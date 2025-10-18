const express = require('express');
const router = express.Router();
const { UserCourses,Courses } = require('../models');
const { Op } = require('sequelize');
const { optimizedAuth } = require('../middleware/optimizedAuth');


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
router.post('/enroll', optimizedAuth, async (req, res) => {
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

module.exports = router;