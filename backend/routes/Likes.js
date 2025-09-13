const express = require('express');
const router = express.Router();
const { User, Likes, Resources } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/v1/likes/{id}:
 *   get:
 *     summary: Get users who liked a particular resource
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: List of users who liked the resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       username:
 *                         type: string
 *                         example: johndoe
 *                       google_id:
 *                         type: string
 *                         example: 1234567890
 *       400:
 *         description: Invalid resource ID
 *       404:
 *         description: No likes found for this resource
 *       500:
 *         description: Internal server error
 */
router.get("/:id", async (req, res) => {
  try {
    console.log("Full req.params:", req.params);
    console.log("Received resource ID:", req.params.id);

    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid resource ID" });
    }

    const likes = await Likes.findAll({
      where: { resource_id: id },
      include: [
        {
          model: User,
          attributes: ["id", "username", "google_id"], // fixed
        },
      ],
    });

    if (!likes || likes.length === 0) {
      return res.status(404).json({ success: false, message: "No users have liked this resource" });
    }

    const users = likes.map((like) => like.User);

    res.json({ success: true, users });
  } catch (error) {
    console.error("Get users who liked resource error:", error.stack);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/v1/likes/{id}:
 *   delete:
 *     summary: Unlike a resource
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Successfully unliked the resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Resource unliked successfully
 *       400:
 *         description: Invalid resource ID
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: User has not liked this resource
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", async (req, res) => {
  try {
    console.log("Full req.params for delete:", req.params);
    console.log("Received resource ID for delete:", req.params.id);

    const resourceId = parseInt(req.params.id, 10);
    const userId = req.user?.id;

    if (isNaN(resourceId) || resourceId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid resource ID" });
    }
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const resource = await Resources.findByPk(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    const deleted = await Likes.destroy({ where: { resource_id: resourceId, user_id: userId } });
    if (deleted === 0) {
      return res.status(403).json({ success: false, message: "User has not liked this resource" });
    }

    await Resources.decrement('likes', { where: { id: resourceId } });

    res.json({ success: true, message: "Resource unliked successfully" });
  } catch (error) {
    console.error("Unlike resource error:", error.stack);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
