/**
 * Main API Swagger Configuration
 * Contains configuration for authenticated endpoints and core functionality
 */

const swaggerJsdoc = require('swagger-jsdoc');

const createMainApiSwaggerConfig = (PORT) => {
  return {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SDP Project API',
        version: '1.0.0',
        description: 'Backend API for SDP Project',
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        }
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server'
        },
        {
          url: 'https://your-production-domain.com1',
          description: 'Production server'
        },
        {
          url: `ws://localhost:${PORT}/sockets`,
          description: 'WebSocket (Socket.IO namespace)'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    },
    apis: ['./routes/*.js', './models/*.js', './sockets/*.js']
  };
};

const generateMainApiSpec = (PORT) => {
  const options = createMainApiSwaggerConfig(PORT);
  return swaggerJsdoc(options);
};

module.exports = {
  createMainApiSwaggerConfig,
  generateMainApiSpec
};
