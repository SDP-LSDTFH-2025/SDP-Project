const express = require('express');
const router = express.Router();
const {Follows_requests} = require('../models');
const {verifyToken, errorClass} = require('../middleware/tools');
const { User, Follows } = require('../models');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * /api/v1/friends/request:
 *   post:
 *     summary: Send a friend request to another user
 *     tags: [Friends]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - id
 *               - username
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase token of the user
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user sending the request
 *               username:
 *                 type: string
 *                 description: Username of the user to send a friend request to
 *     responses:
 *       200:
 *         description: Friend request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: friend request sent successfully
 *       400:
 *         description: Missing required information or friend request already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Insufficient information provided
 *       401:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid Token
 *       404:
 *         description: User does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User does not exist
 *       403:
 *         description: duplicate request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: request already sent
 *       500:
 *         description: Server error
 */

//friend requests
router.post('/request',async(req,res)=>{
    try{
        const {token,id,username} = req.body;

        if (!token||!id||!username){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }
        

        const friend =await User.findOne({where:{username:username}})
        if (!friend){
            console.log(friend);
            return errorClass.errorRes('User does not exist',res,404);
        }
        const existance = await Follows_requests.findOne({where:{follower_id:id,followee_id:friend.id}});
        if (existance){
            return errorClass.errorRes('Friend request already sent',res,403);
        }
        await Follows_requests.create({
            follower_id:id,
            followee_id:friend.id,
            created_at:new Date()
        })
        res.status(200).json({message:"friend request sent successfully",success:true});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

//friend request response
/**
 * @swagger
 * /api/v1/friends/request/response:
 *   post:
 *     summary: Respond to a friend request (accept or reject)
 *     tags: [Friends]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - id
 *               - requestID
 *               - response
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase token of the user
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user responding to the request
 *               requestID:
 *                 type: integer
 *                 description: ID of the friend request
 *               response:
 *                 type: string
 *                 enum: [accept, reject]
 *                 description: Response to the friend request
 *     responses:
 *       200:
 *         description: Friend request accepted or rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: You are now friends
 *       400:
 *         description: Missing required information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Insufficient information provided
 *       401:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid Token
 *       404:
 *         description: Friend request does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend request does not exist
 *       500:
 *         description: Server error
 */


router.post('/request/response', async (req, res) => {
    try {
        const { token, id, requestID, response } = req.body;

        if (!token||!id||!requestID||!response){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token, id)) {
        //     return errorClass.errorRes('Invalid Token', res,401);
        // }
        
        const request = await Follows_requests.findOne({ where: { id: requestID } });
        if (!request) {
            return errorClass.errorRes('Friend request does not exist', res,404);
        }

        if (response !== 'accept') {
            await Follows_requests.destroy({where:{ id: requestID }});
            return res.status(200).json({ message: "Friendship rejected" });
        }

        await sequelize.transaction(async (t) => {
            await Follows.findOrCreate({
                where: { follower_id: request.follower_id, followee_id: request.followee_id },
                defaults: { created_at: new Date() },
                transaction: t
            });
            await Follows.findOrCreate({
                where: { follower_id: request.followee_id, followee_id: request.follower_id },
                defaults: { created_at: new Date() },
                transaction: t
            });
        });

        await Follows_requests.destroy({where:{ id: requestID }})
        res.status(200).json({ message: "You are now friends",success:true });
    } catch (error) {
        errorClass.serverError(res);
        console.log(error);
    }
});

/**
 * @swagger
 * /api/v1/followers:
 *   post:
 *     summary: Retrieve all followers of a given user
 *     tags:
 *       - Friends
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - id
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase JWT token
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               id:
 *                 type: string
 *                 description: ID of the user whose followers are being retrieved
 *                 example: 123
 *     responses:
 *       200:
 *         description: Followers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: successful
 *                 followers:
 *                   type: array
 *                   description: List of followers
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Record ID in the Follows table
 *                       follower_id:
 *                         type: integer
 *                         description: ID of the follower
 *                       followee_id:
 *                         type: integer
 *                         description: ID of the followee
 *       400:
 *         description: Token or user ID not provided
 *       401:
 *         description: Invalid Token
 *       500:
 *         description: Internal server error
 */

//retrieves all my followers
router.post('/', async (req, res) => {
    try {
        const { token, id} = req.body;

        if (!token||!id){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token, id)) {
        //     return errorClass.errorRes('Invalid Token', res,401);
        // }
        
        const followers =await Follows.findAll({where:{followee_id:id}})
        
        res.status(200).json({ message: "successful", followers:followers,success:true });
    } catch (error) {
        errorClass.serverError(res);
        console.log(error);
    }
});

/**
 * @swagger
 * /api/v1/friends/request/pending:
 *   post:
 *     summary: Get pending follow requests
 *     description: Retrieves all pending follow requests for a given user.
 *     tags:
 *       - Friends
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - id
 *             properties:
 *               token:
 *                 type: string
 *                 description: Authentication token for the user.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *               id:
 *                 type: string
 *                 description: The ID of the user whose follow requests are being fetched.
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved pending follow requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: successful
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 followers:
 *                   type: array
 *                   description: List of pending follow requests
 *                   items:
 *                     type: object
 *                     description: Follow request object from the database
 *       400:
 *         description: Missing required fields (token or id).
 *       401:
 *         description: Invalid token provided.
 *       500:
 *         description: Internal server error.
 */

router.post('/request/pending', async (req, res) => {
    try {
        const { token, id} = req.body;

        if (!token||!id){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token, id)) {
        //     return errorClass.errorRes('Invalid Token', res,401);
        // }
        
        const followers =await Follows_requests.findAll({where:{followee_id:id}})
        
        res.status(200).json({ message: "successful", followers:followers,success:true });
    } catch (error) {
        errorClass.serverError(res);
        console.log(error);
    }
});

/**
 * @swagger
 * /api/v1/friends/request/pending/users:
 *   post:
 *     summary: Get pending follow request users
 *     description: Returns a list of users who have sent follow requests to a given followee.
 *     tags:
 *       - Friends
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - id
 *             properties:
 *               token:
 *                 type: string
 *                 description: authentication token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR..."
 *               id:
 *                 type: uuid
 *                 description: ID of the followee
 *                 example: 12d-w99h...
 *     responses:
 *       200:
 *         description: List of users who sent follow requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "successful"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 followers:
 *                   type: object
 *                   description: List of user objects who sent follow requests + the request info
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing or invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Insufficient information"
 *       401:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post('/request/pending/users', async (req, res) => {
    try {
        const { token, id} = req.body;

        if (!token||!id){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token, id)) {
        //     return errorClass.errorRes('Invalid Token', res,401);
        // }
        
        const requests =await Follows_requests.findAll({where:{followee_id:id}})
        let followers=[];
        console.log('loading...\n\n')
        
        for (let element of requests){
            const {follower_id} = element
            followers.push({user:await User.findOne({where:{id:follower_id}}),request:element})
        }
        
        res.status(200).json({ message: "successful", followers,success:true });
    } catch (error) {
        errorClass.serverError(res);
        console.log(error);
    }
});

module.exports = router;