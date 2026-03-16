const fs = require('fs');

const filePath = './src/pages/listings/CreateListing.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix remaining elements
content = content
  // Success/Error messages in form
  .replace(/className="p-2 bg-green-200 text-green-800 rounded"/g, 'className="p-2 bg-card border border-primary/60 text-text-primary rounded-lg"')
  .replace(/className="p-2 bg-red-200 text-red-800 rounded"/g, 'className="p-2 bg-card border border-error text-error rounded-lg"')
  
  // Fix any remaining text-slate references
  .replace(/text-slate-500/g, 'text-text-muted')
  .replace(/text-gray-500/g, 'text-text-muted')
  
  // Fix price input that was missed
  .replace(/className="w-full p-2 pl-6 border rounded"/g, 'className="w-full p-2 pl-6 bg-background border border-border/60 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"')
  
  // Fix any remaining generic borders
  .replace(/className="border rounded"/g, 'className="bg-background border border-border/60 rounded-lg text-text-primary focus:outline-none focus:border-primary/60 transition-colors"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ CreateListing form fixes applied');
