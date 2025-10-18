const { Op } = require('sequelize');
const PrivateChats = require('../models/PrivateChats');

/**
 * @swagger
 * tags:
 *   name: PrivateChats
 *   description: Socket.IO events for private messaging
 */

/**
 * @swagger
 * /sockets:
 *   get:
 *     summary: Socket.IO connection details
 *     tags: [Sockets]
 *     description: |
 *       Connect using Socket.IO client to `ws://<host>/v1` with JWT token.
 *       The token should be provided as `Authorization: Bearer <JWT>` header or `auth.token` in the handshake.
 *     responses:
 *       200:
 *         description: Connection description (documentation only)
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     socketBearer:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /sockets/private-chats/join:
 *   post:
 *     summary: Join a specific private chat room
 *     tags: [PrivateChats]
 *     security:
 *       - socketBearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrivateJoinRequest'
 *     responses:
 *       200:
 *         description: Client joins the chat room (Socket.IO event `private:join`)
 *
 * /sockets/private-chats/message:
 *   post:
 *     summary: Send a private message (Socket.IO event `private:message`)
 *     tags: [PrivateChats]
 *     security:
 *       - socketBearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrivateMessageRequest'
 *     responses:
 *       200:
 *         description: Ack response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SocketAckResponse'
 *
 * /sockets/private-chats/typing:
 *   post:
 *     summary: Send typing indicator (Socket.IO event `private:typing`)
 *     tags: [PrivateChats]
 *     security:
 *       - socketBearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrivateTypingRequest'
 *     responses:
 *       200:
 *         description: Emitted to receiver's user room
 *
 * /sockets/private-chats/read:
 *   post:
 *     summary: Mark messages as read (Socket.IO event `private:read`)
 *     tags: [PrivateChats]
 *     security:
 *       - socketBearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrivateReadRequest'
 *     responses:
 *       200:
 *         description: Read receipt emitted to sender
 */

