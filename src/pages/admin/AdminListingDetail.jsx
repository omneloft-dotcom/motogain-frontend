import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import adminApi from "../../api/adminApi";
import { useAuth } from "../../context/AuthProvider";
import { isPromotionsEnabled } from "../../utils/isPromotionsEnabled";

const severityColor = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-slate-100 text-slate-700",
};

export default function AdminListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [priceMeta, setPriceMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recheckingSpam, setRecheckingSpam] = useState(false);
  const [recheckingPrice, setRecheckingPrice] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [info, setInfo] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getListingById(id);
      setListing(data.listing || data);
      setPriceMeta(data.priceMeta || null);
    } catch (err) {
      setError("İlan yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleRecheckSpam = async () => {
    if (recheckingSpam) return;
    setRecheckingSpam(true);
    try {
      const updated = await adminApi.recheckListingSpam(id);
      setListing(updated.listing || updated);
    } catch (err) {
      setError("Spam analizi çalıştırılamadı");
    } finally {
      setRecheckingSpam(false);
    }
  };

  const handleRecheckPrice = async () => {
    if (recheckingPrice) return;
    setRecheckingPrice(true);
    try {
      const updated = await adminApi.recheckListingPrice(id);
      setListing(updated.listing || updated);
      setPriceMeta(updated.priceMeta || null);
    } catch (err) {
      setError("Fiyat analizi çalıştırılamadı");
    } finally {
      setRecheckingPrice(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setNoteLoading(true);
    const previous = listing;
    const optimistic = {
      ...listing,
      adminNotes: [
        {
          _id: `temp-${Date.now()}`,
          note: noteText.trim(),
          createdBy: { name: user?.name, role: user?.role },
          createdAt: new Date().toISOString(),
        },
        ...(listing.adminNotes || []),
      ],
    };
    setListing(optimistic);
    try {
      const res = await adminApi.addListingNote(id, noteText.trim());
      setListing(res.listing || listing);
      setNoteText("");
    } catch (err) {
      setError("Not eklenemedi");
      setListing(previous);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleGiveBoost = async () => {
    if (promoLoading) return;
    setPromoLoading(true);
    setInfo("");
    try {
      await adminApi.giveBoost(id);
      await load();
      setInfo("Boost verildi");
    } catch (err) {
      setError("Boost verilemedi");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemoveBoost = async () => {
    if (promoLoading) return;
    setPromoLoading(true);
    setInfo("");
    try {
      await adminApi.removeBoost(id);
      await load();
      setInfo("Boost kaldırıldı");
    } catch (err) {
      setError("Boost kaldırılamadı");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Notu silmek istiyor musunuz?")) return;
    const previous = listing;
    setListing({
      ...listing,
      adminNotes: (listing.adminNotes || []).filter((n) => n._id !== noteId),
    });
    try {
      const res = await adminApi.deleteListingNote(id, noteId);
      setListing(res.listing || listing);
    } catch (err) {
      setError("Not silinemedi");
      setListing(previous);
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-600">Yükleniyor...</div>;
  }

  if (error || !listing) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || "İlan bulunamadı"}</p>
        <Link to="/admin/pending-listings" className="text-indigo-600">
          Geri dön
        </Link>
      </div>
    );
  }

  const qualityFlags = (listing.flags || []).filter(
    (f) =>
      !["SPAM_RATE_LIMIT", "DUPLICATE_PHONE", "DUPLICATE_IMAGE", "SIMILAR_TEXT"].includes(
        f.code
      )
  );
  const spamFlags = (listing.flags || []).filter((f) =>
    ["SPAM_RATE_LIMIT", "DUPLICATE_PHONE", "DUPLICATE_IMAGE", "SIMILAR_TEXT"].includes(f.code)
  );
  const priceFlags = (listing.flags || []).filter((f) =>
    ["PRICE_TOO_LOW", "PRICE_TOO_HIGH"].includes(f.code)
  );
  const adminNotes = listing.adminNotes || [];
  const reviewHistory = listing.reviewHistory || [];
  const hasActiveBoost = Boolean(listing.promotion && listing.promotion.isActive);
  const boostEndsAt = listing.promotion?.endsAt
    ? new Date(listing.promotion.endsAt).toLocaleDateString("tr-TR")
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">İlan Detayı</h1>
          <p className="text-slate-600">{listing.title}</p>
        </div>
        {isPromotionsEnabled && listing?.promotion && (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            Promotion: {listing.promotion.type}
          </span>
        )}
        <Link
          to="/admin/pending-listings"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Bekleyen İlanlar
        </Link>
      </div>

      {isPromotionsEnabled && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-amber-900">Öne Çıkarma (Pilot)</h3>
            {hasActiveBoost ? (
              <p className="text-xs text-amber-800">
                Boost aktif {boostEndsAt ? `(Bitiş: ${boostEndsAt})` : ""}
              </p>
            ) : (
              <p className="text-xs text-amber-800">7 günlük boost verebilirsiniz.</p>
            )}
            {info && <p className="text-xs text-emerald-700 mt-1">{info}</p>}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
          <div className="flex gap-2">
            {hasActiveBoost ? (
              <button
                onClick={handleRemoveBoost}
                disabled={promoLoading}
                className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60"
              >
                {promoLoading ? "Kaldırılıyor..." : "Boost’u Kaldır"}
              </button>
            ) : (
              <button
                onClick={handleGiveBoost}
                disabled={promoLoading}
                className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-200 disabled:opacity-60"
              >
                {promoLoading ? "Veriliyor..." : "7 Günlük Boost Ver"}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Kalite Analizi</h3>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-slate-900">
              {Math.round(listing.qualityScore ?? 0)}
            </span>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                listing.riskLevel === "high"
                  ? "bg-red-100 text-red-700"
                  : listing.riskLevel === "medium"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              Risk: {listing.riskLevel || "low"}
            </span>
          </div>
          <div className="space-y-1">
            {qualityFlags.length === 0 ? (
              <p className="text-sm text-slate-600">Kalite flag'i yok.</p>
            ) : (
              qualityFlags.map((flag) => (
                <div key={flag.code} className="flex items-center gap-2 text-sm text-slate-800">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityColor[flag.severity] || "bg-slate-100 text-slate-700"}`}>
                    {flag.severity}
                  </span>
                  <span>{flag.message || flag.code}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Spam Sinyalleri</h3>
            <button
              onClick={handleRecheckSpam}
              disabled={recheckingSpam}
              className="rounded-lg bg-slate-900 text-white px-3 py-2 text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {recheckingSpam ? "Çalışıyor..." : "Spam Analizini Yeniden Çalıştır"}
            </button>
          </div>
          <div className="space-y-1">
            {spamFlags.length === 0 ? (
              <p className="text-sm text-slate-600">Spam sinyali yok.</p>
            ) : (
              spamFlags.map((flag) => (
                <div key={flag.code} className="flex items-center gap-2 text-sm text-slate-800">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityColor[flag.severity] || "bg-slate-100 text-slate-700"}`}>
                    {flag.severity}
                  </span>
                  <span>{flag.message || flag.code}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Fiyat Analizi</h3>
            <button
              onClick={handleRecheckPrice}
              disabled={recheckingPrice}
              className="rounded-lg bg-slate-900 text-white px-3 py-2 text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {recheckingPrice ? "Çalışıyor..." : "Fiyat Analizini Yeniden Çalıştır"}
            </button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-800 mb-3">
            <div>
              <p className="text-xs text-slate-500">İlan Fiyatı</p>
              <p className="font-semibold">{Number(listing.price).toLocaleString("tr-TR")} ₺</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Median (ref)</p>
              <p className="font-semibold">
                {priceMeta?.stats?.median
                  ? `${Number(priceMeta.stats.median).toLocaleString("tr-TR")} ₺`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">IQR</p>
              <p className="font-semibold">
                {priceMeta?.stats?.iqr !== undefined && priceMeta?.stats?.iqr !== null
                  ? Number(priceMeta.stats.iqr).toLocaleString("tr-TR")
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Referans Aralığı</p>
              <p className="font-semibold">
                {priceMeta?.stats?.lowerBound !== undefined && priceMeta?.stats?.upperBound !== undefined
                  ? `${Number(priceMeta.stats.lowerBound).toLocaleString("tr-TR")} ₺ - ${Number(
                      priceMeta.stats.upperBound
                    ).toLocaleString("tr-TR")} ₺`
                  : "-"}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {priceFlags.length === 0 ? (
              <p className="text-sm text-slate-600">Fiyat flag'i yok.</p>
            ) : (
              priceFlags.map((flag) => (
                <div key={flag.code} className="flex items-center gap-2 text-sm text-slate-800">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityColor[flag.severity] || "bg-slate-100 text-slate-700"}`}>
                    {flag.severity}
                  </span>
                  <span>{flag.message || flag.code}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Temel Bilgiler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-800">
          <div>
            <p className="text-slate-500 text-xs">Başlık</p>
            <p>{listing.title}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Fiyat</p>
            <p>{Number(listing.price).toLocaleString("tr-TR")} ₺</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Şehir</p>
            <p>{listing.city || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Oluşturan</p>
            <p>{listing.createdBy?.name || "-"}</p>
            <p className="text-xs text-slate-500">{listing.createdBy?.email || "-"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Admin Notları</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
            {adminNotes.length === 0 ? (
              <p className="text-sm text-slate-600">Henüz not yok.</p>
            ) : (
              adminNotes.map((n) => (
                <div
                  key={n._id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 flex justify-between items-start gap-3"
                >
                  <div>
                    <p className="text-sm text-slate-800 whitespace-pre-line">{n.note}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {n.createdBy?.name || "Admin"} ·{" "}
                      {n.createdAt ? new Date(n.createdAt).toLocaleString("tr-TR") : ""}
                    </p>
                  </div>
                  {user?.role === "superadmin" && (
                    <button
                      onClick={() => handleDeleteNote(n._id)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      Sil
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Yeni not ekle (sadece adminler görür)"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddNote}
                disabled={noteLoading || !noteText.trim()}
                className="rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                {noteLoading ? "Kaydediliyor..." : "Not Ekle"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">İnceleme Geçmişi</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {reviewHistory.length === 0 ? (
              <p className="text-sm text-slate-600">Kayıt yok.</p>
            ) : (
              reviewHistory.map((h) => (
                <div key={h._id} className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{h.action}</p>
                    {h.reason && <p className="text-xs text-slate-600">Sebep: {h.reason}</p>}
                    <p className="text-xs text-slate-500">
                      {h.admin?.name || "Admin"} ·{" "}
                      {h.createdAt ? new Date(h.createdAt).toLocaleString("tr-TR") : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

