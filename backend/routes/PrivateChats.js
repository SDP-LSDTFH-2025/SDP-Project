const express = require('express');
const router = express.Router();
const { PrivateChats } = require('../models');

/**
 * @swagger
 * /api/v1/private-chats:
 *   get:
 *     summary: Get all private chats
 *     tags: [PrivateChats]
 *     responses:
 *       200:
 *         description: A list of private chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PrivateChat'
*       404:
*         description: Private chats not found
*        
*       500:
*         description: Internal server error
*        
 */
router.get('/', async (req, res) => {
    try{
    const privateChats = await PrivateChats.findAll();
    if(!privateChats){
        return res.status(404).json({success: false, error: 'Private chats not found'});
    }

    res.status(200).json(privateChats);
    } catch (error) {
        console.error('Get private chats error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * @swagger
* /api/v1/private-chats/Getmessagesbychatid:
*   get:
*     summary: Get messages for a specific chat
*     tags: [PrivateChats]
*     parameters:
*       - name: chat_id
*         in: query
*         required: true
*         description: The ID of the chat
*         schema:
*           type: integer
*     responses:
*       200:
*         description: A list of messages
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/PrivateChatMessage'
*       400:
*         description: Chat ID is required
*   
*       404:
*         description: Messages not found
*          
*       500:
*         description: Internal server error
*        
 */
router.get('/Getmessagesbychatid', async (req, res) => {
    const {chat_id} = req.query;
    if(!chat_id){
        return res.status(400).json({success: false, error: 'Chat ID is required'});
    }
    try{
        const messages = await PrivateChats.findAll({where: {id:chat_id}});
        if(!messages){
            return res.status(404).json({success: false, error: 'Messages not found'});
        }
    res.status(200).json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @swagger
 * /api/v1/private-chats/DeleteChat:
 *   delete:
 *     summary: Delete a specific chat
 *     tags: [PrivateChats]
 *     parameters:
 *       - name: chat_id
 *         in: query
 *         required: true
 *         description: The ID of the chat
 *         schema:
 *           type: integer
         
 *     responses:
 *       200:
 *         description: The chat was deleted
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/PrivateChat'
*       400:
*         description: Chat ID is required
*       
*       404:
*         description: Chat not found
*         
*       500:
*         description: Internal server error
*       
 * 
 * 
 * 
 */
router.delete('/DeleteChat', async (req, res) => {
    const {chat_id} = req.query;
    if(!chat_id){
        return res.status(400).json({success: false, error: 'Chat ID is required'});
    }
    try {
        const message = await PrivateChats.destroy({where: {id:chat_id}});
        if(!message){
            return res.status(404).json({success: false, error: 'Chat not found'});
        }
        res.status(200).json({success: true, message: 'Chat deleted successfully'});
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});



module.exports = router;