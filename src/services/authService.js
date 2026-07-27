/**
 * Authentication & Session Management Service
 * Roles: 'GUEST' | 'NGO' | 'ADMIN'
 */
import { storageService } from './storageService';

const AUTH_SESSION_KEY = "flood_portal_auth_session_v1";

const notifyAuthChanged = () => {
  window.dispatchEvent(new Event("flood_auth_changed"));
};

export const authService = {
  
  /**
   * Get current active session
   * @returns {Object} { role: 'GUEST'|'NGO'|'ADMIN', user: Object|null }
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
   * Login as NGO
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
   * Register a new NGO account (requires Admin approval)
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
