# Cloudinary Setup Guide

This guide explains how to set up and use Cloudinary for image uploads in the SDP Project backend.

## Overview

Cloudinary is a cloud-based service that provides solutions for image and video management. In this project, we use Cloudinary for:
- Image uploads
- Image transformations (resizing, cropping, etc.)
- Image optimization
- Secure image delivery

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials

After signing up, you'll find your credentials in the Dashboard:

1. **Cloud Name**: Found in the Dashboard
2. **API Key**: Found in the Dashboard
3. **API Secret**: Found in the Dashboard

### 3. Configure Environment Variables

Add the following variables to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Install Dependencies

The required dependencies are already installed:
- `cloudinary`: Cloudinary SDK
- `multer`: File upload middleware

## API Endpoints

### Test Configuration
```
GET /api/v1/upload/test
```
Tests if Cloudinary is properly configured.

### Upload Single Image
```
POST /api/v1/upload/single
```
Upload a single image file. Requires authentication.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `image` (file)
- Headers: `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "public_id": "sdp-project/users/1/image_name",
    "secure_url": "https://res.cloudinary.com/...",
    "url": "http://res.cloudinary.com/...",
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "bytes": 123456
  }
}
```

### Upload Multiple Images
```
POST /api/v1/upload/multiple
```
Upload multiple image files. Requires authentication.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `images` (files array)
- Headers: `Authorization: Bearer <token>`

### Delete Image
```
DELETE /api/v1/upload/delete/{publicId}
```
Delete an image from Cloudinary. Requires authentication.

### Get Upload Preset
```
GET /api/v1/upload/preset
```
Get upload preset for client-side uploads. Requires authentication.

### Get Image Information
```
GET /api/v1/upload/info/{publicId}
```
Get detailed information about an image. Requires authentication.

## Usage Examples

### Frontend Upload Example

```javascript
// Upload single image
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/v1/upload/single', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result.data.secure_url); // Image URL
```

### Backend Service Usage

```javascript
const CloudinaryService = require('./services/cloudinaryService');

// Upload image
const result = await CloudinaryService.uploadImage(buffer, {
  folder: 'custom-folder',
  transformation: [
    { width: 800, crop: 'scale' },
    { quality: 'auto' }
  ]
});

// Delete image
const deleteResult = await CloudinaryService.deleteImage('public_id');

// Get thumbnail URL
const thumbnailUrl = CloudinaryService.getThumbnailUrl('public_id', 150, 150);
```

## Features

### Automatic Image Optimization
- Images are automatically optimized for web delivery
- Format conversion to WebP when supported
- Quality optimization

### Folder Organization
- Images are organized in folders by user ID
- Structure: `sdp-project/users/{userId}/{filename}`

### Security
- File type validation (jpg, jpeg, png, gif, webp)
- File size limits (5MB per file)
- Authentication required for all upload operations

### Transformations
- Automatic quality optimization
- Format conversion
- Responsive image URLs
- Thumbnail generation

## Error Handling

The service includes comprehensive error handling:

- **File Type Errors**: Only image files are allowed
- **File Size Errors**: Maximum 5MB per file
- **Authentication Errors**: All uploads require valid JWT token
- **Network Errors**: Proper error messages for connection issues

## Testing

### Test Configuration
```bash
curl http://localhost:3000/api/v1/upload/test
```

### Test Upload (with authentication)
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  http://localhost:3000/api/v1/upload/single
```

## Production Considerations

### Environment Variables
- Use strong, unique API keys
- Keep API secrets secure
- Use environment-specific configurations

### Security
- Validate file types on both client and server
- Implement proper authentication
- Use HTTPS in production

### Performance
- Implement caching for frequently accessed images
- Use Cloudinary's CDN for fast delivery
- Consider image optimization strategies

## Troubleshooting

### Common Issues

1. **"Cloudinary configuration missing"**
   - Check your environment variables
   - Ensure `.env` file is in the correct location

2. **"File too large"**
   - Reduce image size before upload
   - Check file size limits

3. **"Only image files are allowed"**
   - Ensure file is an image (jpg, png, gif, webp)
   - Check file extension and MIME type

4. **"Unauthorized"**
   - Ensure you're sending a valid JWT token
   - Check token expiration

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Multer Documentation](https://github.com/expressjs/multer)
