const express = require('express');
const router = express.Router();
const { Study_groups,Group_members, Courses, User} = require('../models');
const {verifyToken, errorClass, courseVariants} = require('../middleware/tools');
const { sequelize } = require('../config/database');
const { spliceStr } = require('sequelize/lib/utils');
const { Op, where} = require("sequelize");

/**
 * @swagger
 * /api/v1/study_groups/create:
 *   post:
 *     summary: Create a new study group
 *     description: Creates a new study group with the given details and adds the creator and participants as members.
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - id
 *               - title
 *               - course_code
 *             properties:
 *               token:
 *                 type: string
 *                 description: Authentication token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR..."
 *               id:
 *                 type: string
 *                 description: ID of the user creating the group
 *                 example: "d05d85d5-8864-4ebf-9326-0970011cace7"
 *               title:
 *                 type: string
 *                 description: Title of the study group
 *                 example: "Algorithms Revision"
 *               course_code:
 *                 type: code
 *                 description: Associated course code
 *                 example: "23A"
 *               description:
 *                 type: string
 *                 description: Optional group description
 *                 example: "Group to prepare for final exam"
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of user IDs to add as participants
 *                 example: ["d05d85d5-8864-4ebf-9326-0970011cace7"]
 *     responses:
 *       200:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Group created successfully
 *       400:
 *         description: Insufficient information provided
 *       401:
 *         description: Invalid token
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */


