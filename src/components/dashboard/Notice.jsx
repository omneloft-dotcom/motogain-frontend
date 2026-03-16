/**
 * Notice - Reusable banner/alert component
 * Types: info, warning, action
 * Dark premium design, no decorative color
 */
export default function Notice({
  type = "info",
  title,
  message,
  icon,
  action,
  onDismiss
}) {
  const typeStyles = {
    info: "border-info",
    warning: "border-warning",
    action: "border-primary/60"
  };

  const textStyles = {
    info: "text-info",
    warning: "text-text-secondary",
    action: "text-text-primary"
  };

  return (
    <div className={`bg-card border ${typeStyles[type]} rounded-xl p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {title && (
            <h3 className={`text-lg font-semibold ${textStyles[type]} mb-2 flex items-center gap-2`}>
              {icon && <span>{icon}</span>}
              {title}
            </h3>
          )}
          {message && (
            <p className={`text-sm ${type === 'info' ? 'text-info' : 'text-text-secondary'}`}>
              {message}
            </p>
          )}
        </div>

        {/* Action or Dismiss */}
        <div className="flex items-center gap-3">
          {action && action}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs font-semibold text-text-muted hover:text-text-secondary transition-colors"
            >
              Kapat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
