const fs = require('fs');
const file = 'src/services/storageService.js';
let content = fs.readFileSync(file, 'utf8');

// Replacements for VICTIMS
content = content.replace(/localStorage\.setItem\(STORAGE_KEYS\.VICTIMS, JSON\.stringify\(([^)]+)\)\);/g, 
  "if (isSupabaseConfigured) { cloudMemoryCache.victims = $1; } else { localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify($1)); }");

// Replacements for DELIVERY_LOGS
content = content.replace(/localStorage\.setItem\(STORAGE_KEYS\.DELIVERY_LOGS, JSON\.stringify\(([^)]+)\)\);/g, 
  "if (isSupabaseConfigured) { cloudMemoryCache.deliveryLogs = $1; } else { localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify($1)); }");

// Replacements for NGOS
content = content.replace(/localStorage\.setItem\(STORAGE_KEYS\.NGOS, JSON\.stringify\(([^)]+)\)\);/g, 
  "if (isSupabaseConfigured) { cloudMemoryCache.ngos = $1; } else { localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify($1)); }");

// Replacements for VOLUNTEERS
content = content.replace(/localStorage\.setItem\(STORAGE_KEYS\.VOLUNTEERS, JSON\.stringify\(([^)]+)\)\);/g, 
  "if (isSupabaseConfigured) { cloudMemoryCache.volunteers = $1; } else { localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify($1)); }");

fs.writeFileSync(file, content);
console.log('Fixed cache logic in storageService.js');
