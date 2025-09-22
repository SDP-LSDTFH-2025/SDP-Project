const express = require('express');
const router = express.Router();
const {Progress} = require('../models');
const {verifyToken, errorClass} = require('../middleware/tools');

/**
 * @swagger
 * /api/v1/progress/update:
 *   post:
 *     summary: Create or update a user's progress
 *     description: Adds a new progress entry for a user, or updates the hours studied if an entry already exists for the given topic and section.
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
 *               - section
 *               - hours_studied
 *             properties:
 *               token:
 *                 type: string
 *                 description: Authentication token for the user.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *               id:
 *                 type: string
 *                 description: The ID of the user whose progress is being updated.
 *                 example: "12345"
 *               topic:
 *                 type: string
 *                 description: The topic of the progress entry.
 *                 example: "Math"
 *               section:
 *                 type: string
 *                 description: The section of the topic.
 *                 example: "Algebra"
 *               hours_studied:
 *                 type: number
 *                 description: Number of hours studied to add to the progress.
 *                 example: 2
 *     responses:
 *       200:
 *         description: Successfully created or updated progress.
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
 *         description: Missing required fields (token, id, topic, section, or hours_studied).
 *       401:
 *         description: Invalid token provided.
 *       500:
 *         description: Internal server error.
 */


router.post('/update', async(req,res)=>{
    try{
        const {token,id,topic,section,hours_studied} = req.body;

        if (!token||!id||!topic||!section||!hours_studied){
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }
        

        const progressEntry = await Progress.findOne({where:{user_id:id,topic,section}});
        if (!progressEntry){//create one if a user does not have any progress
            progressEntry = await Progress.create({
                user_id:id,
                study_date: new Date(),
                topic,
                section,
                hours_studied
            })
        }
        else{//update the existing progress
            await progressEntry.update({
                hours_studied: progressEntry.hours_studied + hours_studied
            });
        }
        res.status(200).json({ message: "Successfully updated progress",success:true });
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

/**
 * @swagger
 * /api/v1/progress/delete:
 *   delete:
 *     summary: Delete a user's progress entry
 *     description: Deletes a progress record for a specific user, topic, and section.
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
 *               - section
 *             properties:
 *               token:
 *                 type: string
 *                 description: Authentication token for the user.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *               id:
 *                 type: string
 *                 description: The ID of the user whose progress is being deleted.
 *                 example: "12345"
 *               topic:
 *                 type: string
 *                 description: The topic of the progress to delete.
 *                 example: "Math"
 *               section:
 *                 type: string
 *                 description: The section of the progress to delete.
 *                 example: "Algebra"
 *     responses:
 *       200:
 *         description: Successfully deleted progress.
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
 *         description: Missing required fields (token, id, topic, or section).
 *       401:
 *         description: Invalid token provided.
 *       404:
 *         description: Progress entry does not exist.
 *       500:
 *         description: Internal server error.
 */


router.delete('/delete/:token/:id/:topic/:section', async (req, res) => {
    try {
        const {token, id, topic, section } = req.params;

        if (!token||!id || !topic || !section) {
            return errorClass.insufficientInfo(res);
        }
        // if (!verifyToken.fireBaseToken(token,id)){
        //     return errorClass.errorRes('Invalid Token',res,401);
        // }

        const progressEntry = await Progress.findOne({ where: { user_id: id, topic, section } });

        if (!progressEntry) {
            return errorClass.errorRes('Progress does not exist', res, 404);
        }

        await progressEntry.destroy();
        res.status(200).json({ message: "Successfully deleted progress", success: true });
    } catch (error) {
        console.error(error);
        errorClass.serverError(res);
    }
});


module.exports = router;