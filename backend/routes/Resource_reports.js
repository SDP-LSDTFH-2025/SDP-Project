const express = require('express');
const router = express.Router();
const { Resources, User, Resource_reports } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: ResourceReports
 *   description: API endpoints for managing resource reports
 */

/**
 * @swagger
 * /api/v1/resource_report:
 *   post:
 *     summary: Create a new resource report
 *     tags: [ResourceReports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resource_id:
 *                 type: integer
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource report created successfully
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
 *                       type: string
 *                       format: uuid
 *                     reason:
 *                       type: string
 *                     response:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       404:
 *         description: Resource or user not found
 *       500:
 *         description: Internal server error
 */
router.post('/resource_report', async (req, res) => {
    const { resource_id, user_id, reason } = req.body;

    try {
        // Validate required fields
        if (!resource_id || !user_id || !reason) {
            return res.status(400).json({ success: false, error: 'resource_id, user_id, and reason are required' });
        }

        // Validate resource_id
        const resource = await Resources.findByPk(resource_id);
        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        // Validate user_id
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const resource_report = await Resource_reports.create({
            resource_id,
            user_id,
            reason,
            created_at: new Date()
        });

        res.json({ success: true, data: resource_report });
    } catch (error) {
        console.error("Resource report creation failed:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource_report:
 *   get:
 *     summary: Get resource reports by reason
 *     tags: [ResourceReports]
 *     parameters:
 *       - name: reason
 *         in: query
 *         required: false
 *         description: Partial reason to filter reports (case-insensitive)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of resource reports
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
 *                         type: string
 *                         format: uuid
 *                       reason:
 *                         type: string
 *                       response:
 *                         type: string
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/resource_report', async (req, res) => {
    try {
        const { reason } = req.query;
        const where = reason ? { reason: { [Op.iLike]: `%${reason}%` } } : {};
        const resource_reports = await Resource_reports.findAll({ where });
        res.json({ success: true, data: resource_reports });
    } catch (error) {
        console.error("Failed to fetch resource reports:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource_report/{id}:
 *   get:
 *     summary: Get a resource report by ID
 *     tags: [ResourceReports]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource report
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource report retrieved successfully
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
 *                       type: string
 *                       format: uuid
 *                     reason:
 *                       type: string
 *                     response:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Resource report not found
 *       500:
 *         description: Internal server error
 */
router.get('/resource_report/:id', async (req, res) => {
    try {
        const resource_report = await Resource_reports.findByPk(req.params.id);
        if (!resource_report) {
            return res.status(404).json({ success: false, error: 'Resource report not found' });
        }
        res.json({ success: true, data: resource_report });
    } catch (error) {
        console.error('Get resource report error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource_report/{id}:
 *   put:
 *     summary: Update a resource report by ID
 *     tags: [ResourceReports]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource report
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               response:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Resource report updated successfully
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
 *                       type: string
 *                       format: uuid
 *                     reason:
 *                       type: string
 *                     response:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       404:
 *         description: Resource report not found
 *       500:
 *         description: Internal server error
 */
router.put('/resource_report/:id', async (req, res) => {
    const { reason, response } = req.body;

    try {
        if (!reason) {
            return res.status(400).json({ success: false, error: 'Reason is required' });
        }

        const resource_report = await Resource_reports.findByPk(req.params.id);
        if (!resource_report) {
            return res.status(404).json({ success: false, error: 'Resource report not found' });
        }

        resource_report.reason = reason;
        resource_report.response = response || null; // Allow null for response
        await resource_report.save();

        res.json({ success: true, data: resource_report });
    } catch (error) {
        console.error('Update resource report error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource_report/{id}:
 *   delete:
 *     summary: Delete a resource report by ID
 *     tags: [ResourceReports]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource report
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource report deleted successfully
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
 *         description: Resource report not found
 *       500:
 *         description: Internal server error
 */
router.delete('/resource_report/:id', async (req, res) => {
    try {
        const resource_report = await Resource_reports.findByPk(req.params.id);
        if (!resource_report) {
            return res.status(404).json({ success: false, error: 'Resource report not found' });
        }

        await resource_report.destroy();
        res.json({ success: true, message: 'Resource report deleted successfully' });
    } catch (error) {
        console.error('Resource report deletion failed:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;