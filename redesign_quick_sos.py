import re

with open('src/components/QuickSOSBanner.jsx', 'r') as f:
    content = f.read()

# Update labels
content = content.replace(
    'block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5',
    'block text-[13px] font-medium text-slate-500 mb-1.5'
)
content = content.replace(
    'block text-xs font-bold text-slate-700 mb-1.5',
    'block text-[13px] font-medium text-slate-500 mb-1.5'
)

# Update inputs
content = content.replace(
    'bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black text-base focus:outline-none focus:border-blue-500 font-mono shadow-inner',
    'bg-white border border-slate-200 rounded-xl text-slate-800 text-[14px] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 shadow-sm'
)
content = content.replace(
    'bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black text-base focus:outline-none focus:border-blue-500 shadow-inner',
    'bg-white border border-slate-200 rounded-xl text-slate-800 text-[14px] focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 shadow-sm'
)

# Update submit button
content = content.replace(
    'className="w-full py-4 mb-8 sm:mb-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold text-base uppercase tracking-wider shadow-sm flex items-center justify-center gap-3 transition-colors active:scale-98"',
    'className="w-full py-4 mb-8 sm:mb-2 rounded-xl text-white bg-slate-900 hover:bg-slate-800 font-semibold text-[15px] shadow-sm flex items-center justify-center gap-2 transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"'
)
content = content.replace('text-[13px] font-medium text-slate-500 uppercase tracking-wider', 'text-[13px] font-medium text-slate-500')

with open('src/components/QuickSOSBanner.jsx', 'w') as f:
    f.write(content)