module.exports = function attachPrivateChatHandlers(nsp) {
  nsp.on('connection', (socket) => {
    const connectedUserId = socket.user?.id || socket.handshake.auth?.userId || null;

    // Per-user room for multi-device delivery (if known)
    if (connectedUserId) {
      socket.join(`user-${connectedUserId}`);
    }

    // Join a specific private chat room
    socket.on('private:join', ({ chatId }) => {
      if (!chatId) return;
      socket.join(`chat-${chatId}`);
    });

    // Send a private message
    socket.on('private:message', async (payload, ack) => {
      try {
        const { senderId, receiverId, message, tempId, type, audioData, duration } = payload || {};
        const effectiveSenderId = connectedUserId || senderId;
        
        // Validate required fields based on message type
        if (!effectiveSenderId || !receiverId) {
          return ack && ack({ ok: false, error: 'senderId and receiverId are required' });
        }

        // For text messages, message is required
        if ((!type || type === 'text') && !message) {
          return ack && ack({ ok: false, error: 'message is required for text messages' });
        }

        // For voice notes, audioData is required
        if (type === 'voice_note' && !audioData) {
          return ack && ack({ ok: false, error: 'audioData is required for voice notes' });
        }

        const messageType = type || 'text';
        const messageText = message || (type === 'voice_note' ? '🎤 Voice note' : '');

        const record = await PrivateChats.create({
          sender_id: effectiveSenderId,
          receiver_id: receiverId,
          message: messageText,
          message_type: messageType,
          audio_data: audioData || null,
          audio_duration: duration || null
        });

        const dto = {
          id: record.id,
          sender_id: record.sender_id,
          receiver_id: record.receiver_id,
          message: record.message,
          message_type: record.message_type,
          audio_data: record.audio_data,
          audio_duration: record.audio_duration,
          created_at: record.created_at,
          tempId
        };

        // Emit to receiver's user room and sender for confirmation
        if (receiverId) nsp.to(`user-${receiverId}`).emit('private:message:new', dto);
        socket.emit('private:message:new', dto);

        // Create notification for private message
        try {
            const Notifications = require('../models/Notifications');
            const User = require('../models/User');
            
            const sender = await User.findByPk(effectiveSenderId);
            const messageTypeText = messageType === 'voice_note' ? 'voice note' : 'message';
            
            await Notifications.create({
                user_id: receiverId,
                title: "New Private Message",
                message: `${sender.username.replaceAll("_", " ")} sent you a ${messageTypeText}.`,
                read: false,
                created_at: new Date()
            });
        } catch (notificationError) {
            console.error('Failed to create notification for private message:', notificationError);
            // Don't fail the main request if notification creation fails
        }

        return ack && ack({ ok: true, data: dto });
      } catch (e) {
        return ack && ack({ ok: false, error: 'failed_to_send' });
      }
    });

    // Typing indicator
    socket.on('private:typing', ({ senderId, receiverId, isTyping }) => {
      const fromId = connectedUserId || senderId;
      if (!fromId || !receiverId) return;
      nsp.to(`user-${receiverId}`).emit('private:typing', { from: fromId, isTyping: !!isTyping });
    });

    // Mark read
    socket.on('private:read', async ({ senderId, fromUserId }) => {
      const me = connectedUserId || senderId;
      if (!me || !fromUserId) return;
      await PrivateChats.update({ read_at: new Date() }, {
        where: { receiver_id: me, sender_id: fromUserId, read_at: { [Op.is]: null } }
      });
      nsp.to(`user-${fromUserId}`).emit('private:read', { by: me });
    });

    // WebRTC Signaling Events
    socket.on('webrtc:offer', ({ callId, offer, targetUserId }) => {
      console.log(`WebRTC offer from ${connectedUserId} to ${targetUserId}`);
      nsp.to(`user-${targetUserId}`).emit('webrtc:offer', {
        callId,
        offer,
        fromUserId: connectedUserId
      });
    });

    socket.on('webrtc:answer', ({ callId, answer, targetUserId }) => {
      console.log(`WebRTC answer from ${connectedUserId} to ${targetUserId}`);
      nsp.to(`user-${targetUserId}`).emit('webrtc:answer', {
        callId,
        answer,
        fromUserId: connectedUserId
      });
    });

    socket.on('webrtc:ice-candidate', ({ callId, candidate, targetUserId }) => {
      console.log(`WebRTC ICE candidate from ${connectedUserId} to ${targetUserId}`);
      nsp.to(`user-${targetUserId}`).emit('webrtc:ice-candidate', {
        callId,
        candidate,
        fromUserId: connectedUserId
      });
    });

    socket.on('webrtc:call-ended', ({ callId, targetUserId }) => {
      console.log(`WebRTC call ended by ${connectedUserId}`);
      nsp.to(`user-${targetUserId}`).emit('webrtc:call-ended', {
        callId,
        fromUserId: connectedUserId
      });
    });

    // Private Call Management Events
    socket.on('private:call:initiate', async ({ callId, callType, targetUserId, targetUserName, targetUserAvatar }) => {
      try {
        console.log(`Private call initiated by ${connectedUserId} to ${targetUserId}`);
        
        // Check if target user is online
        const targetUserSockets = await nsp.adapter.sockets(new Set([`user-${targetUserId}`]));
        const isTargetOnline = targetUserSockets.size > 0;
        
        if (!isTargetOnline) {
          // User is offline, send busy signal
          socket.emit('private:call:busy', {
            callId,
            callType,
            targetUserId,
            reason: 'User is offline'
          });
          return;
        }

        // Send call notification to target user (globally, not just in chat)
        nsp.to(`user-${targetUserId}`).emit('private:call:incoming', {
          callId,
          callType,
          callerId: connectedUserId,
          callerName: targetUserName, // This should be the caller's name
          callerAvatar: targetUserAvatar // This should be the caller's avatar
        });

        // Send calling status to caller
        socket.emit('private:call:initiated', {
          callId,
          callType,
          targetUserId,
          status: 'calling'
        });
      } catch (error) {
        console.error('Error initiating private call:', error);
        socket.emit('private:call:error', {
          callId,
          error: 'Failed to initiate call'
        });
      }
    });

    socket.on('private:call:accept', ({ callId, callType, callerId }) => {
      console.log(`Private call accepted by ${connectedUserId}`);
      
      // Notify caller that call was accepted
      nsp.to(`user-${callerId}`).emit('private:call:accepted', {
        callId,
        callType,
        acceptedBy: connectedUserId
      });

      // Start WebRTC signaling
      nsp.to(`user-${callerId}`).emit('webrtc:offer', {
        callId,
        fromUserId: connectedUserId
      });
    });

    socket.on('private:call:decline', ({ callId, callType, callerId }) => {
      console.log(`Private call declined by ${connectedUserId}`);
      
      // Notify caller that call was declined
      nsp.to(`user-${callerId}`).emit('private:call:declined', {
        callId,
        callType,
        declinedBy: connectedUserId
      });
    });

    socket.on('private:call:end', ({ callId, callType, targetUserId }) => {
      console.log(`Private call ended by ${connectedUserId}`);
      
      // Notify other participant that call ended
      nsp.to(`user-${targetUserId}`).emit('private:call:ended', {
        callId,
        callType,
        endedBy: connectedUserId
      });

      // Also emit WebRTC call ended event
      nsp.to(`user-${targetUserId}`).emit('webrtc:call-ended', {
        callId,
        fromUserId: connectedUserId
      });
    });

    // Call control events
    socket.on('call:mute', ({ callId, isMuted }) => {
      // Broadcast mute status to other participants
      socket.broadcast.emit('call:participant:muted', {
        callId,
        userId: connectedUserId,
        isMuted
      });
    });

    socket.on('call:video:toggle', ({ callId, isVideoOff }) => {
      // Broadcast video status to other participants
      socket.broadcast.emit('call:participant:video:toggled', {
        callId,
        userId: connectedUserId,
        isVideoOff
      });
    });

    socket.on('call:speaker:toggle', ({ callId, isSpeakerOff }) => {
      // Broadcast speaker status to other participants
      socket.broadcast.emit('call:participant:speaker:toggled', {
        callId,
        userId: connectedUserId,
        isSpeakerOff
      });
    });

    socket.on('disconnect', ({ chatId }) => {
      socket.emit('private:user:left', {
        userId: connectedUserId,
        chatId,
        timestamp: new Date().toISOString()
      });
    });
  });
};


