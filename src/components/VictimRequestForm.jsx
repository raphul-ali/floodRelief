import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, Users, Phone, CheckCircle, Navigation, HeartHandshake, ShieldCheck, Hash, UserCheck, AlertOctagon, AlertTriangle, Siren, ShieldAlert, Waves, Droplets, Compass, CheckCircle2, Navigation2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import DistrictSelect from './DistrictSelect';
import { i18nService } from '../services/i18nService';
import RippleButton from './ui/RippleButton';
import { parseNeedsTags } from '../utils/helpers';


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
    customNeeds: '',
    details: '',
    urgency: 'HIGH'
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      isUrgentRescue: initialUrgent,
      groundCondition: initialUrgent ? 'SUBMERGED' : 'DRY_LAND',
      customNeeds: '',
      urgency: initialUrgent ? 'CRITICAL' : 'HIGH'
    }));
  }, [initialUrgent]);

  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attachGps, setAttachGps] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);

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
        setFormData(prev => ({ ...prev, latitude, longitude }));
        setIsLocating(false);
        setLocationStatus(`GPS Pinned: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus('Could not acquire GPS. Please type village & PIN code below.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const totalPeopleCount = (parseInt(formData.peopleCount) || 0) || ((parseInt(formData.malesCount) || 0) + (parseInt(formData.femalesCount) || 0) + (parseInt(formData.childrenCount) || 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.phone) {
      setErrorMessage('Please type a valid Mobile Phone Number!');
      return;
    }
    if (!formData.isUrgentRescue && (!formData.name || !formData.villageName || !formData.district)) {
      setErrorMessage('Please fill out Name, Village Name, and select a District!');
      return;
    }
    if (attachGps && (!formData.latitude || !formData.longitude)) {
      setErrorMessage("GPS Location is required. Click 'Detect GPS Location' or uncheck 'Attach GPS' if unavailable.");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("Please check the confirmation box to verify that your submitted details are 100% genuine and truthful.");
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
      if (onRequestSubmitted) onRequestSubmitted(savedRequest);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit request.');
    }
  };

  /* ─── Admin-card palette constants ─────────────────────────────── */
  const isRescue = formData.isUrgentRescue;

  /* ─── Input base class for mobile & desktop (text-base on mobile prevents iOS auto-zoom) ─── */
  const inputBase = 'w-full px-3.5 py-3 sm:py-2.5 bg-white border border-slate-300 sm:border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors min-h-[44px]';
  const labelBase = 'block text-xs sm:text-xs font-bold text-slate-700 mb-1';

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      {/* Modal shell — Bottom sheet on mobile, rounded card on desktop */}
      <div className="relative w-full max-w-2xl bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col animate-slide-up">

        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl shrink-0 ${isRescue ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'}`}>
              {isRescue ? <Siren className="w-5 h-5 text-white" /> : <Package className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight leading-tight">
                {isRescue
                  ? i18nService.t('emergencyRescueSos', 'EMERGENCY RESCUE SOS')
                  : i18nService.t('floodReliefRequest', 'FLOOD RELIEF & SUPPLY REQUEST')}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                {isRescue
                  ? i18nService.t('sosSubtitle', 'Transmitting victim location to rescue boats')
                  : i18nService.t('requestRegisteredSub', 'Published to NGOs & Volunteers for food & materials')}
              </p>
            </div>
          </div>
          <RippleButton
            darkRipple
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-all duration-200 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </RippleButton>
        </div>



        {/* ── Error banner ──────────────────────────────────────────── */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2 shrink-0">
            <AlertOctagon className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── Success view ──────────────────────────────────────────── */}
        {submittedSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Request Registered!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Your request has been published to nearby verified NGOs, rescue boats, and volunteers in{' '}
                <strong className="text-slate-700">{formData.district}</strong>. Someone will contact you soon.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Registered Phone:</span>
                <span className="font-mono font-bold text-slate-900">{formData.phone}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-semibold text-slate-900 text-right">{formData.villageName}, {formData.district} {formData.pinCode ? `(PIN: ${formData.pinCode})` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Demographics:</span>
                <span className="font-semibold text-slate-700 text-right">
                  {totalPeopleCount} Total ({formData.malesCount}M, {formData.femalesCount}F, {formData.childrenCount}C)
                  {formData.familiesCount > 0 ? ` & ${formData.familiesCount} Families` : ''}
                </span>
              </div>
            </div>

            <RippleButton
              darkRipple
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors active:scale-[0.98] cursor-pointer min-h-[44px]"
            >
              Return to Portal
            </RippleButton>
          </div>
        ) : (
          /* ── FORM CONTENT ─────────────────────────────────────────── */
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">

            {isRescue ? (
              /* ───── EMERGENCY RESCUE MODE ──────────────────────────── */
              <div className="space-y-4">

                {/* rescue alert strip */}
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                  <Siren className="w-4 h-4 text-red-600 shrink-0 animate-pulse" />
                  <span>Quick Emergency Rescue SOS — Enter phone number and count of stranded people.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Phone */}
                  <div>
                    <label className={labelBase}>Mobile Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98640 12345"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className={`${inputBase} pl-10`}
                      />
                    </div>
                  </div>

                  {/* People count */}
                  <div>
                    <label className={labelBase}>People Needing Rescue *</label>
                    <div className="relative">
                      <Users className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="e.g. 5 stranded"
                        value={formData.peopleCount || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, peopleCount: Math.max(1, parseInt(e.target.value) || 0) }))}
                        className={`${inputBase} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                {/* Ground Condition */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Ground & Flood Condition *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Boat vs. Road Transport</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'SUBMERGED', icon: Waves, label: 'Submerged', sub: 'Boat Only' },
                      { key: 'RECEDING', icon: Droplets, label: 'Water Receding', sub: 'Heavy Mud' },
                      { key: 'DRY_LAND', icon: Compass, label: 'Dry Land', sub: 'Road OK' },
                    ].map(({ key, icon: Icon, label, sub }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, groundCondition: key }))}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          formData.groundCondition === key
                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${formData.groundCondition === key ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{label}</span>
                        <span className={`text-[9px] font-medium ${formData.groundCondition === key ? 'text-blue-500' : 'text-slate-400'}`}>{sub}</span>
                      </button>
                    ))}
                  </div>
                  {/* condition description */}
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 leading-relaxed">
                    {formData.groundCondition === 'SUBMERGED' && (<span><strong className="text-slate-900">Submerged:</strong> Area under deep floodwater — Motorboats / rafts required.</span>)}
                    {formData.groundCondition === 'RECEDING' && (<span><strong className="text-slate-900">Water Receding:</strong> Thick mud and silt — High-clearance vehicles or foot access needed.</span>)}
                    {formData.groundCondition === 'DRY_LAND' && (<span><strong className="text-slate-900">Dry Land:</strong> On high ground or relief camp — Accessible via road transport.</span>)}
                  </div>
                </div>

                {/* GPS Location */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> GPS Location
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={attachGps}
                        onChange={(e) => setAttachGps(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[10px] font-semibold text-slate-600">Attach GPS</span>
                    </label>
                  </div>
                  {attachGps && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 border min-h-[40px] cursor-pointer ${
                          formData.latitude
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Navigation2 className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                        <span>{isLocating ? 'Acquiring GPS...' : formData.latitude ? `GPS Pinned ✓ (${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)})` : 'Detect GPS Location'}</span>
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" step="any" placeholder="Latitude" value={formData.latitude || ''} onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null }))} className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-500" />
                        <input type="number" step="any" placeholder="Longitude" value={formData.longitude || ''} onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null }))} className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* ───── FOOD & MATERIAL RELIEF MODE ────────────────────── */
              <div className="space-y-4">

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelBase}>{i18nService.t('victimName', 'Victim / Contact Person Name *')}</label>
                    <input type="text" required placeholder="e.g. Biren Hazarika" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className={inputBase} />
                  </div>
                  <div>
                    <label className={labelBase}>{i18nService.t('phoneContact', 'Mobile Phone Number *')}</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input type="tel" required placeholder="e.g. 98640 12345" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className={`${inputBase} pl-10`} />
                    </div>
                  </div>
                </div>

                {/* Village, District, PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelBase}>{i18nService.t('villageName', 'Village / Panchayat *')}</label>
                    <input type="text" required placeholder="e.g. Kamalabari Village" value={formData.villageName} onChange={(e) => setFormData(prev => ({ ...prev, villageName: e.target.value }))} className={inputBase} />
                  </div>
                  <div>
                    <label className={labelBase}>{i18nService.t('selectDistrict', 'District *')}</label>
                    <DistrictSelect value={formData.district} onChange={(selected) => setFormData(prev => ({ ...prev, district: selected }))} />
                  </div>
                  <div>
                    <label className={labelBase}>{i18nService.t('pinCodeLabel', 'PIN Code (6-digit)')}</label>
                    <div className="relative">
                      <Hash className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input type="text" maxLength="6" placeholder="e.g. 785104" value={formData.pinCode} onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value.replace(/[^0-9]/g, '') }))} className={`${inputBase} pl-10 font-mono`} />
                    </div>
                  </div>
                </div>

                {/* Landmark & GPS */}
                <div className="space-y-3">
                  <div>
                    <label className={labelBase}>{i18nService.t('exactSpotLandmark', 'Exact Spot / Rooftop / Dike Landmark')}</label>
                    <input type="text" placeholder="e.g. Near Primary School Dike, House No 12" value={formData.landmark} onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))} className={inputBase} />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> GPS Location
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={attachGps} onChange={(e) => setAttachGps(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-[10px] font-semibold text-slate-600">Attach GPS</span>
                      </label>
                    </div>
                    {attachGps && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={isLocating}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 border min-h-[40px] cursor-pointer ${
                            formData.latitude
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Navigation2 className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                          <span>{isLocating ? 'Acquiring GPS...' : formData.latitude ? `GPS Pinned ✓ (${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)})` : 'Detect GPS Location'}</span>
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" step="any" placeholder="Latitude" value={formData.latitude || ''} onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null }))} className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-500" />
                          <input type="number" step="any" placeholder="Longitude" value={formData.longitude || ''} onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null }))} className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ground Condition */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Ground & Flood Condition *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Boat vs. Road Transport</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'SUBMERGED', icon: Waves, label: 'Submerged', sub: 'Boat Only' },
                      { key: 'RECEDING', icon: Droplets, label: 'Water Receding', sub: 'Heavy Mud' },
                      { key: 'DRY_LAND', icon: Compass, label: 'Dry Land', sub: 'Road OK' },
                    ].map(({ key, icon: Icon, label, sub }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, groundCondition: key }))}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          formData.groundCondition === key
                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${formData.groundCondition === key ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{label}</span>
                        <span className={`text-[9px] font-medium ${formData.groundCondition === key ? 'text-blue-500' : 'text-slate-400'}`}>{sub}</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 leading-relaxed">
                    {formData.groundCondition === 'SUBMERGED' && (<span><strong className="text-slate-900">Submerged:</strong> Area under deep floodwater — Motorboats / rafts required.</span>)}
                    {formData.groundCondition === 'RECEDING' && (<span><strong className="text-slate-900">Water Receding:</strong> Thick mud and silt — High-clearance vehicles or foot access needed.</span>)}
                    {formData.groundCondition === 'DRY_LAND' && (<span><strong className="text-slate-900">Dry Land:</strong> On high ground or relief camp — Accessible via road transport.</span>)}
                  </div>
                </div>

                {/* Urgency */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <label className="text-xs font-bold text-slate-700">Request Urgency *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'HIGH', icon: AlertOctagon, label: 'High', sub: 'Need it ASAP', activeColor: 'text-red-600', activeBg: 'bg-red-50 border-red-400 text-red-700 ring-red-400' },
                      { key: 'MEDIUM', icon: AlertTriangle, label: 'Medium', sub: 'Within 24 hrs', activeColor: 'text-amber-600', activeBg: 'bg-amber-50 border-amber-400 text-amber-700 ring-amber-400' },
                      { key: 'LOW', icon: CheckCircle, label: 'Low', sub: 'When possible', activeColor: 'text-emerald-600', activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-700 ring-emerald-400' },
                    ].map(({ key, icon: Icon, label, sub, activeColor, activeBg }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, urgency: key }))}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          formData.urgency === key
                            ? `${activeBg} shadow-sm ring-1`
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${formData.urgency === key ? activeColor : 'text-slate-400'}`} />
                        <span>{label}</span>
                        <span className={`text-[9px] font-medium ${formData.urgency === key ? activeColor : 'text-slate-400'}`}>{sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Families Count */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Number of Families Needing Help *</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.familiesCount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, familiesCount: Math.max(1, parseInt(e.target.value) || 0), peopleCount: (Math.max(1, parseInt(e.target.value) || 0)) * 4 }))}
                    placeholder="e.g. 50"
                    className={inputBase}
                  />
                </div>

                {/* Materials & Food (100% Free Text Input) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Materials & Food Needed *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Type freely in Assamese or English</span>
                  </div>
                  <textarea
                    rows="3"
                    placeholder="Type items freely e.g. 50 Cooked Meals, 20 Water Jars, 10 Tirpal (বা ১০০ টা ভাতৰ পেকেট, ২০ টা খোৱা পানী, ১০ টা তিৰপাল)..."
                    value={formData.customNeeds}
                    onChange={(e) => setFormData(prev => ({ ...prev, customNeeds: e.target.value }))}
                    className={`${inputBase} resize-none`}
                    required
                  />
                  {formData.customNeeds && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-600">Auto-Separated Relief Tags:</span>
                        <span className="text-slate-400 font-medium">{parseNeedsTags(formData.customNeeds).length} items detected</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {parseNeedsTags(formData.customNeeds).map((tag, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Situation Notes */}
                <div>
                  <label className={labelBase}>Situation Notes / Water Level Status</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Need fever meds & food packets"
                    value={formData.details}
                    onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                    className={`${inputBase} resize-none`}
                  />
                </div>

              </div>
            )}

            {/* Terms & Truth Declaration Checkbox */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 space-y-1.5 my-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-amber-300 text-blue-600 focus:ring-blue-500 mt-0.5 shrink-0 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                  I hereby confirm that all information entered above is 100% genuine, true, and correct to the best of my knowledge. I understand that submitting false or fake emergency requests is strictly prohibited.
                </span>
              </label>
              {!agreeTerms && (
                <p className="text-[11px] font-bold text-red-600 pl-7">
                  * Required: Please check this box to confirm information is genuine before submitting.
                </p>
              )}
            </div>

            {/* ── Submit Button (Disabled until truth declaration is checked) ───────── */}
            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/90 pt-3 pb-6 sm:pb-3 border-t border-slate-100 shrink-0 -mx-4 sm:-mx-5 px-4 sm:px-5 mt-4">
              <RippleButton
                type="submit"
                disabled={isSubmitting || !agreeTerms}
                className={`w-full py-3.5 sm:py-3.5 rounded-2xl font-black text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[50px] shadow-lg ${
                  isRescue
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
              >
                {isSubmitting ? (
                  <span>SUBMITTING...</span>
                ) : (
                  <>
                    {isRescue ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <HeartHandshake className="w-5 h-5 shrink-0" />}
                    <span>{isRescue ? 'SUBMIT EMERGENCY RESCUE' : i18nService.t('publishRequest', 'SUBMIT RELIEF REQUEST')}</span>
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
