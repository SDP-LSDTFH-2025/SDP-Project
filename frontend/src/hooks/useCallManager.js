import { useState, useEffect, useCallback } from 'react';
import { socket } from '../socket';

export const useCallManager = () => {
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);

  // Listen for incoming calls
  useEffect(() => {
    const handleIncomingPrivateCall = (data) => {
      console.log('Incoming private call:', data);
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
      console.log('Incoming group call:', data);
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
      console.log('Call accepted:', data);
      setIncomingCall(null);
      setActiveCall({
        ...data,
        isIncoming: false,
        status: 'connected'
      });
    };

    const handleCallDeclined = (data) => {
      console.log('Call declined:', data);
      setIncomingCall(null);
      // Add to call history
      setCallHistory(prev => [...prev, {
        ...data,
        status: 'declined',
        timestamp: new Date()
      }]);
    };

    const handleCallEnded = (data) => {
      console.log('Call ended:', data);
      setActiveCall(null);
      setIncomingCall(null);
      // Add to call history
      setCallHistory(prev => [...prev, {
        ...data,
        status: 'ended',
        timestamp: new Date()
      }]);
    };

    const handleCallBusy = (data) => {
      console.log('Call busy:', data);
      setIncomingCall(null);
      // Add to call history
      setCallHistory(prev => [...prev, {
        ...data,
        status: 'busy',
        timestamp: new Date()
      }]);
    };

    // Private call events
    socket.on('private:call:incoming', handleIncomingPrivateCall);
    socket.on('private:call:accepted', handleCallAccepted);
    socket.on('private:call:declined', handleCallDeclined);
    socket.on('private:call:ended', handleCallEnded);
    socket.on('private:call:busy', handleCallBusy);

    // Group call events
    socket.on('group:call:incoming', handleIncomingGroupCall);
    socket.on('group:call:accepted', handleCallAccepted);
    socket.on('group:call:declined', handleCallDeclined);
    socket.on('group:call:ended', handleCallEnded);
    socket.on('group:call:busy', handleCallBusy);

    return () => {
      socket.off('private:call:incoming', handleIncomingPrivateCall);
      socket.off('private:call:accepted', handleCallAccepted);
      socket.off('private:call:declined', handleCallDeclined);
      socket.off('private:call:ended', handleCallEnded);
      socket.off('private:call:busy', handleCallBusy);
      
      socket.off('group:call:incoming', handleIncomingGroupCall);
      socket.off('group:call:accepted', handleCallAccepted);
      socket.off('group:call:declined', handleCallDeclined);
      socket.off('group:call:ended', handleCallEnded);
      socket.off('group:call:busy', handleCallBusy);
    };
  }, []);

  const initiateCall = useCallback((callData) => {
    const { callType, targetUserId, targetUserName, targetUserAvatar, isGroupCall, groupId, groupName, participants } = callData;
    
    const callId = `${callType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (isGroupCall) {
      socket.emit('group:call:initiate', {
        callId,
        callType,
        groupId,
        groupName,
        participants: participants || []
      });
    } else {
      socket.emit('private:call:initiate', {
        callId,
        callType,
        targetUserId,
        targetUserName,
        targetUserAvatar
      });
    }

    setActiveCall({
      callId,
      callType,
      targetUserId,
      targetUserName,
      targetUserAvatar,
      isIncoming: false,
      isGroupCall,
      groupId,
      groupName,
      participants,
      status: 'calling'
    });
  }, []);

  const acceptCall = useCallback(() => {
    if (incomingCall) {
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
      
      setActiveCall({
        ...incomingCall,
        isIncoming: false,
        status: 'connected'
      });
      setIncomingCall(null);
    }
  }, [incomingCall]);

  const declineCall = useCallback(() => {
    if (incomingCall) {
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
  }, [incomingCall]);

  const endCall = useCallback(() => {
    if (activeCall) {
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
      
      setActiveCall(null);
    }
  }, [activeCall]);

  return {
    activeCall,
    incomingCall,
    callHistory,
    initiateCall,
    acceptCall,
    declineCall,
    endCall
  };
};
