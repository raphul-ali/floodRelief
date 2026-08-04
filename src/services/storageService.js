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
  "Free Motorboat / Rescue Boat Service",
  "Free Car / SUV / 4x4 Transport Service",
  "Free Goods Truck / Pickup Van",
  "Free Medical Doctor / Paramedic"
];

export const NGO_TYPES = [
  "Registered NGO / Relief Organization",
  "Free Food & Water Supply Donor",
  "Social Media Influencer / Fundraiser",
  "Individual Volunteer Helper / Self Help Worker"
];


const notifyDataChanged = () => {
  window.dispatchEvent(new Event("flood_data_changed"));
};

const getAuthToken = () => {
  try {
    const sessionStr = localStorage.getItem('flood_portal_auth_session_v1') || localStorage.getItem('flood_relief_auth_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session.accessToken || session.token;
    }
  } catch (e) {}
  return null;
};

const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = { method, headers };
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(endpoint, config);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "API request failed");
    }
    return await response.json();
  } catch (e) {
    console.error(`API Error on ${method} ${endpoint}:`, e);
    throw e;
  }
};

const INITIAL_HELPLINES = [
  {
    id: "db17680f-3faa-43a9-8fd9-1581a6c19904",
    label: "Sivasagar Control Room",
    phone_number: "8471864355",
    sort_order: 1,
    created_at: "2026-07-29T14:27:40.644789+00:00"
  },
  {
    id: "27d3de65-2b09-4b32-a14a-2d6d309617a8",
    label: "Charaideo Control Room",
    phone_number: "9085412180",
    sort_order: 2,
    created_at: "2026-07-29T14:27:40.644789+00:00"
  },
  {
    id: "4cc0ca3a-7b75-4a2a-96f2-8cc657794a49",
    label: "Jorhat Control Room",
    phone_number: "0376-2300124",
    sort_order: 3,
    created_at: "2026-07-29T14:27:40.644789+00:00"
  },
  {
    id: "89d88291-53e5-4454-89f2-7b2ed515b0d2",
    label: "Toll free (all districts)",
    phone_number: "1077",
    sort_order: 4,
    created_at: "2026-07-29T14:27:40.644789+00:00"
  }
];

const cloudMemoryCache = {
  victims: null,
  ngos: null,
  volunteers: null,
  deliveryLogs: null,
  accountRecovery: null,
  volunteerCollab: null,
  helplineNumbers: null,
  campaigns: null
};

