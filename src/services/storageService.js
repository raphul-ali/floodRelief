import { securityService } from './securityService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// All 35 Official Administrative Districts of Assam
export const ASSAM_DISTRICTS = [
  "Jorhat",
  "Sivasagar",
  "Bajali",
  "Baksa",
  "Barpeta",
  "Biswanath",
  "Bongaigaon",
  "Cachar (Silchar)",
  "Charaideo",
  "Chirang",
  "Darrang",
  "Dhemaji",
  "Dhubri",
  "Dibrugarh",
  "Dima Hasao (Haflong)",
  "Goalpara",
  "Golaghat",
  "Hailakandi",
  "Hojai",
  "Kamrup Metropolitan (Guwahati)",
  "Kamrup Rural",
  "Karbi Anglong (Diphu)",
  "Karimganj",
  "Kokrajhar",
  "Lakhimpur",
  "Majuli Island",
  "Morigaon",
  "Nagaon",
  "Nalbari",
  "Sonitpur (Tezpur)",
  "South Salmara-Mankachar",
  "Tamulpur",
  "Tinsukia",
  "Udalguri",
  "West Karbi Anglong"
];

export const VOLUNTEER_ROLES = [
  "🚤 Free Motorboat / Rescue Boat Service",
  "🚗 Free Car / SUV / 4x4 Transport Service",
  "🚚 Free Goods Truck / Pickup Van",
  "🩺 Free Medical Doctor / Paramedic"
];

export const NGO_TYPES = [
  "🏢 Registered NGO / Relief Organization",
  "📦 Free Food & Water Supply Donor",
  "📢 Social Media Influencer / Fundraiser",
  "🤝 Individual Volunteer Helper / Self Help Worker"
];

// Clean Production Storage Keys
const STORAGE_KEYS = {
  VICTIMS: "flood_portal_victims_prod_v9",
  NGOS: "flood_portal_ngos_prod_v9",
  VOLUNTEERS: "flood_portal_volunteers_prod_v9",
  DELIVERY_LOGS: "flood_portal_delivery_logs_prod_v9",
  ACCOUNT_RECOVERY: "flood_portal_account_recovery_v1",
  VOLUNTEER_COLLAB: "flood_portal_vol_collab_v1"
};

const notifyDataChanged = () => {
  window.dispatchEvent(new Event("flood_data_changed"));
};

const cloudMemoryCache = {
  victims: null,
  ngos: null,
  volunteers: null,
  deliveryLogs: null
};

