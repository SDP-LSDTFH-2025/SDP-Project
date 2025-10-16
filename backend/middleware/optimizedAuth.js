const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Simple in-memory cache for user data (in production, use Redis)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// JWT token blacklist (for logout) - in production, use Redis
const tokenBlacklist = new Set();

const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  // Clean up old tokens after 24 hours
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000);
};

// Cache management
const getUserFromCache = (userId) => {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }
  userCache.delete(userId);
  return null;
};

const setUserInCache = (userId, user) => {
  userCache.set(userId, {
    user,
    timestamp: Date.now()
  });
};

// Clean up cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, cached] of userCache.entries()) {
    if (now - cached.timestamp > CACHE_TTL) {
      userCache.delete(userId);
    }
  }
}, CACHE_TTL);

/**
 * Optimized authentication middleware with caching
 * Combines functionality from both auth.js and enhancedAuth
 */
const optimizedAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        error: 'Token has been invalidated.'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to get user from cache first
    let user = getUserFromCache(decoded.id);
    
    if (!user) {
      // If not in cache, fetch from database
      user = await User.findByPk(decoded.id, {
        attributes: ['id', 'username', 'is_active', 'role', 'institution', 'school']
      });
      
      if (user) {
        // Cache the user data
        setUserInCache(decoded.id, user);
      }
    }

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user account disabled.'
      });
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(); // Continue without authentication
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return next(); // Continue without authentication
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to get user from cache first
    let user = getUserFromCache(decoded.id);
    
    if (!user) {
      // If not in cache, fetch from database
      user = await User.findByPk(decoded.id, {
        attributes: ['id', 'username', 'is_active', 'role', 'institution', 'school']
      });
      
      if (user) {
        // Cache the user data
        setUserInCache(decoded.id, user);
      }
    }

    if (user && user.is_active) {
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

module.exports = {
  optimizedAuth,
  optionalAuth,
  isTokenBlacklisted,
  blacklistToken,
  // Cache management functions for testing/cleanup
  clearUserCache: () => userCache.clear(),
  getUserCacheSize: () => userCache.size
};

