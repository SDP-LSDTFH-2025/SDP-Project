const cloudinary = require('../config/cloudinary');
const sharp = require('sharp');
const zlib = require('zlib');

class CloudinaryService {
  /**
   * Compress image before upload
   * @param {Buffer} fileBuffer - File buffer
   * @param {Object} options - Compression options
   * @returns {Promise<Buffer>} Compressed buffer
   */
  static async compressImage(fileBuffer, options = {}) {
    try {
      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 85,
        format = 'jpeg'
      } = options;

      return await sharp(fileBuffer)
        .resize(maxWidth, maxHeight, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality })
        .toBuffer();
    } catch (error) {
      console.error('Image compression error:', error);
      return fileBuffer; // Return original if compression fails
    }
  }

  /**
   * Compress PDF before upload
   * @param {Buffer} fileBuffer - File buffer
   * @returns {Promise<Buffer>} Compressed buffer
   */
  static async compressPDF(fileBuffer) {
    try {
      return new Promise((resolve, reject) => {
        zlib.gzip(fileBuffer, (err, compressed) => {
          if (err) {
            console.error('PDF compression error:', err);
            resolve(fileBuffer); // Return original if compression fails
          } else {
            resolve(compressed);
          }
        });
      });
    } catch (error) {
      console.error('PDF compression error:', error);
      return fileBuffer;
    }
  }

  /**
   * Upload an image to Cloudinary
   * @param {Buffer|string} file - File buffer or base64 string
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  static async uploadImage(file, options = {}) {
    try {
      const uploadOptions = {
        folder: options.folder || 'sdp-project',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: options.transformation || [],
        ...options
      };

      let uploadResult;
      
      if (Buffer.isBuffer(file)) {
        // Compress image before upload
        const compressedFile = await this.compressImage(file, options.compression);
        
        // Upload from buffer
        uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          
          uploadStream.end(compressedFile);
        });
      } else if (typeof file === 'string') {
        // Upload from base64 or URL
        uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
      } else {
        throw new Error('Invalid file format. Expected Buffer or string.');
      }

      return {
        success: true,
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        url: uploadResult.url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload a PDF to Cloudinary as raw resource
   * @param {Buffer|string} file - File buffer or base64 string
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  static async uploadPDF(file, options = {}) {
    try {
      const uploadOptions = {
        folder: options.folder || 'sdp-project/pdfs',
        resource_type: 'raw',
        allowed_formats: ['pdf'],
        access_mode: 'public',
        use_filename: true,
        unique_filename: false,
        ...options
      };
      
      let uploadResult;
      if (Buffer.isBuffer(file)) {
        // Upload PDF directly without compression
        uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file); // Use original file, not compressed
        });
      } else if (typeof file === 'string') {
        uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
      } else {
        throw new Error('Invalid file format. Expected Buffer or string.');
      }
      
      return {
        success: true,
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        url: uploadResult.url,
        format: uploadResult.format,
        bytes: uploadResult.bytes
      };
    } catch (error) {
      console.error('Cloudinary PDF upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param {string} publicId - Public ID of the image
   * @returns {Promise<Object>} Delete result
   */
  static async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      return {
        success: result.result === 'ok',
        message: result.result === 'ok' ? 'Image deleted successfully' : 'Failed to delete image'
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a PDF from Cloudinary
   * @param {string} publicId - Public ID of the PDF
   * @returns {Promise<Object>} Delete result
   */
  
  static async deletePDF(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw'
      });
      
      return {
        success: result.result === 'ok',
        message: result.result === 'ok' ? 'PDF deleted successfully' : 'Failed to delete PDF'
      };
    } catch (error) {
      console.error('Cloudinary PDF delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a signed upload preset for client-side uploads
   * @param {Object} options - Preset options
   * @returns {Object} Upload preset configuration
   */
  static generateUploadPreset(options = {}) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp,
      folder: options.folder || 'sdp-project',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      ...options
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    return {
      timestamp,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      ...params
    };
  }

  /**
   * Transform an image URL with Cloudinary transformations
   * @param {string} publicId - Public ID of the image
   * @param {Array} transformations - Array of transformations
   * @returns {string} Transformed URL
   */
  static getTransformedUrl(publicId, transformations = []) {
    return cloudinary.url(publicId, {
      transformation: transformations
    });
  }

  /**
   * Get image information
   * @param {string} publicId - Public ID of the image
   * @returns {Promise<Object>} Image information
   */
  static async getImageInfo(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Cloudinary get info error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a thumbnail URL
   * @param {string} publicId - Public ID of the image
   * @param {number} width - Thumbnail width
   * @param {number} height - Thumbnail height
   * @returns {string} Thumbnail URL
   */
  static getThumbnailUrl(publicId, width = 150, height = 150) {
    return cloudinary.url(publicId, {
      transformation: [
        { width, height, crop: 'fill' },
        { quality: 'auto' }
      ]
    });
  }

  /**
   * Create a responsive image URL
   * @param {string} publicId - Public ID of the image
   * @param {number} maxWidth - Maximum width
   * @returns {string} Responsive image URL
   */
  static getResponsiveUrl(publicId, maxWidth = 800) {
    return cloudinary.url(publicId, {
      transformation: [
        { width: maxWidth, crop: 'scale' },
        { quality: 'auto' }
      ]
    });
  }
}

module.exports = CloudinaryService;
