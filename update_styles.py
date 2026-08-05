import re

with open('src/components/VictimRequestForm.jsx', 'r') as f:
    content = f.read()

# Replace inputs
content = re.sub(
    r'w-full (pl-\d+ )?(pr-\d+\.?\d* )?(py-\d+\.?\d* )?bg-white border border-(?:gray|red|blue)-300 rounded-(?:lg|md) text-gray-900(?: font-(?:semibold|medium))? text-(?:sm|xs) focus:outline-none focus:border-(?:blue|red)-500 focus:ring-1 focus:ring-(?:blue|red)-500/(?:20|30)(?: font-mono)?(?: placeholder-gray-400)?(?: shadow-sm)?',
    r'w-full \1\2\3bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-\g<4> focus:outline-none focus:border-blue-500'.replace('\\g<4>', 'sm'), # Simplified replacement
    content
)

# Better input replacement
content = content.replace('bg-white border-gray-300 rounded-lg text-gray-900', 'bg-slate-50 border border-slate-200 rounded-xl text-slate-900')
content = content.replace('bg-white border border-gray-300 rounded-lg text-gray-900', 'bg-slate-50 border border-slate-200 rounded-xl text-slate-900')
content = content.replace('bg-white border border-red-300 rounded-lg text-gray-900', 'bg-slate-50 border border-slate-200 rounded-xl text-slate-900')
content = content.replace('bg-white border border-blue-300 rounded-lg text-gray-900', 'bg-slate-50 border border-slate-200 rounded-xl text-slate-900')
content = content.replace('bg-white border border-gray-300 rounded-md text-gray-900', 'bg-slate-50 border border-slate-200 rounded-xl text-slate-900')

# Replace labels
content = content.replace('block text-xs font-semibold text-gray-500 uppercase tracking-wider', 'block text-xs font-bold text-slate-700')
content = content.replace('mb-1.5', 'mb-1')

# Fix shadow and outline
content = content.replace('focus:ring-1 focus:ring-blue-500/20 shadow-sm', '')
content = content.replace('focus:ring-1 focus:ring-blue-500/30 shadow-sm', '')
content = content.replace('focus:ring-1 focus:ring-red-500/30 shadow-sm', '')

with open('src/components/VictimRequestForm.jsx', 'w') as f:
    f.write(content)
