const fs = require('fs');

const filePath = './src/pages/messages/MessagesInbox.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace light theme classes with dark premium tokens
content = content
  // Header title
  .replace(/className="text-2xl font-bold mb-6"/g, 'className="text-2xl font-bold text-text-primary mb-6"')
  
  // Error box
  .replace(/className="bg-red-50 text-red-600 p-4 rounded-lg mb-4"/g, 'className="bg-card border border-error text-error p-4 rounded-lg mb-4"')
  
  // Empty state
  .replace(/className="text-center py-20 text-gray-500"/g, 'className="text-center py-20 text-text-secondary"')
  
  // Conversation card - base (NO bg-white)
  .replace(
    /className={\`bg-white border rounded-lg p-4 hover:shadow-md transition cursor-pointer relative \${/g,
    'className={`bg-transparent border border-transparent rounded-lg p-4 hover:bg-card-hover transition cursor-pointer relative ${'
  )
  
  // Active conversation - green left border ONLY
  .replace(
    /isActive\s*\?\s*"border-blue-600 shadow-md"/g,
    'isActive ? "bg-card border-l-2 border-l-primary/60"'
  )
  
  // Unread conversation
  .replace(
    /hasUnread\s*\?\s*"border-blue-400 bg-blue-50\/30"/g,
    'hasUnread ? "border-border/60"'
  )
  
  // Default conversation hover
  .replace(
    /"border-gray-200 hover:border-blue-400"/g,
    '"border-transparent hover:border-border/60"'
  )
  
  // Active indicator (remove - already using border-l)
  .replace(
    /{\/\* Active indicator - left border \*\/}\s*{isActive && \(\s*<div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg"><\/div>\s*\)}/g,
    ''
  )
  
  // Image container
  .replace(/className="w-full h-full bg-gray-100 rounded-lg overflow-hidden"/g, 'className="w-full h-full bg-card rounded-lg overflow-hidden"')
  .replace(/className="w-full h-full flex items-center justify-center text-gray-400"/g, 'className="w-full h-full flex items-center justify-center text-text-muted"')
  
  // Unread badge
  .replace(
    /className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"/g,
    'className="absolute -top-2 -right-2 bg-primary text-background text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"'
  )
  
  // Unread dot
  .replace(
    /<span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"><\/span>/g,
    '<span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>'
  )
  
  // Title text
  .replace(
    /className={\`truncate \${[\s\S]*?hasUnread[\s\S]*?"font-bold text-gray-900"[\s\S]*?:"font-semibold text-gray-900"[\s\S]*?\}\`}/g,
    'className={`truncate ${hasUnread ? "font-bold text-text-primary" : "font-semibold text-text-primary"}`}'
  )
  
  // Timestamp
  .replace(/className="text-xs text-gray-500 whitespace-nowrap"/g, 'className="text-xs text-text-muted whitespace-nowrap"')
  
  // User name
  .replace(/className="text-sm text-gray-600 mb-2"/g, 'className="text-sm text-text-secondary mb-2"')
  
  // Last message
  .replace(
    /className={\`text-sm truncate \${[\s\S]*?hasUnread[\s\S]*?"text-gray-900 font-medium"[\s\S]*?:"text-gray-500"[\s\S]*?\}\`}/g,
    'className={`text-sm truncate ${hasUnread ? "text-text-primary font-medium" : "text-text-muted"}`}'
  )
  
  // Price
  .replace(/className="text-sm font-semibold text-slate-900 mt-2"/g, 'className="text-sm font-semibold text-text-primary mt-2"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ MessagesInbox transformed to dark premium design');
