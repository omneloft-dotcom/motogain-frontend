const fs = require('fs');

const filePath = './src/pages/dashboard/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add PageShell import
content = content.replace(
  /import Notice from "\.\.\/\.\.\/components\/dashboard\/Notice";/,
  `import Notice from "../../components/dashboard/Notice";\nimport PageShell from "../../components/layout/PageShell";`
);

// Replace the outer div and header with PageShell
content = content.replace(
  /return \(\s*<div className="max-w-7xl mx-auto px-4 py-6">\s*<div className="mb-8">\s*<h1 className="text-3xl font-bold text-text-primary mb-2">\s*Hoş geldin, {user\.name}!\s*<\/h1>\s*<p className="text-text-secondary">\s*Cordy dashboard'ına hoş geldin\. Aşağıda özetlere göz atabilirsin\.\s*<\/p>\s*<\/div>/,
  `return (
    <PageShell
      title={\`Hoş geldin, \${user.name}!\`}
      description="Cordy dashboard'ına hoş geldin. Aşağıda özetlere göz atabilirsin."
    >`
);

// Replace closing div with PageShell closing
content = content.replace(
  /<\/div>\s*\);\s*}\s*$/,
  `    </PageShell>
  );
}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Dashboard wrapped with PageShell');
