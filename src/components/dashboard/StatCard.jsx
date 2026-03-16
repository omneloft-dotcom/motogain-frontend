import { Link } from "react-router-dom";

/**
 * StatCard - KPI display component
 * Dark premium design, hierarchy-focused
 */
export default function StatCard({ label, value, link, icon, highlight = false }) {
  const baseClasses = "block rounded-xl border p-6 transition-all";

  const variantClasses = highlight
    ? "bg-card border-primary/60 hover:bg-card-hover hover:border-primary"
    : "bg-card border-border/60 hover:bg-card-hover hover:border-border";

  return (
    <Link to={link} className={`${baseClasses} ${variantClasses}`}>
      <div className="flex flex-col gap-3">
        {/* Label + Icon */}
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-2xl opacity-60">{icon}</span>}
          <p className="text-xs uppercase tracking-wide text-text-muted font-semibold">
            {label}
          </p>
        </div>

        {/* Value */}
        <p
          className={`text-5xl font-bold tabular-nums ${
            highlight ? "text-primary" : "text-text-primary"
          }`}
        >
          {value}
        </p>
      </div>
    </Link>
  );
}
