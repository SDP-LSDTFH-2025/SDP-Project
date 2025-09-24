

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { generateAllSwaggerSpecs } = require('./config/swagger');
const { createMainApiSwaggerUI, createPublicApiSwaggerUI } = require('./config/swagger/uiConfig');
require('dotenv').config();
const router = require('express').Router();
const { sequelize } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { 
  speedLimiter, 
  hppMiddleware, 
  securityHeaders, 
  requestSizeLimit 
} = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;
const http = require('http');
const { createSocketServer } = require('./sockets/server');


// Generate Swagger specifications
const swaggerSpecs = generateAllSwaggerSpecs(PORT);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(securityHeaders);
app.use(hppMiddleware);
app.use(requestSizeLimit);
app.use(speedLimiter);

// Standard middleware
app.use(compression());

// CORS configuration
// Define API prefix and public API path
const apiPrefix = (process.env.API_PREFIX || '/api/v1').replace(/\/$/, '');
const publicApiPath = `${apiPrefix}/public`;

// 1) Permissive CORS for public API routes only
app.use(publicApiPath, cors({
  origin: true, // reflect request origin (allows any origin)
  credentials: false,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2) Restricted CORS for the rest of the app
const restrictedCors = cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser and curl

    const allowedOrigins = [
      process.env.PROD_LIVE_HOST,
      process.env.PROD_PREVIEW_HOST,
      process.env.CORS_ORIGIN,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Apply restricted CORS except for public API path (already handled above)
app.use((req, res, next) => {
  if (req.path.startsWith(publicApiPath)) return next();
  return restrictedCors(req, res, next);
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Apply rate limiting to all requests
app.use(limiter);

// Swagger documentation
// Main API docs
app.use('/api-docs', ...createMainApiSwaggerUI(swaggerSpecs.mainApi));

// Public Resources API docs
app.use('/public-resources/api-docs', ...createPublicApiSwaggerUI(swaggerSpecs.publicApi));


app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running'
  });
});

// API routes
app.use(process.env.API_PREFIX, routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server startup
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  


    console.log('✅ Database synchronized successfully.');
    // Start HTTP + Socket server
    const server = http.createServer(app);
    const allowedOrigins = [
      process.env.PROD_LIVE_HOST,
      process.env.PROD_PREVIEW_HOST,
      process.env.CORS_ORIGIN,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ].filter(Boolean);
    createSocketServer(server, allowedOrigins);

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation available at: ${process.env.BACKEND_URL}/api-docs`);
      console.log(`📚 Public Resources API Documentation available at: ${process.env.BACKEND_URL}/public-resources/api-docs`);
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}



// Export app for testing
module.exports = app;

// Start server if this file is run directly
if (require.main === module) {
  startServer();
} 
