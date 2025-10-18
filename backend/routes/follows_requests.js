const express = require('express');
const router = express.Router();
const {Follows_requests} = require('../models');
const {verifyToken, errorClass,recommendUsers} = require('../middleware/tools');
const { User, Follows, Notifications } = require('../models');
const { sequelize } = require('../config/database');
const { optimizedAuth } = require('../middleware/optimizedAuth');

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
router.post('/request', optimizedAuth, async(req,res)=>{
    try{
        const {username} = req.body;
        const {id: userId} = req.user; // Get user ID from middleware
        
        console.log('Friend request received:', { userId, username, user: req.user });

        if (!username){
            console.log('Missing username');
            return errorClass.insufficientInfo(res);
        }

        if (!userId){
            console.log('Missing userId from middleware');
            return errorClass.errorRes('User not authenticated', res, 401);
        }

        const friend = await User.findOne({where:{username:username}})
        if (!friend){
            console.log('Friend not found:', username);
            return errorClass.errorRes('User does not exist',res,404);
        }
        
        console.log('Friend found:', { id: friend.id, username: friend.username });
        
        // Test database connection
        try {
            const testQuery = await Follows_requests.count();
            console.log('Database connection test - Follows_requests count:', testQuery);
        } catch (dbError) {
            console.error('Database error:', dbError);
            return errorClass.errorRes('Database error', res, 500);
        }
        
        // Check if request already exists
        const existance = await Follows_requests.findOne({where:{follower_id:userId,followee_id:friend.id}});
        console.log('Checking existing request:', { exists: !!existance, follower_id: userId, followee_id: friend.id });
        if (existance){
            console.log('Friend request already exists');
            return errorClass.errorRes('Friend request already sent',res,403);
        }
        
        // Check if they're already friends
        const alreadyFriends = await Follows.findOne({where:{follower_id:userId,followee_id:friend.id}});
        console.log('Checking existing friendship:', { exists: !!alreadyFriends, follower_id: userId, followee_id: friend.id });
        if (alreadyFriends){
            console.log('Already friends');
            return errorClass.errorRes('You are already friends',res,403);
        }
        
        await Follows_requests.create({
            follower_id:userId,
            followee_id:friend.id,
            created_at:new Date()
        })

        // Create notification for friend request
        try {
            const sender = await User.findByPk(userId);
            await Notifications.create({
                user_id: friend.id,
                title: "New Friend Request",
                message: `${sender.username.replaceAll("_", " ")} sent you a friend request.`,
                read: false,
                created_at: new Date()
            });
        } catch (notificationError) {
            console.error('Failed to create notification for friend request:', notificationError);
            // Don't fail the main request if notification creation fails
        }
        
        console.log('Friend request created successfully');
        res.status(200).json({message:"friend request sent successfully",success:true});
    }
    catch(error){
        console.error('Friend request error:', error);
        errorClass.serverError(res);
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


router.post('/request/response', optimizedAuth, async (req, res) => {
    try {
        const { requestID, response } = req.body;
        const {id: userId} = req.user; // Get user ID from middleware

        if (!requestID||!response){
            return errorClass.insufficientInfo(res);
        }
        
        const request = await Follows_requests.findOne({ where: { id: requestID } });
        if (!request) {
            return errorClass.errorRes('Friend request does not exist', res,404);
        }

        // Verify the request belongs to the current user
        if (request.followee_id !== userId) {
            return errorClass.errorRes('Unauthorized to respond to this request', res,403);
        }

        if (response !== 'accept') {
            await Follows_requests.destroy({where:{ id: requestID }});
            return res.status(200).json({ message: "Friendship rejected", success: true });
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

        // Create notification for friend request acceptance
        try {
            const accepter = await User.findByPk(userId);
            await Notifications.create({
                user_id: request.follower_id,
                title: "Friend Request Accepted",
                message: `${accepter.username.replaceAll("_", " ")} accepted your friend request.`,
                read: false,
                created_at: new Date()
            });
        } catch (notificationError) {
            console.error('Failed to create notification for friend request acceptance:', notificationError);
            // Don't fail the main request if notification creation fails
        }

        await Follows_requests.destroy({where:{ id: requestID }})
        res.status(200).json({ message: "You are now friends",success:true });
    } catch (error) {
        errorClass.serverError(res);
        console.log(error);
    }
});

/**
 * @swagger
 * /api/v1/friends/unfriend:
 *   delete:
 *     summary: Unfriend a user
 *     tags: [Friends]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - friend_id
 *             properties:
 *               friend_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to unfriend
 *     responses:
 *       200:
 *         description: Successfully unfriended
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Successfully unfriended
 *       400:
 *         description: Missing required information
 *       404:
 *         description: Friendship not found
 *       500:
 *         description: Server error
 */
router.delete('/unfriend', optimizedAuth, async (req, res) => {
    try {
        const { friend_id } = req.body;
        const {id: userId} = req.user;

        if (!friend_id) {
            return errorClass.insufficientInfo(res);
        }

        // Remove both directions of the friendship
        await sequelize.transaction(async (t) => {
            await Follows.destroy({
                where: { 
                    follower_id: userId, 
                    followee_id: friend_id 
                },
                transaction: t
            });
            await Follows.destroy({
                where: { 
                    follower_id: friend_id, 
                    followee_id: userId 
                },
                transaction: t
            });
        });

        res.status(200).json({ message: "Successfully unfriended", success: true });
    } catch (error) {
        errorClass.serverError(res);
        console.log(error);
    }
});

/**
 * @swagger
 * /api/v1/friends/check:
 *   get:
 *     summary: Check if two users are friends
 *     tags: [Friends]
 *     parameters:
 *       - name: user_id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Current user ID
 *       - name: friend_id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Friend user ID to check
 *     responses:
 *       200:
 *         description: Friendship status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 are_friends:
 *                   type: boolean
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.get('/check', optimizedAuth, async (req, res) => {
    try {
        const { user_id, friend_id } = req.query;

        if (!user_id || !friend_id) {
            return errorClass.insufficientInfo(res);
        }

        // Check if they are friends (either direction)
        const friendship = await Follows.findOne({
            where: { 
                follower_id: user_id, 
                followee_id: friend_id 
            }
        });

        res.status(200).json({ 
            success: true, 
            are_friends: !!friendship 
        });
    } catch (error) {
        errorClass.serverError(res);
        console.log(error);
    }
});

/**
 * @swagger
 * /api/v1/friends:
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
 *                     description: user object
 *       400:
 *         description: Token or user ID not provided
 *       401:
 *         description: Invalid Token
 *       500:
 *         description: Internal server error
 */

//retrieves all my followers
router.post('/', optimizedAuth, async (req, res) => {
    try {
        const {id: userId} = req.user; // Get user ID from middleware
        
        const followers =await Follows.findAll({where:{followee_id:userId}})
        let followers_users=[];
        
        for (let element of followers){
            const {follower_id} = element
            followers_users.push(await User.findOne({where:{id:follower_id}}))
        }
        
        res.status(200).json({ message: "successful", followers:followers_users,success:true });
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

router.post('/request/pending', optimizedAuth, async (req, res) => {
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

// Get sent friend requests
router.post('/request/sent', optimizedAuth, async (req, res) => {
    try {
        const {id: userId} = req.user; // Get user ID from middleware
        
        const requests = await Follows_requests.findAll({where:{follower_id:userId}})
        let sentRequests = [];
        
        for (let element of requests){
            const {followee_id} = element;
            const user = await User.findOne({where:{id:followee_id}});
            if (user) {
                sentRequests.push({
                    request: element,
                    user: user
                });
            }
        }
        
        res.status(200).json({success: true, followers: sentRequests});
    } catch (error) {
        console.error('Get sent requests error:', error);
        errorClass.serverError(res);
    }
});

router.post('/request/pending/users', optimizedAuth, async (req, res) => {
    try {
        const {id: userId} = req.user; // Get user ID from middleware
        
        const requests =await Follows_requests.findAll({where:{followee_id:userId}})
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

/**
 * @swagger
 * /api/v1/friends/recommend/{token}/{id}/{index}/{threshold}:
 *   get:
 *     summary: Recommend similar users
 *     description: Retrieves a list of users similar to the given user based on weighted attributes like role, institution, school, year of study, and course.
 *     tags:
 *       - Friends
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication token for the user.
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to find similar users for.
 *     responses:
 *       200:
 *         description: Successfully retrieved similar users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successful"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   description: List of recommended users
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing required fields (token or id).
 *       401:
 *         description: Invalid token provided.
 *       404:
 *         description: Reference user does not exist.
 *       500:
 *         description: Internal server error.
 */


router.get('/recommend/:token/:id', optimizedAuth, async (req,res)=>{
    try{
        let {token,id} = req.params;
        if (!token||!id) {
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }

        //default run
        let count = await User.count()
        if (count<20){//not enough people to rendomly pick
            count = 0;
        }
        index = Math.round(parseInt(index)/20) || Math.round(Math.random() * count);
        threshold = parseFloat(threshold) || 0.6;

        const user = await User.findOne({where:{id}});
        if (!user) {
            return errorClass.errorRes('User does not exist', res, 404);
        }
        const users = await User.findAll({
            limit: 20,
            offset: index
        });

        const similarUsers = recommendUsers(user,users);
        res.status(200).json({ message: "Successful", success: true, users:similarUsers });
    }
    catch (error) {
        console.error(error);
        errorClass.serverError(res);
    }
})

/**
 * @swagger
 * /api/v1/friends/recommend/{token}/{id}/{index}/{threshold}:
 *   get:
 *     summary: Recommend similar users
 *     description: Retrieves a list of users similar to the given user based on weighted attributes like role, institution, school, year of study, and course.
 *     tags:
 *       - Friends
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication token for the user.
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to find similar users for.
 *       - name: index
 *         in: path
 *         required: false
 *         schema:
 *           type: integer
 *         description: Pagination index for selecting the batch of candidate users. Defaults to random selection.
 *       - name: threshold
 *         in: path
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum similarity threshold (0-1) to filter recommended users. Defaults to 0.6.
 *     responses:
 *       200:
 *         description: Successfully retrieved similar users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successful"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   description: List of recommended users
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing required fields (token or id).
 *       401:
 *         description: Invalid token provided.
 *       404:
 *         description: Reference user does not exist.
 *       500:
 *         description: Internal server error.
 */

router.get('/recommend/:token/:id/:index/:threshold', optimizedAuth, async (req,res)=>{
    try{
        let {token,id,index,threshold} = req.params;
        if (!token||!id) {
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }

        //default run
        let count = await User.count()
        if (count<20){//not enough people to rendomly pick
            count = 0;
        }
        index = Math.round(parseInt(index)/20) || Math.round(Math.random() * count);
        threshold = parseFloat(threshold) || 0.6;

        const user = await User.findOne({where:{id}});
        if (!user) {
            return errorClass.errorRes('User does not exist', res, 404);
        }
        const users = await User.findAll({
            limit: 20,
            offset: index
        });

        const similarUsers = recommendUsers(user,users);
        res.status(200).json({ message: "Successful", success: true, users:similarUsers });
    }
    catch (error) {
        console.error(error);
        errorClass.serverError(res);
    }
})

module.exports = router;