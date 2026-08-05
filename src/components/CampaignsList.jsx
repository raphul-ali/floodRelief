import React from 'react';
import { Megaphone, MapPin, Calendar, Activity, User, MessageCircle, ExternalLink, Users } from 'lucide-react';

export default function CampaignsList({ campaigns }) {
  const activeCampaigns = campaigns.filter(c => c.status === 'Active');
  
  return (
    <div className="space-y-5">
      {/* Section header card */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="status-chip status-chip-info text-[10px] sm:text-xs py-0.5 sm:py-1">
            <Megaphone className="w-3 h-3" />
            Active Campaigns
          </span>
        </div>
        <h2 className="text-lg sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          Relief Campaigns
        </h2>
        <p className="hidden sm:block text-sm text-slate-500 max-w-xl">
          Join or support ongoing relief campaigns organized by verified NGOs and government agencies.
        </p>
      </div>

      {activeCampaigns.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Active Campaigns</h3>
          <p className="text-slate-500 text-sm mt-1">There are no ongoing campaigns at the moment. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCampaigns.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full">
              <div className="mb-4 flex flex-wrap gap-2 items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
                {c.campaign_type && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-full uppercase tracking-wider">
                    {c.campaign_type}
                  </span>
                )}
                {c.target_count && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-full uppercase tracking-wider">
                    <Users className="w-3 h-3" />
                    {c.target_count}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{c.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">{c.description}</p>
              
              <div className="space-y-2 mt-auto pt-4 border-t border-slate-100 text-sm font-medium text-slate-600">
                {c.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{c.date}</span>
                  </div>
                )}
                {c.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="line-clamp-1">{c.location}</span>
                  </div>
                )}
                {c.contact_person && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{c.contact_person}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                {c.whatsapp_number && (
                  <a
                    href={`https://wa.me/${c.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I am reaching out regarding the ${c.title} campaign.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-bold rounded-full text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact</span>
                  </a>
                )}
                {c.map_link && (
                  <a
                    href={c.map_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-full text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>View Map</span>
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
