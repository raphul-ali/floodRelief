import { securityService } from './securityService';

// All 35 Official Administrative Districts of Assam (Jorhat & Sivasagar prioritized on top)
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

// Realistic Assam Flood Relief & Rescue Seed Data with Verification Flags
const INITIAL_VICTIM_REQUESTS = [
  {
    id: "ASSAM-SOS-801",
    name: "Biren Hazarika & Family",
    phone: "+91 98640 12345",
    altPhone: "+91 94350 98765",
    peopleCount: 7,
    malesCount: 2,
    femalesCount: 2,
    childrenCount: 3,
    locationName: "Kamalabari Ghat Area, Island Ward No 3, Majuli, PIN: 785104",
    villageName: "Kamalabari Village",
    pinCode: "785104",
    district: "Majuli Island",
    latitude: 26.9500,
    longitude: 94.1667,
    isUrgentRescue: true,
    needs: ["Rescue Motorboat & Evacuation", "Clean Drinking Water Jars", "Baby Food & Infant Milk Formula", "First Aid"],
    details: "Brahmaputra water level crossed danger mark by 1.8m. 7 family members including 2 infants trapped on wooden bamboo platform. Current is strong.",
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    assignedNgo: null,
    verified: true,
    verifiedAt: new Date(Date.now() - 3600000 * 1.4).toISOString(),
    verifiedBy: "Control Room Officer (Dispur)"
  },
  {
    id: "ASSAM-SOS-802",
    name: "Jahnavi Gogoi",
    phone: "+91 97060 54321",
    altPhone: "+91 91012 34567",
    peopleCount: 5,
    malesCount: 1,
    femalesCount: 2,
    childrenCount: 2,
    locationName: "Near Lakhimpur Girls High School, Ward 8, PIN: 787001",
    villageName: "Lakhimpur Ward 8",
    pinCode: "787001",
    district: "Lakhimpur",
    latitude: 27.2367,
    longitude: 94.1033,
    isUrgentRescue: false,
    needs: ["Clean Drinking Water Jars", "Cooked Meals & Food Packets", "First Aid & Fever Medicines", "Hygiene & Sanitary Kits"],
    details: "Submerged 3 feet water in house. Safely moved to 1st floor balcony. Need clean drinking water jars and fever medicines for elderly grandmother.",
    status: "In Progress",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    assignedNgo: "SDRF & Assam Red Cross Cell",
    verified: true,
    verifiedAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    verifiedBy: "Lakhimpur District Volunteer"
  },
  {
    id: "ASSAM-SOS-803",
    name: "Abdul Mazid & Community",
    phone: "+91 99540 67890",
    altPhone: "+91 98590 11223",
    peopleCount: 14,
    malesCount: 5,
    femalesCount: 4,
    childrenCount: 5,
    locationName: "Embankment Breach Point, Howly Road, Barpeta, PIN: 781316",
    villageName: "Howly Village",
    pinCode: "781316",
    district: "Barpeta",
    latitude: 26.3200,
    longitude: 91.0000,
    isUrgentRescue: true,
    needs: ["Rescue Motorboat & Evacuation", "First Aid & Fever Medicines", "Warm Blankets & Dry Clothes"],
    details: "River embankment breached at 4 AM. 14 neighbors huddled together on flood dike embankment with rising water on both sides. Immediate boat evacuation urgently needed.",
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    assignedNgo: null,
    verified: true,
    verifiedAt: new Date(Date.now() - 3600000 * 0.7).toISOString(),
    verifiedBy: "Barpeta Helplines Verifier"
  },
  {
    id: "ASSAM-SOS-804",
    name: "Sunil Das (Silchar Relief Camp)",
    phone: "+91 94351 22334",
    altPhone: "",
    peopleCount: 22,
    malesCount: 8,
    femalesCount: 6,
    childrenCount: 8,
    locationName: "Public Higher Secondary School Shelter, Tarapur, Silchar, PIN: 788003",
    villageName: "Tarapur Silchar",
    pinCode: "788003",
    district: "Cachar (Silchar)",
    latitude: 24.8333,
    longitude: 92.7833,
    isUrgentRescue: false,
    needs: ["Cooked Meals & Food Packets", "Baby Food & Infant Milk Formula", "Hygiene & Sanitary Kits", "Water Purification Tablets"],
    details: "Relief camp hosting 22 flood-affected families. Food stocks running low for children.",
    status: "Rescued",
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    assignedNgo: "Assam Student Volunteer Network",
    verified: true,
    verifiedAt: new Date(Date.now() - 3600000 * 9.5).toISOString(),
    verifiedBy: "Cachar SDRF Officer"
  },
  {
    id: "ASSAM-SOS-805",
    name: "Unverified SOS Request (Demo Sample)",
    phone: "+91 98641 55443",
    altPhone: "+91 94352 11000",
    peopleCount: 4,
    malesCount: 2,
    femalesCount: 1,
    childrenCount: 1,
    locationName: "Near Neemati Ghat Ferry Point, Jorhat",
    villageName: "Neemati Village",
    pinCode: "785001",
    district: "Jorhat",
    latitude: 26.8500,
    longitude: 94.2333,
    isUrgentRescue: true,
    needs: ["Rescue Motorboat & Evacuation", "Clean Drinking Water Jars"],
    details: "Water level rapidly rising in backyard. Need evacuation team confirmation.",
    status: "Pending Verification",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    assignedNgo: null,
    verified: false
  }
];

