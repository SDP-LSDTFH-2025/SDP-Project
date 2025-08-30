const express = require('express');
const router = express.Router();
const { Study_groups,Group_members} = require('../models');
const {verifyToken, errorClass} = require('../middleware/tools');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * /api/v1/study_groups/create:
 *   post:
 *     summary: Create a new study group and add the creator as a member
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
 *               - name
 *               - course_id
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase token of the user
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user creating the group
 *               name:
 *                 type: string
 *                 description: Name of the group
 *               course_id:
 *                 type: integer
 *                 description: ID of the course this group belongs to
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
 *       500:
 *         description: Server error
 */

//friend requests
router.post('/create',async(req,res)=>{
    try{
        const {token,id,name,course_id} = req.body;

        if (!token||!id||!name||!course_id){
            return errorClass.insufficientInfo(res);
        }
        if (!verifyToken.fireBaseToken(token,id)){
            return errorClass.errorRes('Invalid Token',res,401);
        }
        
        const group = await Study_groups.create({
            name:name,
            course_id:course_id,
            creator_id:id,
            disabled:false,
            created_at: new Date()
        })
        await Group_members.create({
            group_id:group.id,
            user_id:id,
            joined_at: new Date()
        })
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
        if (!verifyToken.fireBaseToken(token,id)){
            return errorClass.errorRes('Invalid Token',res,401);
        }
        
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
        if (!verifyToken.fireBaseToken(token,id)){
            return errorClass.errorRes('Invalid Token',res,401);
        }
        
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
        const groups = await Study_groups.findAll({
            attributes: { exclude: ['creator_id','disabled'] }
            });

        res.status(200).json({message:"Successfully fetched all the groups", groups:groups});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

module.exports = router;