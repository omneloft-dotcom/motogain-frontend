const fs = require('fs');

const filePath = './src/pages/dashboard/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add Notice import after QuickActions import
content = content.replace(
  /import QuickActions from "\.\.\/\.\.\/components\/dashboard\/QuickActions";/,
  `import QuickActions from "../../components/dashboard/QuickActions";\nimport Notice from "../../components/dashboard/Notice";`
);

// Replace Beta Notice
const betaNoticeOld = `      {showBetaNotice && (
        <div className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-warning bg-card px-4 py-3 text-text-secondary">
          <p className="text-sm">
            Beta sürüm: Yeni özellikler kademeli olarak açılacaktır.
          </p>
          <button
            type="button"
            onClick={dismissBetaNotice}
            className="text-xs font-semibold text-text-muted hover:text-text-secondary"
          >
            Kapat
          </button>
        </div>
      )}`;

const betaNoticeNew = `      {showBetaNotice && (
        <div className="mb-6">
          <Notice
            type="warning"
            message="Beta sürüm: Yeni özellikler kademeli olarak açılacaktır."
            onDismiss={dismissBetaNotice}
          />
        </div>
      )}`;

content = content.replace(betaNoticeOld, betaNoticeNew);

// Replace Admin Panel Link
const adminPanelOld = `      {/* Admin Panel Link */}
      {isAdmin && (
        <div className="bg-card border border-primary  text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Admin Paneli</h3>
              <p className="text-text-secondary text-sm">
                Platform yönetimi ve moderasyon araçları
              </p>
            </div>
            <Link
              to="/admin/dashboard"
              className="bg-card text-text-primary px-6 py-3 rounded-lg hover:bg-card-hover transition-colors font-semibold"
            >
              Panele Git →
            </Link>
          </div>
        </div>
      )}`;

const adminPanelNew = `      {/* Admin Panel Link */}
      {isAdmin && (
        <Notice
          type="action"
          title="Admin Paneli"
          message="Platform yönetimi ve moderasyon araçları"
          action={
            <Link
              to="/admin/dashboard"
              className="bg-card text-text-primary px-6 py-3 rounded-lg hover:bg-card-hover transition-colors font-semibold whitespace-nowrap"
            >
              Panele Git →
            </Link>
          }
        />
      )}`;

content = content.replace(adminPanelOld, adminPanelNew);

// Replace Helpful Tip
const helpfulTipOld = `      {/* Helpful Tip */}
      <div className="mt-8 bg-card border border-info rounded-xl p-6">
        <h3 className="text-lg font-semibold text-info mb-2">
          💡 Hızlı İpucu
        </h3>
        <p className="text-info text-sm">
          Sol menüden tüm özelliklere erişebilirsin. İlan eklemek, favorilerini
          görüntülemek veya mesajlaşmak için ilgili bölümleri ziyaret et.
        </p>
      </div>`;

const helpfulTipNew = `      {/* Helpful Tip */}
      <div className="mt-8">
        <Notice
          type="info"
          title="Hızlı İpucu"
          message="Sol menüden tüm özelliklere erişebilirsin. İlan eklemek, favorilerini görüntülemek veya mesajlaşmak için ilgili bölümleri ziyaret et."
          icon="💡"
        />
      </div>`;

content = content.replace(helpfulTipOld, helpfulTipNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Dashboard banners transformed to Notice components');