const INITIAL_DELIVERY_LOGS = [
  {
    logId: "LOG-901",
    requestId: "ASSAM-SOS-802",
    recipientName: "Jahnavi Gogoi",
    district: "Lakhimpur",
    deliveredBy: "Red Cross Assam Cell & SDRF",
    volunteerPhone: "+91 97061 44556",
    itemsDelivered: "20 Clean Drinking Water Jars (20L), 50 Cooked Meal Packets, 1 Paramedic Medicine Kit",
    deliveryNotes: "Delivered directly via inflatable boat to 1st floor balcony. Verified with WhatsApp geotag photo.",
    statusUpdate: "In Progress",
    verified: true,
    verifiedBy: "Admin Verification Cell",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    logId: "LOG-902",
    requestId: "ASSAM-SOS-804",
    recipientName: "Sunil Das (Silchar Relief Camp)",
    district: "Cachar (Silchar)",
    deliveredBy: "Brahmaputra Valley Community Relief Alliance",
    volunteerPhone: "+91 98641 99887",
    itemsDelivered: "100 Cooked Meal Packets, 40 Baby Milk Powder Boxes, 30 Blanket Sets",
    deliveryNotes: "Relief camp food stock replenished. Camp manager confirmed receiving full ration.",
    statusUpdate: "Rescued",
    verified: true,
    verifiedBy: "Admin Verification Cell",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    logId: "LOG-903",
    requestId: "ASSAM-SOS-801",
    recipientName: "Biren Hazarika & Family",
    district: "Majuli Island",
    deliveredBy: "Pranjal Saikia (Local Boat Owner)",
    volunteerPhone: "+91 94352 88990",
    itemsDelivered: "10 Water Jars, 2 Baby Milk Jars, 1 Emergency Floating Kit",
    deliveryNotes: "Delivered first emergency supplies via country motorboat while awaiting full rescue craft.",
    statusUpdate: "Pending Admin Approval",
    verified: false,
    createdAt: new Date(Date.now() - 900000).toISOString()
  }
];

const INITIAL_NGOS = [
  {
    id: "ngo-assam-1",
    name: "Assam State Disaster Response Force (SDRF) & NDRF Cell",
    contactPerson: "Commander A. K. Sarma",
    phone: "+91 361 2237221",
    whatsapp: "913612237221",
    email: "controlroom@asdma.gov.in",
    operatingZones: ["Jorhat", "Sivasagar", "Majuli Island", "Barpeta", "Lakhimpur"],
    services: ["Motorized Rescue Inflatables", "Helicopter Evacuation Coordination", "Paramedic Rescue Divers"],
    address: "State Emergency Operations Center, ASDMA, Dispur, Guwahati",
    verified: true,
    activeTeams: 24
  },
  {
    id: "ngo-assam-2",
    name: "Brahmaputra Valley Community Relief Alliance",
    contactPerson: "Dr. Hemanta Kalita",
    phone: "+91 98641 99887",
    whatsapp: "919864199887",
    email: "relief@brahmaputra-alliance.org",
    operatingZones: ["Jorhat", "Sivasagar", "Nagaon", "Morigaon"],
    services: ["Community Kitchen Meals", "Clean Drinking Water Tankers", "Infant Baby Formula", "Dry Ration Kits"],
    address: "Relief Hub, Zoo Road, Guwahati",
    verified: true,
    activeTeams: 18
  },
  {
    id: "ngo-assam-3",
    name: "Indian Red Cross Society - Assam State Branch",
    contactPerson: "Mrs. Rina Borah",
    phone: "+91 361 2661555",
    whatsapp: "913612661555",
    email: "assamredcross@gmail.com",
    operatingZones: ["Jorhat", "Sivasagar", "Cachar (Silchar)", "Dhubri"],
    services: ["Mobile Medical Ambulances", "First Aid Clinics", "Water Purification Tablets", "Sanitary Kits"],
    address: "Red Cross Bhawan, Chandmari, Guwahati",
    verified: true,
    activeTeams: 15
  }
];

