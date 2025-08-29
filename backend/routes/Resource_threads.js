const express = require('express');
const router = express.Router();
const { Resource_threads, User } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: ResourceThreads
 *   description: API endpoints for managing resource threads
 */

/**
 * @swagger
 * /api/v1/resource_thread:
 *   post:
 *     summary: Create a new resource thread
 *     tags: [ResourceThreads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               resource_id:
 *                 type: integer
 *               message:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Resource thread created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     resource_id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     message:
 *                       type: string
 *                     parent_id:
 *                       type: integer
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       404:
 *         description: User or parent thread not found
 *       500:
 *         description: Internal server error
 */
router.post('/resource_thread', async (req, res) => {
    const { user_id, resource_id, message, parent_id } = req.body;

    try {
        // Validate required fields
        if (!user_id || !resource_id || !message) {
            return res.status(400).json({ success: false, error: 'user_id, resource_id, and message are required' });
        }

        // Validate user
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Validate parent_id if provided
        if (parent_id) {
            const parentThread = await Resource_threads.findByPk(parent_id);
            if (!parentThread) {
                return res.status(404).json({ success: false, error: 'Parent thread not found' });
            }
        }

        const resource_thread = await Resource_threads.create({
            user_id,
            resource_id,
            message,
            parent_id: parent_id || null, // Allow null for top-level threads
            created_at: new Date()
        });

        res.json({ success: true, data: resource_thread });
    } catch (error) {
        console.error("Resource thread creation failed:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource_thread:
 *   get:
 *     summary: Get resource threads by message
 *     tags: [ResourceThreads]
 *     parameters:
 *       - name: message
 *         in: query
 *         required: false
 *         description: Partial message to filter threads (case-insensitive)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of resource threads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       resource_id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       message:
 *                         type: string
 *                       parent_id:
 *                         type: integer
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/resource_thread', async (req, res) => {
    try {
        const { message } = req.query;
        const where = message ? { message: { [Op.iLike]: `%${message}%` } } : {};
        const resource_threads = await Resource_threads.findAll({ where });
        res.json({ success: true, data: resource_threads });
    } catch (error) {
        console.error("Failed to fetch resource threads:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource_thread/{id}:
 *   put:
 *     summary: Update a resource thread by ID
 *     tags: [ResourceThreads]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource thread
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource thread updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Resource thread not found
 *       500:
 *         description: Internal server error
 */
router.put('/resource_thread/:id', async (req, res) => {
    const { message } = req.body;

    try {
        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        const resource_thread = await Resource_threads.findByPk(req.params.id);
        if (!resource_thread) {
            return res.status(404).json({ success: false, error: 'Resource thread not found' });
        }

        resource_thread.message = message;
        await resource_thread.save();

        res.json({ success: true, data: resource_thread });
    } catch (error) {
        console.error('Update resource thread error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource_thread/{id}:
 *   delete:
 *     summary: Delete a resource thread by ID
 *     tags: [ResourceThreads]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource thread
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource thread deleted successfully
 *       404:
 *         description: Resource thread not found
 *       500:
 *         description: Internal server error
 */
router.delete('/resource_thread/:id', async (req, res) => {
    try {
        const resource_thread = await Resource_threads.findByPk(req.params.id);
        if (!resource_thread) {
            return res.status(404).json({ success: false, error: 'Resource thread not found' });
        }

        await resource_thread.destroy();
        res.json({ success: true, message: 'Resource thread deleted successfully' });
    } catch (error) {
        console.error('Resource thread deletion failed:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;