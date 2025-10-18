const { Op } = require('sequelize');
const Group_chats = require('../models/Group_chats');
const { Study_groups, Group_members } = require('../models');

/**
 * @swagger
 * tags:
 *   name: GroupChats
 *   description: Socket.IO events for group messaging
 */

/**
 * @swagger
 * /sockets/group-chats:
 *   get:
 *     summary: Socket.IO connection details
 *     tags: [Sockets]
 *     description: |
 *       Connect using Socket.IO client to `ws://<host>/sockets/group-chats` with JWT token.
 *       The token should be provided as `Authorization: Bearer <JWT>` header or `auth.token` in the handshake.
 *     responses:
 *       200:
 *         description: Connection description (documentation only)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GroupJoinRequest:
 *       type: object
 *       required:
 *         - groupId
 *       properties:
 *         groupId:
 *           type: integer
 *           description: The ID of the group to join
 *           example: 123
 *     
 *     GroupMessageRequest:
 *       type: object
 *       required:
 *         - groupId
 *         - message
 *       properties:
 *         groupId:
 *           type: integer
 *           description: The ID of the group
 *           example: 123
 *         message:
 *           type: string
 *           description: The message content
 *           example: "Hello everyone!"
 *         tempId:
 *           type: string
 *           description: Temporary ID for client-side tracking
 *           example: "temp-123"
 *     
 *     GroupTypingRequest:
 *       type: object
 *       required:
 *         - groupId
 *         - isTyping
 *       properties:
 *         groupId:
 *           type: integer
 *           description: The ID of the group
 *           example: 123
 *         isTyping:
 *           type: boolean
 *           description: Whether the user is typing
 *           example: true
 *     
 *     GroupReadRequest:
 *       type: object
 *       required:
 *         - groupId
 *       properties:
 *         groupId:
 *           type: integer
 *           description: The ID of the group
 *           example: 123
 *         lastReadMessageId:
 *           type: integer
 *           description: The ID of the last read message
 *           example: 456
 *     
 *     GroupMessageResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The message ID
 *           example: 456
 *         group_id:
 *           type: integer
 *           description: The group ID
 *           example: 123
 *         user_id:
 *           type: string
 *           description: The sender's user ID
 *           example: "user-123"
 *         message:
 *           type: string
 *           description: The message content
 *           example: "Hello everyone!"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the message was created
 *           example: "2024-01-15T10:30:00Z"
 *         tempId:
 *           type: string
 *           description: Temporary ID for client-side tracking
 *           example: "temp-123"
 */

/**
 * @swagger
 * /sockets/group-chats:
 *   get:
 *     summary: Group chat Socket.IO events (documentation only)
 *     tags: [GroupChats]
 *     description: |
 *       This endpoint documents Socket.IO events for group chats. These are not HTTP routes.
 *       Connect to the namespace `/sockets/group-chats` and emit the following events:
 *
 *       - `group:join` with body `GroupJoinRequest`
 *       - `group:leave` with body `GroupJoinRequest`
 *       - `group:message` with body `GroupMessageRequest`
 *       - `group:typing` with body `GroupTypingRequest`
 *       - `group:read` with body `GroupReadRequest`
 *
 *       Example (client):
 *       ```js 
 *       const socket = io('http://localhost:3000/sockets/group-chats', { auth: { userId: '123' } });
 *       socket.emit('group:join', { groupId: 123 });
 *       socket.emit('group:message', { groupId: 123, message: 'Hello!' });
 *       ```
 *     responses:
 *       200:
 *         description: Documentation stub
 */

