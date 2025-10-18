import React, { useState, useEffect } from "react";
import { Phone, PhoneOff, Video, Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { socket } from "../socket";
import "./CallNotification.css";

export default function CallNotification({ 
  callData, 
  onAccept, 
  onDecline, 
  onEndCall 
}) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);

  const {
    callId,
    callType, // 'video' or 'voice'
    callerId,
    callerName,
    callerAvatar,
    isIncoming,
    isGroupCall = false,
    groupName,
    participants = []
  } = callData || {};

  // Call duration timer
  useEffect(() => {
    if (!isIncoming && callData) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isIncoming, callData]);

  // Auto-decline after 30 seconds if not answered
  useEffect(() => {
    if (isIncoming) {
      const autoDeclineTimer = setTimeout(() => {
        onDecline();
      }, 30000); // 30 seconds

      return () => clearTimeout(autoDeclineTimer);
    }
  }, [isIncoming, onDecline]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    // Emit socket event to accept call
    if (isGroupCall) {
      socket.emit('group:call:accept', {
        callId,
        callType,
        groupId: callData.groupId
      });
    } else {
      socket.emit('private:call:accept', {
        callId,
        callType,
        callerId
      });
    }
    onAccept();
  };

  const handleDecline = () => {
    // Emit socket event to decline call
    if (isGroupCall) {
      socket.emit('group:call:decline', {
        callId,
        callType,
        groupId: callData.groupId
      });
    } else {
      socket.emit('private:call:decline', {
        callId,
        callType,
        callerId
      });
    }
    onDecline();
  };

  const handleEndCall = () => {
    // Emit socket event to end call
    if (isGroupCall) {
      socket.emit('group:call:end', {
        callId,
        callType,
        groupId: callData.groupId
      });
    } else {
      socket.emit('private:call:end', {
        callId,
        callType,
        callerId
      });
    }
    onEndCall();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Emit socket event for mute toggle
    socket.emit('call:mute', {
      callId,
      isMuted: !isMuted
    });
  };

  const toggleVideo = () => {
    if (callType === 'video') {
      setIsVideoOff(!isVideoOff);
      // Emit socket event for video toggle
      socket.emit('call:video:toggle', {
        callId,
        isVideoOff: !isVideoOff
      });
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOff(!isSpeakerOff);
    // Emit socket event for speaker toggle
    socket.emit('call:speaker:toggle', {
      callId,
      isSpeakerOff: !isSpeakerOff
    });
  };

  if (!callData) return null;

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
                  onClick={handleEndCall}
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
        </div>
      </div>
  );
}