const INITIAL_VOLUNTEERS = [
  {
    id: "vol-1",
    name: "Bishal Dutta (@AssamExplorer)",
    roleType: "Social Media Influencer / Fundraiser",
    phone: "+91 98642 11223",
    whatsapp: "919864211223",
    district: "Jorhat",
    socialLink: "https://instagram.com/AssamExplorer",
    followersCount: "140K Followers",
    offerings: "Amplify verified SOS rescue requests to 140k followers & coordinate direct donor funds for boat fuel.",
    availableStatus: "Active Now",
    verified: true
  },
  {
    id: "vol-2",
    name: "Pranjal Saikia (Local Boat Owner)",
    roleType: "Local Boat / Transport Owner",
    phone: "+91 94352 88990",
    whatsapp: "919435288990",
    district: "Majuli Island",
    socialLink: "",
    followersCount: "",
    offerings: "Possess 2 wooden country motorboats. Available 24/7 for evacuation in Kamalabari & Salmora areas.",
    availableStatus: "Active Now",
    verified: true
  },
  {
    id: "vol-3",
    name: "Dr. Pallavi Baruah (MBBS)",
    roleType: "Medical Doctor / Paramedic",
    phone: "+91 97061 44556",
    whatsapp: "919706144556",
    district: "Sivasagar",
    socialLink: "https://x.com/DrPallaviAssam",
    followersCount: "12K Followers",
    offerings: "Providing tele-consultation & emergency first-aid kit distribution at Lakhimpur & Sivasagar relief camps.",
    availableStatus: "Active Now",
    verified: true
  }
];

export const VOLUNTEER_ROLES = [
  "Social Media Influencer / Fundraiser",
  "Individual Volunteer Helper",
  "Local Boat / Transport Owner",
  "Medical Doctor / Paramedic",
  "Food & Water Supply Donor",
  "Student Rescue Alliance"
];

const STORAGE_KEYS = {
  VICTIMS: "flood_portal_victims_assam_v8",
  NGOS: "flood_portal_ngos_assam_v8",
  VOLUNTEERS: "flood_portal_volunteers_assam_v8",
  DELIVERY_LOGS: "flood_portal_delivery_logs_v8"
};

const notifyDataChanged = () => {
  window.dispatchEvent(new Event("flood_data_changed"));
};

