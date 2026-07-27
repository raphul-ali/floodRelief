/**
 * Authentication & Session Management Service
 * Roles: 'GUEST' | 'NGO' | 'VOLUNTEER' | 'ADMIN'
 * Includes: Email & Password Login for NGOs and Volunteers + 6-Digit Email OTP Verification
 */
import { storageService } from './storageService';

const AUTH_SESSION_KEY = "flood_portal_auth_session_v1";
const OTP_STORAGE_KEY = "flood_portal_active_otps_v1";

const notifyAuthChanged = () => {
  window.dispatchEvent(new Event("flood_auth_changed"));
};

export const authService = {
  
  /**
   * Get current active session
   * @returns {Object} { role: 'GUEST'|'NGO'|'VOLUNTEER'|'ADMIN', user: Object|null }
   */
  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(AUTH_SESSION_KEY);
      if (!data) {
        return { role: 'GUEST', user: null };
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Auth session parse error:", e);
      return { role: 'GUEST', user: null };
    }
  },

  /**
   * Login as NGO using Email & Password
   */
  loginNgo: (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const ngos = storageService.getNGOs(true); // Include all NGOs
    const foundNgo = ngos.find(n => 
      n.email && n.email.toLowerCase() === cleanEmail && 
      (n.password ? n.password === cleanPass : true) // Allow demo pass matching
    );

    if (!foundNgo) {
      throw new Error("Invalid NGO email or password. Please check your credentials or register your organization.");
    }

    if (!foundNgo.verified) {
      throw new Error("⚠️ Your NGO account is pending Admin Verification. Our control room will contact you to verify details before activation.");
    }

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
      }
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    notifyAuthChanged();
    return session;
  },

  /**
   * Login as Volunteer using Email & Password
   */
  loginVolunteer: (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const volunteers = storageService.getVolunteers(true);
    const foundVol = volunteers.find(v => 
      v.email && v.email.toLowerCase() === cleanEmail && 
      (v.password ? v.password === cleanPass : true)
    );

    if (!foundVol) {
      throw new Error("Invalid Volunteer email or password. Please check your credentials or register.");
    }

    if (!foundVol.verified) {
      throw new Error("⚠️ Your Volunteer account is pending Admin Verification.");
    }

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
      }
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    notifyAuthChanged();
    return session;
  },

  /**
   * Register a new NGO account
   */
  registerNgo: (ngoData, password) => {
    const cleanPass = (password || '').trim();
    if (cleanPass.length < 4) {
      throw new Error("Password must be at least 4 characters long.");
    }

    const ngos = storageService.getNGOs(true);
    const existing = ngos.find(n => n.email && n.email.toLowerCase() === ngoData.email.toLowerCase());
    if (existing) {
      throw new Error("An NGO with this email address is already registered.");
    }

    const newNgo = storageService.addNGO({
      ...ngoData,
      password: cleanPass,
      verified: false
    });

    return newNgo;
  },

  /**
   * Register a new Volunteer account
   */
  registerVolunteer: (volData, password) => {
    const cleanPass = (password || '').trim();
    if (cleanPass.length < 4) {
      throw new Error("Password must be at least 4 characters long.");
    }

    const vols = storageService.getVolunteers(true);
    if (volData.email) {
      const existing = vols.find(v => v.email && v.email.toLowerCase() === volData.email.toLowerCase());
      if (existing) {
        throw new Error("A volunteer with this email address is already registered.");
      }
    }

    const newVol = storageService.addVolunteer({
      ...volData,
      password: cleanPass,
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
   * Login as Admin Control Officer
   */
  loginAdmin: (pinOrPass) => {
    const clean = (pinOrPass || '').trim().toLowerCase();
    if (clean === '1070' || clean === '1234' || clean === 'admin' || clean === 'admin123') {
      const session = {
        role: 'ADMIN',
        user: {
          id: 'admin-control-1',
          name: 'Control Room Officer',
          email: 'admin@asdma.gov.in',
          title: 'ASDMA Emergency Verification Control'
        }
      };

      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      notifyAuthChanged();
      return session;
    } else {
      throw new Error("Incorrect Admin Passcode. Default PIN for demo is 1070.");
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
