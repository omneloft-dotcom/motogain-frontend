const fs = require('fs');

const filePath = './src/pages/listings/CreateListing.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add PageShell import at the top with other React imports
content = content.replace(
  /import React, { useEffect, useState } from "react";/,
  `import React, { useEffect, useState } from "react";\nimport PageShell from "../../components/layout/PageShell";`
);

// Replace the return with PageShell wrapper
content = content.replace(
  /return \(\s*<div className="max-w-xl space-y-4">\s*<h1 className="text-2xl font-bold">İlan Oluştur<\/h1>/,
  `return (
    <PageShell
      title="İlan Oluştur"
      description="Yeni ilan eklemek için aşağıdaki formu doldurun."
    >
      <div className="max-w-3xl space-y-4">`
);

// Find and replace final closing div (careful to get the right one)
// Look for the pattern near the end of file
const lines = content.split('\n');
const lastDivIndex = lines.map((line, idx) => ({ line, idx }))
  .filter(({line}) => line.trim() === '</div>')
  .pop();

if (lastDivIndex) {
  lines[lastDivIndex.idx] = '      </div>\n    </PageShell>';
  content = lines.join('\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ CreateListing wrapped with PageShell');
