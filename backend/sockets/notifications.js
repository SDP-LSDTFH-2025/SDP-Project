const { Op } = require('sequelize');
const Notifications = require('../models/Notifications');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Socket.IO events for real-time notifications
 */

/**
 * @swagger
 * /sockets/notifications:
 *   get:
 *     summary: Socket.IO connection details
 *     tags: [Sockets]
 *     description: |
 *       Connect using Socket.IO client to `ws://<host>/sockets/notifications` with JWT token.
 *       The token should be provided as `Authorization: Bearer <JWT>` header or `auth.token` in the handshake.
 *     responses:
 *       200:
 *         description: Connection description (documentation only)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationSubscribeRequest:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: The user ID to subscribe to notifications for
 *           example: "user-123"
 *     
 *     NotificationReadRequest:
 *       type: object
 *       required:
 *         - notificationId
 *       properties:
 *         notificationId:
 *           type: integer
 *           description: The ID of the notification to mark as read
 *           example: 456
 *     
 *     NotificationReadAllRequest:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: The user ID to mark all notifications as read for
 *           example: "user-123"
 *     
 *     NotificationResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The notification ID
 *           example: 456
 *         user_id:
 *           type: string
 *           description: The user ID
 *           example: "user-123"
 *         title:
 *           type: string
 *           description: The notification title
 *           example: "New Message"
 *         message:
 *           type: string
 *           description: The notification message
 *           example: "You have a new message from John"
 *         read:
 *           type: boolean
 *           description: Whether the notification has been read
 *           example: false
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the notification was created
 *           example: "2024-01-15T10:30:00Z"
 *     
 *     NotificationCountResponse:
 *       type: object
 *       properties:
 *         unreadCount:
 *           type: integer
 *           description: Number of unread notifications
 *           example: 5
 *         totalCount:
 *           type: integer
 *           description: Total number of notifications
 *           example: 12
 */

/**
 * @swagger
 * /sockets/notifications:
 *   get:
 *     summary: Notifications Socket.IO events (documentation only)
 *     tags: [Notifications]
 *     description: |
 *       This endpoint documents Socket.IO events for notifications. These are not HTTP routes.
 *       Connect to the namespace `/sockets/notifications` and emit the following events:
 *
 *       - `notification:subscribe` with body `NotificationSubscribeRequest`
 *       - `notification:unsubscribe` (no body required)
 *       - `notification:read` with body `NotificationReadRequest`
 *       - `notification:read:all` with body `NotificationReadAllRequest`
 *       - `notification:get:recent` (no body required)
 *       - `notification:get:count` (no body required)
 *
 *       Example (client):
 *       ```js
 *       const socket = io('http://localhost:3000/sockets/notifications', { auth: { userId: '123' } });
 *       socket.emit('notification:subscribe', { userId: '123' });
 *       socket.on('notification:new', (notification) => console.log(notification));
 *       ```
 *     responses:
 *       200:
 *         description: Documentation stub
 */

