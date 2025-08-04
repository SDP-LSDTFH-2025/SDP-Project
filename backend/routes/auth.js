const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { enhancedAuth, blacklistToken } = require('../middleware/security');
const { 
  sanitizeInput, 
  authLimiter, 
  registerLimiter, 
  userValidation, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Google OAuth login URL
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Google OAuth URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auth_url:
 *                   type: string
 *                   description: Google OAuth authorization URL
 */
router.get('/google', (req, res) => {
  // Mock Google OAuth URL - in production, this would be the actual Google OAuth URL
  const mockGoogleAuthUrl = 'https://accounts.google.com/oauth/authorize?' +
    'client_id=mock-client-id' +
    '&redirect_uri=http://localhost:3000/api/v1/auth/google/callback' +
    '&response_type=code' +
    '&scope=email profile' +
    '&state=' + Math.random().toString(36).substring(7);
  
  res.json({
    success: true,
    auth_url: mockGoogleAuthUrl
  });
});

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for security
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid authorization code
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required'
      });
    }

    // Mock Google OAuth token exchange
    const mockGoogleUser = {
      id: 'google_' + Math.random().toString(36).substring(7),
      email: 'user@example.com',
      name: 'Mock Google User',
      given_name: 'Mock',
      family_name: 'User',
      picture: 'https://via.placeholder.com/150'
    };

    // Find or create user
    let user = await User.findOne({
      where: { email: mockGoogleUser.email }
    });

    if (!user) {
      // Create new user from Google data
      user = await User.create({
        email: mockGoogleUser.email,
        username: mockGoogleUser.email.split('@')[0] + '_' + Math.random().toString(36).substring(7),
        password: Math.random().toString(36).substring(7), // Random password for Google users
        first_name: mockGoogleUser.given_name,
        last_name: mockGoogleUser.family_name,
        is_active: true
      });
    } else {
      // Update existing user's Google info
      await user.update({
        first_name: mockGoogleUser.given_name,
        last_name: mockGoogleUser.family_name,
        last_login: new Date()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Google login successful',
      data: user,
      token
    });
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/google/mock:
 *   post:
 *     summary: Mock Google OAuth login (for testing)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               given_name:
 *                 type: string
 *               family_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mock Google login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 */
router.post('/google/mock', 
  sanitizeInput,
  async (req, res) => {
  try {
    const { email, name, given_name, family_name } = req.body;

    // Find or create user
    let user = await User.findOne({
      where: { email }
    });

    if (!user) {
      // Create new user from mock Google data
      user = await User.create({
        email,
        username: email.split('@')[0] + '_' + Math.random().toString(36).substring(7),
        password: Math.random().toString(36).substring(7), // Random password for Google users
        first_name: given_name || name.split(' ')[0],
        last_name: family_name || name.split(' ').slice(1).join(' '),
        is_active: true
      });
    } else {
      // Update existing user's info
      await user.update({
        first_name: given_name || name.split(' ')[0],
        last_name: family_name || name.split(' ').slice(1).join(' '),
        last_login: new Date()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Mock Google login successful',
      data: user,
      token
    });
  } catch (error) {
    console.error('Mock Google login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user (email/password)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', 
  registerLimiter,
  sanitizeInput,
  userValidation.register,
  handleValidationErrors,
  async (req, res) => {
  try {
    const { email, username, password, first_name, last_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      username,
      password,
      first_name,
      last_name
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user (email/password)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', 
  authLimiter,
  sanitizeInput,
  userValidation.login,
  handleValidationErrors,
  async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', enhancedAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user (client-side token removal)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', enhancedAuth, (req, res) => {
  // Blacklist the current token
  blacklistToken(req.token);
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router; 