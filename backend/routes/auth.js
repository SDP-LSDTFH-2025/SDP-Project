const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const { enhancedAuth} = require('../middleware/security');


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Google OAuth authentication endpoints
 */

/**
 * @swagger
 * /api/v1/auth/google/verify:
 *   post:
 *     summary: Verify Google access token and create/update user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               access_token:
 *                 type: string
 *                 description: Google access token
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: Invalid access token
 *       500:
 *         description: Internal server error
 */
router.post('/google/verify', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'Access token is required'
      });
    }

    // Verify the token with Google
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`);
    
    if (!googleResponse.ok) {
      return res.status(400).json({
        success: false,
        error: 'Invalid access token'
      });
    }

    const googleUser = await googleResponse.json();
    
    // Find or create user in database
    let user = await User.findOne({
      where: { google_id: googleUser.id }
    });

    if (!user) {
      // Create new user
      user = await User.create({
        google_id: googleUser.id,
        username: googleUser.given_name + '_' + googleUser.family_name,
        is_active: true
      });
    } else {
      // Update existing user's last login
      await user.update({
        last_login: new Date()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.google_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      data: user,
      token
    });

  } catch (error) {
    console.error('Google verify error:', error);
    console.log(error);
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               google_id:
 *                 type: string
 *                 description: Google OAuth ID
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
    const { google_id } = req.body;
    const user = await User.findOne({
      where: { google_id: google_id }
    });
    if(!user){
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
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
router.post('/logout', async (req, res) => {
  
 
  try{
    const { google_id } = req.body;
    console.log(google_id);
    await User.update({
      last_login: new Date()
    }, {
      where: {
        google_id: google_id  
      }
    });
   
    return res.json({
      success: true,
      message: 'Logout successful'
    });
     
  } catch (error) {
    console.error('Logout error:', error);
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router; 