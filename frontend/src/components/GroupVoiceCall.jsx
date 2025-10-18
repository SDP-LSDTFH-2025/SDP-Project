import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { socket } from "../socket";

export default function GroupVoiceCall({ 
  callId, 
  onEndCall, 
  groupId, 
  participants = [] 
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callStatus, setCallStatus] = useState("Starting group call...");
  const [connectedParticipants, setConnectedParticipants] = useState([]);
  const [localStream, setLocalStream] = useState(null);

  const peerConnectionsRef = useRef(new Map()); // Map of userId -> RTCPeerConnection
  const remoteStreamsRef = useRef(new Map()); // Map of userId -> MediaStream
  const audioElementsRef = useRef(new Map()); // Map of userId -> audio element
  const isMountedRef = useRef(true);

  useEffect(() => {
    initializeGroupCall();
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  const initializeGroupCall = async () => {
    try {
      // Get local audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      
      if (isMountedRef.current) {
        setLocalStream(stream);
      }

      // Setup signaling listeners
      setupSignalingListeners();

      // Notify other group members about the call
      socket.emit('group:voice:call:start', {
        callId,
        groupId,
        participants: participants.map(p => p.id)
      });

      setCallStatus("Waiting for participants to join...");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setCallStatus("Error accessing microphone");
    }
  };

  const setupSignalingListeners = () => {
    // Listen for participants joining the call
    socket.on('group:voice:call:joined', handleParticipantJoined);
    socket.on('group:voice:call:left', handleParticipantLeft);
    socket.on('group:voice:call:offer', handleOffer);
    socket.on('group:voice:call:answer', handleAnswer);
    socket.on('group:voice:call:ice-candidate', handleIceCandidate);
    socket.on('group:voice:call:ended', handleCallEnded);
  };

  const handleParticipantJoined = async (data) => {
    const { userId, userName } = data;
    console.log(`Participant ${userName} joined the call`);
    
    if (isMountedRef.current) {
      setConnectedParticipants(prev => [...prev, { id: userId, name: userName }]);
      setCallStatus(`${connectedParticipants.length + 1} participants in call`);
    }

    // Create peer connection for this participant
    await createPeerConnection(userId);
  };

  const handleParticipantLeft = (data) => {
    const { userId } = data;
    console.log(`Participant ${userId} left the call`);
    
    if (isMountedRef.current) {
      setConnectedParticipants(prev => prev.filter(p => p.id !== userId));
      
      // Clean up peer connection
      const peerConnection = peerConnectionsRef.current.get(userId);
      if (peerConnection) {
        peerConnection.close();
        peerConnectionsRef.current.delete(userId);
      }
      
      // Remove remote stream and audio element
      remoteStreamsRef.current.delete(userId);
      const audioElement = audioElementsRef.current.get(userId);
      if (audioElement) {
        audioElement.remove();
        audioElementsRef.current.delete(userId);
      }
    }
  };

  const createPeerConnection = async (userId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (isMountedRef.current) {
        remoteStreamsRef.current.set(userId, remoteStream);
        
        // Create audio element for this participant
        const audioElement = document.createElement('audio');
        audioElement.srcObject = remoteStream;
        audioElement.autoplay = true;
        audioElement.playsInline = true;
        audioElement.muted = isSpeakerOff;
        audioElement.style.display = 'none';
        
        document.body.appendChild(audioElement);
        audioElementsRef.current.set(userId, audioElement);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('group:voice:call:ice-candidate', {
          callId,
          targetUserId: userId,
          candidate: event.candidate
        });
      }
    };

    peerConnectionsRef.current.set(userId, peerConnection);
    return peerConnection;
  };

  const handleOffer = async (data) => {
    const { fromUserId, offer } = data;
    const peerConnection = peerConnectionsRef.current.get(fromUserId) || await createPeerConnection(fromUserId);
    
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    socket.emit('group:voice:call:answer', {
      callId,
      targetUserId: fromUserId,
      answer
    });
  };

  const handleAnswer = async (data) => {
    const { fromUserId, answer } = data;
    const peerConnection = peerConnectionsRef.current.get(fromUserId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  };

  const handleIceCandidate = async (data) => {
    const { fromUserId, candidate } = data;
    const peerConnection = peerConnectionsRef.current.get(fromUserId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  };

  const handleCallEnded = () => {
    setCallStatus("Call ended");
    setTimeout(() => endCall(), 1000);
  };

  const endCall = () => {
    // Notify other participants
    socket.emit('group:voice:call:end', { callId, groupId });
    
    // Clean up
    cleanup();
    onEndCall();
  };

  const cleanup = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    remoteStreamsRef.current.clear();

    // Remove audio elements
    audioElementsRef.current.forEach(audio => audio.remove());
    audioElementsRef.current.clear();

    // Remove event listeners
    socket.off('group:voice:call:joined');
    socket.off('group:voice:call:left');
    socket.off('group:voice:call:offer');
    socket.off('group:voice:call:answer');
    socket.off('group:voice:call:ice-candidate');
    socket.off('group:voice:call:ended');
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleSpeaker = () => {
    const newSpeakerState = !isSpeakerOff;
    setIsSpeakerOff(newSpeakerState);
    
    // Mute/unmute all remote audio elements
    audioElementsRef.current.forEach(audio => {
      audio.muted = newSpeakerState;
    });
  };

  return (
    <div className="voice-call-container">
      <div className="voice-call-content">
        {connectedParticipants.length === 0 ? (
          <div className="voice-call-waiting">
            <div className="waiting-content">
              <div className="voice-avatar">
                <div className="avatar-circle">
                  <Phone size={32} />
                </div>
              </div>
              <h3>Waiting for participants...</h3>
              <p>Share this call with group members</p>
            </div>
          </div>
        ) : (
          <div className="voice-call-connected">
            <div className="call-info">
              <div className="call-avatar">
                <div className="avatar-circle">
                  <Phone size={24} />
                </div>
              </div>
              <h3>Group Voice Call</h3>
              <p>{connectedParticipants.length} participants connected</p>
            </div>
          </div>
        )}

        {/* Call controls */}
        <div className="voice-call-controls">
          <div className="control-buttons">
            <button
              className={`control-btn ${isMuted ? 'muted' : ''}`}
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button
              className={`control-btn ${isSpeakerOff ? 'speaker-off' : ''}`}
              onClick={toggleSpeaker}
              title={isSpeakerOff ? 'Turn on speaker' : 'Turn off speaker'}
            >
              {isSpeakerOff ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <button
              className="control-btn end-call"
              onClick={endCall}
              title="End call"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
