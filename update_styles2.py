with open('src/components/VictimRequestForm.jsx', 'r') as f:
    content = f.read()

# Make the submit button exactly the same color scheme as POST UPDATE
# POST UPDATE uses: bg-blue-600 hover:bg-blue-700 text-white
import re
content = re.sub(
    r'className=\{`w-full py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2\.5 cursor-pointer min-h-\[52px\] shadow-sm active:scale-\[0\.98\] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none \$\{\n                  formData\.isUrgentRescue\n                    \? \'bg-red-600 hover:bg-red-700 text-white\'\n                    : \'bg-blue-600 hover:bg-blue-700 text-white\'\n                \}`\}',
    'className="w-full py-4 rounded-xl font-bold text-base text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px]"',
    content
)

# Also update the form sections if they have gray backgrounds to match the modal's white/slate feel
content = content.replace('bg-gray-50 border-gray-200', 'bg-slate-50 border-slate-200')
content = content.replace('bg-gray-50 border border-gray-200', 'bg-slate-50 border border-slate-200')
content = content.replace('bg-white border border-gray-200', 'bg-white border border-slate-200')

with open('src/components/VictimRequestForm.jsx', 'w') as f:
    f.write(content)