router.post('/create',async(req,res)=>{
    try{
        const {token,id,title,course_code,description,participants} = req.body;

        if (!token||!id||!title||!course_code){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }
   
        const group = await Study_groups.create({
            name:title,
            course_code:course_code,
            creator_id:id,
            disabled:false,
            created_at: new Date(),
            description:description||'no group description'
        })
        await Group_members.create({
            group_id:group.id,
            user_id:id,
            joined_at: new Date()
        })
        for (let member_id of participants){
            await Group_members.create({
                group_id:group.id,
                user_id:member_id,
                joined_at: new Date()
            });
        }
        res.status(200).json({message:"Group created successfully"});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

/**
 * @swagger
 * /api/v1/study_groups/join:
 *   post:
 *     summary: Join a study group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - id
 *               - groupID
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase token of the user
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user joining the group
 *               groupID:
 *                 type: integer
 *                 description: ID of the group to join
 *     responses:
 *       200:
 *         description: Successfully joined the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully joined the group
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
 *       409:
 *         description: User is already a member of the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are already a member of this group
 *       410:
 *        description: Group inexistance
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Group does not exist
 *       500:
 *         description: Server error
 */


router.post('/join',async(req,res)=>{
    try{
        const {token,id,groupID} = req.body;

        if (!token||!id||!groupID){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }
        
        const joined = await Group_members.findOne({where:{user_id:id,group_id:groupID}});
        if (joined){
            console.log(joined);
            return errorClass.errorRes('You are already a member of this group',res,409);
        }

        const groupExistance = Study_groups.findOne({where:{id:groupID}})
        if (!groupExistance){
            return errorClass.errorRes('Group does not exist',res,410)
        }
        await Group_members.create({
            group_id:groupID,
            user_id:id,
            joined_at: new Date()
        })
        res.status(200).json({message:"Successfully joined the group"});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

/**
 * @swagger
 * /api/v1/study_groups/leave:
 *   post:
 *     summary: Leave a study group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - id
 *               - groupID
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase token of the user
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user leaving the group
 *               groupID:
 *                 type: integer
 *                 description: ID of the group to leave
 *     responses:
 *       200:
 *         description: Successfully left the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully left the group
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
 *         description: User is not a member of the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not a member of this group
 *       500:
 *         description: Server error
 */


router.post('/leave',async(req,res)=>{
    try{
        const {token,id,groupID} = req.body;

        if (!token||!id||!groupID){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }
        
        const joined = await Group_members.findOne({where:{user_id:id,group_id:groupID}});
        if (!joined){
            return errorClass.errorRes('You are not a member of this group',res,404);
        }

        await Group_members.destroy({where:{
            group_id:groupID,
            user_id:id,
            }})
        res.status(200).json({message:"Successfully left the group"});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

/**
 * @swagger
 * /api/v1/study_groups:
 *   get:
 *     summary: Fetch all study groups
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: Successfully fetched all groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched all the groups
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       course_code:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


router.get('/',async(req,res)=>{
    try{
        // Get all group memberships
        const group_members = await Group_members.findAll();
        const group_ids = group_members.map(g => g.group_id);

        // Get groups
        const groups = await Study_groups.findAll({
            where: { id: group_ids }
        });

        // Get creators
        const creator_ids = groups.map(g => g.creator_id);
        const creators = await User.findAll({
            where: { id: creator_ids }
        });

        // Get all users for participants
        const user_ids = group_members.map(g => g.user_id);
        const users = await User.findAll({
            where: { id: user_ids }
        });

        let myGroups = [];

        for (let group of groups) {
            // Find creator
            const creator = creators.find(c => c.id === group.creator_id);

            // Find participants
            const participant_ids = group_members
                .filter(gm => gm.group_id === group.id)
                .map(gm => gm.user_id);

            const participants = users.filter(u => participant_ids.includes(u.id));

            // Push enriched group
            const plainGroup = group.toJSON();
            plainGroup.creator_name= creator?.username;
            plainGroup.participants = participants;
            myGroups.push(plainGroup);
        }

        res.status(200).json({
            message: "Successfully fetched the group",
            groups: myGroups
        });

    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

/**
 * @swagger
 * /api/v1/study_groups/byID/{id}:
 *   get:
 *     summary: Get a study group by ID
 *     description: Fetches the details of a study group by its unique identifier.
 *     tags:
 *       - Groups
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the study group to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched the specified group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched the specified group
 *                 group:
 *                   type: object
 *                   description: The study group object without `creator_id` and `disabled`
 *       400:
 *         description: Invalid request (e.g. malformed ID)
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

router.get('/byID/:id',async(req,res)=>{
    try{
        const id = req.params.id;
        const group = await Study_groups.findOne({
            attributes: { exclude: ['creator_id','disabled'] },
            where:{id:id}
            });

        res.status(200).json({message:"Successfully fetched the specified group", group:group});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})
/**
 * @swagger
 * /api/v1/study_groups/byName/{name}:
 *   get:
 *     summary: Get a study group by name
 *     description: Fetches the details of a study group by its unique name.
 *     tags:
 *       - Groups
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: The name of the study group to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched the specified group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched the specified group
 *                 group:
 *                   type: object
 *                   description: The study group object without `creator_id` and `disabled`
 *       400:
 *         description: Invalid request (e.g. missing or malformed name)
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

router.get('/byName/:name',async(req,res)=>{
    try{
        const name = req.params.name;
        const group = await Study_groups.findOne({
            attributes: { exclude: ['creator_id','disabled'] },
            where:{name:name}
            });

        res.status(200).json({message:"Successfully fetched the specified group", group:group});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

/**
 * @swagger
 * /api/v1/study_groups/byCreator/{creatorID}:
 *   get:
 *     summary: Get a study group by creator ID
 *     description: Fetches the details of a study group created by a specific user.
 *     tags:
 *       - Groups
 *     parameters:
 *       - in: path
 *         name: creatorID
 *         required: true
 *         description: The unique ID of the creator whose study group should be fetched
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched the specified group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched the specified group
 *                 group:
 *                   type: object
 *                   description: The study group object without `creator_id` and `disabled`
 *       400:
 *         description: Invalid request (e.g. missing or malformed creatorID)
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

router.get('/byCreator/:creatorID',async(req,res)=>{
    try{
        const creatorID = req.params.creatorID;
        const group = await Study_groups.findOne({
            attributes: { exclude: ['creator_id','disabled'] },
            where:{creator_id:creatorID}
            });

        res.status(200).json({message:"Successfully fetched the specified group", group:group});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

/**
 * @swagger
 * /api/v1/study_groups/myGroups/{token}/{id}:
 *   get:
 *     summary: Fetch groups belonging to a specific user
 *     description: Returns all groups where the given user ID is a member. Requires a token and user ID.
 *     tags:
 *       - Groups
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication token for the request.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose groups are being fetched.
 *     responses:
 *       200:
 *         description: Successfully fetched the specified group(s).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched the specified group
 *                 group:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Group member object
 *       400:
 *         description: Missing token or user ID (Insufficient info).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   example: Insufficient info provided by client
 *       401:
 *         description: Invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   example: Invalid Token
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   example: Internal server error
 */


router.get('/myGroups/:token/:id',async(req,res)=>{
    try{
        const {token,id} = req.params;

        if (!token||!id) {
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }

        // Get all group memberships
        const group_members = await Group_members.findAll({
        where: { user_id: id }
        });
        const group_ids = group_members.map(g => g.group_id);

        // Get groups
        const groups = await Study_groups.findAll({
            where: { id: group_ids }
        });

        // Get creators
        const creator_ids = groups.map(g => g.creator_id);
        const creators = await User.findAll({
            where: { id: creator_ids }
        });

        // Get all users for participants
        const user_ids = group_members.map(g => g.user_id);
        const users = await User.findAll({
            where: { id: user_ids }
        });

        let myGroups = [];

        for (let group of groups) {
            // Find creator
            const creator = creators.find(c => c.id === group.creator_id);

            // Find participants
            const participant_ids = group_members
                .filter(gm => gm.group_id === group.id)
                .map(gm => gm.user_id);

            const participants = users.filter(u => participant_ids.includes(u.id));

            // Push enriched group
            const plainGroup = group.toJSON();
            plainGroup.creator_name= creator?.username;
            plainGroup.participants = participants;
            myGroups.push(plainGroup);
        }

        res.status(200).json({
            message: "Successfully fetched the group",
            groups: myGroups
        });

    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

/**
 * @swagger
 * /api/v1/study_groups/recommendedGroups/{token}/{id}:
 *   get:
 *     summary: Fetch recommended study groups for a user
 *     description: Returns a list of study groups recommended based on the user's academic interests.  
 *     tags:
 *       - Groups
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication token for the request.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID whose recommended groups will be fetched.
 *     responses:
 *       200:
 *         description: Successfully fetched recommended groups.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched the specified group
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Recommended study group object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "123"
 *                       name:
 *                         type: string
 *                         example: "Mathematics Study Group"
 *                       course_code:
 *                         type: string
 *                         example: "MATH101"
 *                       description:
 *                         type: string
 *                         example: "A group for students interested in calculus and linear algebra."
 *       400:
 *         description: Missing token or user ID (Insufficient info).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   example: Insufficient info provided by client
 *       401:
 *         description: Invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   example: Invalid Token
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   example: Internal server error
 */


router.get('/recommendedGroups/:token/:id',async(req,res)=>{
    try{
        const {token,id} = req.params;

        if (!token||!id) {
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }
        let myGroups = [];
        const user = await User.findOne({
            where:{id}
        })

        if (!user["academic_interests"]){
            res.status(200).json({message:"User has no academic interests"});
            return;
        }
        let count = 0;
        const interest = user["academic_interests"].split(",");
        const interestExpand = courseVariants(interest);

        for (let potential of interestExpand){
            const groups = await Study_groups.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${potential}%`  // contains "math" in any case
                    }
                }
                });

            for (let group of groups){
                count++;
                myGroups.push(group)
            }
        }


        res.status(200).json({message:"Successfully fetched the specified group", groups:myGroups, success: true},count);
    }
    catch(error){
        //server error
        errorClass.serverError(res);
        console.log(error);
    }
})

module.exports = router;