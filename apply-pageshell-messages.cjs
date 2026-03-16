const fs = require('fs');

const filePath = './src/pages/messages/MessagesInbox.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add PageShell import
content = content.replace(
  /import EmptyState from "\.\.\/\.\.\/components\/common\/EmptyState";/,
  `import EmptyState from "../../components/common/EmptyState";\nimport PageShell from "../../components/layout/PageShell";`
);

// Replace loading return with PageShell
content = content.replace(
  /if \(loading\) {\s*return \(\s*<div className="max-w-4xl mx-auto px-4 py-6">\s*<h1 className="text-2xl font-bold text-text-primary mb-6">Mesajlarım<\/h1>/,
  `if (loading) {
    return (
      <PageShell title="Mesajlarım">`
);

content = content.replace(
  /<\/div>\s*<\/div>\s*\);\s*}\s*return \(\s*<div className="max-w-4xl mx-auto px-4 py-6">\s*<h1 className="text-2xl font-bold text-text-primary mb-6">Mesajlarım<\/h1>/,
  `</PageShell>
    );
  }

  return (
    <PageShell title="Mesajlarım">`
);

// Replace final closing div with PageShell
content = content.replace(
  /<\/div>\s*<\/div>\s*\);\s*}\s*$/,
  `    </PageShell>
  );
}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Messages inbox wrapped with PageShell');
