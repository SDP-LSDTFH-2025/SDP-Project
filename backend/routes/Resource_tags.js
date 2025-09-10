const express = require('express');
const router = express.Router();
const { Resources, Resource_tags } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: ResourceTags
 *   description: API endpoints for managing resource tags
 */

/**
 * @swagger
 * /api/v1/resource_tag:
 *   post:
 *     summary: Create a new resource tag
 *     tags: [ResourceTags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resource_id:
 *                 type: integer
 *               tag:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource tag created successfully
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
 *                     tag:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
    const { resource_id, tag } = req.body;

    try {
        // Validate required fields
        if (!resource_id || !tag) {
            return res.status(400).json({ success: false, error: 'resource_id and tag are required' });
        }

        // Validate resource_id
        const resource = await Resources.findByPk(resource_id);
        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        const resource_tag = await Resource_tags.create({
            resource_id,
            tag,
            created_at: new Date()
        });

        res.json({ success: true, data: resource_tag });
    } catch (error) {
        console.error("Resource tag creation failed:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource_tag/:
 *   get:
 *     summary: Get resource tags by tag name
 *     tags: [ResourceTags]
 *     parameters:
 *       - name: tag
 *         in: query
 *         required: false
 *         description: Partial tag name to filter (case-insensitive)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of resource tags
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
 *                       tag:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
    try {
        const { tag } = req.query;
        const where = tag ? { tag: { [Op.iLike]: `%${tag}%` } } : {};
        const resource_tags = await Resource_tags.findAll({ where });
        res.json({ success: true, data: resource_tags });
    } catch (error) {
        console.error("Failed to fetch resource tags:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource_tag/:{id}:
 *   get:
 *     summary: Get a resource tag by ID
 *     tags: [ResourceTags]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource tag
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource tag retrieved successfully
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
 *                     tag:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Resource tag not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
    try {
        const resource_tag = await Resource_tags.findByPk(req.params.id);
        if (!resource_tag) {
            return res.status(404).json({ success: false, error: 'Resource tag not found' });
        }
        res.json({ success: true, data: resource_tag });
    } catch (error) {
        console.error('Get resource tag error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource_tag/:{id}:
 *   put:
 *     summary: Update a resource tag by ID
 *     tags: [ResourceTags]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource tag
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource tag updated successfully
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
 *                     tag:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       404:
 *         description: Resource tag not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', async (req, res) => {
    const { tag } = req.body;

    try {
        if (!tag) {
            return res.status(400).json({ success: false, error: 'Tag is required' });
        }

        const resource_tag = await Resource_tags.findByPk(req.params.id);
        if (!resource_tag) {
            return res.status(404).json({ success: false, error: 'Resource tag not found' });
        }

        resource_tag.tag = tag;
        await resource_tag.save();

        res.json({ success: true, data: resource_tag });
    } catch (error) {
        console.error('Update resource tag error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource_tag/:{id}:
 *   delete:
 *     summary: Delete a resource tag by ID
 *     tags: [ResourceTags]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource tag
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource tag deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Resource tag not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', async (req, res) => {
    try {
        const resource_tag = await Resource_tags.findByPk(req.params.id);
        if (!resource_tag) {
            return res.status(404).json({ success: false, error: 'Resource tag not found' });
        }

        await resource_tag.destroy();
        res.json({ success: true, message: 'Resource tag deleted successfully' });
    } catch (error) {
        console.error('Resource tag deletion failed:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;