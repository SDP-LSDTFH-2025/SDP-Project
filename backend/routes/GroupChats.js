const express = require("express");
const router = express.Router();
const Group_chats = require("../models/Group_chats"); // ← matches your filename

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

module.exports = router;
