import { useToast } from "../../context/ToastContext";
import Toast from "./Toast";

/**
 * ToastContainer - Global toast renderer
 * Renders all active toasts at the root level to escape overflow constraints
 * Positioned: bottom-right, z-index: 9999
 */
export default function ToastContainer() {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-[9999] p-6 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            actionLabel={toast.actionLabel}
            onAction={toast.onAction}
            onClose={() => hideToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </div>
    </div>
  );
}
