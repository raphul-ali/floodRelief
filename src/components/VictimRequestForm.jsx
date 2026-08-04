import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, Users, Phone, CheckCircle, Navigation, HeartHandshake, ShieldCheck, Hash, UserCheck, AlertOctagon, AlertTriangle, Siren, ShieldAlert, Waves, Droplets, Compass } from 'lucide-react';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import DistrictSelect from './DistrictSelect';
import { i18nService } from '../services/i18nService';
import RippleButton from './ui/RippleButton';

export const parseNeedsTags = (needs) => {
  if (!needs) return [];
  let rawList = Array.isArray(needs) ? needs : [needs];
  const tags = [];
  rawList.forEach(item => {
    if (typeof item === 'string') {
      item.split(/[,;\n]+/).forEach(part => {
        const trimmed = part.trim();
        if (trimmed) tags.push(trimmed);
      });
    }
  });
  return tags;
};

// Removed SUPPLY_NEEDS array

export default function VictimRequestForm({ onClose, onRequestSubmitted, initialUrgent = true }) {
  const [, setLangState] = useState(i18nService.getLanguage());

  useEffect(() => {
    const handleLangChange = () => setLangState(i18nService.getLanguage());
    window.addEventListener('flood_lang_changed', handleLangChange);
    return () => window.removeEventListener('flood_lang_changed', handleLangChange);
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    altPhone: '',
    malesCount: 0,
    femalesCount: 0,
    childrenCount: 0,
    familiesCount: 0,
    district: '',
    villageName: '',
    pinCode: '',
    landmark: '',
    latitude: null,
    longitude: null,
    isUrgentRescue: initialUrgent,
    groundCondition: initialUrgent ? 'SUBMERGED' : 'DRY_LAND',
    customNeeds: initialUrgent ? '' : 'Cooked Meals, Clean Drinking Water',
    details: '',
    urgency: 'HIGH'
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      isUrgentRescue: initialUrgent,
      groundCondition: initialUrgent ? 'SUBMERGED' : 'DRY_LAND',
      customNeeds: initialUrgent ? '' : 'Cooked Meals, Clean Drinking Water',
      urgency: initialUrgent ? 'CRITICAL' : 'HIGH'
    }));
  }, [initialUrgent]);

  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attachGps, setAttachGps] = useState(true);

  // HTML5 Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setIsLocating(false);
        setLocationStatus(`GPS Pinned: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        setIsLocating(false);
        console.warn("GPS error:", error);
        setLocationStatus('Could not acquire GPS automatically. Please type village & PIN code below.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Removed toggleNeed function

  const totalPeopleCount = (parseInt(formData.peopleCount) || 0) || ((parseInt(formData.malesCount) || 0) + (parseInt(formData.femalesCount) || 0) + (parseInt(formData.childrenCount) || 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.phone) {
      setErrorMessage("Please type a valid Mobile Phone Number!");
      return;
    }

    if (!formData.isUrgentRescue && (!formData.name || !formData.villageName || !formData.district)) {
      setErrorMessage("Please fill out Name, Village Name, and select a District!");
      return;
    }

    if (attachGps && (!formData.latitude || !formData.longitude)) {
      setErrorMessage("GPS Location is required when 'Attach GPS' is checked. Please click 'Attach Mandatory GPS Location *' button to auto-detect your location before submitting, or uncheck the 'Attach GPS' option if you don't have internet/GPS.");
      return;
    }

    setIsSubmitting(true);

    try {
      const landmarkText = (formData.isUrgentRescue && formData.landmark) ? ` (${formData.landmark})` : '';
      const locationAddressFormatted = `${formData.villageName}${formData.pinCode ? `, PIN: ${formData.pinCode}` : ''}${landmarkText}`;

      const currentUser = authService.getCurrentUser();
      let requestedByRole = 'CITIZEN';
      let requestedByName = formData.name;
      let requestedByPhone = formData.phone;

      if (currentUser && currentUser.user) {
        if (currentUser.role === 'NGO') {
          requestedByRole = 'NGO';
          requestedByName = currentUser.user.name;
          requestedByPhone = currentUser.user.phone || formData.phone;
        } else if (currentUser.role === 'VOLUNTEER') {
          requestedByRole = 'VOLUNTEER';
          requestedByName = currentUser.user.name;
          requestedByPhone = currentUser.user.phone || formData.phone;
        }
      }

      const savedRequest = storageService.addVictimRequest({
        ...formData,
        requestedByRole,
        requestedByName,
        requestedByPhone,
        peopleCount: totalPeopleCount,
        locationName: locationAddressFormatted,
        needs: formData.isUrgentRescue ? ['Emergency Motorboat Rescue & Life Evacuation'] : parseNeedsTags(formData.customNeeds),
        latitude: attachGps ? formData.latitude : null,
        longitude: attachGps ? formData.longitude : null
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);

      if (onRequestSubmitted) {
        onRequestSubmitted(savedRequest);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setIsSubmitting(false);
      setErrorMessage(err.message || "Failed to submit request.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 max-sm:pb-24 max-sm:pt-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-2xl bg-white border rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col animate-slide-up ${
        formData.isUrgentRescue ? 'border-red-200 shadow-red-900/10' : 'border-gray-200 shadow-blue-900/10'
      }`}>

        {/* Modal Header */}
        <div className={`flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b shrink-0 ${
          formData.isUrgentRescue
            ? 'bg-red-50 border-red-100'
            : 'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${
              formData.isUrgentRescue
                ? 'bg-red-600 border border-red-500 shadow-md shadow-red-500/30 animate-pulse'
                : 'bg-blue-600 border border-blue-500 shadow-md shadow-blue-500/30'
            }`}>
              {formData.isUrgentRescue ? <Siren className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-tight leading-tight">
                {formData.isUrgentRescue ? i18nService.t('emergencyRescueSos', 'EMERGENCY RESCUE SOS') : i18nService.t('floodReliefRequest', 'FLOOD RELIEF & SUPPLY REQUEST')}
              </h3>
              <p className={`text-[10px] sm:text-xs font-medium mt-0.5 ${formData.isUrgentRescue ? 'text-red-600' : 'text-blue-600'}`}>
                {formData.isUrgentRescue
                  ? i18nService.t('sosSubtitle', 'Transmitting victim location directly to rescue boats')
                  : i18nService.t('requestRegisteredSub', 'Published to NGOs & Volunteers to supply food & materials')}
              </p>
            </div>
          </div>
          <RippleButton
            darkRipple
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-200/60 transition-all duration-200 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </RippleButton>
        </div>

        {/* Form Type Switcher Bar */}
        <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-2">
          <RippleButton
            type="button"
            darkRipple={!formData.isUrgentRescue}
            onClick={() => setFormData(prev => ({
              ...prev,
              isUrgentRescue: true,
              needs: ['Emergency Motorboat Rescue & Life Evacuation']
            }))}
            className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
              formData.isUrgentRescue
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.98]'
            }`}
          >
            <Siren className="w-4 h-4" />
            <span>{i18nService.t('emergencyBoatRescue', 'EMERGENCY BOAT RESCUE')}</span>
          </RippleButton>

          <RippleButton
            type="button"
            darkRipple={formData.isUrgentRescue}
            onClick={() => setFormData(prev => ({
              ...prev,
              isUrgentRescue: false,
              needs: ['Cooked Meals & Food Packets', 'Clean Drinking Water Jars']
            }))}
            className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
              !formData.isUrgentRescue
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.98]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{i18nService.t('foodMaterialRelief', 'FOOD & MATERIAL RELIEF')}</span>
          </RippleButton>
        </div>

        {/* Error / Rate Limit Alert Banner */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 bg-red-950/60 border border-red-700/50 rounded-lg text-red-200 text-xs font-medium flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dignified Reassuring Success View */}
        {submittedSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Request Registered. Someone will help you soon.
              </h3>
              <p className="text-xs sm:text-sm text-[#9ca3af] max-w-md mx-auto leading-relaxed">
                Your request has been published to nearby verified NGOs, rescue boat operators, and logistics volunteers in <strong className="text-blue-300">{formData.district}</strong>. Someone will contact your mobile phone soon.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Registered Phone:</span>
                <span className="font-mono font-semibold text-gray-900">{formData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="font-semibold text-gray-900">{formData.villageName}, {formData.district} {formData.pinCode ? `(PIN: ${formData.pinCode})` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Demographics:</span>
                <span className="font-semibold text-blue-600 text-right">
                  {totalPeopleCount} Total ({formData.malesCount} M, {formData.femalesCount} F, {formData.childrenCount} C)
                  {formData.familiesCount > 0 ? ` & ${formData.familiesCount} Families` : ''}
                </span>
              </div>
            </div>

            <RippleButton
              darkRipple
              onClick={onClose}
              className="w-full py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs sm:text-sm transition-all duration-200 min-h-[48px] border border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              Return to Portal
            </RippleButton>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">

            {formData.isUrgentRescue ? (
              /* Emergency Rescue Mode: ONLY Phone + People Count + Auto GPS */
              <div className="space-y-4">
                <div className="bg-red-950/50 border border-red-800/60 p-3 rounded-lg text-red-200 text-xs font-medium flex items-center gap-2">
                  <Siren className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                  <span>Quick Emergency Rescue SOS — Enter phone number and count of stranded people.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Mobile Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98640 12345"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-3.5 py-3 bg-white border border-red-300 rounded-lg text-gray-900 font-semibold text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 font-mono shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Number of People Needing Rescue */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Number of People Needing Rescue *
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="e.g. 5 people stranded"
                        value={formData.peopleCount || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, peopleCount: Math.max(1, parseInt(e.target.value) || 0) }))}
                        className="w-full pl-10 pr-3.5 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-semibold text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Ground Condition Pill Selector */}
                <div className="space-y-1.5 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Current Ground &amp; Flood Condition *</span>
                    <span className="text-[10px] text-gray-400 font-medium">Boat vs. Road Transport</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <RippleButton
                      type="button"
                      darkRipple={formData.groundCondition !== 'SUBMERGED'}
                      onClick={() => setFormData(prev => ({ ...prev, groundCondition: 'SUBMERGED' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                        formData.groundCondition === 'SUBMERGED'
                          ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm ring-2 ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <Waves className={`w-4 h-4 ${formData.groundCondition === 'SUBMERGED' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span>Submerged</span>
                      <span className={`text-[9px] font-medium ${formData.groundCondition === 'SUBMERGED' ? 'text-blue-600' : 'text-gray-400'}`}>Boat Only</span>
                    </RippleButton>

                    <RippleButton
                      type="button"
                      darkRipple={formData.groundCondition !== 'RECEDING'}
                      onClick={() => setFormData(prev => ({ ...prev, groundCondition: 'RECEDING' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                        formData.groundCondition === 'RECEDING'
                          ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm ring-2 ring-amber-500/20'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <Droplets className={`w-4 h-4 ${formData.groundCondition === 'RECEDING' ? 'text-amber-600' : 'text-gray-400'}`} />
                      <span>Water Receding</span>
                      <span className={`text-[9px] font-medium ${formData.groundCondition === 'RECEDING' ? 'text-amber-600' : 'text-gray-400'}`}>Heavy Mud</span>
                    </RippleButton>

                    <RippleButton
                      type="button"
                      darkRipple={formData.groundCondition !== 'DRY_LAND'}
                      onClick={() => setFormData(prev => ({ ...prev, groundCondition: 'DRY_LAND' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                        formData.groundCondition === 'DRY_LAND'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <Compass className={`w-4 h-4 ${formData.groundCondition === 'DRY_LAND' ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span>Dry Land</span>
                      <span className={`text-[9px] font-medium ${formData.groundCondition === 'DRY_LAND' ? 'text-emerald-600' : 'text-gray-400'}`}>Road Accessible</span>
                    </RippleButton>
                  </div>

                  {/* Dynamic Ground Condition Description */}
                  <div className="mt-2 p-2.5 bg-white border border-gray-200 rounded-lg text-[11px] font-medium leading-relaxed">
                    {formData.groundCondition === 'SUBMERGED' && (
                      <p className="text-blue-800">
                        <strong className="font-semibold text-blue-900 uppercase tracking-wide mr-1">Submerged Location:</strong>
                        Area is under deep floodwater. Rescue motorboats, rafts, or life jackets are required to reach victims.
                      </p>
                    )}
                    {formData.groundCondition === 'RECEDING' && (
                      <p className="text-amber-800">
                        <strong className="font-semibold text-amber-900 uppercase tracking-wide mr-1">Water Receding:</strong>
                        Water level is dropping, leaving thick mud and silt. High-clearance vehicles or foot access required.
                      </p>
                    )}
                    {formData.groundCondition === 'DRY_LAND' && (
                      <p className="text-emerald-800">
                        <strong className="font-semibold text-emerald-900 uppercase tracking-wide mr-1">Dry Land / Relief Spot:</strong>
                        Located on high ground, dike, or relief camp. Accessible via standard trucks and road transport.
                      </p>
                    )}
                  </div>
                </div>

                {/* Auto GPS Location */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">GPS Location</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={attachGps}
                          onChange={(e) => setAttachGps(e.target.checked)}
                          className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-[10px] font-medium text-gray-600">Attach GPS</span>
                      </label>
                    </div>
                    {attachGps && (
                      <div className="space-y-2">
                        <RippleButton
                          type="button"
                          darkRipple={!formData.latitude}
                          onClick={handleDetectLocation}
                          disabled={isLocating}
                          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] min-h-[44px] cursor-pointer ${
                            formData.latitude
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-emerald-500/10'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-blue-500/10'
                          }`}
                        >
                          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                          <span>{isLocating ? 'Acquiring GPS...' : formData.latitude ? 'GPS Pinned (Click to Refetch)' : 'Tap to Detect GPS Location'}</span>
                        </RippleButton>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <input
                            type="number"
                            step="any"
                            placeholder="Latitude"
                            value={formData.latitude || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null }))}
                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md text-gray-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          />
                          <input
                            type="number"
                            step="any"
                            placeholder="Longitude"
                            value={formData.longitude || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null }))}
                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md text-gray-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Food & Material Relief Mode: Full comprehensive form fields */
              <div className="space-y-4">
                {/* Victim Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {i18nService.t('victimName', 'Victim / Contact Person Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Biren Hazarika"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-sm font-medium shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {i18nService.t('phoneContact', 'Mobile Phone Number *')}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98640 12345"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-blue-300 rounded-lg text-gray-900 font-medium text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 font-mono shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Village Name, District, and PIN Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {i18nService.t('villageName', 'Village / Panchayat *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kamalabari Village"
                      value={formData.villageName}
                      onChange={(e) => setFormData(prev => ({ ...prev, villageName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {i18nService.t('selectDistrict', 'District *')}
                    </label>
                    <DistrictSelect
                      value={formData.district}
                      onChange={(selected) => setFormData(prev => ({ ...prev, district: selected }))}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {i18nService.t('pinCodeLabel', 'PIN Code (6-digit)')}
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="e.g. 785104"
                        value={formData.pinCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value.replace(/[^0-9]/g, '') }))}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Landmark & GPS Row */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {i18nService.t('exactSpotLandmark', 'Exact Spot / Rooftop / Dike Landmark')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Primary School Dike, House No 12"
                      value={formData.landmark}
                      onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                    />
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">GPS Location</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={attachGps}
                          onChange={(e) => setAttachGps(e.target.checked)}
                          className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-[10px] font-medium text-gray-600">Attach GPS</span>
                      </label>
                    </div>
                    {attachGps && (
                      <div className="space-y-2">
                        <RippleButton
                          type="button"
                          darkRipple={!formData.latitude}
                          onClick={handleDetectLocation}
                          disabled={isLocating}
                          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] min-h-[44px] cursor-pointer ${
                            formData.latitude
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-emerald-500/10'
                              : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 shadow-blue-500/10'
                          }`}
                        >
                          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                          <span>
                            {isLocating
                              ? 'Acquiring GPS...'
                              : formData.latitude
                                ? 'GPS Pinned'
                                : 'Fetch Auto Geolocation'}
                          </span>
                        </RippleButton>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <input
                            type="number"
                            step="any"
                            placeholder="Latitude"
                            value={formData.latitude || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null }))}
                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md text-gray-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          />
                          <input
                            type="number"
                            step="any"
                            placeholder="Longitude"
                            value={formData.longitude || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null }))}
                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md text-gray-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ground & Flood Condition Selector */}
                <div className="space-y-1.5 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Current Ground &amp; Flood Condition *</span>
                    <span className="text-[10px] text-gray-400 font-medium">Boat vs. Road Transport</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <RippleButton
                      type="button"
                      darkRipple={formData.groundCondition !== 'SUBMERGED'}
                      onClick={() => setFormData(prev => ({ ...prev, groundCondition: 'SUBMERGED' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                        formData.groundCondition === 'SUBMERGED'
                          ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm ring-2 ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <Waves className={`w-4 h-4 ${formData.groundCondition === 'SUBMERGED' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span>Submerged</span>
                      <span className={`text-[9px] font-medium ${formData.groundCondition === 'SUBMERGED' ? 'text-blue-600' : 'text-gray-400'}`}>Boat Only</span>
                    </RippleButton>

                    <RippleButton
                      type="button"
                      darkRipple={formData.groundCondition !== 'RECEDING'}
                      onClick={() => setFormData(prev => ({ ...prev, groundCondition: 'RECEDING' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                        formData.groundCondition === 'RECEDING'
                          ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm ring-2 ring-amber-500/20'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <Droplets className={`w-4 h-4 ${formData.groundCondition === 'RECEDING' ? 'text-amber-600' : 'text-gray-400'}`} />
                      <span>Water Receding</span>
                      <span className={`text-[9px] font-medium ${formData.groundCondition === 'RECEDING' ? 'text-amber-600' : 'text-gray-400'}`}>Heavy Mud</span>
                    </RippleButton>

                    <RippleButton
                      type="button"
                      darkRipple={formData.groundCondition !== 'DRY_LAND'}
                      onClick={() => setFormData(prev => ({ ...prev, groundCondition: 'DRY_LAND' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                        formData.groundCondition === 'DRY_LAND'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <Compass className={`w-4 h-4 ${formData.groundCondition === 'DRY_LAND' ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span>Dry Land</span>
                      <span className={`text-[9px] font-medium ${formData.groundCondition === 'DRY_LAND' ? 'text-emerald-600' : 'text-gray-400'}`}>Road Accessible</span>
                    </RippleButton>
                  </div>

                  {/* Dynamic Ground Condition Description */}
                  <div className="mt-2 p-2.5 bg-white border border-gray-200 rounded-lg text-[11px] font-medium leading-relaxed">
                    {formData.groundCondition === 'SUBMERGED' && (
                      <p className="text-blue-800">
                        <strong className="font-semibold text-blue-900 uppercase tracking-wide mr-1">Submerged Location:</strong>
                        Area is under deep floodwater. Rescue motorboats, rafts, or life jackets are required to reach victims.
                      </p>
                    )}
                    {formData.groundCondition === 'RECEDING' && (
                      <p className="text-amber-800">
                        <strong className="font-semibold text-amber-900 uppercase tracking-wide mr-1">Water Receding:</strong>
                        Water level is dropping, leaving thick mud and silt. High-clearance vehicles or foot access required.
                      </p>
                    )}
                    {formData.groundCondition === 'DRY_LAND' && (
                      <p className="text-emerald-800">
                        <strong className="font-semibold text-emerald-900 uppercase tracking-wide mr-1">Dry Land / Relief Spot:</strong>
                        Located on high ground, dike, or relief camp. Accessible via standard trucks and road transport.
                      </p>
                    )}
                  </div>
                </div>

                {/* Urgency Level Selector */}
                <div className="space-y-1.5 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Request Urgency *</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <RippleButton
                      type="button"
                      darkRipple={formData.urgency !== 'HIGH'}
                      onClick={() => setFormData(prev => ({ ...prev, urgency: 'HIGH' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                        formData.urgency === 'HIGH'
                          ? 'bg-red-50 border-red-300 text-red-800 shadow-sm ring-2 ring-red-500/20'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <AlertOctagon className={`w-4 h-4 ${formData.urgency === 'HIGH' ? 'text-red-600' : 'text-gray-400'}`} />
                      <span>High</span>
                      <span className={`text-[9px] font-medium ${formData.urgency === 'HIGH' ? 'text-red-600' : 'text-gray-400'}`}>Need it ASAP</span>
                    </RippleButton>

                    <RippleButton
                      type="button"
                      darkRipple={formData.urgency !== 'MEDIUM'}
                      onClick={() => setFormData(prev => ({ ...prev, urgency: 'MEDIUM' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                        formData.urgency === 'MEDIUM'
                          ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm ring-2 ring-amber-500/20'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <AlertTriangle className={`w-4 h-4 ${formData.urgency === 'MEDIUM' ? 'text-amber-600' : 'text-gray-400'}`} />
                      <span>Medium</span>
                      <span className={`text-[9px] font-medium ${formData.urgency === 'MEDIUM' ? 'text-amber-600' : 'text-gray-400'}`}>Within 24 hrs</span>
                    </RippleButton>

                    <RippleButton
                      type="button"
                      darkRipple={formData.urgency !== 'LOW'}
                      onClick={() => setFormData(prev => ({ ...prev, urgency: 'LOW' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                        formData.urgency === 'LOW'
                          ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm ring-2 ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <CheckCircle className={`w-4 h-4 ${formData.urgency === 'LOW' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span>Low</span>
                      <span className={`text-[9px] font-medium ${formData.urgency === 'LOW' ? 'text-blue-600' : 'text-gray-400'}`}>Whenever possible</span>
                    </RippleButton>
                  </div>
                </div>

                {/* Demographics: Number of Families Needing Help */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 shadow-sm">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>Number of Families Needing Help *</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.familiesCount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, familiesCount: Math.max(1, parseInt(e.target.value) || 0), peopleCount: (Math.max(1, parseInt(e.target.value) || 0)) * 4 }))}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                  />
                </div>

                {/* Materials & Food Needed */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Materials &amp; Food Needed *
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">Use commas (,) to separate items</span>
                  </div>
                  <textarea
                    rows="3"
                    placeholder="e.g. Phenyle, Bleaching Powder, Dettol Soap, Tirpal, Mosquito Nets..."
                    value={formData.customNeeds}
                    onChange={(e) => setFormData(prev => ({ ...prev, customNeeds: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-sm font-medium shadow-sm"
                    required
                  />
                  {formData.customNeeds && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Generated Supply Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {parseNeedsTags(formData.customNeeds).map((tag, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200 leading-tight">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Situation Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Situation Notes / Water Level Status
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Need fever meds & food packets"
                    value={formData.details}
                    onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-sm font-medium shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 pb-12 sm:pb-4 mb-6 sm:mb-2">
              <RippleButton
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer min-h-[52px] shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none ${
                  formData.isUrgentRescue
                    ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500/40 shadow-red-600/30'
                    : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/40 shadow-blue-600/30'
                }`}
              >
                {isSubmitting ? (
                  <span>SUBMITTING...</span>
                ) : (
                  <>
                    {formData.isUrgentRescue ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <HeartHandshake className="w-5 h-5 shrink-0" />}
                    <span>{formData.isUrgentRescue ? 'SUBMIT EMERGENCY RESCUE' : i18nService.t('publishRequest', 'SUBMIT RELIEF REQUEST')}</span>
                  </>
                )}
              </RippleButton>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
