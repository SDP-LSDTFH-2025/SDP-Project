const express = require('express');
const router = express.Router();
const CloudinaryService = require('../services/cloudinaryService');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');
const { enhancedAuth } = require('../middleware/security');
/**
 * @swagger
 * /api/v1/upload/test:
 *   get:
 *     summary: Test Cloudinary configuration
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: Cloudinary configuration test
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 config:
 *                   type: object
 *       500:
 *         description: Configuration error
 */
router.get('/test', async (req, res) => {
  try {
    // Test Cloudinary configuration
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary configuration missing. Please check your environment variables.',
        missing: {
          cloudName: !cloudName,
          apiKey: !apiKey,
          apiSecret: !apiSecret
        }
      });
    }

    res.json({
      success: true,
      message: 'Cloudinary configuration is valid',
      config: {
        cloudName: cloudName,
        apiKey: apiKey ? `${apiKey.substring(0, 4)}...` : 'missing',
        apiSecret: apiSecret ? `${apiSecret.substring(0, 4)}...` : 'missing'
      }
    });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test Cloudinary configuration'
    });
  }
});

/**
 * @swagger
 * /api/v1/upload/single:
 *   post:
 *     summary: Upload a single image to Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *      
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 public_id:
 *                   type: string
 *                 secure_url:
 *                   type: string
 *                 url:
 *                   type: string
 *                 width:
 *                   type: number
 *                 height:
 *                   type: number
 *                 format:
 *                   type: string
 *                 bytes:
 *                   type: number
 *       400:
 *         description: Upload failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/single',
  
  uploadSingle,
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      const uploadResult = await CloudinaryService.uploadImage(req.file.buffer, {
        folder: `sdp-project/users/${'111857316950890974037'}`,
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          error: uploadResult.error
        });
      }
        

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: uploadResult
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload image'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/upload/multiple:
 *   post:
 *     summary: Upload multiple images to Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple image files to upload
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Upload failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/multiple',
  enhancedAuth,
  uploadMultiple,
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No image files provided'
        });
      }

      const uploadPromises = req.files.map(file => 
        CloudinaryService.uploadImage(file.buffer, {
          folder: `sdp-project/users/${req.user.id}`,
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        })
      );

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      res.json({
        success: true,
        message: `Successfully uploaded ${successfulUploads.length} images`,
        data: {
          successful: successfulUploads,
          failed: failedUploads,
          total: results.length,
          successful_count: successfulUploads.length,
          failed_count: failedUploads.length
        }
      });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload images'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/upload/delete/{publicId}:
 *   delete:
 *     summary: Delete an image from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Public ID of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: Delete failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/delete/:publicId',
 
  async (req, res) => {
    try {
      const { publicId } = req.params;
      
      const deleteResult = await CloudinaryService.deleteImage(publicId);
      
      if (!deleteResult.success) {
        return res.status(400).json({
          success: false,
          error: deleteResult.error
        });
      }

      res.json({
        success: true,
        message: deleteResult.message
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete image'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/upload/preset:
 *   get:
 *     summary: Get upload preset for client-side uploads
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upload preset generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/preset',
  enhancedAuth,
  async (req, res) => {
    try {
      const preset = CloudinaryService.generateUploadPreset({
        folder: `sdp-project/users/${req.user.id}`
      });

      res.json({
        success: true,
        data: preset
      });
    } catch (error) {
      console.error('Preset generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate upload preset'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/upload/info/{publicId}:
 *   get:
 *     summary: Get image information from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Public ID of the image
 *     responses:
 *       200:
 *         description: Image information retrieved successfully
 *       400:
 *         description: Failed to get image info
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/info/:publicId',
  
  async (req, res) => {
    try {
      const { publicId } = req.params;
      
      const infoResult = await CloudinaryService.getImageInfo(publicId);
      
      if (!infoResult.success) {
        return res.status(400).json({
          success: false,
          error: infoResult.error
        });
      }

      res.json({
        success: true,
        data: infoResult.data
      });
    } catch (error) {
      console.error('Get info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get image information'
      });
    }
  }
);

module.exports = router;
