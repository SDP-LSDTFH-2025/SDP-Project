

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

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


// Swagger configuration
const swaggerOptions = {
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
  apis: ['./routes/*.js', './models/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

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
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Apply rate limiting to all requests
app.use(limiter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
    await sequelize.sync({alter:true});
    console.log('✅ Database synchronized successfully.');
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation available at: http://localhost:${PORT}/api-docs`);
    
    });

    app.post('/signup', async (req, res) => {
      try {
        // console.log({ verified: verifyGoogleToken(req.body.credential) });
        if (req.body.credential) {
          const verificationResponse = await verifyGoogleToken(req.body.credential);

          if (verificationResponse.error) {
            return res.status(400).json({
              message: verificationResponse.error,
            });
          }

          const profile = verificationResponse?.payload;

          DB.push(profile);

          res.status(201).json({
            message: 'Signup was successful',
            user: {
              firstName: profile?.given_name,
              lastName: profile?.family_name,
              picture: profile?.picture,
              email: profile?.email,
              token: jwt.sign({ email: profile?.email }, 'myScret', {
                expiresIn: '1d',
              }),
            },
          });
        }
      } catch (error) {
        res.status(500).json({
          message: 'An error occurred. Registration failed.',
        });
      }
    });

    app.post('/login', async (req, res) => {
      try {
        if (req.body.credential) {
          const verificationResponse = await verifyGoogleToken(req.body.credential);
          if (verificationResponse.error) {
            return res.status(400).json({
              message: verificationResponse.error,
            });
          }

          const profile = verificationResponse?.payload;

          const existsInDB = DB.find((person) => person?.email === profile?.email);

          if (!existsInDB) {
            return res.status(400).json({
              message: 'You are not registered. Please sign up',
            });
          }

          res.status(201).json({
            message: 'Login was successful',
            user: {
              firstName: profile?.given_name,
              lastName: profile?.family_name,
              picture: profile?.picture,
              email: profile?.email,
              token: jwt.sign({ email: profile?.email }, process.env.JWT_SECRET, {
                expiresIn: '1d',
              }),
            },
          });
        }
      } catch (error) {
        res.status(500).json({
          message: error?.message || error,
        });
      }
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