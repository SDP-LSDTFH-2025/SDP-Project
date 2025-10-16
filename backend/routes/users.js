const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { User, UserCourses, Courses, sequelize } = require('../models');
const { optimizedAuth } = require('../middleware/optimizedAuth');
const { Follows } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */


/**
 * @swagger
 * /api/v1/users/friends:
 *   get:
 *     summary: Get friends who are doing the same course and are not following each other
 *     tags: [Users]
 *     parameters:
 *       - name: user_id
 *         in: query
 *         required: true
 *         description: User ID
 *         schema:
 *           type: uuid
 *     responses:
 *       200:
 *         description: Friends list
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
 *                     $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */ 

router.get('/friends', [
  query('user_id').notEmpty().withMessage('user_id is required').isUUID().withMessage('user_id must be a valid UUID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {user_id} = req.query;

  const user = await User.findByPk(user_id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  // Optimized query to get friends in one go
  const friends_list = await User.findAll({
    include: [{
      model: UserCourses,
      as: 'UserCourses',
      include: [{
        model: Courses,
        as: 'Course'
      }]
    }],
    where: {
      id: {
        [Op.in]: sequelize.literal(`(
          SELECT DISTINCT uc2.user_id 
          FROM user_courses uc1 
          JOIN user_courses uc2 ON uc1.course_id = uc2.course_id 
          WHERE uc1.user_id = '${user_id}' 
          AND uc2.user_id != '${user_id}'
          AND uc2.user_id NOT IN (
            SELECT follower_id FROM follows WHERE followee_id = '${user_id}'
          )
        )`)
      }
    },
    limit: 50
  });
  res.json({ success: true, data: friends_list });
  }
  catch(error){
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/:id' ,async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
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
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});


/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               course:
 *                 type: string
 *               year_of_study:
 *                 type: string
 *               academic_interests:
 *                 type: string
 *               study_preferences:
 *                 type: string
 *               institution:
 *                 type: string
 *               school:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/register', optimizedAuth, async (req, res) => {
  try{
  console.log("Payload received on backend:", req.body)
  const {user_id,course,year_of_study,academic_interests,study_preferences,institution,school} = req.body;
  const user = await User.findOne({where:{id: user_id}});
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  await User.update(
  { course, year_of_study, academic_interests, study_preferences, institution, school },
  { where: { id: user_id } }
);

const updated_user = await User.findOne({ where: { id: user_id } });

  res.json({
    success: true,
    data: updated_user
  });
}
catch(error){
  console.error('Register user error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}
});

module.exports = router; 