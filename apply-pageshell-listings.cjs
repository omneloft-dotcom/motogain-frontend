const fs = require('fs');

const filePath = './src/pages/listings/ListingsPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add PageShell import
content = content.replace(
  /import EmptyState from "\.\.\/\.\.\/components\/common\/EmptyState";/,
  `import EmptyState from "../../components/common/EmptyState";\nimport PageShell from "../../components/layout/PageShell";`
);

// Replace the outer div with PageShell - keep search and other content inside
content = content.replace(
  /return \(\s*<div className="max-w-7xl mx-auto px-4 py-6">\s*{\/\* Header with search \*\/}\s*<div className="mb-6 flex flex-col gap-3">\s*<div>\s*<h1 className="text-3xl font-bold text-text-primary mb-1">Tüm İlanlar<\/h1>\s*<p className="text-text-secondary">\s*{listings\.length} ilan listeleniyor\s*{hasActiveFilters && " \(filtrelenmiş\)"}\s*<\/p>\s*<\/div>/,
  `return (
    <PageShell
      title="Tüm İlanlar"
      description={\`\${listings.length} ilan listeleniyor\${hasActiveFilters ? " (filtrelenmiş)" : ""}\`}
    >
      <div className="mb-6">`
);

// Remove the closing div of header and keep search input
content = content.replace(
  /<\/div>\s*<div className="w-full">/,
  `<div className="w-full">`
);

// Replace final closing div with PageShell closing
content = content.replace(
  /{\/\* FAZ 18: Toast mesajı \*\/}\s*{toast && <Toast {\.\.\.toast} onClose={\(\) => setToast\(null\)} \/>}\s*<\/div>\s*\);\s*}\s*$/,
  `{/* FAZ 18: Toast mesajı */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </PageShell>
  );
}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Listings wrapped with PageShell');
