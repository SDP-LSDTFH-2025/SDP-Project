const express = require('express');
const router = express.Router();
const { Study_groups,Group_members} = require('../models');
const {verifyToken, errorClass} = require('../middleware/tools');
const { sequelize } = require('../config/database');

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
 *                 example: "12345"
 *               title:
 *                 type: string
 *                 description: Title of the study group
 *                 example: "Algorithms Revision"
 *               course_code:
 *                 type: string
 *                 description: Associated course code
 *                 example: "CS101"
 *               description:
 *                 type: string
 *                 description: Optional group description
 *                 example: "Group to prepare for final exam"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Optional creation date (defaults to now)
 *                 example: "2025-09-24T14:48:00.000Z"
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of user IDs to add as participants
 *                 example: ["67890", "24680"]
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
 *       500:
 *         description: Internal server error
 */


router.post('/create',async(req,res)=>{
    try{
        const {token,id,title,course_code,description,date,participants} = req.body;

        if (!token||!id||!title||!course_code){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }
        
        const group = await Study_groups.create({
            name:title,
            course_id:course_code,
            creator_id:id,
            disabled:false,
            created_at: date||new Date(),
            description:description||'no group description'
        })
        await Group_members.create({
            group_id:group.id,
            user_id:id,
            joined_at: date||new Date()
        })
        for (let member_id in participants){
            await Group_members.create({
                group_id:group.id,
                user_id:member_id,
                joined_at: date||new Date()
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
 *                       course_id:
 *                         type: integer
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
        const groups = await Study_groups.findAll();

        res.status(200).json({message:"Successfully fetched all the groups", groups:groups});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

/**
 * @swagger
 * /byID/{id}:
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
 * /byName/{name}:
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
 * /byCreator/{creatorID}:
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

module.exports = router;