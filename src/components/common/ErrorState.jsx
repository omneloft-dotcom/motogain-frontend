import { Link } from "react-router-dom";

/**
 * ErrorState - Dark premium error state component
 * Shows when requests fail or pages error
 */
export default function ErrorState({
  icon = "⚠️",
  title,
  message,
  actionLabel = "Tekrar Dene",
  actionOnClick,
  secondaryLabel = "Ana Sayfaya Dön",
  secondaryTo = "/dashboard",
  showActions = true,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">{title}</h2>
      <p className="text-text-secondary max-w-md mb-6">{message}</p>

      {showActions && (
        <div className="flex flex-col sm:flex-row gap-3">
          {actionOnClick && (
            <button
              onClick={actionOnClick}
              className="bg-card border border-border text-text-secondary px-6 py-3 rounded-lg hover:bg-card-hover hover:text-text-primary transition-colors"
            >
              {actionLabel}
            </button>
          )}

          {secondaryTo && (
            <Link
              to={secondaryTo}
              className="bg-card border border-border text-text-secondary px-6 py-3 rounded-lg hover:bg-card-hover hover:text-text-primary transition-colors"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
