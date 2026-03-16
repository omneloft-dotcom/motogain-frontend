import { Link } from "react-router-dom";

/**
 * QuickActions - Dashboard intent accelerators
 * CTA discipline: 1 primary, 2 secondary max
 */
export default function QuickActions() {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-6">
      <h2 className="text-xl font-bold text-text-primary mb-6">Hızlı İşlemler</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* PRIMARY ACTION - Only green CTA */}
        <Link
          to="/listings/create"
          className="flex-1 bg-primary text-background rounded-lg px-6 py-4 hover:bg-highlight active:bg-primary-dark transition-colors font-semibold text-center"
        >
          <div className="text-2xl mb-1">➕</div>
          <div>Yeni İlan Ekle</div>
        </Link>

        {/* SECONDARY ACTIONS - Border only, no green */}
        <Link
          to="/listings"
          className="flex-1 border border-border text-text-secondary rounded-lg px-6 py-4 hover:bg-card-hover hover:text-text-primary transition-all text-center"
        >
          <div className="text-2xl mb-1">🔍</div>
          <div>İlanları Gör</div>
        </Link>

        <Link
          to="/messages"
          className="flex-1 border border-border text-text-secondary rounded-lg px-6 py-4 hover:bg-card-hover hover:text-text-primary transition-all text-center"
        >
          <div className="text-2xl mb-1">💬</div>
          <div>Mesajlar</div>
        </Link>

        <Link
          to="/courier-calendar"
          className="flex-1 border border-border text-text-secondary rounded-lg px-6 py-4 hover:bg-card-hover hover:text-text-primary transition-all text-center"
        >
          <div className="text-2xl mb-1">📅</div>
          <div>Kurye Takvimi</div>
        </Link>
      </div>
    </div>
  );
}
