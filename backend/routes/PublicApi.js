const express = require('express');
const router = express.Router();
 
const { public_resources } = require('../models');
const { Op } = require('sequelize');
const CloudinaryService = require('../services/cloudinaryService');
const { uploadSingle, handleUploadError, uploadMultiple } = require('../middleware/upload');

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
    try {
      const exist = await public_resources.findOne({ where: { event_id: event_id } });
      if (!exist) {
        return res.status(404).json({ success: false, error: 'resource not found' });
      }
        const publicResource = await public_resources.findOne({ where: { event_id: event_id } });
        res.json({ success: true, data: publicResource });
    } catch (error) {
        console.error('Error retrieving public resource:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
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
    const {event_id } = req.body;
try{
    if (!req.files) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }
    

    const uploadResult = await CloudinaryService.uploadImage(req.files.map(file => file.buffer), {
        folder: `sdp-project/public/${event_id}`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      ...req.files.map(file => ({
        picture_url: file.secure_url,
        public_id: file.public_id,
        event_id: event_id,
        created_at: new Date()
      })),
    });
    await public_resources.create({
       picture_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
         event_id: event_id,
         created_at: new Date()
        });
    res.json({ success: true, message: 'Pictures uploaded successfully' });
} catch (error) {
    console.error('Error uploading pictures:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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
router.post('/pdf', uploadSingle, handleUploadError, async (req, res) => {
    const {event_id } = req.body;
try{
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file provided'
      });
    }

    const uploadResult = await CloudinaryService.uploadPDF(req.file.buffer, {
        folder: `sdp-project/public/${event_id}`,
      });
    await public_resources.create({
       file_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
         event_id: event_id,
         created_at: new Date()
        });
    res.json({ success: true, message: 'PDF uploaded successfully' });
} catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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
    const {event_id } = req.params;
try{
    const publicResource = await public_resources.findOne({ where: { event_id: event_id } });
    if (!publicResource) {
      return res.status(404).json({ success: false, error: 'Public resource not found' });
    }
    if (publicResource.public_id) {
      await CloudinaryService.deletePDF(publicResource.public_id);
    }
    await publicResource.destroy();
    res.json({ success: true, message: 'PDF deleted successfully' });
} catch (error) {
    console.error('Error deleting PDF:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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
    const {event_id } = req.params;
try{
    const publicResource = await public_resources.findOne({ where: { event_id: event_id } });
    if (!publicResource) {
      return res.status(404).json({ success: false, error: 'Public resource not found' });
    } 
    if(publicResource.public_id) {
      await CloudinaryService.deleteImage(publicResource.public_id);
    }
    await publicResource.destroy();
    res.json({ success: true, message: 'Pictures deleted successfully' });
} catch (error) {
    console.error('Error deleting pictures:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
}
});


module.exports = router;