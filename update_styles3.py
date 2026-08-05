with open('src/components/VictimRequestForm.jsx', 'r') as f:
    content = f.read()

# Update the header icon box
content = content.replace(
    "'bg-red-600 border border-red-500 shadow-md shadow-red-500/30 animate-pulse'",
    "'bg-red-600 shadow-sm'"
)
content = content.replace(
    "'bg-blue-600 border border-blue-500 shadow-md shadow-blue-500/30'",
    "'bg-blue-600 shadow-sm'"
)

# Update the alert banner
content = content.replace(
    'bg-red-950/60 border border-red-700/50 rounded-lg text-red-200',
    'bg-red-50 border border-red-200 rounded-xl text-red-700'
)
content = content.replace(
    'text-red-400 shrink-0',
    'text-red-600 shrink-0'
)

# Update the emergency banner
content = content.replace(
    'bg-red-950/50 border border-red-800/60 p-3 rounded-lg text-red-200 text-xs font-medium flex items-center gap-2',
    'bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2'
)
content = content.replace(
    'text-red-400 shrink-0 animate-pulse',
    'text-red-600 shrink-0'
)

# Replace all standard shadow-md with standard shadow-sm for pill selectors
content = content.replace('hover:shadow-md hover:-translate-y-0.5', '')

with open('src/components/VictimRequestForm.jsx', 'w') as f:
    f.write(content)
