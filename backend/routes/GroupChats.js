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

    if (!groupId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing groupId parameter" });
    }

    // Fetch all messages for this group
    const messages = await Group_chats.findAll({
      where: { group_id: groupId },
      order: [["created_at", "ASC"]],
    });

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("❌ Get group chats error:", error);
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

    if (!groupId || !message) {
      return res.status(400).json({
        success: false,
        error: "groupId and message are required"
      });
    }

    // Verify user is a member of the group
    const membership = await Group_members.findOne({
      where: { group_id: groupId, user_id: userId }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: "Not a member of this group"
      });
    }

    // Create the message
    const record = await Group_chats.create({
      group_id: groupId,
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

    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("❌ Send group message error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

module.exports = router;
