const fs = require('fs');

const filePath = './src/pages/messages/ChatPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace light theme classes with dark premium tokens
content = content
  // Loading state
  .replace(
    /className="flex items-center justify-center h-screen text-gray-600 text-xl"/g,
    'className="flex items-center justify-center h-screen text-text-secondary text-xl"'
  )
  
  // Deal closed banner
  .replace(
    /className="bg-gray-100 border-2 border-gray-400 rounded-lg p-4 mb-4 text-center"/g,
    'className="bg-card border border-border rounded-lg p-4 mb-4 text-center"'
  )
  .replace(/className="text-lg font-bold text-gray-800"/g, 'className="text-lg font-bold text-text-primary"')
  .replace(/className="text-sm text-gray-700 mt-1"/g, 'className="text-sm text-text-secondary mt-1"')
  
  // Message container
  .replace(
    /className="bg-white rounded-lg border p-4 h-\[70vh\] overflow-y-auto space-y-4"/g,
    'className="bg-background rounded-lg border border-border/60 p-4 h-[70vh] overflow-y-auto space-y-4"'
  )
  .replace(
    /<p className="text-gray-500 text-center">Henüz mesaj yok\.<\/p>/g,
    '<p className="text-text-muted text-center">Henüz mesaj yok.</p>'
  )
  
  // Typing indicator
  .replace(
    /className="mt-2 text-sm text-gray-500 italic"/g,
    'className="mt-2 text-sm text-text-muted italic"'
  )
  
  // Message input
  .replace(
    /className="flex-1 border rounded-lg p-3 outline-none"/g,
    'className="flex-1 bg-card border border-border rounded-lg p-3 text-text-primary placeholder:text-text-muted outline-none focus:border-primary/60 transition-colors"'
  )
  
  // Send button - primary ONLY when text exists
  .replace(
    /className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"/g,
    'className={`px-4 py-2 rounded-lg transition-colors font-semibold ${text.trim() ? "bg-primary text-background hover:bg-highlight" : "bg-card border border-border text-text-secondary hover:bg-card-hover"}`}'
  )
  
  // Offer button - remove green, make secondary
  .replace(
    /className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"/g,
    'className="bg-card border border-border text-text-secondary px-4 py-2 rounded-lg hover:bg-card-hover hover:text-text-primary transition-colors"'
  )
  
  // Offer input panel
  .replace(
    /className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg"/g,
    'className="mt-4 p-4 bg-card border border-border rounded-lg"'
  )
  .replace(
    /<span className="text-gray-700 font-medium">Teklif Tutarı:<\/span>/g,
    '<span className="text-text-secondary font-medium">Teklif Tutarı:</span>'
  )
  .replace(
    /className="flex-1 border rounded-lg p-2 outline-none"/g,
    'className="flex-1 bg-background border border-border rounded-lg p-2 text-text-primary outline-none focus:border-primary/60 transition-colors"'
  )
  .replace(
    /<span className="text-gray-700 font-medium">₺<\/span>/g,
    '<span className="text-text-secondary font-medium">₺</span>'
  )
  
  // Offer submit button - primary style
  .replace(
    /className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"/g,
    'className="flex-1 bg-primary text-background px-4 py-2 rounded-lg hover:bg-highlight transition-colors font-semibold"'
  )
  
  // Offer cancel button
  .replace(
    /className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"/g,
    'className="flex-1 bg-card border border-border text-text-secondary px-4 py-2 rounded-lg hover:bg-card-hover hover:text-text-primary transition-colors"'
  )
  
  // Closed message input notice
  .replace(
    /className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg text-center text-gray-700"/g,
    'className="mt-4 p-4 bg-card border border-border rounded-lg text-center text-text-secondary"'
  );

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ ChatPage transformed to dark premium design');
