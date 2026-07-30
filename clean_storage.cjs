const fs = require('fs');
let content = fs.readFileSync('src/services/storageService.js', 'utf-8');

// 1. Remove STORAGE_KEYS
content = content.replace(/\/\/ Clean Production Storage Keys[\s\S]*?const STORAGE_KEYS = \{[\s\S]*?\};\n/, '');

// 2. Add missing fields to cloudMemoryCache
content = content.replace(/const cloudMemoryCache = \{([\s\S]*?)\};/, 'const cloudMemoryCache = {$1  accountRecovery: null,\n  volunteerCollab: null\n};');

// 3. Fix getters
content = content.replace(/let list = \[\];\s*if \(isSupabaseConfigured\) \{\s*list = cloudMemoryCache\.(\w+) \|\| \[\];\s*\} else \{\s*const data = localStorage\.getItem\(STORAGE_KEYS\.\w+\);\s*list = data \? JSON\.parse\(data\) : \[\];\s*\}/g, 'const list = cloudMemoryCache.$1 || [];');

content = content.replace(/let logs = \[\];\s*if \(isSupabaseConfigured\) \{\s*logs = cloudMemoryCache\.(\w+) \|\| \[\];\s*\} else \{\s*const data = localStorage\.getItem\(STORAGE_KEYS\.\w+\);\s*logs = data \? JSON\.parse\(data\) : \[\];\s*\}/g, 'const logs = cloudMemoryCache.$1 || [];');

// Fix Account Recovery & Volunteer Collab Getters
content = content.replace(/const data = localStorage\.getItem\(STORAGE_KEYS\.ACCOUNT_RECOVERY\);\s*const list = data \? JSON\.parse\(data\) : \[\];/g, 'const list = cloudMemoryCache.accountRecovery || [];');
content = content.replace(/const data = localStorage\.getItem\(STORAGE_KEYS\.VOLUNTEER_COLLAB\);\s*let list = data \? JSON\.parse\(data\) : \[\];/g, 'let list = cloudMemoryCache.volunteerCollab || [];');

// 4. Fix setters (if/else localStorage.setItem)
content = content.replace(/if \(isSupabaseConfigured\) \{ cloudMemoryCache\.(\w+) = ([^;]+); \} else \{ localStorage\.setItem\(STORAGE_KEYS\.\w+, JSON\.stringify\([^)]+\)\); \}/g, 'cloudMemoryCache.$1 = $2;');

// Account Recovery & Volunteer Collab Setters
content = content.replace(/localStorage\.setItem\(STORAGE_KEYS\.ACCOUNT_RECOVERY, JSON\.stringify\(([^)]+)\)\);/g, 'cloudMemoryCache.accountRecovery = $1;');
content = content.replace(/localStorage\.setItem\(STORAGE_KEYS\.VOLUNTEER_COLLAB, JSON\.stringify\(([^)]+)\)\);/g, 'cloudMemoryCache.volunteerCollab = $1;');

// 5. Fix sync fetch fallback to localStorage
content = content.replace(/if \(isSupabaseConfigured\) \{ cloudMemoryCache\.(\w+) = ([^;]+); \} else \{ localStorage\.setItem\(STORAGE_KEYS\.\w+, JSON\.stringify\([^)]+\)\); \}/g, 'cloudMemoryCache.$1 = $2;');

// 6. Fix reset
content = content.replace(/localStorage\.removeItem\(STORAGE_KEYS\.\w+\);\s*/g, '');

fs.writeFileSync('src/services/storageService.js', content);
console.log('Cleanup script executed');
