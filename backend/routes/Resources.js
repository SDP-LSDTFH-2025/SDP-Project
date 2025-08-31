const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto'); // Added for checksum calculation
const CloudinaryService = require('../services/cloudinaryService');
const { Resources, User } = require('../models/Resources');
const { Op } = require('sequelize');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images and PDFs allowed.'));
  }
});

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: API endpoints for managing resources
 */

/**
 * @swagger
 * /api/v1/resource:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               course_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *               picture:
 *                 type: string
 *                 format: binary
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
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/resource', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'picture', maxCount: 1 }]), async (req, res) => {
    const { user_id, course_id, title, description } = req.body;
    const file = req.files?.file?.[0];
    const picture = req.files?.picture?.[0];

    try {
        // Validate user
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Validate required fields
        if (!title || !description || !course_id) {
            return res.status(400).json({ success: false, error: 'Title, description, and course_id are required' });
        }

        let file_url = null;
        let public_id = null;
        let pictures_url = null;
        let checksum = null;

        // Handle PDF upload
        if (file) {
            if (file.mimetype !== 'application/pdf') {
                return res.status(400).json({ success: false, error: 'File must be a PDF' });
            }
            const uploadResult = await CloudinaryService.uploadPDF(file.buffer);
            if (!uploadResult.success) {
                return res.status(500).json({ success: false, error: uploadResult.error });
            }
            file_url = uploadResult.secure_url;
            public_id = uploadResult.public_id;
            checksum = crypto.createHash('md5').update(file.buffer).digest('hex');
        }

        // Handle image upload
        if (picture) {
            const uploadResult = await CloudinaryService.uploadImage(picture.buffer);
            if (!uploadResult.success) {
                return res.status(500).json({ success: false, error: uploadResult.error });
            }
            pictures_url = uploadResult.secure_url;
            if (!public_id) public_id = uploadResult.public_id;
            if (!checksum) checksum = crypto.createHash('md5').update(picture.buffer).digest('hex');
        }

        // Ensure required fields for database
        if (!public_id || !checksum) {
            return res.status(400).json({ success: false, error: 'At least one file (PDF or image) is required' });
        }

        const resource = await Resources.create({
            title,
            description,
            likes: 0,
            file_url,
            public_id,
            pictures_url,
            checksum,
            upload_id: user_id,
            course_id,
            created_at: new Date()
        });

        res.json({ success: true, data: resource });
    } catch (error) {
        console.error("Resource creation failed:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource retrieved successfully
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.get('/resource/:id', async (req, res) => {
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
 * /api/v1/resource:
 *   get:
 *     summary: Get resources by title
 *     tags: [Resources]
 *     parameters:
 *       - name: title
 *         in: query
 *         required: false
 *         description: The title of the resource (partial match)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of resources
 *       500:
 *         description: Internal server error
 */
router.get('/resource', async (req, res) => {
    try {
        const { title } = req.query;
        const where = title ? { title: { [Op.iLike]: `%${title}%` } } : {};
        const resources = await Resources.findAll({ where });
        res.json({ success: true, data: resources });
    } catch (error) {
        console.error("Failed to fetch resources:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource/{id}:
 *   put:
 *     summary: Update a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource
 *         schema:
 *           type: integer
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
router.put('/resource/:id', async (req, res) => {
    const { title, description } = req.body;

    try {
        const resource = await Resources.findByPk(req.params.id);
        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        if (title) resource.title = title;
        if (description) resource.description = description;
        await resource.save();

        res.json({ success: true, data: resource });
    } catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resource/{id}:
 *   delete:
 *     summary: Delete a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the resource
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.delete('/resource/:id', async (req, res) => {
    try {
        const resource = await Resources.findByPk(req.params.id);
        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        // Delete from Cloudinary if public_id exists
        if (resource.public_id) {
            await CloudinaryService.deleteImage(resource.public_id);
        }

        await resource.destroy();
        res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Resource deletion failed:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;