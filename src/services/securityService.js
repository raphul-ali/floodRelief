/**
 * Security & Rate Limiting Protection Service for Flood Relief Portal
 * Provides: Rate Limiting, Input Sanitization (Anti-XSS), Phone & PIN Validation, and Payload Protection
 */

const RATE_LIMIT_KEY = "flood_portal_rate_limit_v1";
const MAX_SUBMISSIONS_PER_WINDOW = 3; // Max 3 submissions
const WINDOW_DURATION_MS = 2 * 60 * 1000; // 2 Minutes window

export const securityService = {
  
  /**
   * Check if submission is rate limited
   * @returns {Object} { allowed: boolean, cooldownSeconds: number }
   */
  checkRateLimit: () => {
    try {
      const now = Date.now();
      const rawHistory = localStorage.getItem(RATE_LIMIT_KEY);
      let timestamps = rawHistory ? JSON.parse(rawHistory) : [];

      // Filter out timestamps outside the window
      timestamps = timestamps.filter(ts => now - ts < WINDOW_DURATION_MS);

      if (timestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
        const oldestTimestamp = timestamps[0];
        const remainingMs = WINDOW_DURATION_MS - (now - oldestTimestamp);
        const cooldownSeconds = Math.ceil(remainingMs / 1000);
        return {
          allowed: false,
          cooldownSeconds: Math.max(1, cooldownSeconds),
          message: `⚠️ Anti-Spam Rate Limit: Too many submissions. Please wait ${cooldownSeconds} seconds before submitting again.`
        };
      }

      return { allowed: true, cooldownSeconds: 0 };
    } catch (e) {
      console.error("Rate limit check error:", e);
      return { allowed: true, cooldownSeconds: 0 };
    }
  },

  /**
   * Record a successful submission timestamp
   */
  recordSubmission: () => {
    try {
      const now = Date.now();
      const rawHistory = localStorage.getItem(RATE_LIMIT_KEY);
      let timestamps = rawHistory ? JSON.parse(rawHistory) : [];

      timestamps = timestamps.filter(ts => now - ts < WINDOW_DURATION_MS);
      timestamps.push(now);

      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
    } catch (e) {
      console.error("Failed to record submission timestamp:", e);
    }
  },

  /**
   * Anti-XSS Input Sanitizer
   * Escapes HTML special characters and strips unsafe scripts
   */
  sanitizeText: (input) => {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "");
  },

  /**
   * Validate Indian Mobile Number (10 digits, optional +91 prefix)
   */
  validatePhoneNumber: (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    // Check if 10 digits starting with 6-9, or 12 digits starting with 91
    return /^(?:(?:\+?91)|0)?[6-9]\d{9}$/.test(cleanPhone);
  },

  /**
   * Validate Indian PIN Code (6 digits)
   */
  validatePinCode: (pin) => {
    if (!pin) return true; // Optional field
    return /^[1-9][0-9]{5}$/.test(pin.trim());
  },

  /**
   * Truncate long strings to prevent storage payload attacks
   */
  limitLength: (str, maxLen = 300) => {
    if (!str) return '';
    return str.slice(0, maxLen);
  }
};
