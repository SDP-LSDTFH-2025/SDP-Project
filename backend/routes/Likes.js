const express = require('express');
const router = express.Router();
const { User, Likes, Resources } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/v1/likes/{id}:
 *   get:
 *     summary: Get users who liked a resource
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
 *         description: List of users who liked the resource (empty array if none)
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
 *                       google_id:
 *                         type: string
 *       400:
 *         description: Invalid resource ID
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    if (isNaN(resourceId)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID' });
    }

    const resource = await Resources.findByPk(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const likes = await Likes.findAll({
      where: { resource_id: resourceId },
      include: [
        {
          model: User,
          as: 'user', 
          attributes: ['id', 'username', 'google_id']
        }
      ]
    });

    const users = likes.map(like => like.user).filter(Boolean); 

    res.json({ success: true, users }); 
  } catch (error) {
    console.error('Get likes error:', error.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
