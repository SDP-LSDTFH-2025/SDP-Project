const express = require('express');
const router = express.Router();
const {Follows_requests} = require('../models');
const {verifyToken, errorClass} = require('../middleware/tools');
const { User, Follows } = require('../models');
const { sequelize } = require('../config/database');

//friend requests
router.post('/request',async(req,res)=>{
    try{
        const {token,id,username} = req.body;

        if (!token||!id||!username){
            return errorClass.insufficientInfo(res);
        }
        if (!verifyToken.fireBaseToken(token,id)){
            return errorClass.errorRes('Invalid Token',res);
        }
        

        const friend =await User.findOne({where:{username:username}})
        if (!friend){
            console.log(friend);
            return errorClass.errorRes('User does not exist',res);
        }
        const existance = await Follows_requests.findOne({where:{follower_id:id,followee_id:friend.id}});
        if (existance){
            return errorClass.errorRes('Friend request already sent',res);
        }
        await Follows_requests.create({
            follower_id:id,
            followee_id:friend.id,
            created_at:new Date()
        })
        res.status(200).json({message:"friend request sent successfully"});
    }
    catch(error){
        errorClass.serverError(res);
        console.log(error);
    }
})

//friend request response

router.post('/request/response', async (req, res) => {
    try {
        const { token, id, requestID, response } = req.body;

        if (!token||!id||!requestID||!response){
            return errorClass.insufficientInfo(res);
        }
        if (!verifyToken.fireBaseToken(token, id)) {
            return errorClass.errorRes('Invalid Token', res);
        }
        
        const request = await Follows_requests.findOne({ where: { id: requestID } });
        if (!request) {
            return errorClass.errorRes('Friend request does not exist', res);
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
        res.status(200).json({ message: "You are now friends" });
    } catch (error) {
        errorClass.serverError(res);
        console.log(error);
    }
});


module.exports = router;