import re

with open('src/components/AdminDashboard.jsx', 'r') as f:
    content = f.read()

# Replace SOS Card Details section
old_sos_details = """                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <p className="text-slate-700"><strong className="text-slate-900">Impacted:</strong> {req.familiesCount > 0 ? `${req.familiesCount} Families` : `${req.peopleCount || 1} People`}</p>
                        <p className="text-slate-700"><strong className="text-slate-900">Phone:</strong> {req.phone}</p>"""

new_sos_details = """                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {req.needs && req.needs.map((need, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-semibold">{need}</span>
                        ))}
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                           <p className="text-slate-700 flex flex-col"><strong className="text-slate-900 mb-0.5">Demographics:</strong> <span>{req.peopleCount || 1} People ({req.malesCount||0}M, {req.femalesCount||0}F, {req.childrenCount||0}C)</span></p>
                           <p className="text-slate-700 flex flex-col"><strong className="text-slate-900 mb-0.5">Condition:</strong> <span>Urgency: {req.urgency || 'HIGH'}<br/>{req.groundCondition}</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                           <p className="text-slate-700 flex flex-col"><strong className="text-slate-900 mb-0.5">Contact:</strong> <span>{req.phone}{req.altPhone ? ` / ${req.altPhone}` : ''}</span></p>
                           <p className="text-slate-700 flex flex-col"><strong className="text-slate-900 mb-0.5">Reported By:</strong> <span>{req.requestedByName} ({req.requestedByRole})<br/>{req.requestedByPhone}</span></p>
                        </div>
                        <div className="pt-1">
                           <p className="text-slate-700"><strong className="text-slate-900">Location Details:</strong> {req.locationName} {req.landmark ? `(Landmark: ${req.landmark})` : ''} {req.pinCode ? `- ${req.pinCode}` : ''}</p>
                           {req.latitude && req.longitude && (
                             <a href={`https://www.google.com/maps/search/?api=1&query=${req.latitude},${req.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold flex items-center gap-1 mt-1 hover:underline">
                               <MapPin className="w-3.5 h-3.5" /> View on Maps ({req.latitude.toFixed(4)}, {req.longitude.toFixed(4)})
                             </a>
                           )}
                           {req.details && <p className="text-slate-700 mt-2 bg-white p-2 border border-slate-200 rounded-lg"><strong className="text-slate-900">Notes:</strong> {req.details}</p>}
                        </div>"""

content = content.replace(old_sos_details, new_sos_details)

# Write back
with open('src/components/AdminDashboard.jsx', 'w') as f:
    f.write(content)

