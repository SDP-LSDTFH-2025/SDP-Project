const express = require("express");
const router = express.Router();
const { PrivateChats } = require("../models");
const { Op } = require("sequelize");

/**
 * @swagger
 * /api/v1/private-chats/last-messages:
 *   get:
 *     summary: Get last message for each conversation
 *     tags: [PrivateChats]
 *     parameters:
 *       - name: user_id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of last messages for each conversation
 */
router.get("/last-messages", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing user_id" });
    }

    // Get the last message for each conversation involving this user
    const lastMessages = await PrivateChats.findAll({
      where: {
        [Op.or]: [
          { sender_id: user_id },
          { receiver_id: user_id },
        ],
      },
      order: [["created_at", "DESC"]],
    });

    // Group by conversation and get the latest message for each
    const conversationMap = new Map();
    
    lastMessages.forEach(message => {
      const otherUserId = message.sender_id === user_id ? message.receiver_id : message.sender_id;
      if (!conversationMap.has(otherUserId) || 
          new Date(message.created_at) > new Date(conversationMap.get(otherUserId).created_at)) {
        conversationMap.set(otherUserId, message);
      }
    });

    const result = Array.from(conversationMap.values());

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Get last messages error:", error);
    res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/v1/private-chats:
 *   get:
 *     summary: Get all private chat messages between two users
 *     tags: [PrivateChats]
 *     parameters:
 *       - name: sender_id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: receiver_id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of all private chats between the two users
 */
router.get("/", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.query;

    if (!sender_id || !receiver_id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing sender_id or receiver_id" });
    }

    const privateChats = await PrivateChats.findAll({
      where: {
        [Op.or]: [
          { sender_id, receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id },
        ],
      },
      order: [["created_at", "ASC"]],
    });

    res.status(200).json({ success: true, data: privateChats });
  } catch (error) {
    console.error("Get private chats error:", error);
    res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;
