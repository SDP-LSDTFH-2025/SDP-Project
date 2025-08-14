const express = require('express');
const router = express.Router();
const { Resources, User } = require('../models');
const { Op } = require('sequalize');

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: API endpoints for managing resources
 */

/**
 * @swagger
 * /api/v1/resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Resource'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
    const { user_id, title, description } = req.body;
    try {
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const resource = await Resources.create({ title, description });
        res.json({ success: true, data: resource });
    } catch (error) {
        console.error("Resurce creation failed:", error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @swagger
 * /api/v1/resources/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource retrieved successfully
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
    try {
        const resource = await Resources.findByPk(req.params.id);
        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }
        res.json({ success: true, data: resource });
    } catch (error) {
        console.error('Get resource error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resources:
 *   get:
 *     summary: Get resources by title
 *     tags: [Resources]
 *     parameters:
 *       - name: title
 *         in: query
 *         required: true
 *         description: The title of the resource
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of resources
 *       500:
 *         description: Internal server error
 */
router.get('/:delete', async (req, res) => {
    try {
        const resource = await Resources.findAll({
            where: { title: req.params.title }
        });
        res.json({ success: true, data: reosuces });
    } catch (error) {
        console.error("Failed to fetch resources by title:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resources/{id}:
 *   put:
 *     summary: Update a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', async (req, res) => {
    const { title, description } = req.body;

    try {
        const resource = await Resources.findByPk(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                error: 'Resource not found'
            });
        }

        resource.title = title;
        resource.description = description;
        await resource.save();

        res.json({
            success: true,
            data: resource
        });
    } catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @swagger
 * /api/v1/resources/{id}:
 *   delete:
 *     summary: Delete a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', async (req, res) => {
    try {
        const resource = await Resources.destroy({
            where: { id: req.params.id }
        });
        res.json({ success: true, data: resource });
    } catch (error) {
        console.error('Resource deletion failed:', error);
        res.status(500).json({
            success: fail,
            error: 'Server crashed'
        });
    }
});

module.exports = router;
