// i18n Translation Service - Supports English (en), Assamese (as), and Hindi (hi)

const STORAGE_KEY = 'flood_app_lang';

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' }
];

const translations = {
  en: {
    // Header & Navigation
    notice: 'Independent community relief bridge. This is NOT an official government website.',
    noticeBadge: 'Private Initiative',
    govtHelpline: 'Govt Helpline: 1070',
    appTitle: 'ASSAM FLOOD VICTIMS & NGO PORTAL',
    shortTitle: 'ASSAM FLOOD RELIEF',
    subTitle: 'Direct Rescue Bridge Connecting Citizens with NGOs & Rescue Boats',
    home: 'HOME',
    login: 'Login',
    logout: 'Logout',
    requestRescue: 'REQUEST RESCUE',
    reliefForm: 'REQUEST RELIEF',
    dashboard: 'Dashboard',
    checkRequests: 'Requests',
    ngosAndVolunteers: 'NGOs',
    emergencyServices: 'Emergency',

    // Quick SOS Banner & Rescue Form
    sosTitle: 'NEED EMERGENCY MOTORBOAT RESCUE? SEND SOS NOW',
    sosSubtitle: '1-Tap transmit your exact GPS & stranded count directly to rescue boats',
    detectGps: '1-Tap Detect GPS',
    gpsPinned: 'GPS Pinned',
    acquiringGps: 'Acquiring GPS...',
    demographics: 'Demographics Breakdown',
    total: 'Total',
    males: 'Males',
    females: 'Females',
    children: 'Children',
    families: 'Families',
    waterLevelNotes: 'Water Level & Spot Notes',
    waterLevelPlaceholder: 'e.g. Water 4ft high, trapped on roof of house near dike',
    transmitSos: 'TRANSMIT EMERGENCY RESCUE SOS NOW',
    transmitting: 'TRANSMITTING SOS...',
    yourMobilePhone: '1. Your Mobile Phone *',
    victimContactName: '2. Victim / Contact Name *',
    selectDistrict: '3. Select District *',
    villagePanchayat: '4. Village / Panchayat Name *',
    pinCodeLabel: '5. PIN Code (6-digit)',
    gpsLocationLabel: '6. GPS Location',
    alternatePhone: 'Alternate Phone Number (Optional)',
    exactSpotLandmark: 'Exact Spot / Rooftop / Dike Landmark',
    attachGps: 'Attach GPS',
    fetchAutoGeolocation: 'Fetch Auto Geolocation',

    // Form Switcher & Tabs
    emergencyRescueSos: 'EMERGENCY RESCUE SOS',
    floodReliefRequest: 'FLOOD RELIEF & SUPPLY REQUEST',
    emergencyBoatRescue: 'EMERGENCY BOAT RESCUE',
    foodMaterialRelief: 'FOOD & MATERIAL RELIEF',
    materialsNeeded: 'Materials & Food Needed',
    materialsPlaceholder: 'e.g. Cooked Meals, Drinking Water, Blankets, Baby Food...',
    situationNotes: 'Situation Notes / Water Level Status',
    publishRequest: 'SUBMIT REQUEST',
    requestRegistered: 'Request Registered. Someone will help you soon.',
    requestRegisteredSub: 'Your request has been published to nearby verified NGOs, rescue boat operators, and logistics volunteers.',
    returnToPortal: 'Return to Portal',
    submitAnotherSos: 'Submit Another SOS',

    // Directories & Tabs
    allCategories: 'ALL',
    ngosCategory: 'NGOs & INDIVIDUAL HELPERS',
    boatsCarsCategory: 'BOATS & CARS',
    logisticsCategory: 'LOGISTICS & SERVICES',
    searchPlaceholder: 'Search boat, car, name, district...',
    callNgo: 'Call NGO',
    callVolunteer: 'Call Volunteer',
    whatsApp: 'WhatsApp',
    numberHidden: 'Number Protected (NGO Partners Only)',
    operatingLocation: 'District / Operating Location',
    registerNgoBtn: '+ REGISTER NGO',
    offerBoatCarBtn: '+ OFFER BOAT / CAR / LOGISTICS',

    // ASDMA & Emergency Services
    emergencyTitle: 'NEAREST EMERGENCY SERVICES',
    emergencySubtitle: 'Fire stations, police thanas, hospitals & rescue squads near you — anywhere in India.',
    verifiedStations: '231 Verified Emergency Stations (Offline Instant)',
    changeDistrict: 'Change District / Region',
    detectLiveGps: 'Live GPS',
    locating: 'Locating…',

    // Login & Register Modal
    ngoLoginTab: 'NGO LOGIN',
    volunteerLoginTab: 'VOLUNTEER LOGIN',
    createAccountTab: 'CREATE ACCOUNT',
    emailLabel: 'Email Address *',
    passwordLabel: 'Password *',
    registerAsNgo: 'Register as NGO Organization',
    registerAsVolunteer: 'Register as Volunteer Driver / Boat',
    orgNameLabel: 'Organization Name *',
    volunteerNameLabel: 'Volunteer Full Name *',
    showPhonePublicly: 'Show phone number publicly in public relief directory',
    loginSubmit: 'LOGIN TO PORTAL',
    registerSubmit: 'SUBMIT FOR ADMIN APPROVAL',

    // Footer
    partnerLogin: 'Partner Portal Login',
    openSourceNetwork: 'Open-Source Assam Flood Relief Network',
    copyright: '© 2026 Assam Flood Victims & NGO Portal. Independent Community Network.'
  },

  as: {
    // Header & Navigation
    notice: 'স্বতন্ত্ৰ সম্প্ৰদায় ৰাহাত সেতু। এইখন চৰকাৰী ৱেবছাইট নহয়।',
    noticeBadge: 'ব্যক্তিগত উদ্যোগ',
    govtHelpline: 'চৰকাৰী হেল্পলাইন: ১০৭০',
    appTitle: 'অসম বানপীড়িত আৰু বেচৰকাৰী সংস্থা পৰ্টেল',
    shortTitle: 'অসম বান ৰাহাত',
    subTitle: 'নাগৰিকক বেচৰকাৰী সংস্থা আৰু উদ্ধাৰকাৰী নাওৰ সৈতে সংযোগ কৰা প্ৰত্যক্ষ সেতু',
    home: 'গৃহ',
    login: 'লগইন',
    logout: 'লগআউট',
    requestRescue: 'উদ্ধাৰৰ বাবে অনুৰোধ',
    reliefForm: 'ৰাহাত প্ৰপত্ৰ',
    dashboard: 'ডেছবৰ্ড',
    checkRequests: 'অনুৰোধ',
    ngosAndVolunteers: 'সংস্থা',
    emergencyServices: 'জৰুৰী',

    // Quick SOS Banner & Rescue Form
    sosTitle: 'জৰুৰীকালীন নাও উদ্ধাৰৰ প্ৰয়োজন? এতিয়াই SOS পঠিয়াওক',
    sosSubtitle: '১-টাপত আপোনাৰ শুদ্ধ GPS আৰু আবদ্ধ লোকৰ সংখ্যা উদ্ধাৰকাৰী নাওলৈ প্ৰেৰণ কৰক',
    detectGps: '১-টাপ GPS চিনাক্ত কৰক',
    gpsPinned: 'GPS সংকেত চিহ্নিত',
    acquiringGps: 'GPS চিনাক্ত কৰি থকা হৈছে...',
    demographics: 'জনসংখ্যাৰ তালিকা',
    total: 'মুঠ',
    males: 'পুৰুষ',
    females: 'মহিলা',
    children: 'শিশু',
    families: 'পৰিয়াল',
    waterLevelNotes: 'পানীৰ স্তৰ আৰু স্থানৰ বিৱৰণ',
    waterLevelPlaceholder: 'যেনে- পানী ৪ ফুট ওখ, চালত আবদ্ধ হৈ আছে',
    transmitSos: 'এতিয়াই জৰুৰীকালীন উদ্ধাৰৰ অনুৰোধ প্ৰেৰণ কৰক',
    transmitting: 'সংকেত প্ৰেৰণ কৰি থকা হৈছে...',
    yourMobilePhone: '১. আপোনাৰ মোবাইল নম্বৰ *',
    victimContactName: '২. পীড়িত व्यक्ति / যোগাযোগৰ নাম *',
    selectDistrict: '৩. জিলা বাছনি কৰক *',
    villagePanchayat: '৪. ৰাজহ গাঁও / পঞ্চায়ত *',
    pinCodeLabel: '৫. পিন ক’ড (৬-টা সংখ্যা)',
    gpsLocationLabel: '৬. GPS স্থান',
    alternatePhone: 'বিকল্প মোবাইল নম্বৰ (ঐচ্ছিক)',
    exactSpotLandmark: 'স্থানৰ বিৱৰণ / চাল / মথাউৰিৰ সমীপৰ চিহ্ন',
    attachGps: 'GPS সংযুক্ত কৰক',
    fetchAutoGeolocation: 'স্বয়ংক্ৰিয় GPS বিচাৰক',

    // Form Switcher & Tabs
    emergencyRescueSos: 'জৰুৰীকালীন উদ্ধাৰ সংকেত',
    floodReliefRequest: 'বান ৰাহাত আৰু সামগ্ৰীৰ অনুৰোধ',
    emergencyBoatRescue: 'জৰুৰীকালীন নাও উদ্ধাৰ',
    foodMaterialRelief: 'আহাৰ আৰু ৰাহাত সামগ্ৰী',
    materialsNeeded: 'প্ৰয়োজনীয় সামগ্ৰী আৰু আহাৰ',
    materialsPlaceholder: 'যেনে- ৰন্ধা আহাৰ, খোৱাপানী, কম্বল, শিশু খাদ্য...',
    situationNotes: 'পানীৰ স্তৰ আৰু জৰুৰী অৱস্থাৰ বিৱৰণ',
    publishRequest: 'ৰাহাত অনুৰোধ প্ৰকাশ কৰক',
    requestRegistered: 'অনুৰোধ পঞ্জীয়ন হ’ল। অতি সোনকালে সহায় পোৱা যাব।',
    requestRegisteredSub: 'আপোনাৰ অনুৰোধ ওচৰৰ বেচৰকাৰী সংস্থা আৰু উদ্ধাৰকাৰী দললৈ প্ৰেৰণ কৰা হৈছে।',
    returnToPortal: 'পৰ্টেললৈ ঘূৰি যাওক',
    submitAnotherSos: 'আন এটা SOS পঠিয়াওক',

    // Directories & Tabs
    allCategories: 'সকলো',
    ngosCategory: 'বেচৰকাৰী সংস্থা আৰু সহায়ক',
    boatsCarsCategory: 'নাও আৰু গাড়ী',
    logisticsCategory: 'লজিষ্টিক আৰু সেৱা',
    searchPlaceholder: 'নাও, গাড়ী, নাম, জিলা সন্ধান কৰক...',
    callNgo: 'কল কৰক',
    callVolunteer: 'স্বেচ্ছাসেৱকক কল কৰক',
    whatsApp: 'হোৱাটছএপ',
    numberHidden: 'নম্বৰ সংৰক্ষিত (কেৱল অংশীদাৰ সংস্থা)',
    operatingLocation: 'জিলা / কৰ্মক্ষেত্ৰ',
    registerNgoBtn: '+ সংস্থা পঞ্জীয়ন কৰক',
    offerBoatCarBtn: '+ নাও / গাড়ী / লজিষ্টিক দিয়ক',

    // ASDMA & Emergency Services
    emergencyTitle: 'নিকটৱৰ্তী জৰুৰীকালীন সেৱা',
    emergencySubtitle: 'অগ্নিSource, আৰক্ষী থানা, চিকিৎসালয় আৰু উদ্ধাৰকাৰী দল',
    verifiedStations: '২৩১ টা প্ৰমাণিত জৰুৰীকালীন কেন্দ্ৰ',
    changeDistrict: 'জিলা সলনি কৰক',
    detectLiveGps: 'লাইভ GPS',
    locating: 'স্থান বিচাৰি থকা হৈছে…',

    // Login & Register Modal
    ngoLoginTab: 'সংস্থা লগইন',
    volunteerLoginTab: 'স্বেচ্ছাসেৱক লগইন',
    createAccountTab: 'একাউন্ট সৃষ্টি কৰক',
    emailLabel: 'ইমেইল ঠিকা *',
    passwordLabel: 'পাছৱৰ্ড *',
    registerAsNgo: 'বেচৰকাৰী সংস্থা হিচাপে পঞ্জীয়ন',
    registerAsVolunteer: 'স্বেচ্ছাসেৱক চালক / নাও হিচাপে পঞ্জীয়ন',
    orgNameLabel: 'সংস্থাৰ নাম *',
    volunteerNameLabel: 'স্বেচ্ছাসেৱকৰ সম্পূৰ্ণ নাম *',
    showPhonePublicly: 'ৰাহাত ডাইৰেক্টৰীত মোবাইল নম্বৰ ৰাজহুৱা কৰক',
    loginSubmit: 'পৰ্টেলত লগইন কৰক',
    registerSubmit: 'অনুমোদনৰ বাবে জমা দিয়ক',

    // Footer
    partnerLogin: 'অংশীদাৰ প’ৰ্টেল লগইন',
    openSourceNetwork: 'মুক্ত উৎস অসম বান ৰাহাত নেটৱৰ্ক',
    copyright: '© ২০২৬ অসম বানপীড়িত আৰু বেচৰকাৰী সংস্থা পৰ্টেল।'
  },

  hi: {
    // Header & Navigation
    notice: 'स्वतंत्र सामुदायिक राहत पुल। यह आधिकारिक सरकारी वेबसाइट नहीं है।',
    noticeBadge: 'निजी पहल',
    govtHelpline: 'सरकारी हेल्पलाइन: 1070',
    appTitle: 'असम बाढ़ पीड़ित एवं एनजीओ पोर्टल',
    shortTitle: 'असम बाढ़ राहत',
    subTitle: 'नागरिकों को एनजीओ और बचाव नौकाओं से जोड़ने वाला सीधा बचाव सेतु',
    home: 'होम',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    requestRescue: 'बचाव का अनुरोध',
    reliefForm: 'राहत फॉर्म',
    dashboard: 'डैशबोर्ड',
    checkRequests: 'अनुरोध',
    ngosAndVolunteers: 'एनजीओ',
    emergencyServices: 'आपदा',

    // Quick SOS Banner & Rescue Form
    sosTitle: 'क्या आपको आपातकालीन नाव बचाव की आवश्यकता है? अभी SOS भेजें',
    sosSubtitle: '1-टैप में अपना सटीक GPS और फंसे लोगों की संख्या बचाव नौकाओं को भेजें',
    detectGps: '1-टैप GPS पहचानें',
    gpsPinned: 'GPS चिह्नित किया गया',
    acquiringGps: 'GPS खोजा जा रहा है...',
    demographics: 'जनसंख्या विवरण',
    total: 'कुल',
    males: 'पुरुष',
    females: 'महिलाएं',
    children: 'बच्चे',
    families: 'परिवार',
    waterLevelNotes: 'पानी का स्तर और स्थान विवरण',
    waterLevelPlaceholder: 'जैसे- पानी 4 फीट ऊंचा है, छत पर फंसे हैं',
    transmitSos: 'अभी आपातकालीन बचाव SOS भेजें',
    transmitting: 'संकेत भेजा जा रहा है...',
    yourMobilePhone: '1. आपका मोबाइल नंबर *',
    victimContactName: '2. पीड़ित / संपर्क व्यक्ति का नाम *',
    selectDistrict: '3. जिला चुनें *',
    villagePanchayat: '4. गांव / पंचायत का नाम *',
    pinCodeLabel: '5. पिन कोड (6 अंक)',
    gpsLocationLabel: '6. GPS स्थान',
    alternatePhone: 'वैकल्पिक मोबाइल नंबर (ऐच्छिक)',
    exactSpotLandmark: 'सटीक स्थान / छत / तटबंध का लैंडमार्क',
    attachGps: 'GPS संलग्न करें',
    fetchAutoGeolocation: 'स्वचालित GPS प्राप्त करें',

    // Form Switcher & Tabs
    emergencyRescueSos: 'आपातकालीन बचाव संकेत',
    floodReliefRequest: 'बाढ़ राहत और सामग्री अनुरोध',
    emergencyBoatRescue: 'आपातकालीन नाव बचाव',
    foodMaterialRelief: 'भोजन और राहत सामग्री',
    materialsNeeded: 'आवश्यक सामग्री और भोजन',
    materialsPlaceholder: 'जैसे- पका हुआ भोजन, पीने का पानी, कंबल, शिशु आहार...',
    situationNotes: 'स्थिति और पानी का स्तर विवरण',
    publishRequest: 'राहत अनुरोध प्रकाशित करें',
    requestRegistered: 'अनुरोध पंजीकृत हुआ। जल्द ही सहायता मिलेगी।',
    requestRegisteredSub: 'आपका अनुरोध नजदीकी सत्यापित एनजीओ और बचाव टीमों को भेज दिया गया है।',
    returnToPortal: 'पोर्टल पर लौटें',
    submitAnotherSos: 'एक और SOS भेजें',

    // Directories & Tabs
    allCategories: 'सभी',
    ngosCategory: 'एनजीओ और व्यक्तिगत सहायक',
    boatsCarsCategory: 'नाव और कारें',
    logisticsCategory: 'लॉजिस्टिक्स और सेवाएं',
    searchPlaceholder: 'नाव, कार, नाम, जिला खोजें...',
    callNgo: 'कॉल करें',
    callVolunteer: 'स्वयंसेवक को कॉल करें',
    whatsApp: 'व्हाट्सएप',
    numberHidden: 'नंबर सुरक्षित (केवल भागीदार एनजीओ)',
    operatingLocation: 'जिला / कार्य क्षेत्र',
    registerNgoBtn: '+ एनजीओ पंजीकृत करें',
    offerBoatCarBtn: '+ नाव / कार / लॉजिस्टिक्स दें',

    // ASDMA & Emergency Services
    emergencyTitle: 'निकटतम आपातकालीन सेवाएं',
    emergencySubtitle: 'फायर स्टेशन, पुलिस थाने, अस्पताल और बचाव दल',
    verifiedStations: '231 सत्यापित आपातकालीन स्टेशन',
    changeDistrict: 'जिला बदलें',
    detectLiveGps: 'लाइव GPS',
    locating: 'खोजा जा रहा है…',

    // Login & Register Modal
    ngoLoginTab: 'एनजीओ लॉगिन',
    volunteerLoginTab: 'स्वयंसेवक लॉगिन',
    createAccountTab: 'खाता बनाएं',
    emailLabel: 'ईमेल पता *',
    passwordLabel: 'पासवर्ड *',
    registerAsNgo: 'एनजीओ संगठन के रूप में पंजीकरण',
    registerAsVolunteer: 'स्वयंसेवक ड्राइवर / नाव के रूप में पंजीकरण',
    orgNameLabel: 'संगठन का नाम *',
    volunteerNameLabel: 'स्वयंसेवक का पूरा नाम *',
    showPhonePublicly: 'राहत निर्देशिका में मोबाइल नंबर सार्वजनिक करें',
    loginSubmit: 'पोर्टल में लॉगिन करें',
    registerSubmit: 'अनुमोदन के लिए जमा करें',

    // Footer
    partnerLogin: 'भागीदार पोर्टल लॉगिन',
    openSourceNetwork: 'ओपन-सोर्स असम बाढ़ राहत नेटवर्क',
    copyright: '© 2026 असम बाढ़ पीड़ित एवं एनजीओ पोर्टल।'
  }
};

const applyLangClass = (langCode) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = langCode;
    document.documentElement.classList.remove('lang-en', 'lang-as', 'lang-hi');
    document.documentElement.classList.add(`lang-${langCode}`);
  }
};

// Initial land setup
if (typeof document !== 'undefined') {
  applyLangClass(localStorage.getItem(STORAGE_KEY) || 'en');
}

export const i18nService = {
  getLanguage: () => {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  },

  setLanguage: (langCode) => {
    if (translations[langCode]) {
      localStorage.setItem(STORAGE_KEY, langCode);
      applyLangClass(langCode);
      window.dispatchEvent(new Event('flood_lang_changed'));
    }
  },

  t: (key, defaultText = '') => {
    const lang = localStorage.getItem(STORAGE_KEY) || 'en';
    const dict = translations[lang] || translations['en'];
    return dict[key] || translations['en'][key] || defaultText || key;
  }
};
