// FAZ 18: Sade ilan kapatma modal'ı
// Nedeni seç + onayla - o kadar

import { useState } from "react";

const CLOSE_REASONS = [
  { value: "sold", label: "Satıldı", icon: "✅", description: "Ürün satıldı" },
  { value: "cancelled", label: "Vazgeçtim", icon: "🚫", description: "İlanı iptal ediyorum" },
  { value: "wrong", label: "Yanlış İlan", icon: "⚠️", description: "Hatalı ilan oluşturdum" },
  { value: "other", label: "Diğer", icon: "💬", description: "Başka bir sebep" },
];

export default function CloseListingModal({ isOpen, onClose, onConfirm, listingTitle }) {
  const [selectedReason, setSelectedReason] = useState("sold");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedReason) return;

    setLoading(true);
    try {
      await onConfirm(selectedReason);
      onClose();
    } catch (err) {
      console.error("Close listing error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">İlanı Kapat</h2>
          <p className="text-sm text-slate-600 line-clamp-1">
            <span className="font-medium">{listingTitle}</span>
          </p>
        </div>

        {/* Close Reasons */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Kapatma nedenini seçin:
          </p>

          {CLOSE_REASONS.map((reason) => (
            <label
              key={reason.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedReason === reason.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="closeReason"
                value={reason.value}
                checked={selectedReason === reason.value}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{reason.icon}</span>
                  <span className="font-semibold text-slate-900">
                    {reason.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{reason.description}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !selectedReason}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Kapatılıyor..." : "İlanı Kapat"}
          </button>
        </div>
      </div>
    </div>
  );
}
