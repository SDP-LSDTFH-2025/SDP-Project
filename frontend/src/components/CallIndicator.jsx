import React, { useState, useEffect } from "react";
import { Phone, Video, PhoneOff } from "lucide-react";
import { socket } from "../socket";

export default function CallIndicator() {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    // Listen for incoming calls
    const handleIncomingCall = (data) => {
      setIncomingCall(data);
    };

    const handleCallAccepted = (data) => {
      setIncomingCall(null);
      setActiveCall(data);
    };

    const handleCallDeclined = (data) => {
      setIncomingCall(null);
    };

    const handleCallEnded = (data) => {
      setIncomingCall(null);
      setActiveCall(null);
    };

    // Listen to both private and group call events
    socket.on('private:call:incoming', handleIncomingCall);
    socket.on('group:call:incoming', handleIncomingCall);
    socket.on('private:call:accepted', handleCallAccepted);
    socket.on('group:call:accepted', handleCallAccepted);
    socket.on('private:call:declined', handleCallDeclined);
    socket.on('group:call:declined', handleCallDeclined);
    socket.on('private:call:ended', handleCallEnded);
    socket.on('group:call:ended', handleCallEnded);

    return () => {
      socket.off('private:call:incoming', handleIncomingCall);
      socket.off('group:call:incoming', handleIncomingCall);
      socket.off('private:call:accepted', handleCallAccepted);
      socket.off('group:call:accepted', handleCallAccepted);
      socket.off('private:call:declined', handleCallDeclined);
      socket.off('group:call:declined', handleCallDeclined);
      socket.off('private:call:ended', handleCallEnded);
      socket.off('group:call:ended', handleCallEnded);
    };
  }, []);

  if (!incomingCall && !activeCall) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        {incomingCall ? (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                {incomingCall.callType === 'video' ? (
                  <Video className="w-5 h-5 text-white" />
                ) : (
                  <Phone className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {incomingCall.isGroupCall ? incomingCall.groupName : incomingCall.callerName}
              </p>
              <p className="text-xs text-gray-500">
                Incoming {incomingCall.callType} call
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Accept call
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
                }}
                className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  // Decline call
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
                }}
                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : activeCall ? (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                {activeCall.callType === 'video' ? (
                  <Video className="w-5 h-5 text-white" />
                ) : (
                  <Phone className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activeCall.isGroupCall ? activeCall.groupName : activeCall.targetUserName || activeCall.callerName}
              </p>
              <p className="text-xs text-gray-500">
                Active {activeCall.callType} call
              </p>
            </div>
            <button
              onClick={() => {
                // End call
                if (activeCall.isGroupCall) {
                  socket.emit('group:call:end', {
                    callId: activeCall.callId,
                    callType: activeCall.callType,
                    groupId: activeCall.groupId
                  });
                } else {
                  socket.emit('private:call:end', {
                    callId: activeCall.callId,
                    callType: activeCall.callType,
                    targetUserId: activeCall.targetUserId || activeCall.callerId
                  });
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
