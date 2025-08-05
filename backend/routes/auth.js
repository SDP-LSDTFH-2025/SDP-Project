const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const { enhancedAuth, blacklistToken } = require('../middleware/security');


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Google OAuth authentication endpoints
 */

// Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({
      where: { google_id: profile.id }
    });

    if (!user) {
      // Create new user from Google data
      user = await User.create({
        google_id: profile.id,
        email: profile.emails[0].value,
        username: profile.emails[0].value.split('@')[0] + '_' + Math.random().toString(36).substring(7),
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        auth_provider: 'google',
        is_active: true
      });
    } else {
      // Update existing user's info
      await user.update({
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        last_login: new Date()
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

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
 *                 success:
 *                   type: boolean
 *                 auth_url:
 *                   type: string
 *                   description: Google OAuth authorization URL
 */
router.get('/google', (req, res) => {
  const googleAuthUrl = 'https://accounts.google.com/oauth/authorize?' +
    'client_id=' + process.env.GOOGLE_CLIENT_ID +
    '&redirect_uri=' + encodeURIComponent(process.env.GOOGLE_CALLBACK_URL) +
    '&response_type=code' +
    '&scope=email profile' +
    '&state=' + Math.random().toString(36).substring(7);
  
  res.json({
    success: true,
    auth_url: googleAuthUrl
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
 *       500:
 *         description: Internal server error
 */
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // For production, you might want to redirect to your frontend with the token
      // or return it in a way that your frontend can handle
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
  }
);

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