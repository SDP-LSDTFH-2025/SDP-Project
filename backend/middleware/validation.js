const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss');

// Sanitize input to prevent XSS
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
};

// Rate limiting for specific endpoints
const createRateLimiter = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Google OAuth rate limiting
const googleAuthLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 attempts
  'Too many Google authentication attempts, please try again later.'
);

// Validation rules for Google OAuth
const googleAuthValidation = {
  mockLogin: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('name')
      .isLength({ min: 1, max: 100 })
      .trim()
      .escape()
      .withMessage('Name is required'),
    body('given_name')
      .optional()
      .isLength({ min: 1, max: 50 })
      .trim()
      .escape(),
    body('family_name')
      .optional()
      .isLength({ min: 1, max: 50 })
      .trim()
      .escape()
  ]
};

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

module.exports = {
  sanitizeInput,
  googleAuthLimiter,
  googleAuthValidation,
  handleValidationErrors
}; 