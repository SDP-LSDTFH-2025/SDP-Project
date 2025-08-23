const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { enhancedAuth} = require('../middleware/security');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const {errorClass, isValidEmail, generateID} = require('../middleware/tools');
const crypto = require('crypto');
const bcript = require('bcrypt');

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

    const ticket = await client.verifyIdToken({
      idToken: access_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({
        success: false,
        error: 'Invalid access token' 
      });
    }

    const googleUser = payload;
    console.log(googleUser);
    
    // Find or create user in database
    let user = await User.findOne({
      where: { google_id: googleUser.sub}
    });
    
    let un_username = `${googleUser.given_name}_${googleUser.family_name}`;
    let suffix = 1;
    while (await User.findOne({ where: { username: un_username } })) {
      un_username = `${googleUser.given_name}_${googleUser.family_name}_${suffix++}`;
    }
        if (!user) {
      // Create new user
      user = await User.create({
        google_id: googleUser.sub,
        username: un_username,
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
    console.error('Google verify error:', error.message);
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


//Manual signing in routes:
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /api/v1/auth/signIn:
 *   post:
 *     summary: generates user id to create new users, returns a message and a token
 *     tags: [Manual Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *               username:
 *                 type: string
 *                 description: User's username
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: email/password/username not provided
 *       500:
 *         description: Internal server error
 */

router.post('/signIn',async (req,res)=>{
    try{
        //checking the availability of the request body
        if (!req.body){
            return errorClass.insufficientInfo(res);
        }
        const {email,password,username} = req.body;
        if (!email || !password){
            return errorClass.insufficientInfo(res);
        }
        if (!isValidEmail(email)){
            return errorClass.errorRes('invalid email',res);
        }
        
        //hashing valuable information
        const H_email = await crypto.createHash('sha256').update(email).digest("hex"); //allows lookup in the db
        const H_password = await bcript.hash(password,12); //untracable even from the rainbow table

        //storing the user to db
        let sub = generateID(13);
        while (await User.findOne({where:{google_id:sub}})) {
            sub = generateID();
        }

        await User.create({
                google_id:sub,
                username:username,
                last_login: new Date(),
                created_at: new Date(),
                h_email:H_email,
                h_password:H_password
            });
            
        //generate token
        const Token = jwt.sign(
            { id: sub, username: username},
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
            );

        res.status(200).json({message:'successful operation',token:Token});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
});

/**
 * @swagger
 * /api/v1/auth/logIn:
 *   post:
 *     summary: checks if user exists, if true then return a token
 *     tags: [Manual Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address (provide either email or username)
 *               username:
 *                 type: string
 *                 description: User's username (provide either email or username)
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: User exists, token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: email/password/username not provided
 *       500:
 *         description: Internal server error
 */

router.post('/logIn',async (req,res)=>{
    try{
        //checking the availability of the request body
        if (!req.body){
            return errorClass.insufficientInfo(res);
        }
        const {email,password,username} = req.body;
        if ((!email && !username) || !password){
            return errorClass.insufficientInfo(res);
        }
        //"email":"gaming@gmail.com",

        let user;
        if (email){//email login
            if (!isValidEmail(email)){
                return errorClass.errorRes('invalid email snytax',res);
            }
            const H_email = await crypto.createHash('sha256').update(email).digest("hex"); //allows lookup in the db
            user = await User.findOne({where:{h_email:H_email}});
        }
        else{//username login
            user = await User.findOne({where:{username:username}});
        }
        if (!user){
            return errorClass.userNotFound(res);
        }
            
        //generate token
        const Token = jwt.sign(
            { id: user.google_id, username: username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({message:'successful operation',token:Token});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
});


module.exports = router; 