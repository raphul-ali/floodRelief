import re

with open('src/components/VictimRequestForm.jsx', 'r') as f:
    content = f.read()

# 1. Redesign Mode Toggles (Top Tabs)
# Replace the container first
content = re.sub(
    r'<div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-2">',
    '<div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 flex items-center gap-2">',
    content
)
# Emergency Boat Rescue Tab
content = re.sub(
    r'className={`flex-1 py-2\.5 px-3\.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer \$\{\n              formData\.isUrgentRescue\n                \? \'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800\'\n                : \'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 active:bg-gray-100\'\n            \}`\}',
    'className={`flex-1 py-3 px-4 rounded-xl text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${formData.isUrgentRescue ? \'bg-slate-900 text-white shadow-sm\' : \'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50\'}`}',
    content
)
# Food Material Relief Tab
content = re.sub(
    r'className={`flex-1 py-2\.5 px-3\.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer \$\{\n              !formData\.isUrgentRescue\n                \? \'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800\'\n                : \'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 active:bg-gray-100\'\n            \}`\}',
    'className={`flex-1 py-3 px-4 rounded-xl text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${!formData.isUrgentRescue ? \'bg-slate-900 text-white shadow-sm\' : \'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50\'}`}',
    content
)

# 2. Redesign Labels (Muted, sophisticated)
content = content.replace(
    'block text-xs font-bold text-slate-700 mb-1',
    'block text-[13px] font-medium text-slate-500 mb-1.5'
)
# Any remaining uppercase tracking-wider labels
content = re.sub(
    r'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5',
    r'text-[13px] font-medium text-slate-500 mb-1.5',
    content
)
content = re.sub(
    r'text-xs font-semibold text-gray-500 uppercase tracking-wider',
    r'text-[13px] font-medium text-slate-500',
    content
)


# 3. Redesign Inputs
# Make them clean with focus:border-slate-400
content = re.sub(
    r'bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500',
    r'w-full bg-white border border-slate-200 rounded-xl text-slate-800 text-[14px] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 shadow-sm',
    content
)

# 4. Redesign Ground Condition Pills
# Active: border-slate-900 text-slate-900. Inactive: border-slate-200 text-slate-500
content = re.sub(
    r'\'bg-blue-50 border-blue-300 text-blue-800 shadow-sm ring-2 ring-blue-500/20\'',
    r"'bg-white border-slate-900 text-slate-900 shadow-sm ring-1 ring-slate-900'",
    content
)
content = re.sub(
    r'\'bg-amber-50 border-amber-300 text-amber-800 shadow-sm ring-2 ring-amber-500/20\'',
    r"'bg-white border-slate-900 text-slate-900 shadow-sm ring-1 ring-slate-900'",
    content
)
content = re.sub(
    r'\'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20\'',
    r"'bg-white border-slate-900 text-slate-900 shadow-sm ring-1 ring-slate-900'",
    content
)
content = re.sub(
    r'\'bg-red-50 border-red-300 text-red-800 shadow-sm ring-2 ring-red-500/20\'',
    r"'bg-white border-slate-900 text-slate-900 shadow-sm ring-1 ring-slate-900'",
    content
)
content = re.sub(
    r'\'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300\'',
    r"'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'",
    content
)

# Ground Condition text dynamic colors - make them subtle slate
content = content.replace('text-blue-800', 'text-slate-700')
content = content.replace('text-blue-900', 'text-slate-800')
content = content.replace('text-amber-800', 'text-slate-700')
content = content.replace('text-amber-900', 'text-slate-800')
content = content.replace('text-emerald-800', 'text-slate-700')
content = content.replace('text-emerald-900', 'text-slate-800')
content = content.replace('text-blue-600', 'text-slate-700')
content = content.replace('text-amber-600', 'text-slate-700')
content = content.replace('text-emerald-600', 'text-slate-700')

# 5. Redesign Submit Button
# Use sleek Slate-900 for submit button
content = re.sub(
    r'className="w-full py-4 rounded-xl font-bold text-base text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 transition-colors active:scale-\[0\.98\] disabled:opacity-60 disabled:cursor-not-allowed min-h-\[52px\]"',
    'className="w-full py-4 rounded-xl font-semibold text-[15px] text-white bg-slate-900 hover:bg-slate-800 shadow-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"',
    content
)

# 6. Icons and small text
content = content.replace('text-gray-400', 'text-slate-400')
content = content.replace('text-[9px] font-medium text-slate-700', 'text-[11px] font-normal text-slate-500')
content = content.replace('uppercase tracking-wider block', 'font-medium')

# Write back
with open('src/components/VictimRequestForm.jsx', 'w') as f:
    f.write(content)

