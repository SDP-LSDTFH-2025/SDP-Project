/**
 * Swagger UI Configuration
 * Contains custom styling and setup options for Swagger UI
 */

const swaggerUi = require('swagger-ui-express');

/**
 * Custom CSS for Public Resources API documentation
 */
const publicApiCustomCSS = `
  .swagger-ui .topbar { display: none; }
  .swagger-ui .info .title { color: #3b82f6; font-size: 2.5rem; margin-bottom: 1rem; }
  .swagger-ui .info .description { font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; }
  .swagger-ui .scheme-container { background: #f8fafc; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
  .swagger-ui .opblock.opblock-get { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
  .swagger-ui .opblock.opblock-post { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
  .swagger-ui .opblock.opblock-delete { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
  .swagger-ui .opblock-summary-description { font-weight: 500; }
`;

/**
 * Setup options for Public Resources API documentation
 */
const publicApiSetupOptions = {
  customCss: publicApiCustomCSS,
  customSiteTitle: 'Public Resources API Documentation'
};

/**
 * Setup options for Main API documentation
 */
const mainApiSetupOptions = {
  customSiteTitle: 'SDP Project API Documentation'
};

/**
 * Create Swagger UI middleware for main API
 * @param {Object} swaggerSpec - Swagger specification object
 * @returns {Array} Express middleware array
 */
const createMainApiSwaggerUI = (swaggerSpec) => {
  return [
    swaggerUi.serveFiles(swaggerSpec, {}),
    swaggerUi.setup(swaggerSpec, mainApiSetupOptions)
  ];
};

/**
 * Create Swagger UI middleware for Public Resources API
 * @param {Object} swaggerSpec - Swagger specification object
 * @returns {Array} Express middleware array
 */
const createPublicApiSwaggerUI = (swaggerSpec) => {
  return [
    swaggerUi.serveFiles(swaggerSpec, {}),
    swaggerUi.setup(swaggerSpec, publicApiSetupOptions)
  ];
};

module.exports = {
  createMainApiSwaggerUI,
  createPublicApiSwaggerUI,
  publicApiSetupOptions,
  mainApiSetupOptions,
  publicApiCustomCSS
};
