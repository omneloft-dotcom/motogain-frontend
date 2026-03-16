const fs = require('fs');

const filePath = './src/pages/listings/CreateListing.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace light theme classes with dark premium tokens
content = content
  // Page container
  .replace(/className="min-h-screen bg-slate-100"/g, 'className="min-h-screen bg-background"')
  
  // Form container
  .replace(/className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg"/g, 'className="max-w-3xl mx-auto p-6 bg-card border border-border/60 rounded-xl"')
  
  // Section headings
  .replace(/className="text-2xl font-bold text-slate-900 mb-6"/g, 'className="text-2xl font-bold text-text-primary mb-6"')
  .replace(/className="text-xl font-semibold text-slate-900 mb-4"/g, 'className="text-xl font-semibold text-text-primary mb-4"')
  
  // Labels
  .replace(/className="block text-sm font-semibold text-slate-800 mb-1"/g, 'className="block text-sm text-text-secondary mb-1"')
  .replace(/className="block text-sm font-medium text-slate-700 mb-1"/g, 'className="block text-sm text-text-secondary mb-1"')
  .replace(/className="block text-sm text-slate-700"/g, 'className="block text-sm text-text-secondary"')
  
  // Inputs and textareas
  .replace(/className="w-full p-2 border rounded"/g, 'className="w-full p-2 bg-background border border-border/60 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"')
  .replace(/className="w-full p-3 border rounded"/g, 'className="w-full p-3 bg-background border border-border/60 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"')
  
  // Error messages
  .replace(/className="text-red-600 text-sm"/g, 'className="text-error text-sm"')
  .replace(/className="text-red-500 text-sm mb-4"/g, 'className="text-error text-sm mb-4"')
  
  // Success message
  .replace(/className="bg-green-100 text-green-800 p-4 rounded mb-4"/g, 'className="bg-card border border-primary/60 text-text-primary p-4 rounded-lg mb-4"')
  
  // Loading message
  .replace(/className="text-center text-slate-600 my-8"/g, 'className="text-center text-text-secondary my-8"')
  
  // Submit button
  .replace(/className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold"/g, 'className="bg-primary text-background px-6 py-3 rounded-lg font-semibold hover:bg-highlight transition-colors"')
  
  // Checkbox labels
  .replace(/className="flex items-start gap-2 text-sm text-slate-700"/g, 'className="flex items-start gap-2 text-sm text-text-secondary"')
  
  // Info text
  .replace(/className="text-sm text-slate-600"/g, 'className="text-sm text-text-muted"')
  .replace(/className="text-xs text-slate-500"/g, 'className="text-xs text-text-muted"')
  
  // Buttons (secondary)
  .replace(/className="text-slate-700 hover:text-slate-900"/g, 'className="text-text-secondary hover:text-text-primary transition-colors"')
  
  // Dividers
  .replace(/className="border-b my-6"/g, 'className="border-b border-border/60 my-6"')
  
  // Disabled states
  .replace(/:disabled { opacity: 0.5; cursor: not-allowed; }/g, ':disabled { opacity: 0.5; cursor: not-allowed; background-color: var(--color-card); color: var(--color-text-muted); }');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ CreateListing form transformed to dark premium design');
