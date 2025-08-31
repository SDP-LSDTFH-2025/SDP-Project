const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const { validate: isUUID } = require('uuid');
const CloudinaryService = require('../services/cloudinaryService');
const { Resources, User } = require('../models');
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
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-incrementing ID of the resource
 *         title:
 *           type: string
 *           description: The title of the resource
 *         description:
 *           type: string
 *           description: The description of the resource
 *         likes:
 *           type: integer
 *           description: Number of likes for the resource
 *         file_url:
 *           type: string
 *           description: URL of the uploaded PDF file
 *         public_id:
 *           type: string
 *           description: Public ID of the file in Cloudinary
 *         pictures_url:
 *           type: string
 *           description: URL of the uploaded image
 *         checksum:
 *           type: string
 *           description: MD5 checksum of the uploaded file
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: ID of the user who uploaded the resource
 *         course_id:
 *           type: integer
 *           description: ID of the course associated with the resource
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the resource was created
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the user uploading the resource
 *               course_id:
 *                 type: integer
 *                 description: The ID of the course
 *               title:
 *                 type: string
 *                 description: The title of the resource
 *               description:
 *                 type: string
 *                 description: The description of the resource
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The PDF file to upload
 *               picture:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *             required:
 *               - user_id
 *               - course_id
 *               - title
 *               - description
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
 *         description: Bad request (e.g., invalid input or missing file)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.post('/resources', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'picture', maxCount: 1 }]), async (req, res) => {
    const { user_id, course_id, title, description } = req.body;
    const file = req.files?.file?.[0];
    const picture = req.files?.picture?.[0];

    try {
        // Validate user_id as UUID
        if (!isUUID(user_id)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        // Validate user
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Validate required fields
        if (!title || !description || !course_id) {
            return res.status(400).json({ success: false, error: 'Title, description, and course_id are required' });
        }

        // Validate course_id as integer
        const courseId = parseInt(course_id);
        if (isNaN(courseId)) {
            return res.status(400).json({ success: false, error: 'Invalid course ID' });
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
            user_id, // Changed from upload_id to match model
            course_id: courseId,
            created_at: new Date()
        });

        res.json({ success: true, data: resource });
    } catch (error) {
        console.error('Resource creation failed:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resources/all:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: List of all resources
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
 *                     $ref: '#/components/schemas/Resource'
 *       500:
 *         description: Internal server error
 *        
 */
router.get('/all', async (req, res) => {
    try{
    const resources = await Resources.findAll();
    res.json({ success: true, data: resources });
    } catch (error) {
        console.error('Get all resources error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
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
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource retrieved successfully
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
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       400:
 *         description: Invalid resource ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.get('/resources/:id', async (req, res) => {
    try {
        const resourceId = parseInt(req.params.id);
        if (isNaN(resourceId)) {
            return res.status(400).json({ success: false, error: 'Invalid resource ID' });
        }
        const resource = await Resources.findByPk(resourceId);
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
 *     summary: Get resources by title (optional) or all resources
 *     tags: [Resources]
 *     parameters:
 *       - name: title
 *         in: query
 *         required: false
 *         description: The title of the resource (partial match, case-insensitive)
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Maximum number of resources to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 100
 *       - name: offset
 *         in: query
 *         required: false
 *         description: Number of resources to skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: List of resources
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
 *                     $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Invalid limit or offset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.get('/resources', async (req, res) => {
    try {
        const { title, limit = 100, offset = 0 } = req.query;
        if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
            return res.status(400).json({ success: false, error: 'Invalid limit or offset' });
        }
        const where = title ? { title: { [Op.iLike]: `%${title}%` } } : {};
        const resources = await Resources.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        res.json({ success: true, data: resources });
    } catch (error) {
        console.error('Failed to fetch resources:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resources/course/{id}:
 *   get:
 *     summary: Get resources by course ID
 *     tags: [Resources]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the course
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Maximum number of resources to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 100
 *       - name: offset
 *         in: query
 *         required: false
 *         description: Number of resources to skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: List of resources for the specified course
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
 *                     $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Invalid course ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.get('/resources/course/:id', async (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        if (isNaN(courseId)) {
            return res.status(400).json({ success: false, error: 'Invalid course ID' });
        }
        const { limit = 100, offset = 0 } = req.query;
        if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
            return res.status(400).json({ success: false, error: 'Invalid limit or offset' });
        }
        const resources = await Resources.findAll({
            where: { course_id: courseId },
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        res.json({ success: true, data: resources });
    } catch (error) {
        console.error('Get resources through course id error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/v1/resources/user/{id}:
 *   get:
 *     summary: Get resources by user ID
 *     tags: [Resources]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The UUID of the user
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Maximum number of resources to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 100
 *       - name: offset
 *         in: query
 *         required: false
 *         description: Number of resources to skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: List of resources uploaded by the specified user
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
 *                     $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.get('/resources/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        if (!isUUID(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const { limit = 100, offset = 0 } = req.query;
        if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
            return res.status(400).json({ success: false, error: 'Invalid limit or offset' });
        }
        const resources = await Resources.findAll({
            where: { user_id: userId },
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        res.json({ success: true, data: resources });
    } catch (error) {
        console.error('Failed to get resources by user_id:', error);
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
 *                 description: The updated title of the resource
 *               description:
 *                 type: string
 *                 description: The updated description of the resource
 *     responses:
 *       200:
 *         description: Resource updated successfully
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
 *         description: Invalid resource ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.put('/resources/:id', async (req, res) => {
    const { title, description } = req.body;

    try {
        const resourceId = parseInt(req.params.id);
        if (isNaN(resourceId)) {
            return res.status(400).json({ success: false, error: 'Invalid resource ID' });
        }
        const resource = await Resources.findByPk(resourceId);
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
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid resource ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.delete('/resources/:id', async (req, res) => {
    try {
        const resourceId = parseInt(req.params.id);
        if (isNaN(resourceId)) {
            return res.status(400).json({ success: false, error: 'Invalid resource ID' });
        }
        const resource = await Resources.findByPk(resourceId);
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