export const storageService = {
  
  // --- VICTIM SOS REQUESTS ---
  getVictimRequests: (includeUnverified = false) => {
    try {
      let list = [];
      if (isSupabaseConfigured && cloudMemoryCache.victims !== null) {
        list = cloudMemoryCache.victims;
      } else {
        const data = localStorage.getItem(STORAGE_KEYS.VICTIMS);
        list = data ? JSON.parse(data) : [];
      }
      
      if (!includeUnverified) {
        return list.filter(req => req.verified === true);
      }
      return list;
    } catch (e) {
      console.error("Failed to load victims from storage:", e);
      return [];
    }
  },

  getPendingVictimRequests: () => {
    try {
      const list = storageService.getVictimRequests(true);
      return list.filter(req => req.verified !== true);
    } catch (e) {
      return [];
    }
  },

  addVictimRequest: (requestData) => {
    const rateCheck = securityService.checkRateLimit();
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message);
    }

    if (!securityService.validatePhoneNumber(requestData.phone)) {
      throw new Error("Invalid mobile phone number. Please provide a valid 10-digit Indian phone number.");
    }
    if (requestData.pinCode && !securityService.validatePinCode(requestData.pinCode)) {
      throw new Error("Invalid PIN Code. Please provide a valid 6-digit postal PIN code.");
    }

    const sanitized = {
      ...requestData,
      name: securityService.limitLength(securityService.sanitizeText(requestData.name), 60),
      phone: securityService.limitLength(securityService.sanitizeText(requestData.phone), 20),
      altPhone: securityService.limitLength(securityService.sanitizeText(requestData.altPhone), 20),
      district: securityService.sanitizeText(requestData.district),
      villageName: securityService.limitLength(securityService.sanitizeText(requestData.villageName), 100),
      pinCode: securityService.limitLength(securityService.sanitizeText(requestData.pinCode), 10),
      landmark: securityService.limitLength(securityService.sanitizeText(requestData.landmark), 150),
      locationName: securityService.limitLength(securityService.sanitizeText(requestData.locationName), 250),
      details: securityService.limitLength(securityService.sanitizeText(requestData.details), 400),
      requestedByRole: requestData.requestedByRole ? securityService.sanitizeText(requestData.requestedByRole) : 'CITIZEN',
      requestedByName: requestData.requestedByName ? securityService.limitLength(securityService.sanitizeText(requestData.requestedByName), 80) : securityService.limitLength(securityService.sanitizeText(requestData.name), 60),
      requestedByPhone: requestData.requestedByPhone ? securityService.limitLength(securityService.sanitizeText(requestData.requestedByPhone), 20) : securityService.limitLength(securityService.sanitizeText(requestData.phone), 20),
    };

    const requests = storageService.getVictimRequests(true);
    const newRequest = {
      id: "ASSAM-SOS-" + Math.floor(100 + Math.random() * 900),
      createdAt: new Date().toISOString(),
      status: "Pending Verification",
      assignedNgo: null,
      verified: false,
      ...sanitized
    };

    const updated = [newRequest, ...requests];

    if (isSupabaseConfigured && supabase) {
      // Optimitic memory cache update for live mode
      cloudMemoryCache.victims = updated;
      
      supabase.from('victim_requests').insert([{
        id: newRequest.id,
        created_at: newRequest.createdAt,
        name: newRequest.name,
        phone: newRequest.phone,
        alt_phone: newRequest.altPhone,
        people_count: newRequest.peopleCount,
        males_count: newRequest.malesCount,
        females_count: newRequest.femalesCount,
        children_count: newRequest.childrenCount,
        families_count: newRequest.familiesCount,
        district: newRequest.district,
        village_name: newRequest.villageName,
        pin_code: newRequest.pinCode,
        landmark: newRequest.landmark,
        location_name: newRequest.locationName,
        latitude: newRequest.latitude,
        longitude: newRequest.longitude,
        is_urgent_rescue: newRequest.isUrgentRescue,
        needs: newRequest.needs,
        details: newRequest.details,
        status: newRequest.status,
        verified: newRequest.verified || false,
        requested_by_role: newRequest.requestedByRole || 'CITIZEN',
        requested_by_name: newRequest.requestedByName || newRequest.name,
        requested_by_phone: newRequest.requestedByPhone || newRequest.phone
      }]).then(({ error }) => {
        if (error) console.error("Supabase insert error:", error);
      });
    }

    securityService.recordSubmission();
    notifyDataChanged();
    return newRequest;
  },

  verifyVictimRequest: (requestId, verifierName = "Super Admin") => {
    const requests = storageService.getVictimRequests(true);
    const updated = requests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          verified: true,
          status: req.status === "Pending Verification" ? "Pending" : req.status,
          verifiedAt: new Date().toISOString(),
          verifiedBy: verifierName
        };
      }
      return req;
    });
    if (isSupabaseConfigured) { cloudMemoryCache.victims = updated; } else { localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated)); }

    // Supabase Sync
    if (isSupabaseConfigured && supabase) {
      supabase.from('victim_requests').update({
        verified: true,
        status: 'Pending',
        verified_at: new Date().toISOString(),
        verified_by: verifierName
      }).eq('id', requestId).then(({ error }) => {
        if (error) console.error("Supabase update error:", error);
      });
    }

    notifyDataChanged();
  },

  rejectVictimRequest: (requestId) => {
    const requests = storageService.getVictimRequests(true);
    const updated = requests.filter(req => req.id !== requestId);
    if (isSupabaseConfigured) { cloudMemoryCache.victims = updated; } else { localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated)); }

    if (isSupabaseConfigured && supabase) {
      supabase.from('victim_requests').delete().eq('id', requestId).then(({ error }) => {
        if (error) console.error("Supabase delete error:", error);
      });
    }

    notifyDataChanged();
  },

  updateRequestStatus: (requestId, status, assignedNgo = null) => {
    const requests = storageService.getVictimRequests(true);
    const updated = requests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: securityService.sanitizeText(status),
          assignedNgo: assignedNgo !== null ? securityService.sanitizeText(assignedNgo) : req.assignedNgo
        };
      }
      return req;
    });
    if (isSupabaseConfigured) { cloudMemoryCache.victims = updated; } else { localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated)); }

    if (isSupabaseConfigured && supabase) {
      supabase.from('victim_requests').update({
        status: securityService.sanitizeText(status),
        assigned_ngo: assignedNgo
      }).eq('id', requestId).then(({ error }) => {
        if (error) console.error("Supabase update status error:", error);
      });
    }

    notifyDataChanged();
  },

  deleteVictimRequest: (requestId) => {
    const requests = storageService.getVictimRequests(true);
    const updated = requests.filter(req => req.id !== requestId);
    if (isSupabaseConfigured) { cloudMemoryCache.victims = updated; } else { localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated)); }

    if (isSupabaseConfigured && supabase) {
      supabase.from('victim_requests').delete().eq('id', requestId).then(({ error }) => {
        if (error) console.error("Supabase delete error:", error);
      });
    }

    notifyDataChanged();
  },

  // --- NGO & VOLUNTEER RELIEF DELIVERY LOGS ---
  getDeliveryLogs: (includeUnverified = false) => {
    try {
      let logs = [];
      if (isSupabaseConfigured && cloudMemoryCache.deliveryLogs !== null) {
        logs = cloudMemoryCache.deliveryLogs;
      } else {
        const data = localStorage.getItem(STORAGE_KEYS.DELIVERY_LOGS);
        logs = data ? JSON.parse(data) : [];
      }
      if (!includeUnverified) {
        return logs.filter(log => log.verified === true);
      }
      return logs;
    } catch (e) {
      console.error("Failed to load delivery logs:", e);
      return [];
    }
  },

  getPendingDeliveryLogs: () => {
    const logs = storageService.getDeliveryLogs(true);
    return logs.filter(log => log.verified !== true);
  },

  submitDeliveryLog: (logData, isAutoVerified = false) => {
    const rateCheck = securityService.checkRateLimit();
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message);
    }

    const sanitized = {
      requestId: securityService.sanitizeText(logData.requestId),
      recipientName: securityService.limitLength(securityService.sanitizeText(logData.recipientName), 80),
      district: securityService.sanitizeText(logData.district),
      deliveredBy: securityService.limitLength(securityService.sanitizeText(logData.deliveredBy), 100),
      volunteerPhone: securityService.limitLength(securityService.sanitizeText(logData.volunteerPhone), 20),
      itemsDelivered: logData.itemsDelivered ? securityService.limitLength(securityService.sanitizeText(logData.itemsDelivered), 300) : null,
      deliveryNotes: logData.deliveryNotes ? securityService.limitLength(securityService.sanitizeText(logData.deliveryNotes), 400) : null,
      statusUpdate: securityService.sanitizeText(logData.statusUpdate || "In Progress"),
      rescuedCount: logData.rescuedCount ? parseInt(logData.rescuedCount, 10) : null,
      remainingCount: logData.remainingCount !== undefined ? parseInt(logData.remainingCount, 10) : null
    };

    const isVerified = isAutoVerified || logData.verified === true;
    const logs = storageService.getDeliveryLogs(true);
    const newLog = {
      logId: "LOG-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      verified: isVerified,
      verifiedBy: isVerified ? (logData.verifiedBy || `Verified NGO: ${sanitized.deliveredBy}`) : null,
      ...sanitized
    };

    const updated = [newLog, ...logs];
    if (isSupabaseConfigured) { cloudMemoryCache.deliveryLogs = updated; } else { localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(updated)); }

    if (isVerified && sanitized.requestId) {
      storageService.updateRequestStatus(
        sanitized.requestId, 
        sanitized.statusUpdate, 
        sanitized.deliveredBy
      );
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from('delivery_logs').insert([{
        log_id: newLog.logId,
        request_id: newLog.requestId,
        recipient_name: newLog.recipientName,
        district: newLog.district,
        delivered_by: newLog.deliveredBy,
        volunteer_phone: newLog.volunteerPhone,
        items_delivered: newLog.itemsDelivered,
        delivery_notes: newLog.deliveryNotes,
        status_update: newLog.statusUpdate,
        verified: isVerified,
        verified_by: newLog.verifiedBy,
        rescued_count: newLog.rescuedCount,
        remaining_count: newLog.remainingCount,
        created_at: newLog.createdAt
      }]).then(({ error }) => {
        if (error) console.error("Supabase delivery log insert error:", error);
      });
    }

    securityService.recordSubmission();
    notifyDataChanged();
    return newLog;
  },

  verifyDeliveryLog: (logId, verifierName = "Super Admin") => {
    const logs = storageService.getDeliveryLogs(true);
    let targetLog = null;

    const updatedLogs = logs.map(log => {
      if (log.logId === logId) {
        targetLog = {
          ...log,
          verified: true,
          verifiedBy: verifierName
        };
        return targetLog;
      }
      return log;
    });

    if (isSupabaseConfigured) { cloudMemoryCache.deliveryLogs = updatedLogs; } else { localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(updatedLogs)); }

    if (targetLog && targetLog.requestId) {
      storageService.updateRequestStatus(
        targetLog.requestId, 
        targetLog.statusUpdate, 
        targetLog.deliveredBy
      );
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from('delivery_logs').update({
        verified: true,
        verified_by: verifierName
      }).eq('log_id', logId).then(({ error }) => {
        if (error) console.error("Supabase verify delivery log error:", error);
      });
    }

    notifyDataChanged();
  },

  rejectDeliveryLog: (logId) => {
    const logs = storageService.getDeliveryLogs(true);
    const updated = logs.filter(log => log.logId !== logId);
    if (isSupabaseConfigured) { cloudMemoryCache.deliveryLogs = updated; } else { localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(updated)); }

    if (isSupabaseConfigured && supabase) {
      supabase.from('delivery_logs').delete().eq('log_id', logId).then(({ error }) => {
        if (error) console.error("Supabase delete delivery log error:", error);
      });
    }

    notifyDataChanged();
  },

  // --- NGO DIRECTORY METHODS ---
  getNGOs: (includeUnverified = false) => {
    try {
      let list = [];
      if (isSupabaseConfigured && cloudMemoryCache.ngos !== null) {
        list = cloudMemoryCache.ngos;
      } else {
        const data = localStorage.getItem(STORAGE_KEYS.NGOS);
        list = data ? JSON.parse(data) : [];
      }
      if (!includeUnverified) {
        return list.filter(n => n.verified === true);
      }
      return list;
    } catch (e) {
      console.error("Failed to load NGOs from storage:", e);
      return [];
    }
  },

  getPendingNGOs: () => {
    const list = storageService.getNGOs(true);
    return list.filter(n => n.verified !== true);
  },

  addNGO: (ngoData) => {
    const rateCheck = securityService.checkRateLimit();
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message);
    }

    const sanitized = {
      ...ngoData,
      name: securityService.limitLength(securityService.sanitizeText(ngoData.name), 80),
      contactPerson: securityService.limitLength(securityService.sanitizeText(ngoData.contactPerson), 60),
      phone: securityService.limitLength(securityService.sanitizeText(ngoData.phone), 20),
      email: securityService.limitLength(securityService.sanitizeText(ngoData.email), 60),
      address: securityService.limitLength(securityService.sanitizeText(ngoData.address), 200),
    };

    const ngos = storageService.getNGOs(true);
    const newNgo = {
      id: "ngo-assam-" + Date.now(),
      verified: ngoData.verified === true,
      activeTeams: 1,
      showPhone: ngoData.showPhone !== false, // default true
      ...sanitized
    };

    const updated = [newNgo, ...ngos];
    
    if (isSupabaseConfigured && supabase) {
      cloudMemoryCache.ngos = updated;
      supabase.from('ngos').insert([{
        id: newNgo.id,
        name: newNgo.name,
        contact_person: newNgo.contactPerson,
        phone: newNgo.phone,
        email: newNgo.email,
        password: newNgo.password,
        logo_url: newNgo.logoUrl || null,
        operating_zones: newNgo.operatingZones,
        services: newNgo.services,
        address: newNgo.address,
        verified: newNgo.verified,
        active_teams: newNgo.activeTeams,
        show_phone: newNgo.showPhone,
        created_at: new Date().toISOString()
      }]).then(({ error }) => {
        if (error) console.error("Supabase NGO insert error:", error);
      });
    } else {
      if (isSupabaseConfigured) { cloudMemoryCache.ngos = updated; } else { localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(updated)); }
    }

    securityService.recordSubmission();
    notifyDataChanged();
    return newNgo;
  },

  verifyNGO: (ngoId) => {
    const ngos = storageService.getNGOs(true);
    const updated = ngos.map(n => n.id === ngoId ? { ...n, verified: true } : n);
    if (isSupabaseConfigured) { cloudMemoryCache.ngos = updated; } else { localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(updated)); }

    if (isSupabaseConfigured && supabase) {
      supabase.from('ngos').update({ verified: true }).eq('id', ngoId).then(({ error }) => {
        if (error) console.error("Supabase NGO verify error:", error);
      });
    }

    notifyDataChanged();
  },

  updateNGOOperatingZones: (ngoId, zones) => {
    const ngos = storageService.getNGOs(true);
    const updated = ngos.map(n => n.id === ngoId ? { ...n, operatingZones: zones } : n);
    if (isSupabaseConfigured) { cloudMemoryCache.ngos = updated; } else { localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(updated)); }

    if (isSupabaseConfigured && supabase) {
      supabase.from('ngos').update({ operating_zones: zones }).eq('id', ngoId).then(({ error }) => {
        if (error) console.error("Supabase NGO zones update error:", error);
      });
    }

    notifyDataChanged();
  },

  rejectNGO: (ngoId) => {
    const ngos = storageService.getNGOs(true);
    const updated = ngos.filter(n => n.id !== ngoId);
    if (isSupabaseConfigured) { cloudMemoryCache.ngos = updated; } else { localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(updated)); }

    if (isSupabaseConfigured && supabase) {
      supabase.from('ngos').delete().eq('id', ngoId).then(({ error }) => {
        if (error) console.error("Supabase NGO delete error:", error);
      });
    }

    notifyDataChanged();
  },

  // --- VOLUNTEER DIRECTORY METHODS ---
  getVolunteers: (includeUnverified = false) => {
    try {
      let list = [];
      if (isSupabaseConfigured && cloudMemoryCache.volunteers !== null) {
        list = cloudMemoryCache.volunteers;
      } else {
        const data = localStorage.getItem(STORAGE_KEYS.VOLUNTEERS);
        list = data ? JSON.parse(data) : [];
      }
      if (!includeUnverified) {
        return list.filter(v => v.verified === true);
      }
      return list;
    } catch (e) {
      console.error("Failed to load volunteers from storage:", e);
      return [];
    }
  },

  getPendingVolunteers: () => {
    const list = storageService.getVolunteers(true);
    return list.filter(v => v.verified !== true);
  },

  addVolunteer: (volData) => {
    const rateCheck = securityService.checkRateLimit();
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message);
    }

    const sanitized = {
      ...volData,
      name: securityService.limitLength(securityService.sanitizeText(volData.name), 80),
      phone: securityService.limitLength(securityService.sanitizeText(volData.phone), 20),
      district: securityService.sanitizeText(volData.district),
      socialLink: securityService.limitLength(securityService.sanitizeText(volData.socialLink), 150),
      offerings: securityService.limitLength(securityService.sanitizeText(volData.offerings), 250),
    };

    const vols = storageService.getVolunteers(true);
    const newVol = {
      id: "vol-" + Date.now(),
      availableStatus: "Active Now",
      verified: volData.verified === true,
      showPhone: volData.showPhone === true, // default false for volunteer unless explicitly requested
      ...sanitized
    };

    const updated = [newVol, ...vols];
    
    if (isSupabaseConfigured && supabase) {
      cloudMemoryCache.volunteers = updated;
      supabase.from('volunteers').insert([{
        id: newVol.id,
        name: newVol.name,
        role_type: newVol.roleType,
        phone: newVol.phone,
        email: newVol.email,
        password: newVol.password,
        district: newVol.district,
        social_link: newVol.socialLink,
        offerings: newVol.offerings,
        available_status: newVol.availableStatus,
        verified: newVol.verified,
        show_phone: newVol.showPhone,
        created_at: new Date().toISOString()
      }]).then(({ error }) => {
        if (error) console.error("Supabase Volunteer insert error:", error);
      });
    } else {
      if (isSupabaseConfigured) { cloudMemoryCache.volunteers = updated; } else { localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(updated)); }
    }

    securityService.recordSubmission();
    notifyDataChanged();
    return newVol;
  },

  verifyVolunteer: (volId) => {
    const vols = storageService.getVolunteers(true);
    const updated = vols.map(v => v.id === volId ? { ...v, verified: true } : v);
    if (isSupabaseConfigured) { cloudMemoryCache.volunteers = updated; } else { localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(updated)); }

    if (isSupabaseConfigured && supabase) {
      supabase.from('volunteers').update({ verified: true }).eq('id', volId).then(({ error }) => {
        if (error) console.error("Supabase Volunteer verify error:", error);
      });
    }

    notifyDataChanged();
  },

  updateVolunteerStatus: (volId, status) => {
    const vols = storageService.getVolunteers(true);
    const updated = vols.map(v => v.id === volId ? { ...v, availableStatus: status } : v);
    if (isSupabaseConfigured) { cloudMemoryCache.volunteers = updated; } else { localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(updated)); }

    if (isSupabaseConfigured && supabase) {
      supabase.from('volunteers').update({ available_status: status }).eq('id', volId).then(({ error }) => {
        if (error) console.error("Supabase Volunteer status update error:", error);
      });
    }

    notifyDataChanged();
  },

  rejectVolunteer: (volId) => {
    const vols = storageService.getVolunteers(true);
    const updated = vols.filter(v => v.id !== volId);
    if (isSupabaseConfigured) { cloudMemoryCache.volunteers = updated; } else { localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(updated)); }

    if (isSupabaseConfigured && supabase) {
      supabase.from('volunteers').delete().eq('id', volId).then(({ error }) => {
        if (error) console.error("Supabase Volunteer delete error:", error);
      });
    }

    notifyDataChanged();
  },

  // --- ACCOUNT RECOVERY REQUESTS (FORGOT PASSWORD / FORGOT EMAIL) ---
  getAccountRecoveryRequests: (includeResolved = true) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNT_RECOVERY);
      const list = data ? JSON.parse(data) : [];
      if (!includeResolved) {
        return list.filter(r => r.status !== 'RESOLVED');
      }
      return list;
    } catch (e) {
      console.error("Failed to load account recovery requests:", e);
      return [];
    }
  },

  getPendingAccountRecoveryRequests: () => {
    return storageService.getAccountRecoveryRequests(false);
  },

  addAccountRecoveryRequest: (reqData) => {
    const list = storageService.getAccountRecoveryRequests(true);
    const newReq = {
      id: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      requestType: reqData.requestType, // 'FORGOT_PASSWORD' | 'FORGOT_EMAIL'
      accountRole: reqData.accountRole || 'NGO', // 'NGO' | 'VOLUNTEER'
      name: (reqData.name || '').trim(),
      phone: (reqData.phone || '').trim(),
      email: (reqData.email || '').trim(),
      details: (reqData.details || '').trim(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      adminNotes: ''
    };

    list.unshift(newReq);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_RECOVERY, JSON.stringify(list));
    notifyDataChanged();
    return newReq;
  },

  resolveAccountRecoveryRequest: (id, notes = '') => {
    const list = storageService.getAccountRecoveryRequests(true);
    const updated = list.map(r => r.id === id ? { ...r, status: 'RESOLVED', adminNotes: notes } : r);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_RECOVERY, JSON.stringify(updated));
    notifyDataChanged();
  },

  deleteAccountRecoveryRequest: (id) => {
    const list = storageService.getAccountRecoveryRequests(true);
    const updated = list.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_RECOVERY, JSON.stringify(updated));
    notifyDataChanged();
  },

  findMatchingAccount: (accountRole, identifier) => {
    if (!identifier) return null;
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^0-9]/g, '');

    if (accountRole === 'NGO') {
      const ngos = storageService.getNGOs(true);
      return ngos.find(n => 
        (n.email && n.email.toLowerCase() === cleanId) ||
        (n.name && n.name.toLowerCase().includes(cleanId)) ||
        (n.phone && cleanPhone && n.phone.replace(/[^0-9]/g, '').includes(cleanPhone))
      ) || null;
    } else {
      const vols = storageService.getVolunteers(true);
      return vols.find(v => 
        (v.email && v.email.toLowerCase() === cleanId) ||
        (v.name && v.name.toLowerCase().includes(cleanId)) ||
        (v.phone && cleanPhone && v.phone.replace(/[^0-9]/g, '').includes(cleanPhone))
      ) || null;
    }
  },

  // --- VOLUNTEER & NGO LOGISTICS COLLABORATION REQUESTS ---
  getVolunteerCollabRequests: (ngoId = null, volId = null) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOLUNTEER_COLLAB);
      let list = data ? JSON.parse(data) : [];
      if (ngoId) {
        list = list.filter(r => r.ngoId === ngoId);
      }
      if (volId) {
        list = list.filter(r => r.volId === volId);
      }
      return list;
    } catch (e) {
      console.error("Failed to load volunteer collaboration requests:", e);
      return [];
    }
  },

  addVolunteerCollabRequest: (reqData) => {
    const list = storageService.getVolunteerCollabRequests();
    const newReq = {
      id: `VREQ-${Math.floor(100000 + Math.random() * 900000)}`,
      ngoId: reqData.ngoId,
      ngoName: reqData.ngoName,
      ngoPhone: reqData.ngoPhone,
      ngoEmail: reqData.ngoEmail,
      volId: reqData.volId,
      volName: reqData.volName,
      volRole: reqData.volRole,
      volPhone: reqData.volPhone,
      volDistrict: reqData.volDistrict,
      sosRequestId: reqData.sosRequestId || '',
      sosLocation: reqData.sosLocation || '',
      message: (reqData.message || '').trim(),
      status: 'PENDING', // 'PENDING' | 'ACCEPTED' | 'DECLINED'
      createdAt: new Date().toISOString()
    };

    list.unshift(newReq);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEER_COLLAB, JSON.stringify(list));
    notifyDataChanged();
    return newReq;
  },

  acceptVolunteerCollabRequest: (id) => {
    const list = storageService.getVolunteerCollabRequests();
    const updated = list.map(r => r.id === id ? { ...r, status: 'ACCEPTED' } : r);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEER_COLLAB, JSON.stringify(updated));
    notifyDataChanged();
  },

  declineVolunteerCollabRequest: (id) => {
    const list = storageService.getVolunteerCollabRequests();
    const updated = list.map(r => r.id === id ? { ...r, status: 'DECLINED' } : r);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEER_COLLAB, JSON.stringify(updated));
    notifyDataChanged();
  },

  deleteVolunteerCollabRequest: (id) => {
    const list = storageService.getVolunteerCollabRequests();
    const updated = list.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEER_COLLAB, JSON.stringify(updated));
    notifyDataChanged();
  },

  resetToDefaultSeed: () => {
    localStorage.removeItem(STORAGE_KEYS.VICTIMS);
    localStorage.removeItem(STORAGE_KEYS.DELIVERY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.NGOS);
    localStorage.removeItem(STORAGE_KEYS.VOLUNTEERS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT_RECOVERY);
    localStorage.removeItem(STORAGE_KEYS.VOLUNTEER_COLLAB);
    notifyDataChanged();
  },

  syncWithSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;
    
    // 1. Fetch Victim SOS Requests from Supabase
    try {
      const { data: victims, error: vErr } = await supabase
        .from('victim_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (vErr) {
        console.error("Supabase victim_requests fetch error:", vErr);
      } else if (Array.isArray(victims)) {
        const formattedVictims = victims.map(v => ({
          id: v.id,
          createdAt: v.created_at,
          name: v.name,
          phone: v.phone,
          altPhone: v.alt_phone,
          peopleCount: v.people_count,
          malesCount: v.males_count,
          femalesCount: v.females_count,
          childrenCount: v.children_count,
          district: v.district,
          villageName: v.village_name,
          pinCode: v.pin_code,
          landmark: v.landmark,
          locationName: v.location_name,
          latitude: v.latitude,
          longitude: v.longitude,
          isUrgentRescue: v.is_urgent_rescue,
          needs: v.needs,
          details: v.details,
          status: v.status,
          verified: v.verified,
          requestedByRole: v.requested_by_role || 'CITIZEN',
          requestedByName: v.requested_by_name || v.name,
          requestedByPhone: v.requested_by_phone || v.phone
        }));
        if (isSupabaseConfigured) { cloudMemoryCache.victims = formattedVictims; } else { localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(formattedVictims)); }
      }
    } catch (err) {
      console.error("Supabase victim_requests processing error:", err);
    }

    // 2. Fetch Delivery Logs from Supabase
    try {
      const { data: logs, error: lErr } = await supabase
        .from('delivery_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (lErr) {
        console.error("Supabase delivery_logs fetch error:", lErr);
      } else if (Array.isArray(logs)) {
        const formattedLogs = logs.map(l => ({
          logId: l.log_id || l.id,
          createdAt: l.created_at,
          requestId: l.request_id,
          recipientName: l.recipient_name,
          district: l.district,
          deliveredBy: l.delivered_by,
          volunteerPhone: l.volunteer_phone,
          itemsDelivered: l.items_delivered,
          peopleImpacted: l.people_impacted,
          rescuedCount: l.rescued_count,
          remainingCount: l.remaining_count,
          deliveryNotes: l.delivery_notes,
          statusUpdate: l.status_update,
          verified: l.verified
        }));
        if (isSupabaseConfigured) { cloudMemoryCache.deliveryLogs = formattedLogs; } else { localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(formattedLogs)); }
      }
    } catch (err) {
      console.error("Supabase delivery_logs processing error:", err);
    }

    // 3. Fetch NGOs from Supabase
    try {
      const { data: ngos, error: nErr } = await supabase
        .from('ngos')
        .select('*')
        .order('created_at', { ascending: false });

      if (nErr) {
        console.error("Supabase ngos fetch error:", nErr);
      } else if (Array.isArray(ngos)) {
        const formattedNgos = ngos.map(n => ({
          id: n.id,
          name: n.name,
          contactPerson: n.contact_person,
          phone: n.phone,
          email: n.email,
          password: n.password,
          logoUrl: n.logo_url,
          operatingZones: n.operating_zones,
          services: n.services,
          address: n.address,
          verified: n.verified,
          activeTeams: n.active_teams || 1
        }));
        if (isSupabaseConfigured) { cloudMemoryCache.ngos = formattedNgos; } else { localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(formattedNgos)); }
      }
    } catch (err) {
      console.error("Supabase ngos processing error:", err);
    }

    // 4. Fetch Volunteers from Supabase
    try {
      const { data: vols, error: volErr } = await supabase
        .from('volunteers')
        .select('*')
        .order('created_at', { ascending: false });

      if (volErr) {
        console.error("Supabase volunteers fetch error:", volErr);
      } else if (Array.isArray(vols)) {
        const formattedVols = vols.map(v => ({
          id: v.id,
          name: v.name,
          roleType: v.role_type,
          phone: v.phone,
          email: v.email,
          password: v.password,
          district: v.district,
          offerings: v.offerings,
          socialLink: v.social_link,
          availableStatus: v.available_status,
          createdAt: v.created_at,
          verified: v.verified
        }));
        if (isSupabaseConfigured) { cloudMemoryCache.volunteers = formattedVols; } else { localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(formattedVols)); }
      }
    } catch (err) {
      console.error("Supabase volunteers processing error:", err);
    }

    try {
      notifyDataChanged();
    } catch (err) {
      console.error("Supabase notifyDataChanged error:", err);
    }
  }
};
