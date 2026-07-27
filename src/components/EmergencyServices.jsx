import React, { useState, useEffect, useRef } from 'react';
import {
  Flame, Shield, Phone, MapPin, Search,
  ExternalLink, Siren, RefreshCw, Compass, Stethoscope, ArrowRight, Loader2
} from 'lucide-react';
import { fetchNearestServices } from '../services/emergencyService';

const RADIUS_OPTIONS = [50, 100, 200, 500];

export default function EmergencyServices() {
  const [userLocation, setUserLocation] = useState(null);   // { lat, lng, label }
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState(null);

  const [radiusKm, setRadiusKm] = useState(50);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [results, setResults] = useState(null); // null = not fetched; [] = fetched, empty

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchAbortRef = useRef(null);

  // ─── Detect current GPS location ─────────────────────────────────────────────
  const detectLocation = async () => {
    setIsLocating(true);
    setLocError(null);
    setResults(null);

    // 1. Try browser GPS
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          })
        );
        const { latitude: lat, longitude: lng } = pos.coords;
        const loc = { lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)} (GPS)` };
        setUserLocation(loc);
        setIsLocating(false);
        doFetch(loc, radiusKm);
        return;
      } catch (_) {
        // GPS denied — fall through to IP
      }
    }

    // 2. IP geolocation fallback — ipapi.co (free, no key)
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
      if (res.ok) {
        const d = await res.json();
        if (d.latitude && d.longitude) {
          const loc = {
            lat: d.latitude,
            lng: d.longitude,
            label: [d.city, d.region, d.country_name].filter(Boolean).join(', ') + ' (IP location)',
          };
          setUserLocation(loc);
          setIsLocating(false);
          doFetch(loc, radiusKm);
          return;
        }
      }
    } catch (_) {}

    setIsLocating(false);
    setLocError('Could not detect your location. Please allow location access in your browser settings.');
  };

  // ─── Fetch services from OpenStreetMap ───────────────────────────────────────
  const doFetch = async (loc, km) => {
    if (!loc) return;

    // Cancel any previous in-flight request
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
      if (!ctrl.signal.aborted) {
        setFetchError('Could not reach OpenStreetMap. Check your internet connection and try again.');
      }
    } finally {
      if (!ctrl.signal.aborted) setIsFetching(false);
    }
  };

  // Auto-detect location on first load
  useEffect(() => { detectLocation(); }, []);

  // Re-fetch when radius changes (only if location already known)
  const handleRadiusChange = (km) => {
    setRadiusKm(km);
    if (userLocation) doFetch(userLocation, km);
  };

  // ─── Filter results ───────────────────────────────────────────────────────────
  const filtered = (results ?? []).filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.district ?? '').toLowerCase().includes(q) ||
      (item.address ?? '').toLowerCase().includes(q);
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  // ─── Category badge ───────────────────────────────────────────────────────────
  const badge = (category) => {
    if (category === 'Fire Dept')
      return (
        <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-400 bg-amber-950/70 px-2.5 py-0.5 rounded border border-amber-500/40 w-fit">
          <Flame className="w-3 h-3" /> FIRE & RESCUE
        </div>
      );
    if (category === 'Police Thana')
      return (
        <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-400 bg-blue-950/70 px-2.5 py-0.5 rounded border border-blue-500/40 w-fit">
          <Shield className="w-3 h-3" /> POLICE THANA
        </div>
      );
    if (category === 'Hospital')
      return (
        <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded border border-emerald-500/40 w-fit">
          <Stethoscope className="w-3 h-3" /> HOSPITAL
        </div>
      );
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-black text-red-400 bg-red-950/70 px-2.5 py-0.5 rounded border border-red-500/40 w-fit">
        <Siren className="w-3 h-3 animate-pulse" /> RESCUE SQUAD
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-red-500/20 text-red-400 text-xs font-black rounded-full border border-red-500/40">
              Live OpenStreetMap Data
            </span>
            {userLocation && !isLocating && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/40">
                Within {radiusKm} km of your location
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase">
            NEAREST EMERGENCY SERVICES
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Fire stations, police thanas, hospitals &amp; rescue squads near you — anywhere in India.
          </p>
        </div>

        {/* Location status bar */}
        {isLocating && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-amber-300">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-amber-400" />
            Detecting your location (GPS → IP fallback)…
          </div>
        )}
        {!isLocating && locError && (
          <div className="bg-red-950/60 border border-red-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-bold text-red-300">
            <span>{locError}</span>
            <button
              onClick={detectLocation}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-black text-[11px] shrink-0 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        {!isLocating && userLocation && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs font-bold text-amber-300">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span className="truncate">📍 {userLocation.label}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 shrink-0 hidden sm:inline">
              {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
            </span>
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search station, hospital, or area…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* Category filter buttons */}
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { key: 'ALL', label: 'All Services', activeClass: 'bg-red-600 text-white border-red-500' },
              { key: 'Fire Dept', label: 'Fire Dept', activeClass: 'bg-amber-600 text-white border-amber-500' },
              { key: 'Police Thana', label: 'Police Thana', activeClass: 'bg-blue-600 text-white border-blue-500' },
              { key: 'Hospital', label: 'Hospitals', activeClass: 'bg-emerald-600 text-white border-emerald-500' },
              { key: 'Rescue Squad', label: 'NDRF / SDRF', activeClass: 'bg-rose-600 text-white border-rose-500' },
            ].map(({ key, label, activeClass }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  selectedCategory === key
                    ? activeClass
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Radius selector */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">Radius:</span>
            {RADIUS_OPTIONS.map((km) => (
              <button
                key={km}
                onClick={() => handleRadiusChange(km)}
                disabled={isFetching}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-colors disabled:opacity-40 ${
                  radiusKm === km
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 text-amber-300 border-amber-500/30 hover:border-amber-400'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ── Body states ── */}

      {/* Detecting location */}
      {isLocating && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 text-sm">
          <Loader2 className="w-8 h-8 animate-spin text-red-400" />
          <p className="font-bold">Detecting your location…</p>
        </div>
      )}

      {/* Fetching from OSM */}
      {!isLocating && isFetching && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
          <p className="font-bold">Searching OpenStreetMap within {radiusKm} km…</p>
          <p className="text-xs text-slate-500">May take a few seconds</p>
        </div>
      )}

      {/* Fetch error */}
      {!isLocating && !isFetching && fetchError && (
        <div className="bg-red-950/50 border border-red-500/40 rounded-2xl p-8 text-center space-y-3">
          <Compass className="w-10 h-10 text-red-400 mx-auto" />
          <p className="font-black text-white text-sm">{fetchError}</p>
          <button
            onClick={() => doFetch(userLocation, radiusKm)}
            className="px-4 py-2 bg-red-600 text-white text-xs font-black rounded-xl"
          >
            Retry
          </button>
        </div>
      )}

      {/* No results from OSM */}
      {!isLocating && !isFetching && !fetchError && results !== null && filtered.length === 0 && (
        <div className="bg-slate-900/90 border border-slate-700 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white uppercase">
              {results.length === 0
                ? `No emergency services found within ${radiusKm} km`
                : 'No services match your search filter'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {results.length === 0
                ? 'OpenStreetMap returned no mapped emergency services in this area. Try a larger search radius.'
                : 'Clear your search or change category.'}
            </p>
          </div>
          {results.length === 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {RADIUS_OPTIONS.filter((r) => r > radiusKm).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRadiusChange(r)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all"
                >
                  Expand to {r} km <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          )}
          {results.length > 0 && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
              className="px-4 py-2 bg-slate-700 text-white font-black text-xs rounded-xl"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Results grid */}
      {!isLocating && !isFetching && filtered.length > 0 && (
        <>
          <p className="text-xs text-slate-500 font-bold px-1">
            Showing {filtered.length} emergency service{filtered.length !== 1 ? 's' : ''} within {radiusKm} km
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-red-500/50 rounded-2xl p-5 space-y-3 shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    {badge(item.category)}
                    {item.distanceKm != null && (
                      <span className="text-[11px] font-black px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 shrink-0">
                        📍 {item.distanceKm} km
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors leading-snug">
                    {item.name}
                  </h3>

                  <div className="space-y-0.5 text-xs text-slate-400 font-medium">
                    {item.district && (
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {item.district}
                      </div>
                    )}
                    {item.address && (
                      <p className="pl-4 text-[11px] leading-relaxed">{item.address}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <a
                    href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {item.phone}
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
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
