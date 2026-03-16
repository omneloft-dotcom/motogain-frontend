// src/components/admin/ApproveRejectButtons.jsx

/* 
  Props:
  - onApprove: () => void
  - onReject: () => void
  - isApproving: boolean
  - isRejecting: boolean
  - disabled: boolean (opsiyonel)
*/

const ApproveRejectButtons = ({
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
  disabled = false,
}) => {
  const isApproveDisabled = disabled || isApproving || isRejecting;
  const isRejectDisabled = disabled || isApproving || isRejecting;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onApprove}
        disabled={isApproveDisabled}
        className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition
          ${
            isApproveDisabled
              ? "cursor-not-allowed bg-emerald-100 text-emerald-400"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
      >
        {isApproving ? "Onaylanıyor..." : "Onayla"}
      </button>

      <button
        type="button"
        onClick={onReject}
        disabled={isRejectDisabled}
        className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition
          ${
            isRejectDisabled
              ? "cursor-not-allowed bg-rose-100 text-rose-400"
              : "bg-rose-500 text-white hover:bg-rose-600"
          }`}
      >
        {isRejecting ? "Reddediliyor..." : "Reddet"}
      </button>
    </div>
  );
};

export default ApproveRejectButtons;
