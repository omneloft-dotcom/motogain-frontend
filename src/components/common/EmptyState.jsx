import { Link } from "react-router-dom";

/**
 * EmptyState - Dark premium empty state component
 * Shows when lists/pages have no content
 */
export default function EmptyState({
  icon = "📭",
  title,
  description,
  actionLabel,
  actionTo,
  actionOnClick,
  secondaryLabel,
  secondaryTo,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">{title}</h2>
      <p className="text-text-secondary max-w-md mb-6">{description}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className="bg-primary text-background px-6 py-3 rounded-lg hover:bg-highlight transition-colors font-semibold"
          >
            {actionLabel}
          </Link>
        )}

        {actionLabel && actionOnClick && (
          <button
            onClick={actionOnClick}
            className="bg-primary text-background px-6 py-3 rounded-lg hover:bg-highlight transition-colors font-semibold"
          >
            {actionLabel}
          </button>
        )}

        {secondaryLabel && secondaryTo && (
          <Link
            to={secondaryTo}
            className="bg-card border border-border text-text-secondary px-6 py-3 rounded-lg hover:bg-card-hover hover:text-text-primary transition-colors"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
