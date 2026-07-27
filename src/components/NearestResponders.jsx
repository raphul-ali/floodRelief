import React, { useState, useEffect } from 'react';
import { 
  Flame, Shield, Navigation, Phone, MessageSquare, MapPin, Search, Filter, 
  ExternalLink, CheckCircle2, Siren, RefreshCw 
} from 'lucide-react';
import { responderService } from '../services/responderService';
import { ASSAM_DISTRICTS } from '../services/storageService';

export default function NearestResponders() {
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [respondersList, setRespondersList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  // Auto-detect GPS location on mount
  const handleDetectGPS = (isAuto = false) => {
    setIsLocating(true);
    setLocationStatus(isAuto ? 'Auto-detecting your live GPS coordinates...' : 'Acquiring your exact GPS coordinates...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsLocating(false);
          setLocationStatus(`📍 Live GPS Active: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          loadResponders(latitude, longitude, selectedCategory);
        },
        async (error) => {
          console.warn("Browser GPS unavailable/denied. Trying IP Geolocation fallback...", error);
          try {
            const res = await fetch('https://ipapi.co/json/');
            if (res.ok) {
              const ipData = await res.json();
              if (ipData.latitude && ipData.longitude) {
                setUserLocation({ lat: ipData.latitude, lng: ipData.longitude });
                setLocationStatus(`📍 Live IP Location (${ipData.city || 'Assam'}): ${ipData.latitude.toFixed(4)}, ${ipData.longitude.toFixed(4)}`);
                loadResponders(ipData.latitude, ipData.longitude, selectedCategory);
                setIsLocating(false);
                return;
              }
            }
          } catch (e) {
            console.warn("IP Geolocation fallback failed:", e);
          }

          setIsLocating(false);
          setLocationStatus('⚠️ Click "Detect Live GPS" to pin your location or select your District.');
          loadResponders(null, null, selectedCategory);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setLocationStatus('⚠️ Geolocation not supported by browser. Select your District below.');
      loadResponders(null, null, selectedCategory);
    }
  };

  const loadResponders = async (lat = null, lng = null, cat = 'ALL') => {
    setLoading(true);
    try {
      const results = await responderService.getNearestResponders(lat, lng, cat);
      setRespondersList(results);
    } catch (err) {
      console.error("Failed to fetch responders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically trigger GPS location detection on mount
    handleDetectGPS(true);
  }, []);

  const filteredList = respondersList.filter(resp => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      resp.name.toLowerCase().includes(q) ||
      (resp.district && resp.district.toLowerCase().includes(q)) ||
      (resp.address && resp.address.toLowerCase().includes(q));

    const matchesDistrict = selectedDistrict === 'ALL' || resp.district === selectedDistrict;

    return matchesSearch && matchesDistrict;
  });

  const getCategoryBadge = (category) => {
    if (category === 'Fire Dept') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 bg-amber-950/70 px-2.5 py-0.5 rounded border border-amber-500/40 w-fit">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>FIRE & WATER RESCUE DEPT</span>
        </div>
      );
    }
    if (category === 'Police Station') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-black text-blue-400 bg-blue-950/70 px-2.5 py-0.5 rounded border border-blue-500/40 w-fit">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>POLICE THANA & CONTROL ROOM</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-xs font-black text-red-400 bg-red-950/70 px-2.5 py-0.5 rounded border border-red-500/40 w-fit">
        <Siren className="w-3.5 h-3.5 text-red-400 animate-pulse" />
        <span>NDRF / SDRF DISASTER RESCUE SQUAD</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider">
              <Siren className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Live GPS Auto-Detection Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              NEAREST FIRE STATIONS, POLICE THANAS & RESCUE SQUADS
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Calculates real-time distance from your exact live GPS coordinates.
            </p>
          </div>

          <button
            onClick={() => handleDetectGPS(false)}
            disabled={isLocating}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-xl shadow-red-950/60 transition-all shrink-0 active:scale-95 animate-urgent-pulse"
          >
            <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'REFRESHING GPS...' : 'RE-DETECT MY LIVE GPS'}</span>
          </button>
        </div>

        {locationStatus && (
          <div className="text-xs font-bold text-amber-300 bg-amber-950/50 border border-amber-800/60 px-4 py-2 rounded-xl flex items-center justify-between">
            <span>{locationStatus}</span>
            {userLocation && (
              <span className="text-[10px] bg-slate-900 px-2 py-1 rounded border border-amber-500/40 text-white font-mono">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search station name, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-400"
          />
        </div>

        {/* Categories & District Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All Responders
            </button>
            <button
              onClick={() => setSelectedCategory('Fire Dept')}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                selectedCategory === 'Fire Dept'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              🚒 Fire Dept
            </button>
            <button
              onClick={() => setSelectedCategory('Police Station')}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                selectedCategory === 'Police Station'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              👮 Police Thana
            </button>
            <button
              onClick={() => setSelectedCategory('Rescue Squad')}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                selectedCategory === 'Rescue Squad'
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              🚁 NDRF/SDRF
            </button>
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Districts / Regions</option>
            {ASSAM_DISTRICTS.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>

        </div>

      </div>

      {/* Responder Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
          <span>Locating nearest emergency stations based on your GPS...</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Siren className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Responder Stations Found Nearby</h3>
          <p className="text-xs text-slate-400">Try re-detecting your live GPS coordinates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((resp) => (
            <div 
              key={resp.id} 
              className="bg-slate-900/90 border border-slate-800 hover:border-red-500/40 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {getCategoryBadge(resp.category)}
                    <h3 className="text-base font-black text-white mt-2 leading-tight">{resp.name}</h3>
                  </div>

                  {resp.distanceKm !== null && resp.distanceKm !== undefined && resp.distanceKm < 9000 && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                      📍 {resp.distanceKm} km away
                    </span>
                  )}
                </div>

                {/* Location */}
                <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{resp.district}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pl-5">
                    {resp.address}
                  </div>
                </div>

                {/* Services */}
                {Array.isArray(resp.services) && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Capabilities:</span>
                    <div className="flex flex-wrap gap-1">
                      {resp.services.map((srv, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 text-slate-300 rounded-md">
                          ✓ {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <a
                  href={`tel:${resp.phone}`}
                  className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {resp.phone}</span>
                </a>

                {resp.controlPhone && (
                  <a
                    href={`tel:${resp.controlPhone}`}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
                    title="Call Secondary Line"
                  >
                    Alt Line
                  </a>
                )}

                {resp.latitude && resp.longitude && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${resp.latitude}&mlon=${resp.longitude}#map=15/${resp.latitude}/${resp.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    title="View Navigation Map"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Map</span>
                  </a>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
