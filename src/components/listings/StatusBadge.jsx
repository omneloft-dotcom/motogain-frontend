// FAZ 18: Standart ilan durum badge komponenti
// Tek kaynak, tutarlı görünüm

const STATUS_CONFIG = {
  // Backend status values (NEW)
  pending_approval: {
    label: "Beklemede",
    icon: "⏳",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    tooltip: "İlan moderasyon incelemesinde",
  },
  active: {
    label: "Yayında",
    icon: "✅",
    className: "bg-green-100 text-green-800 border-green-200",
    tooltip: "İlan aktif ve görünür",
  },
  inactive: {
    label: "Kapandı",
    icon: "🔒",
    className: "bg-slate-100 text-slate-800 border-slate-200",
    tooltip: "İlan kapatıldı veya reddedildi",
  },
  expired: {
    label: "Süresi Doldu",
    icon: "⏰",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    tooltip: "İlan süresi doldu",
  },
  // Legacy frontend status values (for backward compatibility)
  pending: {
    label: "Beklemede",
    icon: "⏳",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    tooltip: "İlan moderasyon incelemesinde",
  },
  approved: {
    label: "Yayında",
    icon: "✅",
    className: "bg-green-100 text-green-800 border-green-200",
    tooltip: "İlan aktif ve görünür",
  },
  rejected: {
    label: "Reddedildi",
    icon: "❌",
    className: "bg-red-100 text-red-800 border-red-200",
    tooltip: "İlan onaylanmadı",
  },
  closed: {
    label: "Kapandı",
    icon: "🔒",
    className: "bg-slate-100 text-slate-800 border-slate-200",
    tooltip: "İlan kapatıldı",
  },
};

export default function StatusBadge({ status, showIcon = true, size = "md" }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending_approval;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${config.className} ${sizeClasses[size]}`}
      title={config.tooltip}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}