export const storageService = {
  // Get victim requests (Default: verified only; set includeUnverified = true for Admin dashboard)
  getVictimRequests: (includeUnverified = false) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VICTIMS);
      let list = data ? JSON.parse(data) : INITIAL_VICTIM_REQUESTS;
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(INITIAL_VICTIM_REQUESTS));
      }
      if (!includeUnverified) {
        return list.filter(req => req.verified === true);
      }
      return list;
    } catch (e) {
      console.error("Failed to load victims from storage:", e);
      return INITIAL_VICTIM_REQUESTS.filter(req => req.verified === true);
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
      verified: false, // Held in queue until Admin verifies
      ...sanitized
    };

    const updated = [newRequest, ...requests];
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated));
    securityService.recordSubmission();
    notifyDataChanged();
    return newRequest;
  },

  verifyVictimRequest: (requestId, verifierName = "Admin Control Room") => {
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
    notifyDataChanged();
  },

  rejectVictimRequest: (requestId) => {
    const requests = storageService.getVictimRequests(true);
    const updated = requests.filter(req => req.id !== requestId);
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated));
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
    notifyDataChanged();
  },

  deleteVictimRequest: (requestId) => {
    const requests = storageService.getVictimRequests(true);
    const updated = requests.filter(req => req.id !== requestId);
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(updated));
    notifyDataChanged();
  },

  // --- NGO & Volunteer Relief Delivery Logs ---
  getDeliveryLogs: (includeUnverified = false) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELIVERY_LOGS);
      let logs = data ? JSON.parse(data) : INITIAL_DELIVERY_LOGS;
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(INITIAL_DELIVERY_LOGS));
      }
      if (!includeUnverified) {
        return logs.filter(log => log.verified === true);
      }
      return logs;
    } catch (e) {
      console.error("Failed to load delivery logs:", e);
      return INITIAL_DELIVERY_LOGS.filter(log => log.verified === true);
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

    // If auto-verified NGO source, immediately update the request status & assigned NGO
    if (isVerified && sanitized.requestId) {
      storageService.updateRequestStatus(
        sanitized.requestId, 
        sanitized.statusUpdate, 
        sanitized.deliveredBy
      );
    }

    securityService.recordSubmission();
    notifyDataChanged();
    return newLog;
  },

  verifyDeliveryLog: (logId, verifierName = "Admin Control Room") => {
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

    // If verified log has statusUpdate and target requestId, update the victim request status & assigned NGO
    if (targetLog && targetLog.requestId) {
      storageService.updateRequestStatus(
        targetLog.requestId, 
        targetLog.statusUpdate, 
        targetLog.deliveredBy
      );
    }

    notifyDataChanged();
  },

  rejectDeliveryLog: (logId) => {
    const logs = storageService.getDeliveryLogs(true);
    const updated = logs.filter(log => log.logId !== logId);
    localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(updated));
    notifyDataChanged();
  },

  // --- NGO Directory Methods ---
  getNGOs: (includeUnverified = false) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NGOS);
      let list = data ? JSON.parse(data) : INITIAL_NGOS;
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(INITIAL_NGOS));
      }
      if (!includeUnverified) {
        return list.filter(n => n.verified === true);
      }
      return list;
    } catch (e) {
      console.error("Failed to load NGOs from storage:", e);
      return INITIAL_NGOS.filter(n => n.verified === true);
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
      verified: false, // Admin manual verification needed
      activeTeams: 1,
      ...sanitized
    };

    const updated = [newNgo, ...ngos];
    localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(updated));
    securityService.recordSubmission();
    notifyDataChanged();
    return newNgo;
  },

  verifyNGO: (ngoId) => {
    const ngos = storageService.getNGOs(true);
    const updated = ngos.map(n => n.id === ngoId ? { ...n, verified: true } : n);
    localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(updated));
    notifyDataChanged();
  },

  rejectNGO: (ngoId) => {
    const ngos = storageService.getNGOs(true);
    const updated = ngos.filter(n => n.id !== ngoId);
    localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(updated));
    notifyDataChanged();
  },

  // --- Volunteer Directory Methods ---
  getVolunteers: (includeUnverified = false) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOLUNTEERS);
      let list = data ? JSON.parse(data) : INITIAL_VOLUNTEERS;
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(INITIAL_VOLUNTEERS));
      }
      if (!includeUnverified) {
        return list.filter(v => v.verified === true);
      }
      return list;
    } catch (e) {
      console.error("Failed to load volunteers from storage:", e);
      return INITIAL_VOLUNTEERS.filter(v => v.verified === true);
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
      verified: false, // Admin manual verification needed
      ...sanitized
    };

    const updated = [newVol, ...vols];
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(updated));
    securityService.recordSubmission();
    notifyDataChanged();
    return newVol;
  },

  verifyVolunteer: (volId) => {
    const vols = storageService.getVolunteers(true);
    const updated = vols.map(v => v.id === volId ? { ...v, verified: true } : v);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(updated));
    notifyDataChanged();
  },

  rejectVolunteer: (volId) => {
    const vols = storageService.getVolunteers(true);
    const updated = vols.filter(v => v.id !== volId);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(updated));
    notifyDataChanged();
  },

  resetToDefaultSeed: () => {
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(INITIAL_VICTIM_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(INITIAL_DELIVERY_LOGS));
    localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(INITIAL_NGOS));
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(INITIAL_VOLUNTEERS));
    notifyDataChanged();
  }
};
