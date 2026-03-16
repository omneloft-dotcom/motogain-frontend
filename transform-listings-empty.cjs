const fs = require('fs');

const filePath = './src/pages/listings/ListingsPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add EmptyState import
content = content.replace(
  /import Toast from "\.\.\/\.\.\/components\/common\/Toast";/,
  `import Toast from "../../components/common/Toast";\nimport EmptyState from "../../components/common/EmptyState";`
);

// Replace empty state with EmptyState component
const oldEmptyState = `      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            İlan bulunamadı
          </h2>
          <p className="text-text-secondary max-w-md mb-6">
            {hasActiveFilters
              ? "Filtrelerinize uygun ilan bulunamadı. Filtreleri değiştirmeyi deneyin."
              : "Henüz hiç ilan yok."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-card-hover text-text-primary border border-primary/60 px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}`;

const newEmptyState = `      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <EmptyState
          icon="🔍"
          title="İlan bulunamadı"
          description={
            hasActiveFilters
              ? "Filtrelerinize uygun ilan bulunamadı. Filtreleri değiştirmeyi deneyin."
              : "Henüz hiç ilan yok. İlk ilanı siz ekleyin."
          }
          actionLabel={hasActiveFilters ? "Filtreleri Temizle" : "İlan Ekle"}
          actionOnClick={hasActiveFilters ? clearFilters : undefined}
          actionTo={!hasActiveFilters ? "/listings/create" : undefined}
          secondaryLabel={!hasActiveFilters ? "İlanları Keşfet" : undefined}
          secondaryTo={!hasActiveFilters ? "/listings" : undefined}
        />
      )}`;

content = content.replace(oldEmptyState, newEmptyState);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Listings empty state updated');
