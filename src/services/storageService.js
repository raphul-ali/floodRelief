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
  "Social Media Influencer / Fundraiser",
  "Individual Volunteer Helper",
  "Local Boat / Transport Owner",
  "Medical Doctor / Paramedic",
  "Food & Water Supply Donor",
  "Student Rescue Alliance"
];

// Clean Production Storage Keys
const STORAGE_KEYS = {
  VICTIMS: "flood_portal_victims_prod_v9",
  NGOS: "flood_portal_ngos_prod_v9",
  VOLUNTEERS: "flood_portal_volunteers_prod_v9",
  DELIVERY_LOGS: "flood_portal_delivery_logs_prod_v9"
};

const notifyDataChanged = () => {
  window.dispatchEvent(new Event("flood_data_changed"));
};

export const storageService = {
  
  // --- VICTIM SOS REQUESTS ---
  getVictimRequests: (includeUnverified = false) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VICTIMS);
      let list = data ? JSON.parse(data) : [];
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
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated));

    // Supabase Cloud Sync
    if (isSupabaseConfigured && supabase) {
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
        verified: false
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
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated));

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
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated));

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
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated));

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
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated));

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
      const data = localStorage.getItem(STORAGE_KEYS.DELIVERY_LOGS);
      let logs = data ? JSON.parse(data) : [];
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
      itemsDelivered: securityService.limitLength(securityService.sanitizeText(logData.itemsDelivered), 300),
      deliveryNotes: securityService.limitLength(securityService.sanitizeText(logData.deliveryNotes), 400),
      statusUpdate: securityService.sanitizeText(logData.statusUpdate || "In Progress")
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
    localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(updated));

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

    localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(updatedLogs));

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
    localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(updated));

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
      const data = localStorage.getItem(STORAGE_KEYS.NGOS);
      let list = data ? JSON.parse(data) : [];
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
      ...sanitized
    };

    const updated = [newNgo, ...ngos];
    localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      supabase.from('ngos').insert([{
        id: newNgo.id,
        name: newNgo.name,
        contact_person: newNgo.contactPerson,
        phone: newNgo.phone,
        email: newNgo.email,
        password: newNgo.password,
        operating_zones: newNgo.operatingZones,
        services: newNgo.services,
        address: newNgo.address,
        verified: newNgo.verified,
        active_teams: newNgo.activeTeams,
        created_at: new Date().toISOString()
      }]).then(({ error }) => {
        if (error) console.error("Supabase NGO insert error:", error);
      });
    }

    securityService.recordSubmission();
    notifyDataChanged();
    return newNgo;
  },

  verifyNGO: (ngoId) => {
    const ngos = storageService.getNGOs(true);
    const updated = ngos.map(n => n.id === ngoId ? { ...n, verified: true } : n);
    localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      supabase.from('ngos').update({ verified: true }).eq('id', ngoId).then(({ error }) => {
        if (error) console.error("Supabase NGO verify error:", error);
      });
    }

    notifyDataChanged();
  },

  rejectNGO: (ngoId) => {
    const ngos = storageService.getNGOs(true);
    const updated = ngos.filter(n => n.id !== ngoId);
    localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(updated));

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
      const data = localStorage.getItem(STORAGE_KEYS.VOLUNTEERS);
      let list = data ? JSON.parse(data) : [];
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
      ...sanitized
    };

    const updated = [newVol, ...vols];
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
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
        created_at: new Date().toISOString()
      }]).then(({ error }) => {
        if (error) console.error("Supabase Volunteer insert error:", error);
      });
    }

    securityService.recordSubmission();
    notifyDataChanged();
    return newVol;
  },

  verifyVolunteer: (volId) => {
    const vols = storageService.getVolunteers(true);
    const updated = vols.map(v => v.id === volId ? { ...v, verified: true } : v);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      supabase.from('volunteers').update({ verified: true }).eq('id', volId).then(({ error }) => {
        if (error) console.error("Supabase Volunteer verify error:", error);
      });
    }

    notifyDataChanged();
  },

  rejectVolunteer: (volId) => {
    const vols = storageService.getVolunteers(true);
    const updated = vols.filter(v => v.id !== volId);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      supabase.from('volunteers').delete().eq('id', volId).then(({ error }) => {
        if (error) console.error("Supabase Volunteer delete error:", error);
      });
    }

    notifyDataChanged();
  },

  resetToDefaultSeed: () => {
    localStorage.removeItem(STORAGE_KEYS.VICTIMS);
    localStorage.removeItem(STORAGE_KEYS.DELIVERY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.NGOS);
    localStorage.removeItem(STORAGE_KEYS.VOLUNTEERS);
    notifyDataChanged();
  }
};