module.exports = function attachNotificationHandlers(nsp) {
  nsp.on('connection', (socket) => {
    const connectedUserId = socket.user?.id || socket.handshake.auth?.userId || null;
    let subscribedUserId = null;

    // Per-user room for multi-device delivery (if known)
    if (connectedUserId) {
      socket.join(`user-${connectedUserId}`);
      socket.join(`notification-${connectedUserId}`);
      subscribedUserId = connectedUserId;
    }

    // Subscribe to notifications for a specific user
    socket.on('notification:subscribe', async ({ userId }, ack) => {
      try {
        const targetUserId = userId || connectedUserId;
        if (!targetUserId) {
          return ack && ack({ ok: false, error: 'userId is required' });
        }

        // Verify user can subscribe to these notifications
        if (connectedUserId && connectedUserId !== targetUserId) {
          return ack && ack({ ok: false, error: 'Cannot subscribe to other user notifications' });
        }

        socket.join(`notification-${targetUserId}`);
        subscribedUserId = targetUserId;

        // Send current unread count
        const unreadCount = await Notifications.count({
          where: { user_id: targetUserId, read: false }
        });

        socket.emit('notification:count', { unreadCount });

        return ack && ack({ ok: true, userId: targetUserId });
      } catch (e) {
        console.error('Notification subscribe error:', e);
        return ack && ack({ ok: false, error: 'Failed to subscribe to notifications' });
      }
    });

    // Unsubscribe from notifications
    socket.on('notification:unsubscribe', (ack) => {
      if (subscribedUserId) {
        socket.leave(`notification-${subscribedUserId}`);
        subscribedUserId = null;
      }
      return ack && ack({ ok: true });
    });

    // Mark a specific notification as read
    socket.on('notification:read', async ({ notificationId }, ack) => {
      try {
        if (!notificationId) {
          return ack && ack({ ok: false, error: 'notificationId is required' });
        }

        const notification = await Notifications.findOne({
          where: { id: notificationId, user_id: subscribedUserId || connectedUserId }
        });

        if (!notification) {
          return ack && ack({ ok: false, error: 'Notification not found' });
        }

        await Notifications.update(
          { read: true },
          { where: { id: notificationId } }
        );

        // Send updated count
        const unreadCount = await Notifications.count({
          where: { user_id: subscribedUserId || connectedUserId, read: false }
        });

        socket.emit('notification:count', { unreadCount });
        socket.emit('notification:read', { notificationId });

        return ack && ack({ ok: true, notificationId });
      } catch (e) {
        console.error('Notification read error:', e);
        return ack && ack({ ok: false, error: 'Failed to mark notification as read' });
      }
    });

    // Mark all notifications as read
    socket.on('notification:read:all', async (payload, ack) => {
      try {
        const userId = subscribedUserId || connectedUserId || payload?.userId;
        if (!userId) {
          return ack && ack({ ok: false, error: 'userId is required' });
        }

        await Notifications.update(
          { read: true },
          { where: { user_id: userId, read: false } }
        );

        socket.emit('notification:count', { unreadCount: 0 });
        socket.emit('notification:read:all', { userId });

        return ack && ack({ ok: true, userId });
      } catch (e) {
        console.error('Notification read all error:', e);
        return ack && ack({ ok: false, error: 'Failed to mark all notifications as read' });
      }
    });

    // Get recent notifications
    socket.on('notification:get:recent', async ({ limit = 20, offset = 0 }, ack) => {
      try {
        const userId = subscribedUserId || connectedUserId;
        if (!userId) {
          return ack && ack({ ok: false, error: 'userId is required' });
        }

        const notifications = await Notifications.findAll({
          where: { user_id: userId },
          order: [['created_at', 'DESC']],
          limit: Math.min(limit, 50), // Cap at 50 notifications
          offset
        });

        return ack && ack({ ok: true, data: notifications });
      } catch (e) {
        console.error('Get notifications error:', e);
        return ack && ack({ ok: false, error: 'Failed to get notifications' });
      }
    });

    // Get notification count
    socket.on('notification:get:count', async (ack) => {
      try {
        const userId = subscribedUserId || connectedUserId;
        if (!userId) {
          return ack && ack({ ok: false, error: 'userId is required' });
        }

        const unreadCount = await Notifications.count({
          where: { user_id: userId, read: false }
        });

        const totalCount = await Notifications.count({
          where: { user_id: userId }
        });

        return ack && ack({ 
          ok: true, 
          data: { unreadCount, totalCount } 
        });
      } catch (e) {
        console.error('Get notification count error:', e);
        return ack && ack({ ok: false, error: 'Failed to get notification count' });
      }
    });

    socket.on('disconnect', () => {
      // No-op for now
    });
  });

  // Helper function to send notification to a user (can be called from other parts of the app)
  nsp.sendNotificationToUser = async function(userId, notificationData) {
    try {
      const notification = await Notifications.create({
        user_id: userId,
        title: notificationData.title,
        message: notificationData.message,
        read: false,
        created_at: new Date()
      });

      // Send to all connected clients for this user
      nsp.to(`notification-${userId}`).emit('notification:new', notification);

      // Send updated count
      const unreadCount = await Notifications.count({
        where: { user_id: userId, read: false }
      });

      nsp.to(`notification-${userId}`).emit('notification:count', { unreadCount });

      return notification;
    } catch (e) {
      console.error('Send notification error:', e);
      throw e;
    }
  };
};
