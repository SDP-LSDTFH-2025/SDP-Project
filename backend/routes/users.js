const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { enhancedAuth } = require('../middleware/security');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */


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
 *           type: integer
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
 *               google_id:
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
router.post('/register', async (req, res) => {
  try{
  console.log("Payload received on backend:", req.body)
  const {google_id,course,year_of_study,academic_interests,study_preferences,institution,school} = req.body;
  const user = await User.findOne({where:{google_id}});
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  await User.update(
  { course, year_of_study, academic_interests, study_preferences, institution, school },
  { where: { google_id } }
);

const updated_user = await User.findOne({ where: { google_id } });

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