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
 * /sockets/private-chats:
 *   get:
 *     summary: Socket.IO connection details
 *     tags: [Sockets]
 *     description: |
 *       Connect using Socket.IO client to `ws://<host>/sockets/private-chats` with JWT token.
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
 * /sockets/private-chats:
 *   get:
 *     summary: Private chat Socket.IO events (documentation only)
 *     tags: [PrivateChats]
 *     description: |
 *       This endpoint documents Socket.IO events for private chats. These are not HTTP routes.
 *       Connect to the namespace `/sockets/private-chats` and emit the following events:
 *
 *       - `private:join` with body `PrivateJoinRequest`
 *       - `private:message` with body `PrivateMessageRequest`
 *       - `private:typing` with body `PrivateTypingRequest`
 *       - `private:read` with body `PrivateReadRequest`
 *
 *       Example (client):
 *       ```js
 *       const socket = io('http://localhost:3000/sockets/private-chats', { auth: { userId: '123' } });
 *       socket.emit('private:join', { chatId: 'abc' });
 *       ```
 *     responses:
 *       200:
 *         description: Documentation stub
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
        const { senderId, receiverId, message, tempId } = payload || {};
        const effectiveSenderId = connectedUserId || senderId;
        if (!effectiveSenderId || !receiverId || !message) {
          return ack && ack({ ok: false, error: 'senderId, receiverId and message are required' });
        }

        const record = await PrivateChats.create({
          sender_id: effectiveSenderId,
          receiver_id: receiverId,
          message
        });

        const dto = {
          id: record.id,
          sender_id: record.sender_id,
          receiver_id: record.receiver_id,
          message: record.message,
          created_at: record.created_at,
          tempId
        };

        // Emit to receiver's user room and sender for confirmation
        if (receiverId) nsp.to(`user-${receiverId}`).emit('private:message:new', dto);
        socket.emit('private:message:new', dto);

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

    socket.on('disconnect', () => {
      // No-op for now
    });
  });
};


