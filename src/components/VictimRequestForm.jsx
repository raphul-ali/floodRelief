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

  const [materialCounts, setMaterialCounts] = useState({});
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCount, setCustomItemCount] = useState(1);

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

  /* ─── Input base class (matches admin card bg-slate-50 inputs) ─── */
  const inputBase = 'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors';
  const labelBase = 'block text-xs font-semibold text-slate-700 mb-1.5';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 max-sm:pb-24 max-sm:pt-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      {/* Modal shell — same card style as Admin Dashboard cards */}
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[88vh] sm:max-h-[90vh] flex flex-col animate-slide-up">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${isRescue ? 'bg-red-600' : 'bg-blue-600'}`}>
              {isRescue ? <Siren className="w-5 h-5 text-white" /> : <Package className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight leading-tight">
                {isRescue
                  ? i18nService.t('emergencyRescueSos', 'EMERGENCY RESCUE SOS')
                  : i18nService.t('floodReliefRequest', 'FLOOD RELIEF & SUPPLY REQUEST')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {isRescue
                  ? i18nService.t('sosSubtitle', 'Transmitting victim location to rescue boats')
                  : i18nService.t('requestRegisteredSub', 'Published to NGOs & Volunteers for food & materials')}
              </p>
            </div>
          </div>
          <RippleButton
            darkRipple
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-all duration-200 active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </RippleButton>
        </div>

        {/* ── Form-type tab switcher (matches admin chip bar) ───────── */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 shrink-0">
          <RippleButton
            type="button"
            darkRipple={!isRescue}
            onClick={() => setFormData(prev => ({ ...prev, isUrgentRescue: true, needs: ['Emergency Motorboat Rescue & Life Evacuation'] }))}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap ${
              isRescue
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
            }`}
          >
            <Siren className="w-3.5 h-3.5" />
            <span>{i18nService.t('emergencyBoatRescue', 'EMERGENCY BOAT RESCUE')}</span>
          </RippleButton>

          <RippleButton
            type="button"
            darkRipple={isRescue}
            onClick={() => setFormData(prev => ({ ...prev, isUrgentRescue: false, needs: ['Cooked Meals & Food Packets', 'Clean Drinking Water Jars'] }))}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap ${
              !isRescue
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{i18nService.t('foodMaterialRelief', 'FOOD & MATERIAL RELIEF')}</span>
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

                {/* Materials & Food */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Materials & Food Needed (With Item Counts) *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const std = {
                          'Cooked Meals': 50,
                          'Clean Drinking Water Jars (20L)': 20,
                          'Tarpaulin / Tirpal Sheets': 10,
                          'Bleaching Powder & Phenyle': 5,
                          'Mosquito Nets': 10
                        };
                        setMaterialCounts(std);
                        const str = Object.entries(std).map(([k, v]) => `${v} ${k}`).join(', ');
                        setFormData(prev => ({ ...prev, customNeeds: str }));
                      }}
                      className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>⚡ Prefill Standard Kit</span>
                    </button>
                  </div>

                  {/* Preset Items Quantity Grid */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      Select item quantities (enter count):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {[
                        { name: 'Cooked Meals', unit: 'Packets' },
                        { name: 'Clean Drinking Water Jars (20L)', unit: 'Jars' },
                        { name: 'Dry Ration & Rice Kits', unit: 'Kits' },
                        { name: 'Baby Food & Milk Powder', unit: 'Cans' },
                        { name: 'Tarpaulin / Tirpal Sheets', unit: 'Sheets' },
                        { name: 'Bleaching Powder & Phenyle', unit: 'Kits' },
                        { name: 'Mosquito Nets', unit: 'Nets' },
                        { name: 'Sanitary Pads', unit: 'Packs' },
                        { name: 'ORS Packets & Medicines', unit: 'Kits' },
                        { name: 'Torch & Batteries', unit: 'Units' },
                        { name: 'Water Purifier Tablets', unit: 'Strips' },
                        { name: 'Warm Blankets', unit: 'Pieces' }
                      ].map(({ name, unit }) => {
                        const count = materialCounts[name] || 0;

                        const updateQty = (val) => {
                          const validVal = Math.max(0, parseInt(val) || 0);
                          const updated = { ...materialCounts, [name]: validVal };
                          setMaterialCounts(updated);

                          const selectedItems = Object.entries(updated)
                            .filter(([_, c]) => c > 0)
                            .map(([n, c]) => `${c} ${n}`);

                          setFormData(prev => ({ ...prev, customNeeds: selectedItems.join(', ') }));
                        };

                        return (
                          <div
                            key={name}
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                              count > 0 ? 'bg-blue-50/80 border-blue-300 shadow-2xs' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className={`font-bold truncate text-[11px] ${count > 0 ? 'text-blue-900' : 'text-slate-800'}`}>
                                {name}
                              </p>
                              <p className="text-[9px] text-slate-400 font-medium">{unit}</p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateQty(count - 1)}
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center cursor-pointer active:scale-95"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={count}
                                onChange={(e) => updateQty(e.target.value)}
                                className="w-12 text-center py-1 bg-white border border-slate-200 rounded-md font-extrabold text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                              />
                              <button
                                type="button"
                                onClick={() => updateQty(count + 1)}
                                className="w-6 h-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-extrabold flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Custom Item with Count */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      Add custom item with count:
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Custom item name (e.g. Candles, Dettol Soap)"
                        value={customItemName}
                        onChange={(e) => setCustomItemName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Count"
                          value={customItemCount}
                          onChange={(e) => setCustomItemCount(e.target.value)}
                          className="w-20 px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customItemName.trim()) return;
                            const name = customItemName.trim();
                            const cnt = Math.max(1, parseInt(customItemCount) || 1);
                            const updated = { ...materialCounts, [name]: cnt };
                            setMaterialCounts(updated);

                            const selectedItems = Object.entries(updated)
                              .filter(([_, c]) => c > 0)
                              .map(([n, c]) => `${c} ${n}`);

                            setFormData(prev => ({ ...prev, customNeeds: selectedItems.join(', ') }));
                            setCustomItemName('');
                            setCustomItemCount(1);
                          }}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all"
                        >
                          + Add Item
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Formatted Needs Output Textarea */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Materials & Quantities Summary:
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. 50 Cooked Meals, 20 Clean Drinking Water Jars (20L), 10 Tarpaulin Sheets..."
                      value={formData.customNeeds}
                      onChange={(e) => setFormData(prev => ({ ...prev, customNeeds: e.target.value }))}
                      className={`${inputBase} resize-none`}
                      required
                    />
                  </div>

                  {formData.customNeeds && (
                    <div className="space-y-1 pt-0.5">
                      <span className="text-[10px] font-semibold text-slate-500">Requested Supply Tags ({parseNeedsTags(formData.customNeeds).length}):</span>
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

            {/* ── Submit Button ─────────────────────────────────────── */}
            <div className="pt-2 pb-12 sm:pb-2 mb-6 sm:mb-0">
              <RippleButton
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] shadow-sm ${
                  isRescue
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
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
