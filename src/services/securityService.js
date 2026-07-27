/**
 * Security & Rate Limiting Protection Service for Flood Relief Portal
 * Provides: Rate Limiting, Input Sanitization (Anti-XSS), Phone (+91), Email, and Strong Password Validation
 */

const RATE_LIMIT_KEY = "flood_portal_rate_limit_v1";
const MAX_SUBMISSIONS_PER_WINDOW = 3; // Max 3 submissions
const WINDOW_DURATION_MS = 2 * 60 * 1000; // 2 Minutes window

export const securityService = {
  
  /**
   * Check if submission is rate limited
   */
  checkRateLimit: () => {
    try {
      const now = Date.now();
      const rawHistory = localStorage.getItem(RATE_LIMIT_KEY);
      let timestamps = rawHistory ? JSON.parse(rawHistory) : [];

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
   * Validate Indian Mobile Number (Must be 10 digits starting with 6-9, country code +91)
   */
  validatePhoneNumber: (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    // Must be 10 digits (6-9xxxxxxxxx) or 12 digits (916-9xxxxxxxxx)
    if (cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone)) return true;
    if (cleanPhone.length === 12 && /^91[6-9]\d{9}$/.test(cleanPhone)) return true;
    return false;
  },

  /**
   * Format phone number to clean Indian format +91 XXXXX XXXXX
   */
  formatIndianPhone: (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/[^0-9]/g, '');
    const clean10 = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
    if (clean10.length === 10) {
      return `+91 ${clean10.slice(0, 5)} ${clean10.slice(5)}`;
    }
    return phone;
  },

  /**
   * Validate Email Address
   */
  validateEmail: (email) => {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail);
  },

  /**
   * Validate Password Strength:
   * - Minimum 8 characters
   * - At least 1 Letter (a-z, A-Z)
   * - At least 1 Number (0-9)
   * - At least 1 Symbol / Special Character
   */
  validatePassword: (password) => {
    if (!password || password.length < 8) return false;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
    return hasLetter && hasNumber && hasSymbol;
  },

  /**
   * Validate NGO Logo Upload
   * Requirements:
   * - Formats: JPG, JPEG, PNG
   * - File size: Min 20 KB, Max 50 KB
   */
  validateLogoFile: (file) => {
    if (!file) return { valid: false, error: 'Please select a logo image file.' };

    const ext = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png'];
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!validExtensions.includes(ext) && !validMimes.includes(file.type)) {
      return { valid: false, error: '⚠️ Invalid format! Only JPG, JPEG, and PNG files are allowed.' };
    }

    const minBytes = 20 * 1024; // 20 KB
    const maxBytes = 50 * 1024; // 50 KB

    if (file.size < minBytes) {
      const kb = (file.size / 1024).toFixed(1);
      return { valid: false, error: `⚠️ Logo image too small (${kb} KB). Minimum file size is 20 KB.` };
    }

    if (file.size > maxBytes) {
      const kb = (file.size / 1024).toFixed(1);
      return { valid: false, error: `⚠️ Logo image too large (${kb} KB). Maximum allowed size is 50 KB.` };
    }

    return { valid: true, error: null };
  },

  /**
   * Validate Indian PIN Code (6 digits)
   */
  validatePinCode: (pin) => {
    if (!pin) return true;
    return /^[1-9][0-9]{5}$/.test(pin.trim());
  },

  /**
   * Truncate long strings
   */
  limitLength: (str, maxLen = 300) => {
    if (!str) return '';
    return str.slice(0, maxLen);
  }
};
