import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Megaphone, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export default function CampaignsAdmin() {
  const [campaigns, setCampaigns] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [targetCount, setTargetCount] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCampaignType, setEditCampaignType] = useState('');
  const [editTargetCount, setEditTargetCount] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editWhatsappNumber, setEditWhatsappNumber] = useState('');
  const [editMapLink, setEditMapLink] = useState('');

  const loadData = () => {
    setCampaigns(storageService.getCampaigns());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('flood_data_changed', loadData);
    return () => window.removeEventListener('flood_data_changed', loadData);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");
    await storageService.addCampaign({ 
      title, description, location, date, status: 'Active',
      campaign_type: campaignType,
      target_count: targetCount,
      contact_person: contactPerson,
      whatsapp_number: whatsappNumber,
      map_link: mapLink
    });
    setTitle('');
    setDescription('');
    setLocation('');
    setDate('');
    setCampaignType('');
    setTargetCount('');
    setContactPerson('');
    setWhatsappNumber('');
    setMapLink('');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this campaign?")) {
      await storageService.deleteCampaign(id);
    }
  };

  const startEdit = (c) => {
    setIsEditing(c.id);
    setEditTitle(c.title);
    setEditDescription(c.description || '');
    setEditLocation(c.location || '');
    setEditDate(c.date || '');
    setEditCampaignType(c.campaign_type || '');
    setEditTargetCount(c.target_count || '');
    setEditContactPerson(c.contact_person || '');
    setEditWhatsappNumber(c.whatsapp_number || '');
    setEditMapLink(c.map_link || '');
  };

  const handleUpdate = async () => {
    await storageService.updateCampaign(isEditing, {
      title: editTitle,
      description: editDescription,
      location: editLocation,
      date: editDate,
      campaign_type: editCampaignType,
      target_count: editTargetCount,
      contact_person: editContactPerson,
      whatsapp_number: editWhatsappNumber,
      map_link: editMapLink
    });
    setIsEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-500" />
          Add New Campaign
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Campaign Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white md:col-span-2" required />
            <input type="text" placeholder="Campaign Type (e.g. Medical, Free House)" value={campaignType} onChange={e => setCampaignType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white" />
            <input type="text" placeholder="Target Count (e.g. 50 ppl)" value={targetCount} onChange={e => setTargetCount(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white" />
            <input type="text" placeholder="Date / Duration" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white" />
            <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white" />
            <input type="text" placeholder="Contact Person" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white" />
            <input type="text" placeholder="WhatsApp Number (e.g. +91XXXXXXXXXX)" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white" />
            <input type="text" placeholder="Google Maps Link" value={mapLink} onChange={e => setMapLink(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white md:col-span-2" />
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white md:col-span-2 min-h-[100px]"></textarea>
          </div>
          <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Campaign
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-800">All Campaigns</h3>
        {campaigns.length === 0 ? (
          <p className="text-slate-500 text-sm">No campaigns found.</p>
        ) : (
          campaigns.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              {isEditing === c.id ? (
                <div className="space-y-3">
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={editCampaignType} onChange={e => setEditCampaignType(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Campaign Type" />
                    <input type="text" value={editTargetCount} onChange={e => setEditTargetCount(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Target Count" />
                    <input type="text" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Date" />
                    <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Location" />
                    <input type="text" value={editContactPerson} onChange={e => setEditContactPerson(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Contact Person" />
                    <input type="text" value={editWhatsappNumber} onChange={e => setEditWhatsappNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="WhatsApp Number" />
                  </div>
                  <input type="text" value={editMapLink} onChange={e => setEditMapLink(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Map Link" />
                  <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[80px]" placeholder="Description" />
                  <div className="flex gap-2">
                    <button onClick={handleUpdate} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"><Save className="w-4 h-4"/> Save</button>
                    <button onClick={() => setIsEditing(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"><X className="w-4 h-4"/> Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{c.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{c.description}</p>
                    <div className="flex gap-4 mt-3 text-xs font-semibold text-slate-600 flex-wrap">
                      {c.campaign_type && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{c.campaign_type}</span>}
                      {c.target_count && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">{c.target_count}</span>}
                      {c.date && <span>{c.date}</span>}
                      {c.location && <span>{c.location}</span>}
                      {c.contact_person && <span>Contact: {c.contact_person}</span>}
                      {c.whatsapp_number && (
                        <a 
                          href={`https://wa.me/${c.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I am reaching out regarding the ${c.title} campaign.`)}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-green-600 hover:text-green-700 underline"
                        >
                          Contact in WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => startEdit(c)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
