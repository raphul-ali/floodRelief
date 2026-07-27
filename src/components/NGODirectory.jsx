import React, { useState } from 'react';
import { HeartHandshake, Phone, MessageSquare, Mail, MapPin, ShieldCheck, Plus, X, Users, CheckCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function NGODirectory({ ngos = [] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNgo, setNewNgo] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    operatingZones: 'All Zones',
    services: 'Motorized Rescue Boats, Cooked Food Distribution, Medical Aid',
    address: ''
  });

  const handleAddNgo = (e) => {
    e.preventDefault();
    if (!newNgo.name || !newNgo.phone) {
      alert("Please provide NGO Name and Contact Phone Number.");
      return;
    }

    const zonesArray = newNgo.operatingZones.split(',').map(z => z.trim());
    const servicesArray = newNgo.services.split(',').map(s => s.trim());

    storageService.addNGO({
      ...newNgo,
      operatingZones: zonesArray,
      services: servicesArray,
      whatsapp: newNgo.whatsapp || newNgo.phone.replace(/[^0-9]/g, '')
    });

    setShowAddModal(false);
    setNewNgo({
      name: '',
      contactPerson: '',
      phone: '',
      whatsapp: '',
      email: '',
      operatingZones: 'All Zones',
      services: 'Motorized Rescue Boats, Cooked Food Distribution, Medical Aid',
      address: ''
    });

    alert("NGO successfully registered! Victims can now view your contact details.");
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-amber-400" />
            <span>ACTIVE NGOS & RESCUE ORGANIZATIONS DIRECTORY</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Victims and field volunteers can reach out directly to registered NGOs operating in their district.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTER NEW NGO / RESCUE UNIT</span>
        </button>
      </div>

      {/* NGO Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ngos.map((ngo) => (
          <div key={ngo.id} className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between transition-all">
            
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>VERIFIED DISASTER RESPONSE TEAM</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">{ngo.name}</h3>
                  <p className="text-xs text-slate-400">Contact Person: <span className="text-slate-200 font-semibold">{ngo.contactPerson}</span></p>
                </div>
              </div>

              {/* Operating Zones */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coverage Areas:</span>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(ngo.operatingZones) && ngo.operatingZones.map((zone, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-[11px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-md">
                      📍 {zone}
                    </span>
                  ))}
                </div>
              </div>

              {/* Services offered */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Capabilities & Supplies:</span>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(ngo.services) && ngo.services.map((srv, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 text-slate-300 rounded-md">
                      ✓ {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Address */}
              {ngo.address && (
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{ngo.address}</span>
                </div>
              )}
            </div>

            {/* Direct Contact Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <a
                href={`tel:${ngo.phone}`}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call NGO</span>
              </a>

              {ngo.whatsapp && (
                <a
                  href={`https://wa.me/${ngo.whatsapp.replace(/[^0-9]/g, '')}?text=Emergency%20Flood%20Relief%20Inquiry`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-emerald-950 border border-emerald-700 text-emerald-400 hover:bg-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Add NGO Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-400" />
                <span>REGISTER NGO / VOLUNTEER TEAM</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNgo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">NGO / Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Disaster Rescue Volunteers"
                  value={newNgo.name}
                  onChange={(e) => setNewNgo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Capt. Rajesh Verma"
                    value={newNgo.contactPerson}
                    onChange={(e) => setNewNgo(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone Number (Hotline) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={newNgo.phone}
                    onChange={(e) => setNewNgo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Coverage Zones (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. North Zone, Central Zone, Rural East"
                  value={newNgo.operatingZones}
                  onChange={(e) => setNewNgo(prev => ({ ...prev, operatingZones: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Services & Supplies Offered</label>
                <input
                  type="text"
                  placeholder="e.g. Rescue Boats, Food Packets, Medical Ambulances"
                  value={newNgo.services}
                  onChange={(e) => setNewNgo(prev => ({ ...prev, services: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Base Camp Address / Control Room Location</label>
                <input
                  type="text"
                  placeholder="e.g. Community Center, Main Road"
                  value={newNgo.address}
                  onChange={(e) => setNewNgo(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-md"
                >
                  Save & Publish NGO
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
