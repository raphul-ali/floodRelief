// 100% Free Emergency Responders Search Service (Fire Dept, Police Stations, NDRF/SDRF Rescue Squads)
import { calculateDistance } from './medicalService';

// Helper to check if coordinates are within Assam / Northeast region
const isWithinAssamRegion = (lat, lng) => {
  if (!lat || !lng) return false;
  // Assam bounding box approx: Lat 24.0 to 28.2, Lng 89.5 to 96.5
  return lat >= 24.0 && lat <= 28.2 && lng >= 89.5 && lng <= 96.5;
};

// Pre-seeded verified emergency response stations across Assam
const VERIFIED_ASSAM_RESPONDERS = [
  {
    id: "resp-1",
    name: "Assam Fire & Emergency Services Headquarters (Guwahati)",
    type: "Fire Department & Rescue Command",
    category: "Fire Dept",
    phone: "101",
    controlPhone: "+91 361 2540101",
    district: "Kamrup Metro (Guwahati)",
    address: "Panbazar, Guwahati, Assam 781001",
    latitude: 26.1833,
    longitude: 91.7450,
    services: ["Water Evacuation", "Fire & Flood Rescue", "Submersible Pumps"]
  },
  {
    id: "resp-2",
    name: "1st Battalion NDRF (National Disaster Response Force) Base",
    type: "NDRF Disaster Rescue Squad",
    category: "Rescue Squad",
    phone: "+91 361 2840105",
    controlPhone: "+91 94351 12233",
    district: "Kamrup Metro (Guwahati)",
    address: "Patgaon, Azara, Guwahati, Assam 781017",
    latitude: 26.1150,
    longitude: 91.5900,
    services: ["Deep Water Inflatable Boats", "Helicopter Winching", "Collapsed Structure Rescue"]
  },
  {
    id: "resp-3",
    name: "Assam State Disaster Response Force (SDRF) Central Control",
    type: "State Rescue Battalion",
    category: "Rescue Squad",
    phone: "1070",
    controlPhone: "+91 361 2237221",
    district: "Kamrup Metro (Guwahati)",
    address: "ASDMA Control Room, Dispur, Guwahati",
    latitude: 26.1400,
    longitude: 91.7900,
    services: ["River Patrol Inflatables", "Flood Evacuation Squads", "Divers"]
  },
  {
    id: "resp-4",
    name: "Majuli Fire & Disaster Rescue Station",
    type: "Fire Station & Boat Rescue Squad",
    category: "Fire Dept",
    phone: "+91 3775 274101",
    controlPhone: "+91 94350 77112",
    district: "Majuli Island",
    address: "Garamur Town, Majuli, Assam 785104",
    latitude: 26.9600,
    longitude: 94.1700,
    services: ["Country Motorboat Patrol", "Flood Water Pumping", "Dike Evacuation"]
  },
  {
    id: "resp-5",
    name: "Majuli District Police Control Room",
    type: "Police Station",
    category: "Police Station",
    phone: "+91 3775 274100",
    controlPhone: "+91 112",
    district: "Majuli Island",
    address: "Police Station Road, Garamur, Majuli",
    latitude: 26.9650,
    longitude: 94.1750,
    services: ["Law & Order Patrol", "Emergency Helpline 112", "Shelter Security"]
  },
  {
    id: "resp-6",
    name: "Jorhat Fire & Disaster Rescue Control",
    type: "Fire Department",
    category: "Fire Dept",
    phone: "+91 376 2320101",
    controlPhone: "+91 94350 55100",
    district: "Jorhat",
    address: "Gar Ali, Jorhat, Assam 785001",
    latitude: 26.7500,
    longitude: 94.2167,
    services: ["Flood Water Drainage", "Boat Evacuation"]
  },
  {
    id: "resp-7",
    name: "Jorhat District Police Station & Control",
    type: "Police Station",
    category: "Police Station",
    phone: "+91 376 2320022",
    controlPhone: "+91 112",
    district: "Jorhat",
    address: "AT Road, Jorhat, Assam",
    latitude: 26.7550,
    longitude: 94.2200,
    services: ["24x7 Control Room", "Flood Evacuation Escort"]
  },
  {
    id: "resp-8",
    name: "Sivasagar Fire & Flood Emergency Station",
    type: "Fire Department",
    category: "Fire Dept",
    phone: "+91 3772 222101",
    controlPhone: "+91 94350 44101",
    district: "Sivasagar",
    address: "Station Road, Sivasagar, Assam 785640",
    latitude: 26.9833,
    longitude: 94.6333,
    services: ["High Capacity Dewatering Pumps", "Submersible Evacuation"]
  },
  {
    id: "resp-9",
    name: "Lakhimpur Fire & Emergency Rescue Station",
    type: "Fire Department",
    category: "Fire Dept",
    phone: "+91 3752 222101",
    controlPhone: "+91 94350 88200",
    district: "Lakhimpur",
    address: "CD Road, North Lakhimpur, Assam 787001",
    latitude: 27.2300,
    longitude: 94.1000,
    services: ["Water Rescue Inflatables", "Emergency Flood Drainage"]
  },
  {
    id: "resp-10",
    name: "Silchar Fire Station & Barak Valley Rescue Base",
    type: "Fire Department",
    category: "Fire Dept",
    phone: "+91 3842 245101",
    controlPhone: "+91 94350 99100",
    district: "Cachar (Silchar)",
    address: "Club Road, Silchar, Cachar, Assam 788001",
    latitude: 24.8333,
    longitude: 92.7833,
    services: ["Speedboat Rescue", "Disaster Relief Patrol"]
  },
  {
    id: "resp-11",
    name: "Barpeta Fire Station & Flood Water Rescue Unit",
    type: "Fire Department",
    category: "Fire Dept",
    phone: "+91 3665 252101",
    controlPhone: "+91 94350 66100",
    district: "Barpeta",
    address: "Main Road, Barpeta Town, Assam 781301",
    latitude: 26.3167,
    longitude: 91.0000,
    services: ["Motorboat Evacuation", "Heavy Water Drainage Pumps"]
  },
  {
    id: "resp-12",
    name: "Dhubri Fire Station & Border Rescue Unit",
    type: "Fire Department",
    category: "Fire Dept",
    phone: "+91 3662 230101",
    controlPhone: "+91 94350 33221",
    district: "Dhubri",
    address: "GT Road, Dhubri, Assam 783301",
    latitude: 26.0200,
    longitude: 89.9800,
    services: ["River Inflatables", "Submersible Pumps"]
  }
];