module.exports = function attachGroupChatHandlers(nsp) {
  nsp.on('connection', (socket) => {
    const connectedUserId = socket.user?.id || socket.handshake.auth?.userId || null;

    // Per-user room for multi-device delivery (if known)
    if (connectedUserId) {
      socket.join(`user-${connectedUserId}`);
    }

    // Join a specific group chat room
    socket.on('group:join', async ({ groupId }, ack) => {
      try {
        if (!groupId) {
          return ack && ack({ ok: false, error: 'groupId is required' });
        }

        // Verify user is a member of the group
        if (connectedUserId) {
          const membership = await Group_members.findOne({
            where: { group_id: groupId, user_id: connectedUserId }
          });

          if (!membership) {
            return ack && ack({ ok: false, error: 'Not a member of this group' });
          }
        }

        socket.join(`group-${groupId}`);
        
        // Notify other group members that user joined
        socket.to(`group-${groupId}`).emit('group:user:joined', {
          userId: connectedUserId,
          groupId,
          timestamp: new Date().toISOString()
        });

        return ack && ack({ ok: true, groupId });
      } catch (e) {
        return ack && ack({ ok: false, error: 'Failed to join group' });
      }
    });

    // Leave a group chat room
    socket.on('group:leave', ({ groupId }, ack) => {
      if (!groupId) {
        return ack && ack({ ok: false, error: 'groupId is required' });
      }

      socket.leave(`group-${groupId}`);
      
      // Notify other group members that user left
      socket.to(`group-${groupId}`).emit('group:user:left', {
        userId: connectedUserId,
        groupId,
        timestamp: new Date().toISOString()
      });

      return ack && ack({ ok: true, groupId });
    });

    // Send a group message
    socket.on('group:message', async (payload, ack) => {
      try {
        const { groupId, message, tempId, messageType, audioData, audioDuration } = payload || {};
        const effectiveUserId = connectedUserId || payload?.userId;
        
        if (!effectiveUserId || !groupId || !message) {
          return ack && ack({ ok: false, error: 'userId, groupId and message are required' });
        }

        // Validate message type and required fields
        const validMessageTypes = ['text', 'voice_note', 'image', 'file'];
        const messageTypeToUse = messageType || 'text';
        
        if (!validMessageTypes.includes(messageTypeToUse)) {
          return ack && ack({ ok: false, error: 'Invalid message type' });
        }

        // For voice notes, validate required fields
        if (messageTypeToUse === 'voice_note' && (!audioData || !audioDuration)) {
          return ack && ack({ ok: false, error: 'audioData and audioDuration are required for voice notes' });
        }

        // Verify user is a member of the group
        const membership = await Group_members.findOne({
          where: { group_id: groupId, user_id: effectiveUserId }
        });

        if (!membership) {
          return ack && ack({ ok: false, error: 'Not a member of this group' });
        }

        const record = await Group_chats.create({
          group_id: groupId,
          user_id: effectiveUserId,
          message,
          message_type: messageTypeToUse,
          audio_data: audioData || null,
          audio_duration: audioDuration || null,
          deleted: false,
          created_at: new Date()
        });

        const dto = {
          id: record.id,
          group_id: record.group_id,
          user_id: record.user_id,
          message: record.message,
          message_type: record.message_type,
          audio_data: record.audio_data,
          audio_duration: record.audio_duration,
          created_at: record.created_at,
          tempId
        };

        // Emit to all group members
        nsp.to(`group-${groupId}`).emit('group:message:new', dto);

        // Create notifications for group members (except sender)
        try {
            const Notifications = require('../models/Notifications');
            const Group_members = require('../models/Group_members');
            const User = require('../models/User');
            const Study_groups = require('../models/Study_groups');
            
            // Get all group members except the sender
            const members = await Group_members.findAll({
                where: { group_id: groupId },
                attributes: ['user_id']
            });
            
            const sender = await User.findByPk(effectiveUserId);
            const group = await Study_groups.findByPk(groupId);
            
            // Create notifications for all members except the sender
            for (const member of members) {
                if (member.user_id !== effectiveUserId) {
                    const messageTypeText = messageTypeToUse === 'voice_note' ? 'voice note' : 'message';
                    await Notifications.create({
                        user_id: member.user_id,
                        title: "New Group Message",
                        message: `${sender.username.replaceAll("_", " ")} sent a ${messageTypeText} in "${group.name}" group.`,
                        read: false,
                        created_at: new Date()
                    });
                }
            }
        } catch (notificationError) {
            console.error('Failed to create notifications for group message:', notificationError);
            // Don't fail the main request if notification creation fails
        }

        return ack && ack({ ok: true, data: dto });
      } catch (e) {
        console.error('Group message error:', e);
        return ack && ack({ ok: false, error: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('group:typing', ({ groupId, isTyping }) => {
      const fromId = connectedUserId || payload?.userId;
      if (!fromId || !groupId) return;

      socket.to(`group-${groupId}`).emit('group:typing', {
        userId: fromId,
        groupId,
        isTyping: !!isTyping,
        timestamp: new Date().toISOString()
      });
    });

    // Mark messages as read
    socket.on('group:read', async ({ groupId, lastReadMessageId }, ack) => {
      try {
        const me = connectedUserId || payload?.userId;
        if (!me || !groupId) {
          return ack && ack({ ok: false, error: 'userId and groupId are required' });
        }

        // Verify user is a member of the group
        const membership = await Group_members.findOne({
          where: { group_id: groupId, user_id: me }
        });

        if (!membership) {
          return ack && ack({ ok: false, error: 'Not a member of this group' });
        }

        // Update read status for messages up to lastReadMessageId
        if (lastReadMessageId) {
          await Group_chats.update(
            { read_at: new Date() },
            {
              where: {
                group_id: groupId,
                id: { [Op.lte]: lastReadMessageId },
                read_at: { [Op.is]: null }
              }
            }
          );
        }

        // Notify other group members about read status
        socket.to(`group-${groupId}`).emit('group:read', {
          userId: me,
          groupId,
          lastReadMessageId,
          timestamp: new Date().toISOString()
        });

        return ack && ack({ ok: true });
      } catch (e) {
        console.error('Group read error:', e);
        return ack && ack({ ok: false, error: 'Failed to mark as read' });
      }
    });

    // Get recent messages for a group
    socket.on('group:messages:get', async ({ groupId, limit = 50, offset = 0 }, ack) => {
      try {
        const me = connectedUserId || payload?.userId;
        if (!me || !groupId) {
          return ack && ack({ ok: false, error: 'userId and groupId are required' });
        }

        // Verify user is a member of the group
        const membership = await Group_members.findOne({
          where: { group_id: groupId, user_id: me }
        });

        if (!membership) {
          return ack && ack({ ok: false, error: 'Not a member of this group' });
        }

        const messages = await Group_chats.findAll({
          where: { group_id: groupId, deleted: false },
          order: [['created_at', 'DESC']],
          limit: Math.min(limit, 100), // Cap at 100 messages
          offset
        });

        return ack && ack({ ok: true, data: messages.reverse() });
      } catch (e) {
        console.error('Get group messages error:', e);
        return ack && ack({ ok: false, error: 'Failed to get messages' });
      }
    });

    socket.on('disconnect', ({groupId}) => {
      // No-op for now
      socket.emit('group:user:left', {
        userId: connectedUserId,
        groupId,
        timestamp: new Date().toISOString()
      });
    });
  });
};
