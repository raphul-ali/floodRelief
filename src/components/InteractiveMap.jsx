import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { AlertTriangle, MapPin, Phone, ShieldAlert, HeartHandshake } from 'lucide-react';
import { pdfService } from '../services/pdfService';
import { authService } from '../services/authService';

export default function InteractiveMap({ victimRequests = [], ngos = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Map centered over Assam Valley (26.3200, 92.0000)
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [26.3200, 92.0000],
        zoom: 8,
        zoomControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    if (map._layerGroup) {
      map._layerGroup.clearLayers();
    } else {
      map._layerGroup = L.layerGroup().addTo(map);
    }

    const bounds = [];

    const createRedPin = () => L.divIcon({
      className: 'custom-pin-wrapper',
      html: `<div class="custom-pin-urgent"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const createAmberPin = () => L.divIcon({
      className: 'custom-pin-wrapper',
      html: `<div class="custom-pin-standard"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const createNgoPin = () => L.divIcon({
      className: 'custom-pin-wrapper',
      html: `<div class="custom-pin-ngo"></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const currentAuth = authService.getCurrentUser();
    const isAuthorizedUser = currentAuth && (currentAuth.role === 'NGO' || currentAuth.role === 'VOLUNTEER' || currentAuth.role === 'ADMIN');

    // Add Victim Markers
    victimRequests.forEach((victim) => {
      if (!victim.latitude || !victim.longitude) return;

      const latLng = [victim.latitude, victim.longitude];
      bounds.push(latLng);

      const icon = victim.isUrgentRescue ? createRedPin() : createAmberPin();

      const maskedPhone = victim.phone ? `+91 ******${victim.phone.slice(-4)}` : 'Protected';
      const phoneButtonHtml = isAuthorizedUser
        ? `<a href="tel:${victim.phone}" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded inline-flex items-center gap-1">Call ${victim.phone}</a>`
        : `<div class="bg-slate-900 border border-slate-700 text-amber-300 text-[11px] font-bold px-2.5 py-1.5 rounded-lg">Contact: ${maskedPhone} (Log in as NGO/Volunteer to view)</div>`;

      const popupContent = document.createElement('div');
      popupContent.className = "p-1 space-y-2 font-sans";
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5">
          <span class="font-black text-sm ${victim.isUrgentRescue ? 'text-red-400' : 'text-amber-400'}">
            ${victim.isUrgentRescue ? 'ASSAM STRANDED SOS' : 'RELIEF REQUEST'}
          </span>
          <span class="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">${victim.status}</span>
        </div>
        <div>
          <div class="font-extrabold text-sm text-white">${victim.name}</div>
          <div class="text-xs text-amber-300 font-bold">District: ${victim.district || 'Assam'}</div>
          <div class="text-xs text-slate-300 mt-0.5">${victim.peopleCount > 0 ? victim.peopleCount + ' People trapped' : (victim.familiesCount > 0 ? victim.familiesCount + ' Families trapped' : '0 People trapped')}</div>
          <div class="text-[11px] text-slate-400 mt-1">Needs: ${(Array.isArray(victim.needs) ? victim.needs.join(', ') : victim.needs)}</div>
        </div>
        <div class="pt-2 flex items-center justify-between gap-2">
          ${phoneButtonHtml}
        </div>
      `;

      const marker = L.marker(latLng, { icon }).bindPopup(popupContent);
      map._layerGroup.addLayer(marker);
    });

    // Add Assam NGO Base Markers
    ngos.forEach((ngo, i) => {
      const ngoCoords = [26.1833 + (i * 0.15), 91.7500 + (i * 0.2)];
      bounds.push(ngoCoords);

      const popupContent = document.createElement('div');
      popupContent.className = "p-1 space-y-1 font-sans";
      popupContent.innerHTML = `
        <div class="font-bold text-xs text-blue-400">ASSAM RESCUE BASE</div>
        <div class="font-black text-sm text-white">${ngo.name}</div>
        <div class="text-xs text-slate-300">${ngo.phone}</div>
        <div class="text-[11px] text-slate-400">Zones: ${ngo.operatingZones.slice(0, 3).join(', ')}</div>
      `;

      const marker = L.marker(ngoCoords, { icon: createNgoPin() }).bindPopup(popupContent);
      map._layerGroup.addLayer(marker);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    }

  }, [victimRequests, ngos]);

  return (
    <div className="space-y-4">
      {/* Map Header & Legend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <span>LIVE ASSAM FLOOD SOS & RESCUE MAP</span>
          </h3>
          <p className="text-xs text-slate-400">Real-time geographic coordinates of victims in Majuli, Barpeta, Lakhimpur & Cachar.</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse border border-white"></span>
            <span className="text-red-300">Stranded / Motorboat Evacuation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white"></span>
            <span className="text-amber-300">Food & Water Request</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 rotate-45 border border-white"></span>
            <span className="text-blue-300">Assam SDRF / NGO Base</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[65vh] min-h-[450px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}
