import React, { useState, useEffect, useRef } from 'react';
import {
  Flame, Shield, Phone, MapPin, Search,
  ExternalLink, Siren, RefreshCw, Compass, Stethoscope,
  ArrowRight, Loader2, Navigation
} from 'lucide-react';
import { fetchNearestServices } from '../services/emergencyService';
import { ASSAM_DISTRICTS } from '../services/storageService';
import { i18nService } from '../services/i18nService';
import RippleButton from './ui/RippleButton';

const RADIUS_OPTIONS = [50, 100, 200, 500];

const DISTRICT_COORDS = {
  "Kamrup Metropolitan (Guwahati)": { lat: 26.1434, lng: 91.7898 },
  "Jorhat":                         { lat: 26.7570, lng: 94.2030 },
  "Dibrugarh":                      { lat: 27.4728, lng: 94.9120 },
  "Cachar (Silchar)":                { lat: 24.8240, lng: 92.7970 },
  "Sivasagar":                       { lat: 26.9826, lng: 94.6425 },
  "Sonitpur (Tezpur)":               { lat: 26.6330, lng: 92.7980 },
  "Nagaon":                          { lat: 26.3480, lng: 92.6840 },
  "Lakhimpur":                       { lat: 27.2333, lng: 94.1000 },
  "Tinsukia":                        { lat: 27.4879, lng: 95.3569 },
  "Majuli Island":                   { lat: 26.9600, lng: 94.1700 },
  "Dhubri":                          { lat: 26.0200, lng: 89.9800 },
  "Barpeta":                         { lat: 26.3200, lng: 91.0000 },
  "Bongaigaon":                      { lat: 26.4700, lng: 90.5600 },
  "Goalpara":                        { lat: 26.1800, lng: 90.6200 },
  "Golaghat":                        { lat: 26.5200, lng: 93.9600 },
  "Darrang":                         { lat: 26.4500, lng: 92.0300 },
  "Dhemaji":                         { lat: 27.4800, lng: 94.5800 },
  "Nalbari":                         { lat: 26.4430, lng: 91.4420 },
  "Morigaon":                        { lat: 26.2503, lng: 92.3410 },
  "Hailakandi":                      { lat: 24.6800, lng: 92.5600 },
  "Karimganj":                       { lat: 24.8700, lng: 92.3500 },
  "Dima Hasao (Haflong)":            { lat: 25.1680, lng: 93.0190 },
  "Karbi Anglong (Diphu)":           { lat: 25.8400, lng: 93.4300 },
  "Kokrajhar":                       { lat: 26.4000, lng: 90.2700 },
  "Baksa":                           { lat: 26.6000, lng: 91.4000 },
  "Chirang":                         { lat: 26.5000, lng: 90.7000 },
  "Udalguri":                        { lat: 26.7400, lng: 92.1300 },
  "Biswanath":                       { lat: 26.7300, lng: 93.1500 },
  "Charaideo":                       { lat: 27.0200, lng: 95.0000 },
  "Hojai":                           { lat: 26.0000, lng: 92.8600 },
  "Bajali":                          { lat: 26.5000, lng: 91.1700 },
  "Kamrup Rural":                    { lat: 26.3126, lng: 91.5975 },
  "South Salmara-Mankachar":         { lat: 25.6000, lng: 89.8500 },
  "Tamulpur":                        { lat: 26.6300, lng: 91.5600 },
  "West Karbi Anglong":              { lat: 25.7500, lng: 92.5000 },
};

/* ── Category config ─────────────────────────────────────────────────────── */
const CATEGORIES = [
  { key: 'ALL',          label: 'All Services',  icon: Siren,       color: 'filter-chip-red'   },
  { key: 'Fire Dept',    label: 'Fire Dept',     icon: Flame,       color: 'filter-chip-amber' },
  { key: 'Police Thana', label: 'Police',        icon: Shield,      color: 'filter-chip-blue'  },
  { key: 'Hospital',     label: 'Hospital',      icon: Stethoscope, color: 'filter-chip-green' },
  { key: 'Rescue Squad', label: 'NDRF / SDRF',   icon: Siren,       color: 'filter-chip-rose'  },
];

