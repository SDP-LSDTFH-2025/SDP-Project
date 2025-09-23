const express = require('express');
const router = express.Router();
const {User} = require('../models');
const {verifyToken, errorClass, recommendUsers} = require('../middleware/tools');

/**
 * @swagger
 * /api/v1/users/recommend/{token}/{id}/{index}/{threshold}:
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


router.get('/:token/:id/:index/:threshold',async (req,res)=>{
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