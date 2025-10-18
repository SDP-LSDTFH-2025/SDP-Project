import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Users, Settings, Maximize2, Minimize2 } from "lucide-react";
import { socket } from "../socket";

export default function GroupVideoCall({ 
  callId, 
  onEndCall, 
  groupId, 
  participants = [] 
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState("Starting group call...");
  const [isWaiting, setIsWaiting] = useState(true);
  const [waitingTime, setWaitingTime] = useState(0);
  const [connectedParticipants, setConnectedParticipants] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localVideoSize, setLocalVideoSize] = useState('small'); // small, medium, large

  const localVideoRef = useRef(null);
  const peerConnectionsRef = useRef(new Map()); // Map of userId -> RTCPeerConnection
  const remoteStreamsRef = useRef(new Map()); // Map of userId -> MediaStream
  const videoRefsRef = useRef(new Map()); // Map of userId -> video element ref
  const waitingTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    initializeGroupCall();
    
    // Start waiting timer
    waitingTimerRef.current = setInterval(() => {
      setWaitingTime(prev => {
        const newTime = prev + 1;
        // Auto-end call after 60 seconds if no one joins
        if (newTime >= 60 && connectedParticipants.length === 0) {
          setCallStatus("No participants joined");
          setTimeout(() => endCall(), 2000);
        }
        return newTime;
      });
    }, 1000);
    
    return () => {
      isMountedRef.current = false;
      if (waitingTimerRef.current) {
        clearInterval(waitingTimerRef.current);
      }
      cleanup();
    };
  }, []);

  const initializeGroupCall = async () => {
    try {
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (isMountedRef.current) {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      // Setup signaling listeners
      setupSignalingListeners();

      // Notify other group members about the call
      socket.emit('group:video:call:start', {
        callId,
        groupId,
        participants: participants.map(p => p.id)
      });

      setCallStatus("Waiting for participants to join...");
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCallStatus("Error accessing camera/microphone");
    }
  };

  const setupSignalingListeners = () => {
    // Listen for participants joining the call
    socket.on('group:video:call:joined', handleParticipantJoined);
    socket.on('group:video:call:left', handleParticipantLeft);
    socket.on('group:video:call:offer', handleOffer);
    socket.on('group:video:call:answer', handleAnswer);
    socket.on('group:video:call:ice-candidate', handleIceCandidate);
    socket.on('group:video:call:ended', handleCallEnded);
  };

  const handleParticipantJoined = async (data) => {
    const { userId, userName } = data;
    console.log(`Participant ${userName} joined the call`);
    
    if (isMountedRef.current) {
      setConnectedParticipants(prev => {
        const newParticipants = [...prev, { id: userId, name: userName, joinedAt: new Date() }];
        setIsWaiting(false);
        setCallStatus(`${newParticipants.length} participants in call`);
        return newParticipants;
      });
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
      
      // Remove remote stream
      remoteStreamsRef.current.delete(userId);
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
        
        // Attach stream to video element
        const videoElement = videoRefsRef.current.get(userId);
        if (videoElement) {
          videoElement.srcObject = remoteStream;
        }
        
        // Trigger re-render to show new participant
        setConnectedParticipants(prev => [...prev]);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('group:video:call:ice-candidate', {
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
    
    socket.emit('group:video:call:answer', {
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
    socket.emit('group:video:call:end', { callId, groupId });
    
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

    // Remove event listeners
    socket.off('group:video:call:joined');
    socket.off('group:video:call:left');
    socket.off('group:video:call:offer');
    socket.off('group:video:call:answer');
    socket.off('group:video:call:ice-candidate');
    socket.off('group:video:call:ended');
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

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const formatWaitingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getGridLayout = (participantCount) => {
    if (participantCount <= 1) return '1x1';
    if (participantCount <= 2) return '1x2';
    if (participantCount <= 4) return '2x2';
    if (participantCount <= 6) return '2x3';
    if (participantCount <= 9) return '3x3';
    return '3x4';
  };

  const getLocalVideoSize = () => {
    switch (localVideoSize) {
      case 'small': return { width: '200px', height: '150px' };
      case 'medium': return { width: '300px', height: '225px' };
      case 'large': return { width: '400px', height: '300px' };
      default: return { width: '200px', height: '150px' };
    }
  };

  const gridLayout = getGridLayout(connectedParticipants.length);
  const localVideoSizeStyle = getLocalVideoSize();

  return (
    <div className={`video-call-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="video-call-content">
        {/* Header */}
        <div className="call-header">
          <div className="call-info">
            <div className="call-title">
              <Users size={20} />
              <span>Group Video Call</span>
            </div>
            <div className="call-status">
              {connectedParticipants.length > 0 ? (
                <span className="participant-count">
                  {connectedParticipants.length} participant{connectedParticipants.length !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="waiting-status">Waiting for participants...</span>
              )}
            </div>
          </div>
          <div className="header-controls">
            <button
              className="header-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              className="header-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Main video area */}
        <div className="main-video-area">
          {connectedParticipants.length === 0 ? (
            <div className="waiting-screen">
              <div className="waiting-content">
                <div className="waiting-avatar">
                  <div className="avatar-circle">
                    <Users size={48} />
                  </div>
                </div>
                <h3>Waiting for participants...</h3>
                <p>Share this call with group members</p>
                <div className="waiting-time">{formatWaitingTime(waitingTime)}</div>
                <div className="waiting-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`participants-grid grid-${gridLayout}`}>
              {connectedParticipants.map((participant, index) => {
                const remoteStream = remoteStreamsRef.current.get(participant.id);
                return (
                  <div key={participant.id} className="participant-video">
                    <video
                      ref={(el) => {
                        if (el) {
                          videoRefsRef.current.set(participant.id, el);
                          if (remoteStream) {
                            el.srcObject = remoteStream;
                          }
                        }
                      }}
                      autoPlay
                      playsInline
                      muted={false}
                      className="participant-video-element"
                    />
                    <div className="participant-overlay">
                      <div className="participant-name">{participant.name}</div>
                      <div className="participant-status">
                        {remoteStream ? 'Connected' : 'Connecting...'}
                      </div>
                    </div>
                    {!remoteStream && (
                      <div className="video-placeholder">
                        <div className="placeholder-avatar">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Local video */}
        <div 
          className={`local-video-container ${localVideoSize}`}
          style={localVideoSizeStyle}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
          <div className="local-video-overlay">
            <div className="local-video-label">You</div>
            {isVideoOff && (
              <div className="video-off-indicator">
                <VideoOff size={16} />
              </div>
            )}
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="settings-panel">
            <div className="settings-content">
              <h4>Video Settings</h4>
              <div className="setting-group">
                <label>Local video size:</label>
                <select 
                  value={localVideoSize} 
                  onChange={(e) => setLocalVideoSize(e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Call controls */}
        <div className="call-controls">
          <div className="control-buttons">
            <button
              className={`control-btn ${isMuted ? 'muted' : ''}`}
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button
              className={`control-btn ${isVideoOff ? 'video-off' : ''}`}
              onClick={toggleVideo}
              title={isVideoOff ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
            
            <button
              className="control-btn settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings size={20} />
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
