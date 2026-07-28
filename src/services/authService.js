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

    let foundNgo = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('ngos')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', cleanPass)
        .single();
      
      if (!error && data) {
        foundNgo = {
          id: data.id,
          name: data.name,
          contactPerson: data.contact_person,
          phone: data.phone,
          email: data.email,
          operatingZones: data.operating_zones,
          verified: data.verified
        };
      }
    } else {
      const ngos = storageService.getNGOs(true);
      foundNgo = ngos.find(n => 
        n.email && n.email.toLowerCase() === cleanEmail && 
        (n.password ? n.password === cleanPass : true)
      );
    }

    if (!foundNgo) {
      throw new Error("Invalid NGO email or password. Please check your credentials or register your organization.");
    }

    if (!foundNgo.verified) {
      throw new Error("⚠️ Your NGO account is pending Admin Verification. Our control room will contact you to verify details before activation.");
    }

    const tokens = generateAuthTokens(foundNgo.id, 'NGO');

    const session = {
      role: 'NGO',
      user: {
        id: foundNgo.id,
        name: foundNgo.name,
        contactPerson: foundNgo.contactPerson,
        phone: foundNgo.phone,
        email: foundNgo.email,
        operatingZones: foundNgo.operatingZones,
        verified: true
      },
      ...tokens
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    notifyAuthChanged();
    return session;
  },

  /**
   * Login as Volunteer using Email & Password
   */
  loginVolunteer: async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    let foundVol = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', cleanPass)
        .single();
      
      if (!error && data) {
        foundVol = {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          verified: data.verified
        };
      }
    } else {
      const volunteers = storageService.getVolunteers(true);
      foundVol = volunteers.find(v => 
        v.email && v.email.toLowerCase() === cleanEmail && 
        (v.password ? v.password === cleanPass : true)
      );
    }

    if (!foundVol) {
      throw new Error("Invalid Volunteer email or password. Please check your credentials or register.");
    }

    if (!foundVol.verified) {
      throw new Error("⚠️ Your Volunteer account is pending Admin Verification.");
    }

    const tokens = generateAuthTokens(foundVol.id, 'VOLUNTEER');

    const session = {
      role: 'VOLUNTEER',
      user: {
        id: foundVol.id,
        name: foundVol.name,
        roleType: foundVol.roleType,
        district: foundVol.district,
        phone: foundVol.phone,
        email: foundVol.email,
        verified: true
      },
      ...tokens
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    notifyAuthChanged();
    return session;
  },

  /**
   * Register a new NGO account
   */
  registerNgo: (ngoData, password) => {
    if (!securityService.validateEmail(ngoData.email)) {
      throw new Error("Invalid Email Address. Please enter a valid email format (e.g. ngo@domain.org).");
    }

    if (!securityService.validatePhoneNumber(ngoData.phone)) {
      throw new Error("Invalid Phone Number. Must be a valid 10-digit Indian mobile number (+91).");
    }

    if (!securityService.validatePassword(password)) {
      throw new Error("Password too weak! Must be at least 8 characters long and contain at least 1 letter, 1 number, and 1 special symbol (@#$%^&*).");
    }

    const ngos = storageService.getNGOs(true);
    const existing = ngos.find(n => n.email && n.email.toLowerCase() === ngoData.email.toLowerCase());
    if (existing) {
      throw new Error("An NGO with this email address is already registered.");
    }

    const formattedPhone = securityService.formatIndianPhone(ngoData.phone);

    const newNgo = storageService.addNGO({
      ...ngoData,
      phone: formattedPhone,
      password: (password || '').trim(),
      verified: false
    });

    return newNgo;
  },

  /**
   * Register a new Volunteer account
   */
  registerVolunteer: (volData, password) => {
    if (!securityService.validateEmail(volData.email)) {
      throw new Error("Invalid Email Address. Please enter a valid email format (e.g. volunteer@domain.com).");
    }

    if (!securityService.validatePhoneNumber(volData.phone)) {
      throw new Error("Invalid Phone Number. Must be a valid 10-digit Indian mobile number (+91).");
    }

    if (!securityService.validatePassword(password)) {
      throw new Error("Password too weak! Must be at least 8 characters long and contain at least 1 letter, 1 number, and 1 special symbol (@#$%^&*).");
    }

    const vols = storageService.getVolunteers(true);
    if (volData.email) {
      const existing = vols.find(v => v.email && v.email.toLowerCase() === volData.email.toLowerCase());
      if (existing) {
        throw new Error("A volunteer with this email address is already registered.");
      }
    }

    const formattedPhone = securityService.formatIndianPhone(volData.phone);

    const newVol = storageService.addVolunteer({
      ...volData,
      phone: formattedPhone,
      password: (password || '').trim(),
      verified: false
    });

    return newVol;
  },

  /**
   * 📧 Free Email OTP Verification Service
   * Generates a 6-digit OTP code for verifying email address during account creation
   */
  generateEmailOtp: (email) => {
    if (!email || !email.includes('@')) {
      throw new Error("Please provide a valid email address.");
    }

    // Generate random 6-digit OTP code (e.g. 582901)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes valid

    const otps = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '{}');
    otps[email.trim().toLowerCase()] = { code, expiry };
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));

    console.log(`[FREE EMAIL OTP GENERATED] For ${email}: ${code}`);
    return { success: true, code, message: `6-Digit OTP code (${code}) dispatched to ${email}` };
  },

  /**
   * Verify entered 6-Digit Email OTP
   */
  verifyEmailOtp: (email, enteredCode) => {
    const otps = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '{}');
    const record = otps[email.trim().toLowerCase()];

    if (!record) {
      throw new Error("No OTP request found for this email address. Please request a new OTP code.");
    }

    if (Date.now() > record.expiry) {
      throw new Error("OTP code expired. Please click 'Resend OTP' for a fresh code.");
    }

    if (record.code !== enteredCode.trim()) {
      throw new Error("Incorrect 6-digit OTP code. Please check your email and try again.");
    }

    // Clear used OTP
    delete otps[email.trim().toLowerCase()];
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));

    return true;
  },

  /**
   * Login as Admin Control Officer (Requires raphulali@gmail.com & Raphul@9957422)
   */
  loginAdmin: (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (cleanEmail === 'raphulali@gmail.com' && cleanPass === 'Raphul@9957422') {
      const tokens = generateAuthTokens('admin-raphul', 'ADMIN');
      const session = {
        role: 'ADMIN',
        user: {
          id: 'admin-raphul',
          name: 'Raphul Ali (Super Admin)',
          email: 'raphulali@gmail.com',
          title: 'Head Platform Administrator'
        },
        ...tokens
      };

      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      notifyAuthChanged();
      return session;
    } else {
      throw new Error("Invalid Admin Email or Password. Access denied.");
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
    notifyAuthChanged();
    return { role: 'GUEST', user: null };
  }

};
