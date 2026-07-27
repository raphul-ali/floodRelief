import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Building2, Pill, Navigation, Phone, MapPin, Search, 
  ExternalLink, Siren, RefreshCw, Compass 
} from 'lucide-react';
import { medicalService } from '../services/medicalService';
import { ASSAM_DISTRICTS } from '../services/storageService';

export default function NearestMedicals() {
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [medicalsList, setMedicalsList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  // Auto-detect GPS location on mount
  const handleDetectGPS = (isAuto = false) => {
    setIsLocating(true);
    setLocationStatus(isAuto ? 'Auto-detecting your live GPS coordinates...' : 'Acquiring your exact GPS coordinates...');

    // Use current userLocation as fallback if already acquired
    const fallbackLat = userLocation?.lat || null;
    const fallbackLng = userLocation?.lng || null;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsLocating(false);
          setLocationStatus(`📍 Live GPS Active: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          loadMedicals(latitude, longitude, selectedCategory);
        },
        async (error) => {
          console.warn("Browser GPS unavailable/denied. Trying IP Geolocation fallback...", error);
          try {
            const res = await fetch('https://ipapi.co/json/');
            if (res.ok) {
              const ipData = await res.json();
              if (ipData.latitude && ipData.longitude) {
                setUserLocation({ lat: ipData.latitude, lng: ipData.longitude });
                setLocationStatus(`📍 Live Location (${ipData.city || 'Assam'}): ${ipData.latitude.toFixed(4)}, ${ipData.longitude.toFixed(4)}`);
                loadMedicals(ipData.latitude, ipData.longitude, selectedCategory);
                setIsLocating(false);
                return;
              }
            }
          } catch (e) {
            console.warn("IP Geolocation fallback failed:", e);
          }

          setIsLocating(false);
          if (fallbackLat && fallbackLng) {
            setLocationStatus(`📍 Live GPS Retained: ${fallbackLat.toFixed(4)}, ${fallbackLng.toFixed(4)}`);
            loadMedicals(fallbackLat, fallbackLng, selectedCategory);
          } else {
            setLocationStatus('⚠️ Click "Detect Live GPS" to pin your location or select your District.');
            loadMedicals(null, null, selectedCategory);
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    } else {
      setIsLocating(false);
      setLocationStatus('⚠️ Geolocation not supported by browser. Select your District below.');
      loadMedicals(fallbackLat, fallbackLng, selectedCategory);
    }
  };

  const loadMedicals = async (lat = null, lng = null, cat = 'ALL') => {
    setLoading(true);
    try {
      const results = await medicalService.getNearestMedicals(lat, lng, cat);
      setMedicalsList(results);
    } catch (err) {
      console.error("Failed to fetch medicals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically attempt GPS detection when page loads
    handleDetectGPS(true);
  }, []);

  const filteredList = medicalsList.filter(med => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      med.name.toLowerCase().includes(q) ||
      (med.district && med.district.toLowerCase().includes(q)) ||
      (med.address && med.address.toLowerCase().includes(q));

    const matchesDistrict = selectedDistrict === 'ALL' || med.district === selectedDistrict;

    const matchesCategory = 
      selectedCategory === 'ALL' || 
      med.category === selectedCategory ||
      (selectedCategory === 'Hospital' && (med.category === 'Hospital' || med.type?.toLowerCase().includes('hospital') || med.name?.toLowerCase().includes('hospital'))) ||
      (selectedCategory === 'Pharmacy' && (med.category === 'Pharmacy' || med.type?.toLowerCase().includes('pharmacy') || med.name?.toLowerCase().includes('chemist'))) ||
      (selectedCategory === 'Relief Center' && (med.category === 'Relief Center' || med.type?.toLowerCase().includes('relief') || med.name?.toLowerCase().includes('camp')));

    return matchesSearch && matchesDistrict && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-black rounded-full border border-emerald-500/40">
                24x7 Emergency Medical Units
              </span>
              {userLocation && (
                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-xs font-extrabold rounded-full border border-teal-500/40">
                  Sorted by Live GPS Proximity
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase">
              NEAREST HOSPITALS, PHARMACIES & MEDICAL RELIEF
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Locates free anti-venom, emergency ICUs, and medical relief units closest to your current location.
            </p>
          </div>

          {/* GPS Detector Button */}
          <button
            onClick={() => handleDetectGPS(false)}
            disabled={isLocating}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-lg active:scale-95 transition-all border border-emerald-400/40 shrink-0 disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : 'RE-DETECT MY LIVE GPS'}</span>
          </button>
        </div>

        {/* Location Status Bar */}
        {locationStatus && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs font-bold text-emerald-300">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{locationStatus}</span>
            </div>
            {userLocation && (
              <span className="text-[11px] font-mono text-slate-400 shrink-0 hidden sm:inline">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search hospital name, pharmacy, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
            />
          </div>

          {/* Category Tabs & District Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 overflow-x-auto text-xs w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                All Medical Units
              </button>
              <button
                onClick={() => setSelectedCategory('Hospital')}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                  selectedCategory === 'Hospital'
                    ? 'bg-teal-600 text-white border-teal-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Hospitals & ICUs
              </button>
              <button
                onClick={() => setSelectedCategory('Pharmacy')}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                  selectedCategory === 'Pharmacy'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Pharmacies
              </button>
            </div>

            {/* District Dropdown */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
            >
              <option value="ALL">All Districts / Regions</option>
              {ASSAM_DISTRICTS.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>

          </div>

        </div>
      </div>

      {/* Medical Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Locating nearest emergency hospitals based on your GPS...</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              No Medical Units Match Filter
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              No medical units found for the selected search term or category. Reset your filters to view all emergency units.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedDistrict('ALL'); }}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-md"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((med) => (
            <div 
              key={med.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 space-y-4 shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Type Badge & Distance */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-black px-2.5 py-0.5 bg-emerald-950/80 text-emerald-400 rounded-full border border-emerald-500/30">
                    🏥 {med.type || med.category}
                  </span>
                  {med.distanceKm !== null && (
                    <span className="text-[11px] font-black px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 shrink-0">
                      📍 {med.distanceKm} km away
                    </span>
                  )}
                </div>

                {/* Medical Name */}
                <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {med.name}
                </h3>

                {/* Location Details */}
                <div className="space-y-1 text-xs text-slate-300 font-medium">
                  {med.district && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{med.district}</span>
                    </div>
                  )}
                  {med.address && (
                    <p className="text-slate-400 text-[11px] pl-5 leading-relaxed">
                      {med.address}
                    </p>
                  )}
                </div>

                {/* Services / Capabilities */}
                {med.services && med.services.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Available Care:</p>
                    <div className="flex flex-wrap gap-1">
                      {med.services.map((svc, i) => (
                        <span key={i} className="text-[10px] font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          ✓ {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Phone Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <a
                  href={`tel:${med.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {med.phone}</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${med.latitude},${med.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 transition-colors"
                  title="Open Google Maps Navigation"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
