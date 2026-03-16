const fs = require('fs');

const filePath = './src/pages/listings/ListingsPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace light theme classes with dark premium tokens
content = content
  // Header title
  .replace(/text-slate-900/g, 'text-text-primary')
  .replace(/text-slate-600/g, 'text-text-secondary')
  
  // Search input
  .replace(
    /className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"/,
    'className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"'
  )
  
  // Mobile filter toggle button
  .replace(
    /className="md:hidden bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"/,
    'className="md:hidden bg-card border border-border text-text-primary px-4 py-2 rounded-lg hover:bg-card-hover transition-colors"'
  )
  
  // View toggle buttons - active
  .replace(
    /bg-slate-900 text-white/g,
    'bg-card-hover text-text-primary border border-primary/60'
  )
  
  // View toggle buttons - inactive
  .replace(
    /bg-slate-100 text-slate-700 hover:bg-slate-200/g,
    'bg-card text-text-secondary border border-border hover:bg-card-hover hover:text-text-primary'
  )
  
  // Filters panel background
  .replace(
    /className={\`mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6/,
    'className={`mb-6 bg-card rounded-xl border border-border/60 p-6'
  )
  
  // Filter labels
  .replace(/text-slate-700/g, 'text-text-secondary')
  
  // Filter inputs and selects
  .replace(
    /className="w-full border border-slate-300 rounded-lg px-4 py-2"/g,
    'className="w-full bg-card border border-border rounded-lg px-4 py-2 text-text-primary focus:border-primary/60 transition-colors"'
  )
  
  // Clear filters button
  .replace(
    /className="text-sm text-blue-600 hover:text-blue-800 font-medium"/,
    'className="text-sm text-primary hover:text-highlight font-medium transition-colors"'
  )
  
  // Loading spinner
  .replace(
    /className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"/,
    'className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"'
  )
  
  // Empty state heading
  .replace(
    /className="text-2xl font-bold text-slate-900 mb-2"/,
    'className="text-2xl font-bold text-text-primary mb-2"'
  )
  
  // Empty state CTA button
  .replace(
    /className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"/,
    'className="bg-primary text-background px-6 py-3 rounded-lg hover:bg-highlight transition-colors font-semibold"'
  );

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ ListingsPage transformed to dark premium design');
