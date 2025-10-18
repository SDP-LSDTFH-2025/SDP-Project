const express = require("express");
const router = express.Router();
const Group_chats = require("../models/Group_chats");
const { Group_members } = require("../models");
const { optimizedAuth } = require("../middleware/optimizedAuth");

/**
 * @swagger
 * /api/v1/group-chats:
 *   get:
 *     summary: Get all group chat messages for a specific group
 *     tags: [GroupChats]
 *     parameters:
 *       - name: groupId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of group chat messages
 */
router.get("/", async (req, res) => {
  try {
    const { groupId } = req.query;

    console.log("Group chat history request - groupId:", groupId, "type:", typeof groupId);

    if (!groupId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing groupId parameter" });
    }

    // Convert groupId to integer if it's a string
    const groupIdInt = parseInt(groupId);
    if (isNaN(groupIdInt)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid groupId format" });
    }

    // Fetch all messages for this group
    const messages = await Group_chats.findAll({
      where: { group_id: groupIdInt },
      order: [["created_at", "ASC"]],
    });

    console.log("Found messages:", messages.length);
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("❌ Get group chats error:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/v1/group-chats:
 *   post:
 *     summary: Send a group chat message
 *     tags: [GroupChats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - message
 *             properties:
 *               groupId:
 *                 type: integer
 *                 description: The ID of the group
 *                 example: 123
 *               message:
 *                 type: string
 *                 description: The message content
 *                 example: "Hello everyone!"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 456
 *                     group_id:
 *                       type: integer
 *                       example: 123
 *                     user_id:
 *                       type: string
 *                       example: "user-123"
 *                     message:
 *                       type: string
 *                       example: "Hello everyone!"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a member of this group
 *       500:
 *         description: Internal server error
 */
router.post("/", optimizedAuth, async (req, res) => {
  try {
    const { groupId, message } = req.body;
    const userId = req.user.id;

    console.log("Send group message request - groupId:", groupId, "type:", typeof groupId, "userId:", userId);

    if (!groupId || !message) {
      return res.status(400).json({
        success: false,
        error: "groupId and message are required"
      });
    }

    // Convert groupId to integer if it's a string
    const groupIdInt = parseInt(groupId);
    if (isNaN(groupIdInt)) {
      return res.status(400).json({
        success: false,
        error: "Invalid groupId format"
      });
    }

    // Verify user is a member of the group
    const membership = await Group_members.findOne({
      where: { group_id: groupIdInt, user_id: userId }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: "Not a member of this group"
      });
    }

    // Create the message
    const record = await Group_chats.create({
      group_id: groupIdInt,
      user_id: userId,
      message,
      deleted: false,
      created_at: new Date()
    });

    const responseData = {
      id: record.id,
      group_id: record.group_id,
      user_id: record.user_id,
      message: record.message,
      created_at: record.created_at
    };

    console.log("Message created successfully:", responseData);
    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("❌ Send group message error:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

module.exports = router;
