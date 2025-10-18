import React, { createContext, useContext, useEffect } from 'react';
import { useCallManager } from '../hooks/useCallManager';
import CallNotification from './CallNotification';
import GlobalCallNotification from './GlobalCallNotification';
import VideoCall from './VideoCall';
import VoiceCall from './VoiceCall';
import GroupVideoCall from './GroupVideoCall';
import GroupVoiceCall from './GroupVoiceCall';

const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const callManager = useCallManager();

  // Make call manager globally available
  useEffect(() => {
    window.callManager = callManager;
    return () => {
      delete window.callManager;
    };
  }, [callManager]);

  const renderCallComponent = () => {
    const { activeCall, incomingCall } = callManager;

    // Show incoming call notification
    if (incomingCall) {
      return (
        <CallNotification
          callData={incomingCall}
          onAccept={callManager.acceptCall}
          onDecline={callManager.declineCall}
          onEndCall={callManager.endCall}
        />
      );
    }

    // Show active call component
    if (activeCall) {
      if (activeCall.isGroupCall) {
        if (activeCall.callType === 'video') {
          return (
            <GroupVideoCall
              callId={activeCall.callId}
              groupId={activeCall.groupId}
              participants={activeCall.participants || []}
              onEndCall={callManager.endCall}
            />
          );
        } else {
          return (
            <GroupVoiceCall
              callId={activeCall.callId}
              groupId={activeCall.groupId}
              participants={activeCall.participants || []}
              onEndCall={callManager.endCall}
            />
          );
        }
      } else {
        if (activeCall.callType === 'video') {
          return (
            <VideoCall
              isCaller={!activeCall.isIncoming}
              otherUserId={activeCall.targetUserId || activeCall.callerId}
              onEndCall={callManager.endCall}
              callId={activeCall.callId}
            />
          );
        } else {
          return (
            <VoiceCall
              isCaller={!activeCall.isIncoming}
              otherUserId={activeCall.targetUserId || activeCall.callerId}
              onEndCall={callManager.endCall}
              callId={activeCall.callId}
            />
          );
        }
      }
    }

    return null;
  };

  return (
    <CallContext.Provider value={callManager}>
      {children}
      {/* Global call notification - works from any page */}
      <GlobalCallNotification />
      {/* Local call components for specific chat contexts */}
      {renderCallComponent()}
    </CallContext.Provider>
  );
};
