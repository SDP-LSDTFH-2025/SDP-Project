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

        // Create notification for private message
        try {
            const Notifications = require('../models/Notifications');
            const User = require('../models/User');
            
            const sender = await User.findByPk(effectiveSenderId);
            
            await Notifications.create({
                user_id: receiverId,
                title: "New Private Message",
                message: `${sender.username.replaceAll("_", " ")} sent you a private message.`,
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

    socket.on('disconnect', ({ chatId }) => {
      socket.emit('private:user:left', {
        userId: connectedUserId,
        chatId,
        timestamp: new Date().toISOString()
      });
    });
  });
};