/* ── Category badge for card ─────────────────────────────────────────────── */
function CategoryBadge({ category }) {
  const map = {
    'Fire Dept':    { label: 'FIRE & RESCUE', Icon: Flame,       cls: 'bg-amber-100 text-amber-800 border-amber-300' },
    'Police Thana': { label: 'POLICE THANA',  Icon: Shield,      cls: 'bg-blue-100 text-blue-800 border-blue-300' },
    'Hospital':     { label: 'HOSPITAL',      Icon: Stethoscope, cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  };
  const { label, Icon, cls } = map[category] ?? { label: 'RESCUE SQUAD', Icon: Siren, cls: 'bg-red-100 text-red-800 border-red-300' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full border ${cls}`}>
      <Icon className="w-3 h-3" />{label}
    </span>
  );
}

export default function EmergencyServices() {
  const [userLocation,     setUserLocation]     = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [isLocating,       setIsLocating]       = useState(false);
  const [locError,         setLocError]         = useState(null);
  const [radiusKm,         setRadiusKm]         = useState(50);
  const [isFetching,       setIsFetching]       = useState(false);
  const [fetchError,       setFetchError]       = useState(null);
  const [results,          setResults]          = useState(null);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchAbortRef = useRef(null);
  const filtersRef    = useRef(null);
  const [, setLangState] = useState(i18nService.getLanguage());

  useEffect(() => {
    const h = () => setLangState(i18nService.getLanguage());
    window.addEventListener('flood_lang_changed', h);
    return () => window.removeEventListener('flood_lang_changed', h);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (filtersRef.current) {
        const y = filtersRef.current.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 120);
    return () => clearTimeout(t);
  }, []);

  /* ── Location detection ────────────────────────────────────────────────── */
  const detectLocation = async () => {
    setIsLocating(true);
    setLocError(null);
    setResults(null);

    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, timeout: 10000, maximumAge: 0,
          })
        );
        const { latitude: lat, longitude: lng } = pos.coords;
        const loc = { lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)} (GPS)` };
        setUserLocation(loc);
        setIsLocating(false);
        doFetch(loc, radiusKm);
        return;
      } catch (_) {}
    }

    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
      if (res.ok) {
        const d = await res.json();
        if (d.latitude && d.longitude) {
          const loc = { lat: d.latitude, lng: d.longitude, label: [d.city, d.region, d.country_name].filter(Boolean).join(', ') + ' (IP)' };
          setUserLocation(loc);
          setIsLocating(false);
          doFetch(loc, radiusKm);
          return;
        }
      }
    } catch (_) {}

    const fallback = { lat: 26.1400, lng: 91.7900, label: 'Assam State Emergency Center (Default)' };
    setUserLocation(fallback);
    setIsLocating(false);
    doFetch(fallback, radiusKm);
  };

  const doFetch = async (loc, km) => {
    if (!loc) return;
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const ctrl = new AbortController();
    fetchAbortRef.current = ctrl;
    setIsFetching(true);
    setFetchError(null);
    setResults(null);
    try {
      const data = await fetchNearestServices(loc.lat, loc.lng, km, ctrl.signal);
      if (!ctrl.signal.aborted) setResults(data);
    } catch (err) {
      if (!ctrl.signal.aborted)
        setFetchError('Could not reach OpenStreetMap. Check your internet connection and try again.');
    } finally {
      if (!ctrl.signal.aborted) setIsFetching(false);
    }
  };

  useEffect(() => { detectLocation(); }, []);

  const handleDistrictChange = (distName) => {
    setSelectedDistrict(distName);
    if (distName === 'ALL') { detectLocation(); return; }
    const coords = DISTRICT_COORDS[distName];
    if (coords) {
      const loc = { lat: coords.lat, lng: coords.lng, label: `${distName} District Center` };
      setUserLocation(loc);
      doFetch(loc, radiusKm);
    }
  };

  const handleRadiusChange = (km) => {
    setRadiusKm(km);
    if (userLocation) doFetch(userLocation, km);
  };

  const filtered = (results ?? []).filter(item => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) ||
      (item.district ?? '').toLowerCase().includes(q) ||
      (item.address ?? '').toLowerCase().includes(q);
    const matchCat  = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchDist = selectedDistrict === 'ALL' || (item.district ?? '').toLowerCase().includes(selectedDistrict.toLowerCase());
    return matchSearch && matchCat && matchDist;
  });

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">

      {/* ── Section header card ──────────────────────────────────────────── */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="status-chip status-chip-resolved">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            231 Verified Stations
          </span>
          {userLocation && !isLocating && (
            <span className="status-chip status-chip-info">Within {radiusKm} km</span>
          )}
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            {i18nService.t('emergencyTitle', 'Nearest Emergency Services')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {i18nService.t('emergencySubtitle', 'Fire stations, police thanas, hospitals & rescue squads near you — anywhere in India.')}
          </p>
        </div>

        {/* Location status bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-flat">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 truncate flex-1 min-w-[180px]">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <span className="truncate">{userLocation?.label || 'Detecting location…'}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 font-semibold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 cursor-pointer shadow-flat min-h-[38px]"
            >
              <option value="ALL">{i18nService.t('changeDistrict', 'Change District')}</option>
              {ASSAM_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <RippleButton
              variant="sos"
              onClick={detectLocation}
              disabled={isLocating}
              className="px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide uppercase gap-1.5 min-h-[38px]"
            >
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              {isLocating ? 'Locating…' : 'Live GPS'}
            </RippleButton>
          </div>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div id="emergency-filters-section" ref={filtersRef} className="glass-card rounded-2xl p-4 space-y-3.5 scroll-mt-24">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search station, hospital or area…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 font-medium shadow-flat min-h-[42px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between">
          {/* Category chips */}
          <div className="filter-chip-group">
            {CATEGORIES.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`filter-chip ${color} ${selectedCategory === key ? 'active' : ''} ripple-btn`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Radius pills */}
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Radius:</span>
            {RADIUS_OPTIONS.map(km => (
              <RippleButton
                key={km}
                variant={radiusKm === km ? 'relief' : 'glass'}
                darkRipple={radiusKm !== km}
                onClick={() => handleRadiusChange(km)}
                disabled={isFetching}
                className="px-3 py-1.5 rounded-xl text-xs font-bold min-h-[34px]"
              >
                {km} km
              </RippleButton>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body states ──────────────────────────────────────────────────── */}
      {isLocating && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-red-500" />
          <p className="text-sm font-semibold text-slate-600">Detecting your location…</p>
        </div>
      )}

      {!isLocating && isFetching && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-9 h-9 animate-spin text-amber-500" />
          <p className="text-sm font-semibold text-slate-600">Locating nearest stations within {radiusKm} km…</p>
          <p className="text-xs text-slate-400">May take a few seconds</p>
        </div>
      )}

      {!isLocating && !isFetching && fetchError && (
        <div className="glass-card rounded-2xl p-8 text-center space-y-4 border border-red-200">
          <Compass className="w-10 h-10 text-red-400 mx-auto" />
          <p className="font-bold text-slate-800 text-sm">{fetchError}</p>
          <RippleButton
            variant="sos"
            onClick={() => doFetch(userLocation, radiusKm)}
            className="px-5 py-2 rounded-xl text-xs font-bold"
          >
            Retry
          </RippleButton>
        </div>
      )}

      {!isLocating && !isFetching && !fetchError && results !== null && filtered.length === 0 && (
        <div className="glass-card rounded-3xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto border border-amber-200">
            <Compass className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-base font-black text-slate-800">
            {results.length === 0
              ? `No services found within ${radiusKm} km`
              : 'No services match your filter'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {results.length === 0
              ? 'Try a larger search radius.'
              : 'Clear your search or change category.'}
          </p>
          {results.length === 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {RADIUS_OPTIONS.filter(r => r > radiusKm).map(r => (
                <RippleButton
                  key={r}
                  variant="relief"
                  onClick={() => handleRadiusChange(r)}
                  className="px-4 py-2 rounded-xl text-xs font-bold gap-1.5"
                >
                  Expand to {r} km <ArrowRight className="w-3.5 h-3.5" />
                </RippleButton>
              ))}
            </div>
          )}
          {results.length > 0 && (
            <RippleButton
              variant="glass"
              darkRipple
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
              className="px-5 py-2 rounded-xl text-xs font-bold"
            >
              Clear Filters
            </RippleButton>
          )}
        </div>
      )}

      {/* ── Results grid ─────────────────────────────────────────────────── */}
      {!isLocating && !isFetching && filtered.length > 0 && (
        <>
          <p className="text-xs text-slate-500 font-semibold px-1">
            Showing <strong className="text-slate-800">{filtered.length}</strong> emergency service{filtered.length !== 1 ? 's' : ''} within {radiusKm} km
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <div
                key={item.id}
                className="card-surface rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 group transition-all"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <CategoryBadge category={item.category} />
                  {item.distanceKm != null && (
                    <span className="status-chip status-chip-info shrink-0">
                      <Navigation className="w-3 h-3" />
                      {item.distanceKm} km
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug">
                  {item.name}
                </h3>

                {/* Address */}
                <div className="space-y-1 text-xs">
                  {item.district && (
                    <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      {item.district}
                    </div>
                  )}
                  {item.address && (
                    <p className="text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {item.address}
                    </p>
                  )}
                </div>

                {/* CTA row */}
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100">
                  <a
                    href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                    className="ripple-btn btn-base btn-sos flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.phone}</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ripple-btn ripple-dark btn-base btn-glass p-2.5 rounded-xl min-h-[42px] min-w-[42px] flex items-center justify-center"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="w-4 h-4 text-indigo-600" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
