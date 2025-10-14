const express = require('express');
const router = express.Router();
const {Progress} = require('../models');
const {verifyToken, errorClass} = require('../middleware/tools');

/**
 * @swagger
 * /api/v1/progress/update:
 *   post:
 *     summary: Update an existing user progress entry
 *     description: >
 *       Updates an existing study progress record for a given user and topic.  
 *       If no record is found, a 404 error is returned.  
 *       Automatically updates hours studied, section, progress percentage, and study streak.
 *     tags:
 *       - Progress
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - id
 *               - topic
 *               - hours_studied
 *             properties:
 *               token:
 *                 type: string
 *                 description: Authentication token for the user (Firebase token)
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               id:
 *                 type: string
 *                 description: Unique identifier for the user
 *                 example: "d05d85d5-8864-4ebf-9326-0970011cace7"
 *               topic:
 *                 type: string
 *                 description: The topic to update progress for
 *                 example: "Linear Algebra"
 *               section:
 *                 type: string
 *                 description: Optional section name being studied
 *                 example: "Vector Spaces"
 *               hours_studied:
 *                 type: number
 *                 description: Number of additional hours studied
 *                 example: 1.5
 *               progress:
 *                 type: number
 *                 description: Progress percentage (0–100)
 *                 example: 75
 *     responses:
 *       200:
 *         description: Successfully updated existing progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully updated progress"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing required fields in the request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Insufficient information provided"
 *       401:
 *         description: Invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Token"
 *       404:
 *         description: No progress entry found for the given user and topic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Progress not found"
 *       500:
 *         description: Internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post('/update', async(req,res)=>{
    try{
        const {token,id,topic,section,hours_studied,progress} = req.body;

        if (!token||!id||!topic||!hours_studied){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }
        

        const progressEntry = await Progress.findOne({where:{user_id:id,topic}});
        if (!progressEntry){//create one if a user does not have any progress
            return errorClass.errorRes("Progress not found",res,404);
        }
        let completed = false;
        if (progress == 100.) completed = true;

        let study_streak_change = 0;
        const today = new Date();
        const last_day = progressEntry.date_last_studied;

        if (today.getDay == 1) study_streak_change = 1; //temporary fix
        else if (today.getDay - 1 == last_day.getDay) study_streak_change = 1;

        //update the existing progress
        await progressEntry.update({
            section: section || progressEntry.section,
            hours_studied: progressEntry.hours_studied + hours_studied,
            progress: progress||progressEntry.progress,
            date_last_studied: today,
            completed,
            study_days_streak: progressEntry.study_days_streak + 1
        });
        
        res.status(200).json({ message: "Successfully updated progress",success:true });
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})


/**
 * @swagger
 * /api/v1/progress/create:
 *   post:
 *     summary: Create a progress entry for a user
 *     description: >
 *       This endpoint records a user's study progress, including topic, section, and hours studied.  
 *       It requires a valid `token`, `id`, `topic`, and `hours_studied` in the request body.
 *     tags:
 *       - Progress
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - id
 *               - topic
 *               - hours_studied
 *             properties:
 *               token:
 *                 type: string
 *                 description: Authentication token for the user (Firebase token)
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               id:
 *                 type: string
 *                 description: Unique identifier for the user
 *                 example: "d05d85d5-8864-4ebf-9326-0970011cace7"
 *               topic:
 *                 type: string
 *                 description: The topic the user studied
 *                 example: "Linear Algebra"
 *               section:
 *                 type: string
 *                 description: Optional section name of the topic
 *                 example: "Matrix Operations"
 *               hours_studied:
 *                 type: number
 *                 description: Number of hours the user spent studying
 *                 example: 2.5
 *     responses:
 *       200:
 *         description: Successfully recorded progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully updated progress"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Insufficient information provided"
 *       401:
 *         description: Invalid token (authentication failed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Token"
 *       500:
 *         description: Server error occurred while processing the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */


router.post('/create', async(req,res)=>{
    try{
        const {token,id,topic,section,hours_studied} = req.body;

        if (!token||!id||!topic||!hours_studied){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }
        

        progressEntry = await Progress.create({
                user_id:id,
                topic,
                section: section||"Unknown",
                hours_studied,
                date_last_studied:new Date(),
                
            })
    
        res.status(200).json({ message: "Successfully updated progress",success:true });
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

/**
 * @swagger
 * /api/v1/progress/delete/{token}/{id}/{topic}:
 *   delete:
 *     summary: Delete an existing user progress entry
 *     description: >
 *       Deletes a specific study progress record for a given user and topic.  
 *       Requires valid authentication token, user ID, and topic name.  
 *       Returns a 404 error if the progress entry does not exist.
 *     tags:
 *       - Progress
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication token for the user (Firebase token)
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the user
 *         example: "d05d85d5-8864-4ebf-9326-0970011cace7"
 *       - in: path
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic name associated with the progress entry
 *         example: "Data Structures"
 *     responses:
 *       200:
 *         description: Successfully deleted the progress record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully deleted progress"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing or invalid parameters in the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Insufficient information provided"
 *       401:
 *         description: Invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Token"
 *       404:
 *         description: The specified progress entry does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Progress/Topic does not exist"
 *       500:
 *         description: Internal server error occurred while deleting progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */


router.delete('/delete/:token/:id/:topic', async (req, res) => {
    try {
        const {token, id, topic} = req.params;

        if (!token||!id || !topic) {
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }

        const progressEntry = await Progress.findOne({ where: { user_id: id, topic } });

        if (!progressEntry) {
            return errorClass.errorRes('Progress/Topic does not exist', res, 404);
        }

        await progressEntry.destroy();
        res.status(200).json({ message: "Successfully deleted progress", success: true });
    } catch (error) {
        console.error(error);
        errorClass.serverError(res);
    }
});


module.exports = router;