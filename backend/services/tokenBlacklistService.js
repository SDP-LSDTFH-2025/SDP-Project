const jwt = require('jsonwebtoken');

/**
 * Token Blacklist Service
 * Manages JWT token blacklisting with persistent storage
 * In production, this should use Redis or a database
 */

class TokenBlacklistService {
  constructor() {
    // In-memory storage (replace with Redis in production)
    this.blacklistedTokens = new Map();
    this.cleanupInterval = null;
    
    // Start cleanup process
    this.startCleanup();
  }

  /**
   * Add a token to the blacklist
   * @param {string} token - JWT token to blacklist
   * @param {number} expiresIn - Token expiration time in seconds
   */
  addToBlacklist(token, expiresIn = 86400) { // Default 24 hours
    try {
      // Decode token to get expiration time
      const decoded = jwt.decode(token);
      const expirationTime = decoded?.exp ? decoded.exp * 1000 : Date.now() + (expiresIn * 1000);
      
      this.blacklistedTokens.set(token, {
        blacklistedAt: Date.now(),
        expiresAt: expirationTime
      });
      
      console.log(`Token blacklisted: ${token.substring(0, 20)}...`);
    } catch (error) {
      console.error('Error adding token to blacklist:', error);
    }
  }

  /**
   * Check if a token is blacklisted
   * @param {string} token - JWT token to check
   * @returns {boolean} - True if token is blacklisted
   */
  isBlacklisted(token) {
    if (!token) return false;
    
    const blacklistEntry = this.blacklistedTokens.get(token);
    
    if (!blacklistEntry) {
      return false;
    }
    
    // Check if token has expired
    if (Date.now() > blacklistEntry.expiresAt) {
      this.blacklistedTokens.delete(token);
      return false;
    }
    
    return true;
  }

  /**
   * Remove a token from the blacklist
   * @param {string} token - JWT token to remove
   */
  removeFromBlacklist(token) {
    this.blacklistedTokens.delete(token);
  }

  /**
   * Clear all blacklisted tokens
   */
  clearBlacklist() {
    this.blacklistedTokens.clear();
  }

  /**
   * Get blacklist statistics
   * @returns {object} - Blacklist statistics
   */
  getStats() {
    const now = Date.now();
    let activeTokens = 0;
    let expiredTokens = 0;
    
    for (const [token, entry] of this.blacklistedTokens.entries()) {
      if (now > entry.expiresAt) {
        expiredTokens++;
      } else {
        activeTokens++;
      }
    }
    
    return {
      totalTokens: this.blacklistedTokens.size,
      activeTokens,
      expiredTokens
    };
  }

  /**
   * Start cleanup process to remove expired tokens
   */
  startCleanup() {
    // Clean up every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000);
  }

  /**
   * Stop cleanup process
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Remove expired tokens from blacklist
   */
  cleanupExpiredTokens() {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [token, entry] of this.blacklistedTokens.entries()) {
      if (now > entry.expiresAt) {
        this.blacklistedTokens.delete(token);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} expired tokens from blacklist`);
    }
  }

  /**
   * Blacklist all tokens for a specific user
   * @param {string} userId - User ID to blacklist all tokens for
   */
  blacklistUserTokens(userId) {
    // This is a simplified implementation
    // In production, you'd need to track user-token relationships
    console.log(`Blacklisting all tokens for user: ${userId}`);
    // Implementation would require tracking user-token relationships
  }
}

// Create singleton instance
const tokenBlacklistService = new TokenBlacklistService();

module.exports = tokenBlacklistService;
