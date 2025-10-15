const express = require('express');
const router = express.Router();
 
const { public_resources } = require('../models');
const { Op } = require('sequelize');
const CloudinaryService = require('../services/cloudinaryService');
const { uploadSingle, handleUploadError, uploadMultiple, uploadPDF } = require('../middleware/upload');

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Pictures uploaded successfully"
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Resource not found"
 */

/**
 * @swagger
 * tags:
 *   name: Public Resources
 *   description: Public resource management endpoints for events
 */

/**
 * @swagger
 * /api/v1/public/{event_id}:
 *   get:
 *     summary: Get public resource by event ID
 *     description: Retrieve a public resource associated with a specific event. This endpoint does not require authentication and is publicly accessible.
 *     tags: [Public Resources]
 *     parameters:
 *       - $ref: '#/components/parameters/EventIdPath'
 *     responses:
 *       200:
 *         description: Public resource retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PublicResource'
 *             examples:
 *               success:
 *                 summary: Successful retrieval
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "550e8400-e29b-41d4-a716-446655440000"
 *                     file_url: "https://res.cloudinary.com/demo/image/upload/v1234567890/sdp-project/public/event123/document.pdf"
 *                     public_id: "sdp-project/public/event123/document"
 *                     picture_url: "https://res.cloudinary.com/demo/image/upload/v1234567890/sdp-project/public/event123/image.jpg"
 *                     event_id: "550e8400-e29b-41d4-a716-446655440001"
 *                     created_at: "2024-01-15T10:30:00Z"
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: Resource not found
 *                 value:
 *                   success: false
 *                   error: "resource not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server_error:
 *                 summary: Server error
 *                 value:
 *                   success: false
 *                   error: "Internal server error"
 *     security: []
 */
router.get('/:event_id', async (req, res) => {
    const { event_id } = req.params;
    
    // Validate event_id parameter
    if (!event_id || event_id.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Event ID is required' 
      });
    }
    
    try {
      const publicResource = await public_resources.findOne({ 
        where: { event_id: event_id.trim() } 
      });
      
      if (!publicResource) {
        return res.status(404).json({ 
          success: false, 
          error: 'Resource not found' 
        });
      }
      
      res.json({ success: true, data: publicResource });
    } catch (error) {
        console.error('Error retrieving public resource:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error' 
        });
    }
});

/**
 * @swagger
 * /api/v1/public/pictures:
 *   post:
 *     summary: Upload multiple pictures for an event
 *     description: Upload one or more image files for a public event. Images are automatically optimized and stored in Cloudinary. This endpoint does not require authentication and is publicly accessible.
 *     tags: [Public Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *               - event_id
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: One or more image files to upload (jpg, jpeg, png, gif, webp)
 *                 minItems: 1
 *                 maxItems: 10
 *               event_id:
 *                 type: string
 *                 description: ID of the event to associate the pictures with (can be any string)
 *                 example: "event-12345"
 *           encoding:
 *             files:
 *               contentType: image/*
 *     responses:
 *       200:
 *         description: Pictures uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *             examples:
 *               success:
 *                 summary: Upload successful
 *                 value:
 *                   success: true
 *                   message: "Pictures uploaded successfully"
 *       400:
 *         description: Bad request - No image files provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_files:
 *                 summary: No files provided
 *                 value:
 *                   success: false
 *                   error: "No image file provided"
 *       500:
 *         description: Internal server error during upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               upload_error:
 *                 summary: Upload failed
 *                 value:
 *                   success: false
 *                   error: "Internal server error"
 *     security: []
 */
