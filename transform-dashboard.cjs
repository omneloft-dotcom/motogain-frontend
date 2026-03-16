const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/dashboard/Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all color classes
const replacements = {
  'text-slate-900': 'text-text-primary',
  'text-slate-600': 'text-text-secondary',
  'text-slate-300': 'text-text-secondary',
  'text-slate-800': 'text-text-secondary',
  'text-blue-900': 'text-info',
  'text-blue-800': 'text-info',
  'text-blue-700': 'text-primary',
  'bg-white': 'bg-card',
  'bg-slate-200': 'bg-card-hover',
  'bg-blue-50': 'bg-card',
  'bg-blue-100': 'bg-card-hover',
  'bg-amber-50': 'bg-card',
  'bg-slate-900': 'bg-primary',
  'bg-slate-800': 'bg-primary-dark',
  'bg-slate-700': 'bg-primary-dark',
  'border-slate-200': 'border-border',
  'border-slate-300': 'border-primary',
  'border-blue-400': 'border-primary',
  'border-blue-200': 'border-info',
  'border-amber-200': 'border-warning',
  'hover:bg-slate-100': 'hover:bg-card-hover',
  'hover:bg-blue-100': 'hover:bg-card-hover',
  'hover:bg-slate-800': 'hover:bg-primary-dark',
  'hover:border-slate-300': 'hover:bg-card-hover hover:border-primary',
  'hover:shadow-md': '',
  'shadow-sm': '',
  'text-amber-900': 'text-text-secondary',
  'text-amber-800': 'text-text-muted',
  'hover:text-amber-900': 'hover:text-text-primary',
  'from-slate-900 to-slate-700': '',
  'bg-gradient-to-r': 'bg-card border border-primary',
};

for (const [oldClass, newClass] of Object.entries(replacements)) {
  const regex = new RegExp(oldClass, 'g');
  content = content.replace(regex, newClass);
}

// Fix highlight border
content = content.replace(
  'border-primary hover:bg-card-hover hover:border-primary',
  'border-primary hover:bg-card-hover hover:border-highlight'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Dashboard transformed to dark theme');
