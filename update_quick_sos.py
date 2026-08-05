import re

with open('src/components/QuickSOSBanner.jsx', 'r') as f:
    content = f.read()

# Update inputs
content = content.replace('bg-slate-900 border-2 border-amber-500/80 rounded-xl text-white', 'bg-slate-50 border border-slate-200 rounded-xl text-slate-900')
content = content.replace('focus:border-amber-400 font-mono shadow-inner', 'focus:border-blue-500')
content = content.replace('bg-slate-900 border-2 border-slate-600 rounded-xl text-white', 'bg-slate-50 border border-slate-200 rounded-xl text-slate-900')
content = content.replace('focus:border-amber-400 shadow-inner', 'focus:border-blue-500')

# Update labels
content = content.replace('font-black text-amber-300', 'font-bold text-slate-700')

# Update GPS section container
content = content.replace('bg-slate-900 p-2.5 rounded-xl border border-slate-700', 'bg-slate-50 p-2.5 rounded-xl border border-slate-200')

# Update submit button
content = content.replace(
    'className="w-full py-4 mb-8 sm:mb-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base uppercase tracking-wider shadow-lg border border-red-500 transition-all flex items-center justify-center gap-3 active:scale-98"',
    'className="w-full py-4 mb-8 sm:mb-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold text-base uppercase tracking-wider shadow-sm flex items-center justify-center gap-3 transition-colors active:scale-98"'
)

with open('src/components/QuickSOSBanner.jsx', 'w') as f:
    f.write(content)
