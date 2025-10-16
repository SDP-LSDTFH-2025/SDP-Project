const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const uploadRoutes = require('./upload');
const notificationRoutes = require('./Notifications');
const courseRoutes = require('./Courses');
const userCourseRoutes = require('./UserCourses');

const Study_groupsRoutes = require('./Study_groups')
const Follows_requests = require('./follows_requests');
const resourcesRoutes = require('./Resources')
const resourcethreadsRoutes = require('./Resource_threads');
const liked_Routes = require('./Likes');
const publicApiRoutes = require('./PublicApi');
const planitProxyRoutes = require('./PlanitProxy');
const progressRoute = require('./progress');

const BACKEND_URL = process.env.BACKEND_URL;

// API Documentation
/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: API Information
 *     description: Get information about the API
 *     tags: [API Info]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 endpoints:
 *                   type: object
 */

router.get('/', (req, res) => {
  res.json({
    message: 'SDP Project API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/users',
      upload: '/upload',
      notifications: '/notifications',
      courses: '/courses',
      userCourses: '/user-courses',
      docs: '/api-docs',
      resources: '/resources',
      resource_threads: '/resource_threads',
      likes: '/likes/:id',
      public: '/public',
      private_chats: '/private-chats',
      planit: '/planit',
      sockets: {
        private_chats: `ws://${BACKEND_URL}/sockets/private-chats`,
        group_chats: `ws://${BACKEND_URL}/sockets/group-chats`, 
        notifications: `ws://${BACKEND_URL}/sockets/notifications`
      }
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/courses', courseRoutes);
router.use('/user-courses', userCourseRoutes);
router.use('/study_groups',Study_groupsRoutes);
router.use('/friends',Follows_requests);
router.use('/resources', resourcesRoutes);
router.use('/resource_threads', resourcethreadsRoutes);
router.use('/likes', liked_Routes);
router.use('/public', publicApiRoutes);
router.use('/planit', planitProxyRoutes);
router.use('/progress',progressRoute);
module.exports = router; 