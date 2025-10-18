/**
 * Public Resources API Swagger Configuration
 * Contains configuration for public, unauthenticated endpoints
 */

const swaggerJsdoc = require('swagger-jsdoc');

const createPublicApiSwaggerConfig = (PORT) => {
  return {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Studdy Buddy - Public Resources API',
        version: '1.0.0',
        description: `
# Public Resources API Documentation

This API provides endpoints for managing public resources associated with events. These endpoints are designed to be publicly accessible and do not require authentication.

## 🚀 Features
- **No Authentication Required**: All endpoints are publicly accessible
- **File Upload Support**: Upload images (JPG, PNG, GIF, WebP) and PDF documents
- **Cloud Storage**: Automatic file storage and optimization via Cloudinary
- **Event Association**: Resources are linked to specific events via event_id

## 📋 Available Operations
- **GET** \`/api/v1/public/{event_id}\`: Retrieve public resources by event ID
- **POST** \`/api/v1/public/pictures\`: Upload multiple pictures for an event
- **POST** \`/api/v1/public/pdf\`: Upload a PDF document for an event
- **DELETE** \`/api/v1/public/pictures/{event_id}\`: Delete all pictures for an event
- **DELETE** \`/api/v1/public/pdf/{event_id}\`: Delete PDF document for an event

## 📝 Important Notes
- All file uploads are automatically optimized
- Files are stored securely in Cloudinary
- Maximum of 10 pictures can be uploaded at a time
- Maximum of 1 PDF can be uploaded at a time
- Maximum of 5MB per picture
- Maximum of 5MB per PDF
- Event IDs must be valid strings

## 🔗 Base URL
- **Development**: \`http://localhost:3000/api/v1/public\`
- **Production**: \`https://sdp-project-zilb.onrender.com/api/v1/public\`

## 📖 Example Usage

### Get Public Resource
\`\`\`bash
curl -X GET "http://localhost:3000/api/v1/public/event-12345" -H "Accept: application/json"
\`\`\`

### Upload Pictures
\`\`\`bash
curl -X POST "http://localhost:3000/api/v1/public/pictures" -F "images=@image1.jpg" -F "images=@image2.png" -F "event_id=event-12345" -H "Accept: application/json"
\`\`\`

### Upload PDF
\`\`\`bash
curl -X POST "http://localhost:3000/api/v1/public/pdf" -F "pdf=@document.pdf" -F "event_id=event-12345" -H "Accept: application/json"
\`\`\`

### Delete Pictures
\`\`\`bash
curl -X DELETE "http://localhost:3000/api/v1/public/pictures/event-12345" -H "Accept: application/json"
\`\`\`

### Delete PDF
\`\`\`bash
curl -X DELETE "http://localhost:3000/api/v1/public/pdf/event-12345" -H "Accept: application/json"
\`\`\`
        `,
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server'
        },
        {
          url: 'https://sdp-project-zilb.onrender.com',
          description: 'Production server'
        }
      ],
      components: {
        schemas: {
          PublicResource: {
            type: 'object',
            required: ['id', 'event_id', 'created_at'],
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Unique identifier for the public resource',
                example: '550e8400-e29b-41d4-a716-446655440000'
              },
              file_url: {
                type: 'string',
                description: 'URL of the uploaded PDF file',
                example: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sdp-project/public/event123/document.pdf'
              },
              public_id: {
                type: 'string',
                description: 'Cloudinary public ID for the resource',
                example: 'sdp-project/public/event123/document'
              },
              picture_url: {
                type: 'string',
                description: 'URL of the uploaded image file',
                example: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sdp-project/public/event123/image.jpg'
              },
              event_id: {
                type: 'string',
                description: 'ID of the associated event (can be any string identifier)',
                example: 'event-12345'
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Timestamp when the resource was created',
                example: '2024-01-15T10:30:00Z'
              }
            }
          },
          ApiResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: 'Indicates if the request was successful'
              },
              data: {
                type: 'object',
                description: 'Response data (when success is true)'
              },
              message: {
                type: 'string',
                description: 'Success message (when success is true)'
              },
              error: {
                type: 'string',
                description: 'Error message (when success is false)'
              }
            }
          }
        },
        parameters: {
          EventIdPath: {
            in: 'path',
            name: 'event_id',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'Unique identifier of the event (can be any string)',
            example: 'event-12345'
          }
        }
      },
      tags: [
        {
          name: 'Public Resources',
          description: 'Public resource management endpoints for events. These endpoints do not require authentication and are designed for public access.'
        }
      ]
    },
    apis: ['./routes/PublicApi.js'] // Only include PublicApi routes
  };
};

const generatePublicApiSpec = (PORT) => {
  const options = createPublicApiSwaggerConfig(PORT);
  return swaggerJsdoc(options);
};

module.exports = {
  createPublicApiSwaggerConfig,
  generatePublicApiSpec
};
