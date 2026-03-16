import { useEffect } from "react";

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
  actionLabel,
  onAction,
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: "bg-card",
      border: "border-primary",
      text: "text-primary",
      icon: "✓",
    },
    error: {
      bg: "bg-card",
      border: "border-error",
      text: "text-error",
      icon: "✕",
    },
    info: {
      bg: "bg-card",
      border: "border-info",
      text: "text-info",
      icon: "ℹ",
    },
    warning: {
      bg: "bg-card",
      border: "border-warning",
      text: "text-warning",
      icon: "⚠",
    },
  };

  const style = styles[type] || styles.success;

  return (
    <div className="animate-slide-up">
      <div
        className={`${style.bg} ${style.border} border-l-4 rounded-lg shadow-lg p-4 pr-8 min-w-[300px] max-w-md relative`}
      >
        <div className="flex items-start gap-3">
          <span className={`text-2xl flex-shrink-0 ${style.text}`}>{style.icon}</span>
          <div className="flex-1 space-y-2">
            <p className="text-text-primary font-medium text-sm">{message}</p>
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="text-sm font-semibold text-primary hover:text-highlight underline"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
