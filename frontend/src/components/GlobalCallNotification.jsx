import React, { useState, useEffect } from "react";
import { Phone, PhoneOff, Video, Mic, MicOff, X } from "lucide-react";
import { socket } from "../socket";
import "./CallNotification.css";

export default function GlobalCallNotification() {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);

  useEffect(() => {
    // Listen for incoming calls globally
    const handleIncomingPrivateCall = (data) => {
      console.log('Global incoming private call:', data);
      setIncomingCall({
        callId: data.callId,
        callType: data.callType || 'voice',
        callerId: data.callerId,
        callerName: data.callerName,
        callerAvatar: data.callerAvatar,
        isIncoming: true,
        isGroupCall: false
      });
    };

    const handleIncomingGroupCall = (data) => {
      console.log('Global incoming group call:', data);
      setIncomingCall({
        callId: data.callId,
        callType: data.callType || 'voice',
        callerId: data.callerId,
        callerName: data.callerName,
        callerAvatar: data.callerAvatar,
        isIncoming: true,
        isGroupCall: true,
        groupId: data.groupId,
        groupName: data.groupName,
        participants: data.participants || []
      });
    };

    const handleCallAccepted = (data) => {
      console.log('Call accepted globally:', data);
      setIncomingCall(null);
    };

    const handleCallDeclined = (data) => {
      console.log('Call declined globally:', data);
      setIncomingCall(null);
    };

    const handleCallEnded = (data) => {
      console.log('Call ended globally:', data);
      setIncomingCall(null);
    };

    const handleCallBusy = (data) => {
      console.log('Call busy globally:', data);
      setIncomingCall(null);
    };

    // Listen to global call events
    socket.on('private:call:incoming', handleIncomingPrivateCall);
    socket.on('group:call:incoming', handleIncomingGroupCall);
    socket.on('private:call:accepted', handleCallAccepted);
    socket.on('group:call:accepted', handleCallAccepted);
    socket.on('private:call:declined', handleCallDeclined);
    socket.on('group:call:declined', handleCallDeclined);
    socket.on('private:call:ended', handleCallEnded);
    socket.on('group:call:ended', handleCallEnded);
    socket.on('private:call:busy', handleCallBusy);
    socket.on('group:call:busy', handleCallBusy);

    return () => {
      socket.off('private:call:incoming', handleIncomingPrivateCall);
      socket.off('group:call:incoming', handleIncomingGroupCall);
      socket.off('private:call:accepted', handleCallAccepted);
      socket.off('group:call:accepted', handleCallAccepted);
      socket.off('private:call:declined', handleCallDeclined);
      socket.off('group:call:declined', handleCallDeclined);
      socket.off('private:call:ended', handleCallEnded);
      socket.off('group:call:ended', handleCallEnded);
      socket.off('private:call:busy', handleCallBusy);
      socket.off('group:call:busy', handleCallBusy);
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (incomingCall && !incomingCall.isIncoming) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [incomingCall]);

  // Auto-decline after 30 seconds if not answered
  useEffect(() => {
    if (incomingCall && incomingCall.isIncoming) {
      const autoDeclineTimer = setTimeout(() => {
        handleDecline();
      }, 30000); // 30 seconds

      return () => clearTimeout(autoDeclineTimer);
    }
  }, [incomingCall]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    if (incomingCall) {
      // Emit socket event to accept call
      if (incomingCall.isGroupCall) {
        socket.emit('group:call:accept', {
          callId: incomingCall.callId,
          callType: incomingCall.callType,
          groupId: incomingCall.groupId
        });
      } else {
        socket.emit('private:call:accept', {
          callId: incomingCall.callId,
          callType: incomingCall.callType,
          callerId: incomingCall.callerId
        });
      }
      setIncomingCall(null);
    }
  };

  const handleDecline = () => {
    if (incomingCall) {
      // Emit socket event to decline call
      if (incomingCall.isGroupCall) {
        socket.emit('group:call:decline', {
          callId: incomingCall.callId,
          callType: incomingCall.callType,
          groupId: incomingCall.groupId
        });
      } else {
        socket.emit('private:call:decline', {
          callId: incomingCall.callId,
          callType: incomingCall.callType,
          callerId: incomingCall.callerId
        });
      }
      setIncomingCall(null);
    }
  };

  const handleDismiss = () => {
    setIncomingCall(null);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Emit socket event for mute toggle
    socket.emit('call:mute', {
      callId: incomingCall?.callId,
      isMuted: !isMuted
    });
  };

  const toggleVideo = () => {
    if (incomingCall?.callType === 'video') {
      setIsVideoOff(!isVideoOff);
      // Emit socket event for video toggle
      socket.emit('call:video:toggle', {
        callId: incomingCall?.callId,
        isVideoOff: !isVideoOff
      });
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOff(!isSpeakerOff);
    // Emit socket event for speaker toggle
    socket.emit('call:speaker:toggle', {
      callId: incomingCall?.callId,
      isSpeakerOff: !isSpeakerOff
    });
  };

  if (!incomingCall) return null;

  const {
    callId,
    callType,
    callerId,
    callerName,
    callerAvatar,
    isIncoming,
    isGroupCall = false,
    groupName,
    participants = []
  } = incomingCall;

  return (
    <div className="call-notification-overlay">
      <div className="call-notification-card">
        {/* Caller Info */}
        <div className="call-notification-header">
          <div className="call-notification-avatar">
            {callerAvatar ? (
              <img src={callerAvatar} alt={callerName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{callerName?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          
          <h3 className="call-notification-title">
            {isGroupCall ? groupName : callerName}
          </h3>
          
          <p className="call-notification-subtitle">
            {isIncoming ? 'Incoming' : 'Outgoing'} {callType} call
          </p>
          
          {isGroupCall && (
            <p className="call-notification-participants">
              {participants.length} participants
            </p>
          )}
          
          {!isIncoming && callDuration > 0 && (
            <p className="call-notification-duration">
              {formatDuration(callDuration)}
            </p>
          )}
        </div>

        {/* Call Controls */}
        <div className="call-notification-controls">
          {isIncoming ? (
            // Incoming call controls
            <>
              <button
                onClick={handleDecline}
                className="call-notification-button call-notification-button-decline"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              
              <button
                onClick={handleAccept}
                className="call-notification-button call-notification-button-accept"
              >
                {callType === 'video' ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <Phone className="w-6 h-6" />
                )}
              </button>
            </>
          ) : (
            // Active call controls
            <>
              <button
                onClick={toggleMute}
                className={`call-notification-button call-notification-button-control ${
                  isMuted ? 'active' : ''
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`call-notification-button call-notification-button-control ${
                    isVideoOff ? 'active' : ''
                  }`}
                >
                  <Video className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={toggleSpeaker}
                className={`call-notification-button call-notification-button-control ${
                  isSpeakerOff ? 'active' : ''
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={handleDecline}
                className="call-notification-button call-notification-button-decline"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Call Status */}
        {isIncoming && (
          <div className="call-notification-status call-notification-ringing">
            Ringing...
          </div>
        )}

        {/* Dismiss button for non-critical notifications */}
        {!isIncoming && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
