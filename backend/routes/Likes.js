const express = require('express');
const router = express.Router();
const { User, Likes, Resources } = require('../models');

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: Manage likes for resources
 */

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
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *       400:
 *         description: Invalid resource ID
 *       404:
 *         description: Resource not found or no likes found
 */
router.get('/:id', async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    if (isNaN(resourceId) || resourceId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID' });
    }

    // ensure resource exists
    const resource = await Resources.findByPk(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const likes = await Likes.findAll({
      where: { resource_id: resourceId },
      include: [
        {
          model: User,
          as: 'user', // must match your association alias
          attributes: ['id', 'username'],
        },
      ],
    });

    if (!likes || likes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users have liked this resource',
      });
    }

    const users = likes
      .map((like) => like.user)
      .filter(Boolean);

    res.json({ success: true, users });
  } catch (err) {
    console.error('Get likes error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/likes/{id}:
 *   post:
 *     summary: Like a resource
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Resource liked successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Resource not found
 *       409:
 *         description: User already liked resource
 */
router.post('/:id', async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    const { user_id } = req.body;

    if (isNaN(resourceId) || resourceId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID' });
    }
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    const resource = await Resources.findByPk(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const existing = await Likes.findOne({
      where: { resource_id: resourceId, user_id },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User already liked this resource' });
    }

    await Likes.create({
      user_id,
      resource_id: resourceId,
      created_at: new Date(),
    });

    res.status(201).json({ success: true, message: 'Resource liked successfully' });
  } catch (err) {
    console.error('Like resource error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/likes/{id}:
 *   delete:
 *     summary: Unlike a resource
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Resource unliked successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Resource not found
 *       403:
 *         description: User has not liked this resource
 */
router.delete('/:id', async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    const { user_id } = req.body;

    if (isNaN(resourceId) || resourceId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID' });
    }
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    const resource = await Resources.findByPk(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const deleted = await Likes.destroy({
      where: { resource_id: resourceId, user_id },
    });

    if (deleted === 0) {
      return res.status(403).json({ success: false, message: 'User has not liked this resource' });
    }

    res.json({ success: true, message: 'Resource unliked successfully' });
  } catch (err) {
    console.error('Unlike resource error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
