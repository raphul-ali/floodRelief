// Emergency Services Locator — Live OpenStreetMap only, no static fallback
// Haversine Distance Formula (returns distance in km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

function buildQuery(lat, lng, radiusMeters) {
  return [
    '[out:json][timeout:10];',
    '(',
    `  node["amenity"="fire_station"](around:${radiusMeters},${lat},${lng});`,
    `  node["amenity"="police"](around:${radiusMeters},${lat},${lng});`,
    `  node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});`,
    `  node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});`,
    `  node["emergency"="rescue_station"](around:${radiusMeters},${lat},${lng});`,
    `  way["amenity"="fire_station"](around:${radiusMeters},${lat},${lng});`,
    `  way["amenity"="police"](around:${radiusMeters},${lat},${lng});`,
    `  way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});`,
    ');',
    'out center 60;',
  ].join('\n');
}

function parseElement(el, userLat, userLng) {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat ?? null;
  const lon = el.lon ?? el.center?.lon ?? null;
  if (lat == null || lon == null) return null;

  let category = 'Emergency Unit';
  if (tags.amenity === 'fire_station') category = 'Fire Dept';
  else if (tags.amenity === 'police') category = 'Police Thana';
  else if (tags.amenity === 'hospital' || tags.amenity === 'clinic') category = 'Hospital';
  else if (tags.emergency === 'rescue_station') category = 'Rescue Squad';

  const name =
    tags.name ||
    tags['name:en'] ||
    (category === 'Fire Dept'
      ? 'Fire & Rescue Station'
      : category === 'Police Thana'
      ? 'Police Station / Thana'
      : category === 'Hospital'
      ? 'Hospital / Clinic'
      : 'Emergency Unit');

  const phone =
    tags.phone ||
    tags['contact:phone'] ||
    tags['emergency:phone'] ||
    (category === 'Fire Dept' ? '101' : category === 'Hospital' ? '108' : '112');

  return {
    id: `osm-${el.id}`,
    name,
    category,
    phone,
    district:
      tags['addr:district'] ||
      tags['addr:city'] ||
      tags['addr:suburb'] ||
      tags['addr:state'] ||
      null,
    address:
      tags['addr:full'] ||
      [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') ||
      null,
    latitude: lat,
    longitude: lon,
    distanceKm: calculateDistance(userLat, userLng, lat, lon),
  };
}

import offlineEmergencyUnits from '../data/emergencyData.json';

// Combined offline emergency stations dataset (Police, Fire, SDRF, Hospitals)
export const VERIFIED_EMERGENCY_UNITS = offlineEmergencyUnits;

/**
 * Fetch nearest emergency services within radiusKm of (lat, lng).
 * Tries Overpass servers in sequence. Fallbacks to pre-seeded verified emergency units on failure/empty.
 */
export async function fetchNearestServices(lat, lng, radiusKm = 50, signal = null) {
  let osmResults = [];

  if (lat != null && lng != null) {
    const query = buildQuery(lat, lng, radiusKm * 1000);
    const url = (server) => `${server}?data=${encodeURIComponent(query)}`;

    for (const server of OVERPASS_SERVERS) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 7000);

      const onExternalAbort = () => ctrl.abort();
      signal?.addEventListener('abort', onExternalAbort);

      try {
        const res = await fetch(url(server), { signal: ctrl.signal });
        clearTimeout(timer);
        signal?.removeEventListener('abort', onExternalAbort);

        if (signal?.aborted) return [];
        if (!res.ok) continue;

        const data = await res.json();
        if (!data.elements?.length) continue;

        osmResults = data.elements
          .map((el) => parseElement(el, lat, lng))
          .filter(Boolean);

        if (osmResults.length > 0) break;
      } catch (err) {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onExternalAbort);
        if (err.name === 'AbortError' && signal?.aborted) return [];
      }
    }
  }

  // Combine live OpenStreetMap results + verified fallback units
  const combined = [...osmResults];
  const osmIds = new Set(osmResults.map(r => r.name.toLowerCase()));

  for (const unit of VERIFIED_EMERGENCY_UNITS) {
    if (!osmIds.has(unit.name.toLowerCase())) {
      const dist = (lat != null && lng != null)
        ? calculateDistance(lat, lng, unit.latitude, unit.longitude)
        : null;
      combined.push({
        ...unit,
        distanceKm: dist
      });
    }
  }

  // Sort by distance if location available
  if (lat != null && lng != null) {
    combined.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  }

  return combined;
}

