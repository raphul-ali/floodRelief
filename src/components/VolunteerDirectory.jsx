import React, { useState } from 'react';
import { 
  Users, Phone, MessageSquare, Instagram, Globe, Plus, X, 
  Sparkles, CheckCircle2, MapPin, Share2, HeartHandshake, ShieldCheck, Megaphone, Anchor, Stethoscope
} from 'lucide-react';
import { storageService, ASSAM_DISTRICTS, VOLUNTEER_ROLES } from '../services/storageService';

export default function VolunteerDirectory({ volunteers = [] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    name: '',
    roleType: 'Social Media Influencer / Fundraiser',
    phone: '',
    whatsapp: '',
    district: 'Kamrup Metro (Guwahati)',
    socialLink: '',
    followersCount: '',
    offerings: ''
  });

  const filteredVolunteers = volunteers.filter(vol => {
    const matchesRole = roleFilter === 'ALL' || vol.roleType === roleFilter;
    const matchesDistrict = districtFilter === 'ALL' || vol.district === districtFilter;
    return matchesRole && matchesDistrict;
  });

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please enter your Name and Contact Phone Number.");
      return;
    }

    storageService.addVolunteer({
      ...formData,
      whatsapp: formData.whatsapp || formData.phone.replace(/[^0-9]/g, '')
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      roleType: 'Social Media Influencer / Fundraiser',
      phone: '',
      whatsapp: '',
      district: 'Kamrup Metro (Guwahati)',
      socialLink: '',
      followersCount: '',
      offerings: ''
    });

    alert("Thank you! Your volunteer profile is now live. Victims and NGOs can connect with you.");
  };

  const getRoleIcon = (roleType) => {
    if (roleType.includes('Influencer') || roleType.includes('Fundraiser')) return <Megaphone className="w-4 h-4 text-purple-400" />;
    if (roleType.includes('Boat')) return <Anchor className="w-4 h-4 text-blue-400" />;
    if (roleType.includes('Medical')) return <Stethoscope className="w-4 h-4 text-rose-400" />;
    return <Sparkles className="w-4 h-4 text-amber-400" />;
  };

  const getWhatsAppLink = (phone, text) => {
    if (!phone) return '#';
    let formatted = phone.replace(/[^0-9]/g, '');
    if (formatted.length === 10) formatted = '91' + formatted;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Community Relief Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            INDIVIDUAL VOLUNTEERS & INFLUENCER RELIEF NETWORK
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Content creators, influencers, boat owners, medical professionals, and citizen volunteers amplifying distress signals, organizing boat transport, and distributing local aid.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-xl shadow-purple-900/40 transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>JOIN AS VOLUNTEER / INFLUENCER</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
          
          <span className="font-bold text-slate-400">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-400"
          >
            <option value="ALL">All Volunteer Roles</option>
            {VOLUNTEER_ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <span className="font-bold text-slate-400">District:</span>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Assam Districts</option>
            {ASSAM_DISTRICTS.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>

        </div>

        <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          {filteredVolunteers.length} Active Helpers Listed
        </span>
      </div>

      {/* Volunteer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVolunteers.map((vol) => (
          <div key={vol.id} className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between transition-all">
            
            <div className="space-y-3">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-500/30 w-fit">
                    {getRoleIcon(vol.roleType)}
                    <span>{vol.roleType}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-2">{vol.name}</h3>
                  {vol.followersCount && (
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 inline-block mt-1">
                      ⭐ {vol.followersCount}
                    </span>
                  )}
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {vol.availableStatus || 'Active Now'}
                </span>
              </div>

              {/* District */}
              <div className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold bg-slate-950 p-2 rounded-xl border border-slate-800">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>Operating Zone: <strong className="text-amber-400">{vol.district}</strong></span>
              </div>

              {/* Offerings */}
              <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed italic">
                "{vol.offerings}"
              </div>

            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <a
                href={`tel:${vol.phone}`}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Helper</span>
              </a>

              {vol.whatsapp && (
                <a
                  href={getWhatsAppLink(vol.whatsapp || vol.phone, `Hello ${vol.name}, reaching out regarding Assam flood relief.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 bg-emerald-950 border border-emerald-700 text-emerald-400 hover:bg-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Chat on WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              )}

              {vol.socialLink && (
                <a
                  href={vol.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 bg-purple-950 border border-purple-700 text-purple-300 hover:bg-purple-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="View Social Profile"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Register Volunteer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>VOLUNTEER & INFLUENCER REGISTRATION</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Your Name / Social Handle *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bishal Dutta (@AssamExplorer)"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Volunteer Role *</label>
                  <select
                    value={formData.roleType}
                    onChange={(e) => setFormData(prev => ({ ...prev, roleType: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-bold text-purple-300"
                  >
                    {VOLUNTEER_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Assam District *</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-bold text-amber-300"
                  >
                    {ASSAM_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Social Media Profile (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/yourhandle"
                    value={formData.socialLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, socialLink: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Followers / Audience Reach (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 50K Followers, 100K YouTube Subscribers"
                  value={formData.followersCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, followersCount: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">How can you help? (Resources / Logistics / Amplification) *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Can amplify SOS posts to 50k followers, possess 1 country boat for evacuation, distribution of 200 food packets daily"
                  value={formData.offerings}
                  onChange={(e) => setFormData(prev => ({ ...prev, offerings: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
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
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-500 text-white font-bold rounded-lg shadow-md"
                >
                  Publish Volunteer Profile
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