export const storageService = {
  
  // --- CAMPAIGNS ---
  getCampaigns: () => {
    return cloudMemoryCache.campaigns || [];
  },

  addCampaign: async (campaignData) => {
    const newItem = {
      id: `camp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      ...campaignData
    };

    try {
      await apiRequest('/api/campaigns', 'POST', newItem);
    } catch (e) {
      console.error("Exception adding campaign via API", e);
    }

    if (cloudMemoryCache.campaigns) {
      cloudMemoryCache.campaigns = [newItem, ...cloudMemoryCache.campaigns];
    } else {
      cloudMemoryCache.campaigns = [newItem];
    }
    notifyDataChanged();
    return newItem;
  },

  updateCampaign: async (id, updates) => {
    try {
      await apiRequest('/api/campaigns/' + id, 'PUT', updates);
    } catch (e) {
      console.error("Failed to update campaign via API", e);
    }

    if (cloudMemoryCache.campaigns) {
      cloudMemoryCache.campaigns = cloudMemoryCache.campaigns.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      notifyDataChanged();
    }
  },

  deleteCampaign: async (id) => {
    try {
      await apiRequest('/api/campaigns/' + id, 'DELETE');
    } catch (e) {
      console.error("Failed to delete campaign via API", e);
    }

    if (cloudMemoryCache.campaigns) {
      cloudMemoryCache.campaigns = cloudMemoryCache.campaigns.filter(item => item.id !== id);
      notifyDataChanged();
    }
  },

  // --- VICTIM SOS REQUESTS ---
  getVictimRequests: (includeUnverified = false) => {
    try {
      const list = cloudMemoryCache.victims || [];
      
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

    const isRescue = Boolean(requestData.isUrgentRescue);
    const rawPhone = requestData.phone ? securityService.sanitizeText(requestData.phone) : '';
    const nameVal = requestData.name ? securityService.limitLength(securityService.sanitizeText(requestData.name), 60) : (isRescue ? `Rescue Victim (${rawPhone})` : 'Relief Requester');
    const villageVal = requestData.villageName ? securityService.limitLength(securityService.sanitizeText(requestData.villageName), 100) : (isRescue ? 'Emergency Rescue Spot' : 'Assam Village');
    const districtVal = requestData.district ? securityService.sanitizeText(requestData.district) : 'Jorhat';
    const locationVal = requestData.locationName ? securityService.limitLength(securityService.sanitizeText(requestData.locationName), 250) : `${villageVal}, ${districtVal}`;

    const sanitized = {
      ...requestData,
      name: nameVal,
      phone: rawPhone,
      altPhone: securityService.limitLength(securityService.sanitizeText(requestData.altPhone), 20),
      district: districtVal,
      villageName: villageVal,
      pinCode: securityService.limitLength(securityService.sanitizeText(requestData.pinCode), 10),
      landmark: securityService.limitLength(securityService.sanitizeText(requestData.landmark), 150),
      locationName: locationVal,
      groundCondition: requestData.groundCondition || (isRescue ? 'SUBMERGED' : 'DRY_LAND'),
      details: securityService.limitLength(securityService.sanitizeText(requestData.details), 400),
      requestedByRole: requestData.requestedByRole ? securityService.sanitizeText(requestData.requestedByRole) : 'CITIZEN',
      requestedByName: requestData.requestedByName ? securityService.limitLength(securityService.sanitizeText(requestData.requestedByName), 80) : nameVal,
      requestedByPhone: requestData.requestedByPhone ? securityService.limitLength(securityService.sanitizeText(requestData.requestedByPhone), 20) : rawPhone,
      urgency: requestData.urgency || (isRescue ? 'CRITICAL' : 'HIGH')
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

    try {
      const dbFields = {
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
        ground_condition: newRequest.groundCondition,
        details: newRequest.details,
        status: newRequest.status,
        verified: newRequest.verified || false,
        requested_by_role: newRequest.requestedByRole || 'CITIZEN',
        requested_by_name: newRequest.requestedByName || newRequest.name,
        requested_by_phone: newRequest.requestedByPhone || newRequest.phone,
        urgency: newRequest.urgency
      };
      apiRequest('/api/victim_requests', 'POST', dbFields).catch(e => console.error("API insert error:", e));
    } catch (e) {
      console.error("Exception adding victim request via API", e);
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
    cloudMemoryCache.victims = updated;

    // API Sync
    apiRequest('/api/victim_requests/' + requestId, 'PUT', {
      verified: true,
      status: 'Pending',
      verified_at: new Date().toISOString(),
      verified_by: verifierName
    }).catch(e => console.error("API update error:", e));

    notifyDataChanged();
  },

  rejectVictimRequest: (requestId) => {
    const requests = storageService.getVictimRequests(true);
    const updated = requests.filter(req => req.id !== requestId);
    cloudMemoryCache.victims = updated;

    apiRequest('/api/victim_requests/' + requestId, 'DELETE').catch(e => console.error("API delete error:", e));

    notifyDataChanged();
  },

  editVictimRequest: (requestId, updatedFields) => {
    const requests = storageService.getVictimRequests(true);
    let updatedRequest = null;
    const updated = requests.map(req => {
      if (req.id === requestId) {
        updatedRequest = { ...req, ...updatedFields };
        return updatedRequest;
      }
      return req;
    });

    cloudMemoryCache.victims = updated;

    if (updatedRequest) {
      // Map JS camelCase back to Supabase snake_case for the update
      const dbFields = {
        name: updatedRequest.name,
        phone: updatedRequest.phone,
        alt_phone: updatedRequest.altPhone,
        people_count: updatedRequest.peopleCount,
        males_count: updatedRequest.malesCount,
        females_count: updatedRequest.femalesCount,
        children_count: updatedRequest.childrenCount,
        families_count: updatedRequest.familiesCount,
        district: updatedRequest.district,
        village_name: updatedRequest.villageName,
        pin_code: updatedRequest.pinCode,
        landmark: updatedRequest.landmark,
        location_name: updatedRequest.locationName,
        is_urgent_rescue: updatedRequest.isUrgentRescue,
        needs: updatedRequest.needs,
        details: updatedRequest.details,
      };
      
      apiRequest('/api/victim_requests/' + requestId, 'PUT', dbFields).catch(e => console.error("API edit error:", e));
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
    cloudMemoryCache.victims = updated;

    apiRequest('/api/victim_requests/' + requestId, 'PUT', {
      status: securityService.sanitizeText(status),
      assigned_ngo: assignedNgo
    }).catch(e => console.error("API update status error:", e));

    notifyDataChanged();
  },

  deleteVictimRequest: (requestId) => {
    const requests = storageService.getVictimRequests(true);
    const updated = requests.filter(req => req.id !== requestId);
    cloudMemoryCache.victims = updated;

    apiRequest('/api/victim_requests/' + requestId, 'DELETE').catch(e => console.error("API delete error:", e));

    notifyDataChanged();
  },

  // --- NGO & VOLUNTEER RELIEF DELIVERY LOGS ---
  getDeliveryLogs: (includeUnverified = false) => {
    try {
      const list = cloudMemoryCache.deliveryLogs || [];
      if (!includeUnverified) {
        return list.filter(log => log.verified === true);
      }
      return list;
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
    cloudMemoryCache.deliveryLogs = updated;

    if (isVerified && sanitized.requestId) {
      storageService.updateRequestStatus(
        sanitized.requestId, 
        sanitized.statusUpdate, 
        sanitized.deliveredBy
      );
    }

    const dbLog = {
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
    };
    apiRequest('/api/db/delivery_logs', 'POST', dbLog).catch(e => console.error("API delivery log insert error:", e));

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

    cloudMemoryCache.deliveryLogs = updatedLogs;

    if (targetLog && targetLog.requestId) {
      storageService.updateRequestStatus(
        targetLog.requestId, 
        targetLog.statusUpdate, 
        targetLog.deliveredBy
      );
    }

    apiRequest('/api/db/delivery_logs/' + logId, 'PUT', {
      verified: true,
      verified_by: verifierName
    }).catch(e => console.error("API verify delivery log error:", e));

    notifyDataChanged();
  },

  rejectDeliveryLog: (logId) => {
    const logs = storageService.getDeliveryLogs(true);
    const updated = logs.filter(log => log.logId !== logId);
    cloudMemoryCache.deliveryLogs = updated;

    apiRequest('/api/db/delivery_logs/' + logId, 'DELETE').catch(e => console.error("API delete delivery log error:", e));

    notifyDataChanged();
  },

  // --- NGO DIRECTORY METHODS ---
  getNGOs: (includeUnverified = false) => {
    try {
      const list = cloudMemoryCache.ngos || [];
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
    
    cloudMemoryCache.ngos = updated;

    securityService.recordSubmission();
    notifyDataChanged();
    return newNgo;
  },

  verifyNGO: (ngoId) => {
    const ngos = storageService.getNGOs(true);
    const updated = ngos.map(n => n.id === ngoId ? { ...n, verified: true } : n);
    cloudMemoryCache.ngos = updated;

    apiRequest('/api/db/ngos/' + ngoId, 'PUT', { verified: true }).catch(e => console.error("API NGO verify error:", e));

    notifyDataChanged();
  },

  updateNGOOperatingZones: (ngoId, zones) => {
    const ngos = storageService.getNGOs(true);
    const updated = ngos.map(n => n.id === ngoId ? { ...n, operatingZones: zones } : n);
    cloudMemoryCache.ngos = updated;

    apiRequest('/api/db/ngos/' + ngoId, 'PUT', { operating_zones: zones }).catch(e => console.error("API NGO zones update error:", e));

    notifyDataChanged();
  },

  rejectNGO: (ngoId) => {
    const ngos = storageService.getNGOs(true);
    const updated = ngos.filter(n => n.id !== ngoId);
    cloudMemoryCache.ngos = updated;

    apiRequest('/api/db/ngos/' + ngoId, 'DELETE').catch(e => console.error("API NGO delete error:", e));

    notifyDataChanged();
  },

  // --- VOLUNTEER DIRECTORY METHODS ---
  getVolunteers: (includeUnverified = false) => {
    try {
      const list = cloudMemoryCache.volunteers || [];
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
    
    cloudMemoryCache.volunteers = updated;

    securityService.recordSubmission();
    notifyDataChanged();
    return newVol;
  },

  verifyVolunteer: (volId) => {
    const vols = storageService.getVolunteers(true);
    const updated = vols.map(v => v.id === volId ? { ...v, verified: true } : v);
    cloudMemoryCache.volunteers = updated;

    apiRequest('/api/db/volunteers/' + volId, 'PUT', { verified: true }).catch(e => console.error("API Volunteer verify error:", e));

    notifyDataChanged();
  },

  updateVolunteerStatus: (volId, status) => {
    const vols = storageService.getVolunteers(true);
    const updated = vols.map(v => v.id === volId ? { ...v, availableStatus: status } : v);
    cloudMemoryCache.volunteers = updated;

    apiRequest('/api/db/volunteers/' + volId, 'PUT', { available_status: status }).catch(e => console.error("API Volunteer status update error:", e));

    notifyDataChanged();
  },

  rejectVolunteer: (volId) => {
    const vols = storageService.getVolunteers(true);
    const updated = vols.filter(v => v.id !== volId);
    cloudMemoryCache.volunteers = updated;

    apiRequest('/api/db/volunteers/' + volId, 'DELETE').catch(e => console.error("API Volunteer delete error:", e));

    notifyDataChanged();
  },

  // --- ACCOUNT RECOVERY REQUESTS (FORGOT PASSWORD / FORGOT EMAIL) ---
  getAccountRecoveryRequests: (includeResolved = true) => {
    try {
      const list = cloudMemoryCache.accountRecovery || [];
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
    cloudMemoryCache.accountRecovery = list;
    notifyDataChanged();
    return newReq;
  },

  resolveAccountRecoveryRequest: (id, notes = '') => {
    const list = storageService.getAccountRecoveryRequests(true);
    const updated = list.map(r => r.id === id ? { ...r, status: 'RESOLVED', adminNotes: notes } : r);
    cloudMemoryCache.accountRecovery = updated;
    notifyDataChanged();
  },

  deleteAccountRecoveryRequest: (id) => {
    const list = storageService.getAccountRecoveryRequests(true);
    const updated = list.filter(r => r.id !== id);
    cloudMemoryCache.accountRecovery = updated;
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

  getAllUsers: () => {
    try {
      const ngos = storageService.getNGOs(true).map(n => ({
        id: n.id,
        userType: 'NGO',
        name: n.name,
        email: n.email || 'N/A',
        password: n.password || '(Standard Account Password)',
        phone: n.phone || 'N/A',
        district: (n.operatingZones && n.operatingZones[0]) || n.address || 'Assam',
        verified: !!n.verified,
        createdAt: n.createdAt || n.created_at || new Date().toISOString(),
        raw: n
      }));

      const vols = storageService.getVolunteers(true).map(v => ({
        id: v.id,
        userType: 'VOLUNTEER',
        name: v.name,
        email: v.email || 'N/A',
        password: v.password || '(Standard Account Password)',
        phone: v.phone || 'N/A',
        district: v.district || 'Assam',
        verified: !!v.verified,
        createdAt: v.createdAt || v.created_at || new Date().toISOString(),
        raw: v
      }));

      return [...ngos, ...vols];
    } catch (e) {
      console.error("Failed to load all users:", e);
      return [];
    }
  },

  // --- VOLUNTEER & NGO LOGISTICS COLLABORATION REQUESTS ---
  getVolunteerCollabRequests: (ngoId = null, volId = null) => {
    try {
      let list = cloudMemoryCache.volunteerCollab || [];
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
    cloudMemoryCache.volunteerCollab = list;
    notifyDataChanged();
    return newReq;
  },

  acceptVolunteerCollabRequest: (id) => {
    const list = storageService.getVolunteerCollabRequests();
    const updated = list.map(r => r.id === id ? { ...r, status: 'ACCEPTED' } : r);
    cloudMemoryCache.volunteerCollab = updated;
    notifyDataChanged();
  },

  declineVolunteerCollabRequest: (id) => {
    const list = storageService.getVolunteerCollabRequests();
    const updated = list.map(r => r.id === id ? { ...r, status: 'DECLINED' } : r);
    cloudMemoryCache.volunteerCollab = updated;
    notifyDataChanged();
  },

  deleteVolunteerCollabRequest: (id) => {
    const list = storageService.getVolunteerCollabRequests();
    const updated = list.filter(r => r.id !== id);
    cloudMemoryCache.volunteerCollab = updated;
    notifyDataChanged();
  },

  // --- HELPLINE NUMBERS ---
  getHelplineNumbers: () => {
    try {
      const list = cloudMemoryCache.helplineNumbers || INITIAL_HELPLINES;
      return [...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    } catch (e) {
      console.error("Failed to load helpline numbers from storage:", e);
      return INITIAL_HELPLINES;
    }
  },

  addHelplineNumber: async (helplineData) => {
    const list = storageService.getHelplineNumbers();
    const newItem = {
      id: helplineData.id || `hl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: (helplineData.label || '').trim(),
      phone_number: (helplineData.phone_number || '').trim(),
      sort_order: Number(helplineData.sort_order) || (list.length + 1),
      created_at: new Date().toISOString()
    };

    const updated = [...list, newItem];
    cloudMemoryCache.helplineNumbers = updated;
    notifyDataChanged();

    apiRequest('/api/db/helpline_numbers', 'POST', newItem).catch(e => console.error("API insert helpline error:", e));
    return newItem;
  },

  updateHelplineNumber: async (id, updateData) => {
    const list = storageService.getHelplineNumbers();
    const updated = list.map(item => {
      if (item.id === id) {
        return {
          ...item,
          label: updateData.label !== undefined ? updateData.label.trim() : item.label,
          phone_number: updateData.phone_number !== undefined ? updateData.phone_number.trim() : item.phone_number,
          sort_order: updateData.sort_order !== undefined ? Number(updateData.sort_order) : item.sort_order
        };
      }
      return item;
    });

    cloudMemoryCache.helplineNumbers = updated;
    notifyDataChanged();

    const target = updated.find(i => i.id === id);
    if (target) {
      apiRequest('/api/db/helpline_numbers/' + id, 'PUT', {
        label: target.label,
        phone_number: target.phone_number,
        sort_order: target.sort_order
      }).catch(e => console.error("API helpline update error:", e));
    }
  },

  deleteHelplineNumber: async (id) => {
    const list = storageService.getHelplineNumbers();
    const updated = list.filter(item => item.id !== id);
    cloudMemoryCache.helplineNumbers = updated;
    notifyDataChanged();

    apiRequest('/api/db/helpline_numbers/' + id, 'DELETE').catch(e => console.error("API helpline delete error:", e));
  },

  resetToDefaultSeed: () => {
    notifyDataChanged();
  },

  syncWithSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;
    
    try {
      const [vicRes, logRes, ngoRes, volRes, helpRes, campRes] = await Promise.all([
        apiRequest('/api/victim_requests', 'GET').catch(() => ({ data: [] })),
        apiRequest('/api/db/delivery_logs', 'GET').catch(() => ({ data: [] })),
        apiRequest('/api/ngos', 'GET').catch(() => ({ data: [] })),
        apiRequest('/api/db/volunteers', 'GET').catch(() => ({ data: [] })),
        apiRequest('/api/db/helpline_numbers', 'GET').catch(() => ({ data: [] })),
        apiRequest('/api/campaigns', 'GET').catch(() => ({ data: [] }))
      ]);
      
      // Map API responses to data variables
      const vicData = vicRes.data || vicRes || [];
      const logData = logRes.data || logRes || [];
      const ngoData = ngoRes.data || ngoRes || [];
      const volData = volRes.data || volRes || [];
      const helpData = helpRes.data || helpRes || [];
      const campData = campRes.data || campRes || [];

      if (Array.isArray(vicData)) {
        cloudMemoryCache.victims = vicData.map(v => ({
          id: v.id,
          createdAt: v.created_at,
          name: v.name,
          phone: v.phone,
          altPhone: v.alt_phone,
          peopleCount: v.people_count,
          malesCount: v.males_count,
          femalesCount: v.females_count,
          childrenCount: v.children_count,
          familiesCount: v.families_count,
          district: v.district,
          villageName: v.village_name,
          pinCode: v.pin_code,
          landmark: v.landmark,
          locationName: v.location_name,
          latitude: v.latitude,
          longitude: v.longitude,
          isUrgentRescue: v.is_urgent_rescue,
          needs: v.needs,
          groundCondition: v.ground_condition || (v.is_urgent_rescue ? 'SUBMERGED' : 'DRY_LAND'),
          details: v.details,
          status: v.status,
          verified: v.verified,
          requestedByRole: v.requested_by_role || 'CITIZEN',
          requestedByName: v.requested_by_name || v.name,
          requestedByPhone: v.requested_by_phone || v.phone
        }));
      }

      if (Array.isArray(logData)) {
        cloudMemoryCache.deliveryLogs = logData.map(l => ({
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
      }

      if (Array.isArray(ngoData)) {
        cloudMemoryCache.ngos = ngoData.map(n => ({
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
      }

      if (Array.isArray(volData)) {
        cloudMemoryCache.volunteers = volData.map(v => ({
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
      }

      cloudMemoryCache.helplineNumbers = helpData;
      cloudMemoryCache.campaigns = campData;

      notifyDataChanged();
    } catch (err) {
      console.error("Supabase parallel sync error:", err);
    }
  }
};
