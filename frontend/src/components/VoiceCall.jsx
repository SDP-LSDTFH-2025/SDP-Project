import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { socket } from "../socket";

export default function VoiceCall({ 
  isCaller, 
  otherUserId, 
  onEndCall, 
  callId 
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const [connectionState, setConnectionState] = useState("new");
  const [isWaiting, setIsWaiting] = useState(true);
  const [waitingTime, setWaitingTime] = useState(0);
  const [hasReceivedResponse, setHasReceivedResponse] = useState(false);

  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const waitingTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    initializeCall();
    
    // Start waiting timer
    if (isCaller) {
      waitingTimerRef.current = setInterval(() => {
        setWaitingTime(prev => {
          const newTime = prev + 1;
          // Auto-end call after 60 seconds if no answer
          if (newTime >= 60) {
            setCallStatus("No answer");
            setTimeout(() => endCall(), 2000);
          }
          return newTime;
        });
      }, 1000);
    }
    
    // Cleanup on unmount only
    return () => {
      isMountedRef.current = false;
      if (waitingTimerRef.current) {
        clearInterval(waitingTimerRef.current);
      }
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media (audio only)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      
      localStreamRef.current = stream;

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log("Received remote audio stream");
        if (!isMountedRef.current) return;
        
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
        setIsConnected(true);
        setIsWaiting(false);
        setHasReceivedResponse(true);
        setCallStatus("Connected");
        
        // Clear waiting timer
        if (waitingTimerRef.current) {
          clearInterval(waitingTimerRef.current);
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate");
          socket.emit('webrtc:ice-candidate', {
            callId,
            candidate: event.candidate,
            targetUserId: otherUserId
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        if (!isMountedRef.current) return;
        
        setConnectionState(peerConnection.connectionState);
        console.log("Connection state:", peerConnection.connectionState);
        
        if (peerConnection.connectionState === 'connected') {
          setIsConnected(true);
          // Only hide waiting screen if we've received a response
          if (hasReceivedResponse) {
            setIsWaiting(false);
            setCallStatus("Connected");
          }
          
          // Clear waiting timer
          if (waitingTimerRef.current) {
            clearInterval(waitingTimerRef.current);
          }
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          setCallStatus("Call ended");
          setTimeout(() => onEndCall(), 2000);
        }
      };

      // Set up signaling listeners
      setupSignalingListeners();

      if (isCaller) {
        // Create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        console.log("Sending offer");
        socket.emit('webrtc:offer', {
          callId,
          offer,
          targetUserId: otherUserId
        });
        
        // Keep waiting screen visible for at least 2 seconds
        setTimeout(() => {
          if (!hasReceivedResponse) {
            console.log("Still waiting for response...");
          }
        }, 2000);
      }

    } catch (error) {
      console.error("Error initializing call:", error);
      setCallStatus("Failed to start call");
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const setupSignalingListeners = () => {
    // Listen for offer
    socket.on('webrtc:offer', async (data) => {
      if (data.callId === callId && !isCaller && isMountedRef.current) {
        console.log("Received offer");
        setIsWaiting(false);
        setHasReceivedResponse(true);
        setCallStatus("Connecting...");
        try {
          await peerConnectionRef.current.setRemoteDescription(data.offer);
          
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          
          console.log("Sending answer");
          socket.emit('webrtc:answer', {
            callId,
            answer,
            targetUserId: otherUserId
          });
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      }
    });

    // Listen for answer
    socket.on('webrtc:answer', async (data) => {
      if (data.callId === callId && isCaller && isMountedRef.current) {
        console.log("Received answer");
        setHasReceivedResponse(true);
        setIsWaiting(false);
        setCallStatus("Connecting...");
        try {
          await peerConnectionRef.current.setRemoteDescription(data.answer);
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      }
    });

    // Listen for ICE candidates
    socket.on('webrtc:ice-candidate', async (data) => {
      if (data.callId === callId && isMountedRef.current) {
        console.log("Received ICE candidate");
        setHasReceivedResponse(true);
        try {
          await peerConnectionRef.current.addIceCandidate(data.candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    // Listen for call end
    socket.on('webrtc:call-ended', (data) => {
      if (data.callId === callId && isMountedRef.current) {
        console.log("Call ended by remote user");
        setCallStatus("Call ended");
        setTimeout(() => onEndCall(), 2000);
      }
    });
  };

  const endCall = () => {
    console.log("Ending call");
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Notify other user
    socket.emit('webrtc:call-ended', {
      callId,
      targetUserId: otherUserId
    });

    // Clean up listeners
    socket.off('webrtc:offer');
    socket.off('webrtc:answer');
    socket.off('webrtc:ice-candidate');
    socket.off('webrtc:call-ended');

    onEndCall();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
      setIsSpeakerOn(!remoteAudioRef.current.muted);
    }
  };

  const formatWaitingTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Debug logging
  useEffect(() => {
    console.log("VoiceCall state:", {
      isWaiting,
      isConnected,
      hasReceivedResponse,
      callStatus,
      connectionState,
      isCaller
    });
  }, [isWaiting, isConnected, hasReceivedResponse, callStatus, connectionState, isCaller]);

  return (
    <div className="voice-call-container">
      <div className="voice-call-content">
        {/* Remote Audio */}
        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          className="remote-audio"
        />

        {/* Waiting Screen */}
        {!isConnected && (
          <div className="voice-call-waiting">
            <div className="waiting-content">
              {isWaiting ? (
                <>
                  <div className="voice-avatar">
                    <div className="avatar-circle">
                      <span>🎤</span>
                    </div>
                  </div>
                  <h3>Voice Call</h3>
                  <p className="waiting-time">
                    {isCaller ? `Calling... ${formatWaitingTime(waitingTime)}` : 'Incoming call...'}
                  </p>
                  <div className="waiting-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </>
              ) : (
                <>
                  <div className="loading-spinner"></div>
                  <p>{callStatus}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Connected State */}
        {isConnected && (
          <div className="voice-call-connected">
            <div className="call-info">
              <div className="call-avatar">
                <span>🎤</span>
              </div>
              <h3>Voice Call</h3>
              <p>Connected</p>
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="voice-call-controls">
          <div className="control-buttons">
            <button
              onClick={toggleMute}
              className={`control-btn ${isMuted ? 'muted' : ''}`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <button
              onClick={toggleSpeaker}
              className={`control-btn ${!isSpeakerOn ? 'speaker-off' : ''}`}
              title={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
            >
              {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>

            <button
              onClick={endCall}
              className="control-btn end-call"
              title="End call"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
