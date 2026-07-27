import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, Users, Phone, CheckCircle, Navigation, HeartHandshake, ShieldCheck, Hash, UserCheck, AlertOctagon, AlertTriangle, Siren, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storageService';
import DistrictSelect from './DistrictSelect';

const SUPPLY_NEEDS = [
  "Cooked Meals & Food Packets",
  "Clean Drinking Water Jars",
  "Baby Food & Infant Milk Formula",
  "First Aid & Fever Medicines",
  "Water Purification Tablets",
  "Warm Blankets & Dry Clothes",
  "Tarpaulins & Relief Tents",
  "Hygiene & Sanitary Kits"
];

export default function VictimRequestForm({ onClose, onRequestSubmitted, initialUrgent = true }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    altPhone: '',
    malesCount: 1,
    femalesCount: 1,
    childrenCount: 0,
    district: 'Jorhat',
    villageName: '',
    pinCode: '',
    landmark: '',
    latitude: null,
    longitude: null,
    isUrgentRescue: initialUrgent,
    needs: initialUrgent ? ['Emergency Motorboat Rescue & Life Evacuation'] : ['Cooked Meals & Food Packets', 'Clean Drinking Water Jars'],
    details: ''
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      isUrgentRescue: initialUrgent,
      needs: initialUrgent ? ['Emergency Motorboat Rescue & Life Evacuation'] : ['Cooked Meals & Food Packets', 'Clean Drinking Water Jars']
    }));
  }, [initialUrgent]);

  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        setLocationStatus(`✅ GPS Pinned: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        setIsLocating(false);
        console.warn("GPS error:", error);
        setLocationStatus('⚠️ Could not acquire GPS automatically. Please type village & PIN code below.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const toggleNeed = (needItem) => {
    setFormData(prev => {
      const exists = prev.needs.includes(needItem);
      if (exists) {
        return { ...prev, needs: prev.needs.filter(item => item !== needItem) };
      } else {
        return { ...prev, needs: [...prev.needs, needItem] };
      }
    });
  };

  const totalPeopleCount = (parseInt(formData.malesCount) || 0) + (parseInt(formData.femalesCount) || 0) + (parseInt(formData.childrenCount) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.phone || !formData.name || !formData.villageName) {
      setErrorMessage("Please fill out Victim Name, Mobile Phone, and Village Name!");
      return;
    }

    setIsSubmitting(true);

    try {
      const locationAddressFormatted = `${formData.villageName}${formData.pinCode ? `, PIN: ${formData.pinCode}` : ''}${formData.landmark ? ` (${formData.landmark})` : ''}`;

      const savedRequest = storageService.addVictimRequest({
        ...formData,
        peopleCount: totalPeopleCount > 0 ? totalPeopleCount : 1,
        locationName: locationAddressFormatted,
        needs: formData.isUrgentRescue ? ['Emergency Motorboat Rescue & Life Evacuation'] : formData.needs
      });

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/85 backdrop-blur-lg overflow-y-auto">
      <div className={`relative w-full max-w-2xl bg-slate-900 border-2 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col ${
        formData.isUrgentRescue ? 'border-red-500 shadow-red-950/80' : 'border-amber-500/40 shadow-amber-950/50'
      }`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0 ${
          formData.isUrgentRescue 
            ? 'bg-gradient-to-r from-red-950 via-slate-950 to-slate-950 border-red-800' 
            : 'bg-gradient-to-r from-amber-950 via-slate-950 to-slate-950 border-amber-800'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-xl border text-white shrink-0 ${
              formData.isUrgentRescue 
                ? 'bg-red-600 border-red-400 shadow-lg shadow-red-600/50 animate-pulse' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              {formData.isUrgentRescue ? <Siren className="w-5 h-5 sm:w-6 sm:h-6" /> : <Package className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-tight leading-tight">
                {formData.isUrgentRescue ? '🚨 EMERGENCY RESCUE SOS' : '📦 FLOOD RELIEF & SUPPLY REQUEST'}
              </h3>
              <p className="text-[10px] sm:text-xs font-semibold text-amber-300">
                {formData.isUrgentRescue 
                  ? 'Transmitting victim location directly to rescue boats' 
                  : 'Published to NGOs & Volunteers to supply food & materials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Type Switcher Bar */}
        <div className="bg-slate-950 border-b border-slate-800 p-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ 
              ...prev, 
              isUrgentRescue: true, 
              needs: ['Emergency Motorboat Rescue & Life Evacuation'] 
            }))}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              formData.isUrgentRescue
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Siren className="w-4 h-4" />
            <span>🚨 EMERGENCY BOAT RESCUE</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({ 
              ...prev, 
              isUrgentRescue: false, 
              needs: ['Cooked Meals & Food Packets', 'Clean Drinking Water Jars'] 
            }))}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              !formData.isUrgentRescue
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>📦 FOOD & MATERIAL RELIEF</span>
          </button>
        </div>

        {/* Error / Rate Limit Alert Banner */}
        {errorMessage && (
          <div className="m-4 p-3.5 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success View */}
        {submittedSuccess ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">
                {formData.isUrgentRescue ? '🚨 SOS TRANSMITTED TO VERIFICATION QUEUE!' : '📦 RELIEF REQUEST SENT TO VERIFICATION QUEUE!'}
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Your submission is currently held in the <span className="text-amber-300 font-bold">Admin Verification Queue</span>. Our Control Room officer will connect with your phone via <span className="text-emerald-400 font-bold">WhatsApp / Call</span> to verify your location before publishing to the live map.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Victim Contact Phone:</span>
                <span className="font-bold text-amber-400">{formData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Village & District:</span>
                <span className="font-bold text-slate-200">{formData.villageName}, {formData.district} ({formData.pinCode || 'No PIN'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Demographics:</span>
                <span className="font-bold text-amber-300">
                  {totalPeopleCount} Total ({formData.malesCount} Males, {formData.femalesCount} Females, {formData.childrenCount} Children)
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            >
              Close & View Rescue Queue
            </button>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Victim Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Victim / Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biren Hazarika"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98640 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border-2 border-amber-500/60 rounded-xl text-white font-black text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Alternate Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Alternate Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="e.g. 94350 98765"
                value={formData.altPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, altPhone: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>

            {/* Village Name, District, and PIN Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Village / Panchayat *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kamalabari Village"
                  value={formData.villageName}
                  onChange={(e) => setFormData(prev => ({ ...prev, villageName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  District *
                </label>
                <DistrictSelect
                  value={formData.district}
                  onChange={(selected) => setFormData(prev => ({ ...prev, district: selected }))}
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  PIN Code (6-digit)
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="e.g. 785104"
                    value={formData.pinCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value.replace(/[^0-9]/g, '') }))}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Landmark & GPS Detector Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Exact Spot / Rooftop / Dike Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Primary School Dike, House No 12"
                  value={formData.landmark}
                  onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  GPS Location
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="w-full py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Acquiring...' : formData.latitude ? '✅ GPS Pinned' : 'Attach GPS'}</span>
                </button>
              </div>
            </div>

            {/* Demographics: Males, Females, Children Counters */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Demographics Needing Rescue</span>
                </div>
                <span className="text-xs font-black text-white bg-slate-900 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Total: {totalPeopleCount} People
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">👨 Males</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={formData.malesCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, malesCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-extrabold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">👩 Females</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={formData.femalesCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, femalesCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-extrabold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">👶 Children</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={formData.childrenCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, childrenCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-extrabold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* ONLY SHOW SUPPLY CHECKLIST IF IN MATERIAL RELIEF MODE */}
            {!formData.isUrgentRescue && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Materials & Food Needed (Check all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableNeeds.map((item) => {
                    const isSelected = formData.needs.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleNeed(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details / Water Level Situation */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Situation Notes / Water Level Status
              </label>
              <textarea
                rows="2"
                placeholder={formData.isUrgentRescue ? "e.g. Water level rising fast, 7 people stuck on bamboo roof platform. Need motorboat urgently." : "e.g. Need fever meds & food packets"}
                value={formData.details}
                onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xl ${
                  formData.isUrgentRescue
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-red-950/80 border border-red-400/40 animate-urgent-pulse'
                    : 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-950/50'
                }`}
              >
                {isSubmitting ? (
                  <span>TRANSMITTING SOS SIGNAL...</span>
                ) : (
                  <>
                    {formData.isUrgentRescue ? <ShieldAlert className="w-5 h-5" /> : <HeartHandshake className="w-5 h-5" />}
                    <span>{formData.isUrgentRescue ? '⚡ TRANSMIT EMERGENCY RESCUE SOS NOW' : 'PUBLISH RELIEF SUPPLY REQUEST'}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
