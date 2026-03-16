import { useState } from "react";
import messageApi from "../../api/messageApi";

export default function OfferBubble({ message, isMine, senderName, listing, currentUserId, onOfferRespond }) {
  const [responding, setResponding] = useState(false);
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");

  const handleRespond = async (action) => {
    // Validate that current user is the recipient
    const messageRecipient = normalizeId(message.recipient?._id || message.recipient);
    const normalizedCurrentUserId = normalizeId(currentUserId);

    if (messageRecipient !== normalizedCurrentUserId) {
      alert("Bu teklife sadece alıcı cevap verebilir");
      return;
    }

    try {
      setResponding(true);
      const result = await messageApi.respondToOffer(message._id, action);

      // Notify parent to refresh messages
      if (onOfferRespond) {
        onOfferRespond(result);
      }
    } catch (err) {
      console.error("Teklif cevaplama hatası:", err);
      const errorMsg = err.response?.data?.message || "Teklif cevaplanamadı";
      alert(errorMsg);
    } finally {
      setResponding(false);
    }
  };

  const handleCounterOffer = async () => {
    if (!counterAmount || counterAmount <= 0) {
      alert("Geçerli bir teklif tutarı giriniz");
      return;
    }

    try {
      setResponding(true);
      const result = await messageApi.counterOffer(message._id, Number(counterAmount));

      // Notify parent to refresh messages
      if (onOfferRespond) {
        onOfferRespond(result);
      }

      setCounterAmount("");
      setShowCounterInput(false);
    } catch (err) {
      console.error("Karşı teklif hatası:", err);
      const errorMsg = err.response?.data?.message || "Karşı teklif gönderilemedi";
      alert(errorMsg);
    } finally {
      setResponding(false);
    }
  };

  const getStatusBadge = () => {
    const { offerStatus } = message;

    if (offerStatus === "accepted") {
      return (
        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
          ✓ Kabul Edildi
        </span>
      );
    }

    if (offerStatus === "rejected") {
      return (
        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
          ✗ Reddedildi
        </span>
      );
    }

    if (offerStatus === "expired") {
      return (
        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full">
          ⌛ Süresi Doldu
        </span>
      );
    }

    return (
      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full">
        ⏳ Bekliyor
      </span>
    );
  };

  // CRITICAL: Can only respond if:
  // 1. Not the sender (isMine = false)
  // 2. Is recipient of the offer (can be listing owner OR user who received counter offer)
  // 3. Offer is still pending
  const normalizeId = (id) => {
    if (!id) return "";
    if (typeof id === "string") return id;
    if (typeof id === "object" && id._id) return String(id._id);
    return String(id);
  };

  const isListingOwner = listing && normalizeId(listing.createdBy) === normalizeId(currentUserId);

  // ✅ FIX: Can respond if current user is the recipient of the offer
  const messageRecipient = normalizeId(message.recipient?._id || message.recipient);
  const isRecipient = messageRecipient === normalizeId(currentUserId);
  const canRespond = isRecipient && message.offerStatus === "pending";

  // ✅ Counter offer button: Only listing owner can counter
  const canCounterOffer = isRecipient && isListingOwner && message.offerStatus === "pending";

  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-600 font-semibold mb-1">
        {isMine ? "Ben" : senderName}
      </span>

      <div
        className={`p-4 rounded-lg border-2 ${
          message.isFinalDeal
            ? "bg-green-50 border-green-400"
            : isMine
            ? "bg-blue-50 border-blue-300"
            : "bg-gray-50 border-gray-300"
        }`}
      >
        {/* Parent Offer Reference - show chain */}
        {message.parentOffer && (
          <div className="mb-3 text-xs text-gray-600 italic">
            ↪ {message.parentOffer.offerAmount?.toLocaleString("tr-TR")} ₺ teklifine karşı
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💰</span>
          <span className="text-xl font-bold text-gray-900">
            {message.offerAmount?.toLocaleString("tr-TR")} ₺
          </span>
        </div>

        <div className="mb-3">{getStatusBadge()}</div>

        {canRespond && !showCounterInput && (
          <div className="space-y-2 mt-3">
            <div className="flex gap-2">
              <button
                onClick={() => handleRespond("accept")}
                disabled={responding}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition"
              >
                {responding ? "..." : "✓ Kabul Et"}
              </button>
              <button
                onClick={() => handleRespond("reject")}
                disabled={responding}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition"
              >
                {responding ? "..." : "✗ Reddet"}
              </button>
            </div>
            {/* Only listing owner can counter offer */}
            {canCounterOffer && (
              <button
                onClick={() => setShowCounterInput(true)}
                disabled={responding}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium transition"
              >
                🔁 Karşı Teklif Ver
              </button>
            )}
          </div>
        )}

        {canCounterOffer && showCounterInput && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-300 rounded-lg">
            <div className="mb-2">
              <label className="text-sm text-gray-700 font-medium mb-1 block">
                Önceki teklif: {message.offerAmount?.toLocaleString("tr-TR")} ₺
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 border rounded-lg p-2 outline-none"
                  placeholder="Karşı teklif tutarı"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCounterOffer()}
                />
                <span className="text-gray-700 font-medium">₺</span>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCounterOffer}
                disabled={responding}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium transition"
              >
                {responding ? "..." : "✓ Gönder"}
              </button>
              <button
                onClick={() => {
                  setShowCounterInput(false);
                  setCounterAmount("");
                }}
                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 font-medium transition"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