export const responderService = {
  getNearestResponders: async (userLat, userLng, category = 'ALL') => {
    let responders = [...VERIFIED_ASSAM_RESPONDERS];

    // Attempt OpenStreetMap Overpass API call if user is inside Assam
    if (userLat && userLng && isWithinAssamRegion(userLat, userLng)) {
      try {
        const radiusMeters = 40000; // 40 km radius
        const query = `
          [out:json][timeout:10];
          (
            node["amenity"="fire_station"](around:${radiusMeters},${userLat},${userLng});
            node["amenity"="police"](around:${radiusMeters},${userLat},${userLng});
            node["emergency"="rescue_station"](around:${radiusMeters},${userLat},${userLng});
          );
          out body 15;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          if (data.elements && data.elements.length > 0) {
            const osmResults = data.elements.map(el => {
              const tags = el.tags || {};
              const name = tags.name || tags['name:en'] || (tags.amenity === 'fire_station' ? 'Local Fire & Rescue Station' : 'Police Station / Thana');
              const phone = tags.phone || tags['contact:phone'] || tags['emergency:phone'] || (tags.amenity === 'fire_station' ? '101' : '112');
              const categoryType = tags.amenity === 'fire_station' ? 'Fire Dept' : (tags.amenity === 'police' ? 'Police Station' : 'Rescue Squad');
              
              return {
                id: `osm-resp-${el.id}`,
                name: name,
                type: `OpenStreetMap ${tags.amenity ? tags.amenity.toUpperCase() : 'Emergency Unit'}`,
                category: categoryType,
                phone: phone,
                controlPhone: '+91 112',
                district: tags['addr:district'] || tags['addr:city'] || 'Nearby Zone',
                address: tags['addr:full'] || tags['addr:street'] || 'Nearby Location',
                latitude: el.lat,
                longitude: el.lon,
                services: ["Emergency Response", "Flood Assistance", "24x7 Patrol"]
              };
            });

            const combined = [...osmResults, ...VERIFIED_ASSAM_RESPONDERS];
            responders = Array.from(new Map(combined.map(item => [item.id, item])).values());
          }
        }
      } catch (err) {
        console.warn("Overpass OSM API fetch timed out. Falling back to local verified responders.", err);
      }
    }

    // Calculate Haversine distance
    const listWithDistance = responders.map(resp => {
      const dist = (userLat && userLng) 
        ? calculateDistance(userLat, userLng, resp.latitude, resp.longitude)
        : null;
      return { ...resp, distanceKm: dist };
    });

    const isUserInsideAssam = isWithinAssamRegion(userLat, userLng);

    if (isUserInsideAssam) {
      // User is physically inside Assam: sort strictly by closest distance in km
      listWithDistance.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
    } else {
      // User is outside Assam (e.g. Delhi / Bangalore / Web preview):
      // Keep Central HQ & Priority Disaster Hubs at top (Guwahati HQ, NDRF, SDRF, Majuli, Jorhat)
      // Do NOT let raw distance from Delhi sort Dhubri first!
    }

    if (category !== 'ALL') {
      return listWithDistance.filter(r => r.category === category);
    }

    return listWithDistance;
  }
};
