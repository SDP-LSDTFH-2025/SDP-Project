const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const uploadRoutes = require('./upload');
const notificationRoutes = require('./Notifications');
const courseRoutes = require('./Courses');
const userCourseRoutes = require('./UserCourses');
<<<<<<< HEAD
const Study_groupsRoutes = require('./Study_groups')
const Follows_requests = require('./follows_requests');
=======
const Study_groupsRoutes = require('./Study_groups');
const resourcesRoutes = require('./Resources')
>>>>>>> b9eb8d693c7c0a8ce646e0a49c287399e221450b
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
      resources: '/resources'
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
module.exports = router; 