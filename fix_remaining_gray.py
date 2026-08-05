with open('src/components/VictimRequestForm.jsx', 'r') as f:
    content = f.read()

content = content.replace('bg-gray-50 border border-gray-200', 'bg-slate-50 border border-slate-200')
content = content.replace('bg-gray-50 border-gray-200', 'bg-slate-50 border-slate-200')
content = content.replace('bg-gray-50', 'bg-slate-50')
content = content.replace('border-gray-200', 'border-slate-200')

with open('src/components/VictimRequestForm.jsx', 'w') as f:
    f.write(content)