router.post('/pictures', uploadMultiple, handleUploadError, async (req, res) => {
    const { event_id } = req.body;
    
    try {
        // Validate event_id parameter
        if (!event_id || event_id.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Event ID is required'
            });
        }
        
        // Validate files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No image files provided'
            });
        }
        
        // Validate file count (max 10 files)
        if (req.files.length > 10) {
            return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum 10 files allowed'
            });
        }
        
        // Validate file types
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));
        if (invalidFiles.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed'
            });
        }
        
        // Upload files to Cloudinary
        const uploadPromises = req.files.map(file => 
            CloudinaryService.uploadImage(file.buffer, {
                folder: `sdp-project/public/${event_id.trim()}`,
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                transformation: [
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            })
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        
        // Create database records for each uploaded file
        const createPromises = uploadResults.map(result => 
            public_resources.create({
                picture_url: result.secure_url,
                public_id: result.public_id,
                event_id: event_id.trim(),
                created_at: new Date()
            })
        );
        
        await Promise.all(createPromises);
        
        res.json({ 
            success: true, 
            message: `${uploadResults.length} picture(s) uploaded successfully`,
            uploaded_count: uploadResults.length
        });
        
    } catch (error) {
        console.error('Error uploading pictures:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

/**
 * @swagger
 * /api/v1/public/pdf:
 *   post:
 *     summary: Upload a PDF document for an event
 *     description: Upload a single PDF file for a public event. The PDF is stored in Cloudinary for secure access. This endpoint does not require authentication and is publicly accessible.
 *     tags: [Public Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - event_id
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to upload (max size and format restrictions apply)
 *               event_id:
 *                 type: string
 *                 description: ID of the event to associate the PDF with (can be any string)
 *                 example: "event-12345"
 *           encoding:
 *             file:
 *               contentType: application/pdf
 *     responses:
 *       200:
 *         description: PDF uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *             examples:
 *               success:
 *                 summary: Upload successful
 *                 value:
 *                   success: true
 *                   message: "PDF uploaded successfully"
 *       400:
 *         description: Bad request - No PDF file provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_file:
 *                 summary: No file provided
 *                 value:
 *                   success: false
 *                   error: "No PDF file provided"
 *       500:
 *         description: Internal server error during upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               upload_error:
 *                 summary: Upload failed
 *                 value:
 *                   success: false
 *                   error: "Internal server error"
 *     security: []
 */
router.post('/pdf', uploadPDF, handleUploadError, async (req, res) => {
    const { event_id } = req.body;
    
    try {
        // Validate event_id parameter
        if (!event_id || event_id.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Event ID is required'
            });
        }
        
        // Validate file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No PDF file provided'
            });
        }
        
        // Validate file type
        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({
                success: false,
                error: 'Invalid file type. Only PDF files are allowed'
            });
        }
        
        // Check if a PDF already exists for this event
        const existingResource = await public_resources.findOne({
            where: { 
                event_id: event_id.trim(),
                file_url: { [Op.ne]: null } // Has a file_url (PDF)
            }
        });
        
        if (existingResource) {
            return res.status(400).json({
                success: false,
                error: 'A PDF already exists for this event. Please delete the existing PDF first.'
            });
        }

        const uploadResult = await CloudinaryService.uploadPDF(req.file.buffer, {
            folder: `sdp-project/public/${event_id.trim()}`
        });
        
        await public_resources.create({
            file_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            event_id: event_id.trim(),
            created_at: new Date()
        });
        
        res.json({ 
            success: true, 
            message: 'PDF uploaded successfully' 
        });
        
    } catch (error) {
        console.error('Error uploading PDF:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

/**
 * @swagger
 * /api/v1/public/pdf/{event_id}:
 *   delete:
 *     summary: Delete PDF document for an event
 *     description: Delete a PDF document associated with a specific event. The file is removed from both the database and Cloudinary storage. This endpoint does not require authentication and is publicly accessible.
 *     tags: [Public Resources]
 *     parameters:
 *       - $ref: '#/components/parameters/EventIdPath'
 *     responses:
 *       200:
 *         description: PDF deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *             examples:
 *               success:
 *                 summary: Deletion successful
 *                 value:
 *                   success: true
 *                   message: "PDF deleted successfully"
 *       404:
 *         description: Public resource not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: Resource not found
 *                 value:
 *                   success: false
 *                   error: "Public resource not found"
 *       500:
 *         description: Internal server error during deletion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               delete_error:
 *                 summary: Deletion failed
 *                 value:
 *                   success: false
 *                   error: "Internal server error"
 *     security: []
 */
router.delete('/pdf/:event_id', async (req, res) => {
    const { event_id } = req.params;
    
    try {
        // Validate event_id parameter
        if (!event_id || event_id.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Event ID is required'
            });
        }
        
        const publicResource = await public_resources.findOne({ 
            where: { 
                event_id: event_id.trim(),
                file_url: { [Op.ne]: null } // Has a file_url (PDF)
            }
        });
        
        if (!publicResource) {
            return res.status(404).json({ 
                success: false, 
                error: 'PDF resource not found for this event' 
            });
        }
        
        // Delete from Cloudinary if public_id exists
        if (publicResource.public_id) {
            try {
                await CloudinaryService.deletePDF(publicResource.public_id);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
                // Continue with database deletion even if Cloudinary fails
            }
        }
        
        await publicResource.destroy();
        res.json({ 
            success: true, 
            message: 'PDF deleted successfully' 
        });
        
    } catch (error) {
        console.error('Error deleting PDF:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

/**
 * @swagger
 * /api/v1/public/pictures/{event_id}:
 *   delete:
 *     summary: Delete pictures for an event
 *     description: Delete all pictures associated with a specific event. The images are removed from both the database and Cloudinary storage. This endpoint does not require authentication and is publicly accessible.
 *     tags: [Public Resources]
 *     parameters:
 *       - $ref: '#/components/parameters/EventIdPath'
 *     responses:
 *       200:
 *         description: Pictures deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *             examples:
 *               success:
 *                 summary: Deletion successful
 *                 value:
 *                   success: true
 *                   message: "Pictures deleted successfully"
 *       404:
 *         description: Public resource not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: Resource not found
 *                 value:
 *                   success: false
 *                   error: "Public resource not found"
 *       500:
 *         description: Internal server error during deletion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               delete_error:
 *                 summary: Deletion failed
 *                 value:
 *                   success: false
 *                   error: "Internal server error"
 *     security: []
 */
router.delete('/pictures/:event_id', async (req, res) => {
    const { event_id } = req.params;
    
    try {
        // Validate event_id parameter
        if (!event_id || event_id.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Event ID is required'
            });
        }
        
        // Find all picture resources for this event
        const pictureResources = await public_resources.findAll({ 
            where: { 
                event_id: event_id.trim(),
                picture_url: { [Op.ne]: null } // Has a picture_url
            }
        });
        
        if (pictureResources.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'No picture resources found for this event' 
            });
        }
        
        // Delete from Cloudinary and database
        const deletePromises = pictureResources.map(async (resource) => {
            if (resource.public_id) {
                try {
                    await CloudinaryService.deleteImage(resource.public_id);
                } catch (cloudinaryError) {
                    console.error('Error deleting from Cloudinary:', cloudinaryError);
                    // Continue with database deletion even if Cloudinary fails
                }
            }
            return resource.destroy();
        });
        
        await Promise.all(deletePromises);
        
        res.json({ 
            success: true, 
            message: `${pictureResources.length} picture(s) deleted successfully`,
            deleted_count: pictureResources.length
        });
        
    } catch (error) {
        console.error('Error deleting pictures:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});


module.exports = router;