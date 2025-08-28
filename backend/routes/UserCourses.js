const express = require('express');
const router = express.Router();
const { UserCourses,Courses } = require('../models');
const { Op } = require('sequelize');
const { Courses } = require('../models');

/**
 * @swagger
 * tags:
 *   name: UserCourses
 *   description: API endpoints for managing user course enrollments
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserCourse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: string
 *         course_id:
 *           type: integer
 *         role:
 *           type: string
 *           enum: [student, instructor, admin]
 *         joined_at:
 *           type: string
 *           format: date-time
 */


/**
 * @swagger
 * /api/v1/user-courses/enroll:
 *   post:
 *     summary: Enroll a user in a course
 *     tags: [UserCourses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - course_id
 *             properties:
 *               user_id:
 *                 type: string
 *               course_id:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *                 default: student
 *     responses:
 *       201:
 *         description: User enrolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserCourse'
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already enrolled
 *       500:
 *         description: Internal server error
 */
router.post('/enroll', async (req, res) => {
  try {
    const { user_id, course_id, role = 'student' } = req.body;
    
    if (!user_id || !course_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and course_id are required'
      });
    }
    const course = await Courses.findOne({
      where: { id: course_id }
    });
    if (!course) {
      return res.status(400).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    // Validate course_id is a number
    const parsedCourseId = parseInt(course_id);
    if (isNaN(parsedCourseId)) {
      return res.status(400).json({
        success: false,
        error: 'course_id must be a valid number'
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await UserCourses.findOne({
      where: { user_id: user_id.toString(), course_id: parsedCourseId }
    });
    
    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        error: 'You are already enrolled in this course'
      });
    }
    
    const userCourse = await UserCourses.create({ 
      user_id: user_id.toString(), 
      course_id: parsedCourseId, 
      role 
    });
    res.status(201).json({ success: true, data: userCourse });
  } catch (error) {
    console.error('Enroll user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/user-courses/remove:
 *   delete:
 *     summary: Remove user from course
 *     tags: [UserCourses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - course_id
 *             properties:
 *               user_id:
 *                 type: string
 *               course_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User removed from course successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: number
 *                   description: Number of removed enrollments
 *       400:
 *         description: Bad request
 *       404:
 *         description: Enrollment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/remove', async (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    
    if (!user_id || !course_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and course_id are required'
      });
    }
    
    // Validate course_id is a number
    const parsedCourseId = parseInt(course_id);
    if (isNaN(parsedCourseId)) {
      return res.status(400).json({
        success: false,
        error: 'course_id must be a valid number'
      });
    }
    
    const deletedRows = await UserCourses.destroy({ 
      where: { user_id: user_id.toString(), course_id: parsedCourseId } 
    });
    
    if (deletedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }
    
    res.json({ success: true, data: deletedRows });
  } catch (error) {
    console.error('Remove user from course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/user-courses/course/{id}:
 *   get:
 *     summary: Get all users enrolled in a course
 *     tags: [UserCourses]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Course ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of users enrolled in the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCourse'
 *       404:
 *         description: No enrollments found for this course
 *       500:
 *         description: Internal server error
 */
router.get('/course/:id', async (req, res) => {
  try {
    const users = await UserCourses.findAll({ 
      where: { course_id: parseInt(req.params.id) } 
    });
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No enrollments found for this course'
      });
    }
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users in course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/user-courses/user/{id}:
 *   get:
 *     summary: Get all courses for a user
 *     tags: [UserCourses]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of courses the user is enrolled in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCourse'
 *       404:
 *         description: No enrollments found for this user
 *       500:
 *         description: Internal server error
 */
router.get('/user/:id', async (req, res) => {
  try {
    const courses = await UserCourses.findAll({ 
      where: { user_id: req.params.id } 
    });
    
    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No enrollments found for this user'
      });
    }
    
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get courses for user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/user-courses/update:
 *   put:
 *     summary: Update user role in a course
 *     tags: [UserCourses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - course_id
 *               - role
 *             properties:
 *               user_id:
 *                 type: string
 *               course_id:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: number
 *                   description: Number of affected rows
 *       400:
 *         description: Bad request
 *       404:
 *         description: Enrollment not found
 *       500:
 *         description: Internal server error
 */
router.put('/update', async (req, res) => {
  try {
    const { user_id, course_id, role } = req.body;
    
    if (!user_id || !course_id || !role) {
      return res.status(400).json({
        success: false,
        error: 'user_id, course_id, and role are required'
      });
    }
    
    // Validate course_id is a number
    const parsedCourseId = parseInt(course_id);
    if (isNaN(parsedCourseId)) {
      return res.status(400).json({
        success: false,
        error: 'course_id must be a valid number'
      });
    }
    
    const [affectedRows] = await UserCourses.update(
      { role }, 
      { where: { user_id: user_id.toString(), course_id: parsedCourseId } }
    );
    
    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }
    
    res.json({ success: true, data: affectedRows });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/user-courses/instructor/{id}:
 *   get:
 *     summary: Get instructor of a course
 *     tags: [UserCourses]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Course ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course instructor details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserCourse'
 *       404:
 *         description: No instructor found for this course
 *       500:
 *         description: Internal server error
 */
router.get('/instructor/:id', async (req, res) => {
  try {
    const instructor = await UserCourses.findOne({ 
      where: { 
        course_id: parseInt(req.params.id), 
        role: 'instructor' 
      } 
    });
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: 'No instructor found for this course'
      });
    }
    
    res.json({ success: true, data: instructor });
  } catch (error) {
    console.error('Get course instructor error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/user-courses/recent:
 *   get:
 *     summary: Get recent enrollments
 *     tags: [UserCourses]
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of enrollments to return (default: 10)
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of recent enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCourse'
 *       500:
 *         description: Internal server error
 */
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const parsedLimit = parseInt(limit);
    
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({
        success: false,
        error: 'limit must be a positive number'
      });
    }
    
    const enrollments = await UserCourses.findAll({ 
      order: [['joined_at', 'DESC']],
      limit: parsedLimit
    });
    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Get recent enrollments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/user-courses/popular:
 *   get:
 *     summary: Get popular courses by enrollment count
 *     tags: [UserCourses]
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of courses to return (default: 10)
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of popular courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       course_id:
 *                         type: integer
 *                       enrollment_count:
 *                         type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const parsedLimit = parseInt(limit);
    
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({
        success: false,
        error: 'limit must be a positive number'
      });
    }
    
    const popularCourses = await UserCourses.findAll({
      attributes: [
        'course_id',
        [UserCourses.sequelize.fn('COUNT', UserCourses.sequelize.col('course_id')), 'enrollment_count']
      ],
      group: ['course_id'],
      order: [[UserCourses.sequelize.fn('COUNT', UserCourses.sequelize.col('course_id')), 'DESC']],
      limit: parsedLimit
    });
    res.json({ success: true, data: popularCourses });
  } catch (error) {
    console.error('Get popular courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/user-courses/date-range:
 *   get:
 *     summary: Get enrollments by date range
 *     tags: [UserCourses]
 *     parameters:
 *       - name: startDate
 *         in: query
 *         required: true
 *         description: Start date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         required: true
 *         description: End date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of enrollments in date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCourse'
 *       400:
 *         description: Start date and end date are required
 *       500:
 *         description: Internal server error
 */
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }
    
    const enrollments = await UserCourses.findAll({ 
      where: { 
        joined_at: { 
          [Op.between]: [new Date(startDate), new Date(endDate)] 
        } 
      } 
    });
    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Get enrollments by date range error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/user-courses/filters:
 *   get:
 *     summary: Get enrollments by filters
 *     tags: [UserCourses]
 *     parameters:
 *       - name: role
 *         in: query
 *         required: false
 *         description: Filter by role
 *         schema:
 *           type: string
 *           enum: [student, instructor, admin]
 *       - name: course_id
 *         in: query
 *         required: false
 *         description: Filter by course ID
 *         schema:
 *           type: integer
 *       - name: user_id
 *         in: query
 *         required: false
 *         description: Filter by user ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of filtered enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCourse'
 *       500:
 *         description: Internal server error
 */
router.get('/filters', async (req, res) => {
  try {
    const { role, course_id, user_id } = req.query;
    
    const whereClause = {};
    if (role) whereClause.role = role;
    if (course_id) {
      const parsedCourseId = parseInt(course_id);
      if (isNaN(parsedCourseId)) {
        return res.status(400).json({
          success: false,
          error: 'course_id must be a valid number'
        });
      }
      whereClause.course_id = parsedCourseId;
    }
    if (user_id) {
      whereClause.user_id = user_id.toString();
    }
    
    const enrollments = await UserCourses.findAll({ where: whereClause });
    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Get enrollments by filters error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/user-courses/group:
 *   get:
 *     summary: Get enrollments for a group of users
 *     tags: [UserCourses]
 *     parameters:
 *       - name: user_ids
 *         in: query
 *         required: true
 *         description: Comma-separated list of user IDs
 *         schema:
 *           type: string
 *           example: "1,2,3,4"
 *     responses:
 *       200:
 *         description: List of enrollments for the specified users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 *                       school:
 *                         type: string
 *       400:
 *         description: user_ids parameter required
 *       500:
 *         description: Internal server error
 */
router.get('/group', async (req, res) => {
  try {
    const { user_ids } = req.query;
    
    if (!user_ids) {
      return res.status(400).json({
        success: false,
        error: 'user_ids parameter is required'
      });
    }
    
    // Parse and validate user IDs (strings)
    const userIdArray = user_ids.split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0); // Remove empty strings
    
    if (userIdArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid user IDs provided. Please provide comma-separated user IDs.'
      });
    }
    
    const enrollments = await UserCourses.findAll({ 
      where: { user_id: { [Op.in]: userIdArray } } 
    });
    const course_ids = enrollments.map(enrollment => enrollment.course_id);
    const courses = await Courses.findAll({
        attributes: ['code', 'name', 'school'],
         where: { id: { [Op.in]: course_ids } } });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get enrollments for group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;