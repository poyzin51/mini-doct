/**
 * Security utilities for the application
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  // Basic HTML sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
};

/**
 * Validate and sanitize user input
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000); // Limit length
};

/**
 * Generate a secure random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
export const generateSecureRandom = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Check if the current connection is secure (HTTPS)
 * @returns {boolean} True if connection is secure
 */
export const isSecureConnection = () => {
  return window.location.protocol === 'https:' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check password strength
 * @param {string} password - Password to check
 * @returns {Object} Password strength info
 */
export const checkPasswordStrength = (password) => {
  if (!password) return { strength: 'weak', score: 0, feedback: [] };
  
  const feedback = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) {
    score += 2;
  } else {
    feedback.push('Use at least 8 characters');
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters');
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters');
  }
  
  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers');
  }
  
  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters');
  }
  
  // Determine strength
  let strength = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return { strength, score, feedback };
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }
  
  /**
   * Check if action is allowed
   * @param {string} key - Unique key for the action (e.g., email, IP)
   * @returns {boolean} True if action is allowed
   */
  isAllowed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    // Update attempts
    this.attempts.set(key, recentAttempts);
    
    return recentAttempts.length < this.maxAttempts;
  }
  
  /**
   * Record an attempt
   * @param {string} key - Unique key for the action
   */
  recordAttempt(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    userAttempts.push(now);
    this.attempts.set(key, userAttempts);
  }
  
  /**
   * Reset attempts for a key
   * @param {string} key - Unique key for the action
   */
  reset(key) {
    this.attempts.delete(key);
  }
}

// Global rate limiter for login attempts
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes