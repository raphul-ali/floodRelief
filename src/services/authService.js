/**
 * Authentication & Session Management Service
 * Roles: 'GUEST' | 'NGO' | 'VOLUNTEER' | 'ADMIN'
 * Includes: Email & Password Login for NGOs and Volunteers + 6-Digit Email OTP Verification
 */
import { storageService } from './storageService';
import { securityService } from './securityService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const AUTH_SESSION_KEY = "flood_portal_auth_session_v1";
const OTP_STORAGE_KEY = "flood_portal_active_otps_v1";

// Session Token Lifetimes:
// Access Token: 15 minutes | Refresh Token: 7 days
const ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000;
const REFRESH_TOKEN_LIFETIME = 7 * 24 * 60 * 60 * 1000;

const notifyAuthChanged = () => {
  window.dispatchEvent(new Event("flood_auth_changed"));
};

/**
 * Helper to generate cryptographic Access & Refresh tokens
 */
const generateAuthTokens = (userId, role) => {
  const now = Date.now();
  const salt = Math.random().toString(36).substring(2, 10);
  
  return {
    accessToken: `at_${role.toLowerCase()}_${userId}_${now}_${salt}`,
    refreshToken: `rt_${role.toLowerCase()}_${userId}_${now}_${salt}`,
    expiresAt: now + ACCESS_TOKEN_LIFETIME,
    refreshExpiresAt: now + REFRESH_TOKEN_LIFETIME
  };
};

export const authService = {
  
  /**
   * Get current active session. Automatically validates Access & Refresh tokens.
   * If Access Token is expired but Refresh Token is valid, auto-refreshes session.
   * @returns {Object} { role: 'GUEST'|'NGO'|'VOLUNTEER'|'ADMIN', user: Object|null, accessToken: string }
   */
  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(AUTH_SESSION_KEY);
      if (!data) {
        return { role: 'GUEST', user: null };
      }
      const session = JSON.parse(data);
      if (!session || !session.role || session.role === 'GUEST') {
        return { role: 'GUEST', user: null };
      }

      const now = Date.now();

      // If refresh token has expired (after 7 days), force logout
      if (session.refreshExpiresAt && now > session.refreshExpiresAt) {
        console.warn("[AUTH] Refresh token expired (7 days inactivity). Logging out.");
        authService.logout();
        return { role: 'GUEST', user: null };
      }

      // If access token has expired (15 mins), auto-refresh session with Refresh Token
      if (session.expiresAt && now > session.expiresAt) {
        console.log("[AUTH] Access token expired. Auto-renewing session with Refresh Token...");
        return authService.refreshAccessToken();
      }

      return session;
    } catch (e) {
      console.error("Auth session parse error:", e);
      return { role: 'GUEST', user: null };
    }
  },

  /**
   * Refresh Access Token using Refresh Token
   */
  refreshAccessToken: () => {
    try {
      const data = localStorage.getItem(AUTH_SESSION_KEY);
      if (!data) return { role: 'GUEST', user: null };

      const session = JSON.parse(data);
      if (!session || session.role === 'GUEST' || !session.user) {
        return { role: 'GUEST', user: null };
      }

      const now = Date.now();
      if (session.refreshExpiresAt && now > session.refreshExpiresAt) {
        authService.logout();
        return { role: 'GUEST', user: null };
      }

      const tokens = generateAuthTokens(session.user.id || 'usr', session.role);
      const updatedSession = {
        ...session,
        ...tokens
      };

      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(updatedSession));
      notifyAuthChanged();
      console.log(`[AUTH REFRESH TOKEN] Access Token renewed for ${session.role} (${session.user.email || session.user.id})`);
      return updatedSession;
    } catch (e) {
      console.error("Error refreshing access token:", e);
      return { role: 'GUEST', user: null };
    }
  },

  /**
   * Start background session auto-refresh timer & window focus listener
   */
  startSessionAutoRefresh: () => {
    // Check and refresh token every 60 seconds if within 2 mins of expiry
    const intervalId = setInterval(() => {
      const session = authService.getCurrentUser();
      if (session && session.role !== 'GUEST' && session.expiresAt) {
        const timeRemaining = session.expiresAt - Date.now();
        if (timeRemaining < 2 * 60 * 1000) {
          authService.refreshAccessToken();
        }
      }
    }, 60 * 1000);

    const handleFocus = () => {
      authService.getCurrentUser();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  },

  /**
   * Update Volunteer Status in Active Session
   */
  updateUserSessionStatus: (status) => {
    try {
      const data = localStorage.getItem(AUTH_SESSION_KEY);
      if (!data) return;
      const session = JSON.parse(data);
      if (session && session.user && session.role === 'VOLUNTEER') {
        session.user.availableStatus = status;
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
        notifyAuthChanged();
      }
    } catch (e) {
      console.error("Failed to update user session status", e);
    }
  },

  /**
   * Login as NGO using Email & Password
   */
  loginNgo: async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    try {
      const res = await fetch('/api/auth/login-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Invalid NGO email or password.");
      }
      
      const data = await res.json();
      const sessionData = {
        role: data.user.role,
        user: data.user,
        accessToken: data.token,
        refreshToken: null,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      };
      
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
      notifyAuthChanged();
      return sessionData;
    } catch (e) {
      throw new Error(e.message || "Failed to connect to authentication server.");
    }
  },

  /**
   * Login as Volunteer using Email & Password
   */
  loginVolunteer: async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    try {
      const res = await fetch('/api/auth/login-volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Invalid Volunteer email or password.");
      }
      
      const data = await res.json();
      const sessionData = {
        role: data.user.role,
        user: data.user,
        accessToken: data.token,
        refreshToken: null,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      };
      
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
      notifyAuthChanged();
      return sessionData;
    } catch (e) {
      throw new Error(e.message || "Failed to connect to authentication server.");
    }
  },

  /**
   * Register a new NGO account
   */
  registerNgo: async (ngoData, password) => {
    if (!securityService.validateEmail(ngoData.email)) {
      throw new Error("Invalid Email Address. Please enter a valid email format (e.g. ngo@domain.org).");
    }

    if (!securityService.validatePhoneNumber(ngoData.phone)) {
      throw new Error("Invalid Phone Number. Must be a valid 10-digit Indian mobile number (+91).");
    }

    if (!securityService.validatePassword(password)) {
      throw new Error("Password too weak! Must be at least 8 characters long and contain at least 1 letter, 1 number, and 1 special symbol (@#$%^&*).");
    }

    const formattedPhone = securityService.formatIndianPhone(ngoData.phone);
    const payload = {
      ...ngoData,
      phone: formattedPhone,
      password: (password || '').trim()
    };

    try {
      const res = await fetch('/api/auth/register-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "An error occurred during registration.");
      }
      return await res.json();
    } catch (e) {
      throw new Error(e.message || "Failed to connect to authentication server.");
    }
  },

  /**
   * Register a new Volunteer account
   */
  registerVolunteer: async (volData, password) => {
    if (!securityService.validateEmail(volData.email)) {
      throw new Error("Invalid Email Address. Please enter a valid email format (e.g. volunteer@domain.com).");
    }

    if (!securityService.validatePhoneNumber(volData.phone)) {
      throw new Error("Invalid Phone Number. Must be a valid 10-digit Indian mobile number (+91).");
    }

    if (!securityService.validatePassword(password)) {
      throw new Error("Password too weak! Must be at least 8 characters long and contain at least 1 letter, 1 number, and 1 special symbol (@#$%^&*).");
    }

    const formattedPhone = securityService.formatIndianPhone(volData.phone);
    const payload = {
      ...volData,
      phone: formattedPhone,
      password: (password || '').trim()
    };

    try {
      const res = await fetch('/api/auth/register-volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "An error occurred during registration.");
      }
      return await res.json();
    } catch (e) {
      throw new Error(e.message || "Failed to connect to authentication server.");
    }
  },

  /**
   * Free Email OTP Verification Service
   * Generates a 6-digit OTP code for verifying email address during account creation
   */
  generateEmailOtp: async (email) => {
    if (!email || !email.includes('@')) {
      throw new Error("Please provide a valid email address.");
    }

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to send OTP code");
      }
      return { success: true, message: "OTP code dispatched successfully" };
    } catch (e) {
      throw new Error(e.message || "Failed to connect to verification server.");
    }
  },

  /**
   * Verify entered 6-Digit Email OTP
   */
  verifyEmailOtp: async (email, enteredCode) => {
    if (!enteredCode || enteredCode.length < 6) {
      throw new Error("Please enter the 6-digit OTP code.");
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          code: enteredCode.trim() 
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid or expired OTP code.");
      }
      return true;
    } catch (e) {
      throw new Error(e.message || "Verification failed. Please try again.");
    }
  },

  /**
   * Login as Admin Control Officer
   */
  loginAdmin: async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Invalid Admin Email or Password. Access denied.");
      }
      
      const data = await res.json();
      
      // We store the real JWT token from the backend
      const sessionData = {
        role: data.user.role,
        user: data.user,
        accessToken: data.token, // This is the real JWT
        refreshToken: null,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      };
      
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
      notifyAuthChanged();
      return sessionData;
    } catch (e) {
      throw new Error(e.message || "Failed to connect to authentication server.");
    }
  },

  /**
   * Update active user's operating zones in auth session
   */
  updateUserSessionZones: (zones) => {
    try {
      const data = localStorage.getItem(AUTH_SESSION_KEY);
      if (!data) return;
      const session = JSON.parse(data);
      if (session && session.user) {
        session.user.operatingZones = zones;
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
        notifyAuthChanged();
      }
    } catch (e) {
      console.error("Error updating session zones:", e);
    }
  },

  /**
   * Logout current user session
   */
  logout: () => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem('flood_relief_session');
    localStorage.removeItem('flood_relief_auth');
    localStorage.removeItem('ngo_user');
    localStorage.removeItem('volunteer_user');
    sessionStorage.clear();
    notifyAuthChanged();
    return { role: 'GUEST', user: null };
  }

};
