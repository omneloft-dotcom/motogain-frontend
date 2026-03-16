const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/dashboard/Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add QuickActions import
content = content.replace(
  'import StatCard from "../../components/dashboard/StatCard";',
  'import StatCard from "../../components/dashboard/StatCard";\nimport QuickActions from "../../components/dashboard/QuickActions";'
);

// Replace Quick Actions section
const oldQuickActionsBlock = `      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-text-primary mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/listings/create"
            className="bg-primary text-white rounded-xl p-4 hover:bg-primary-dark transition-colors text-center"
          >
            <div className="text-2xl mb-2">➕</div>
            <p className="font-semibold">Yeni İlan Ekle</p>
          </Link>
          <Link
            to="/listings"
            className="bg-card border border-border rounded-xl p-4 hover:border-primary  transition-all text-center"
          >
            <div className="text-2xl mb-2">🔍</div>
            <p className="font-semibold text-text-primary">İlanları Gör</p>
          </Link>
          <Link
            to="/messages"
            className="bg-card border border-border rounded-xl p-4 hover:border-primary  transition-all text-center"
          >
            <div className="text-2xl mb-2">💬</div>
            <p className="font-semibold text-text-primary">Mesajlar</p>
          </Link>
          <Link
            to="/profile"
            className="bg-card border border-border rounded-xl p-4 hover:border-primary  transition-all text-center"
          >
            <div className="text-2xl mb-2">👤</div>
            <p className="font-semibold text-text-primary">Profilim</p>
          </Link>
        </div>
      </div>`;

const newQuickActionsBlock = `      {/* Quick Actions */}
      <div className="mb-12">
        <QuickActions />
      </div>`;

content = content.replace(oldQuickActionsBlock, newQuickActionsBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Quick Actions refactored with CTA discipline');
