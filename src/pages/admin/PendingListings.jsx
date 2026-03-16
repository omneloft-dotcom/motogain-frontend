import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../api/adminApi";

export default function PendingListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    riskLevel: "",
    minQualityScore: "",
    spamRisk: "",
    priceAnomaly: "",
    flag: "",
  });

  const fetchListings = async () => {
    try {
      const params = {};
      if (filters.riskLevel) params.riskLevel = filters.riskLevel;
      if (filters.minQualityScore) params.minQualityScore = filters.minQualityScore;
      if (filters.spamRisk) params.spamRisk = filters.spamRisk;
    if (filters.priceAnomaly) params.priceAnomaly = filters.priceAnomaly;
      if (filters.flag) params.flag = filters.flag;
      const res = await adminApi.getPendingListings(params);
      setListings(res);
    } catch (err) {
      console.error("Pending fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [
    filters.riskLevel,
    filters.minQualityScore,
    filters.spamRisk,
    filters.priceAnomaly,
    filters.flag,
  ]);

  const handleApprove = async (id) => {
    try {
      if (!confirm("Bu ilanı onaylamak istediğinize emin misiniz?")) return;

      await adminApi.approveListing(id);

      // Success feedback
      alert("✓ İlan başarıyla onaylandı");

      // Refresh list
      await fetchListings();
    } catch (err) {
      console.error("Approve error:", err);
      // Error feedback
      const errorMsg = err.response?.data?.message || err.message || "İlan onaylanamadı";
      alert("✗ Hata: " + errorMsg);
    }
  };

  const handleReject = async (id) => {
    try {
      const reason = prompt("Red sebebi giriniz (zorunlu):");
      if (!reason || reason.trim().length === 0) return;

      await adminApi.rejectListing(id, reason.trim());

      // Success feedback
      alert("✓ İlan başarıyla reddedildi");

      // Refresh list
      await fetchListings();
    } catch (err) {
      console.error("Reject error:", err);
      // Error feedback
      const errorMsg = err.response?.data?.message || err.message || "İlan reddedilemedi";
      alert("✗ Hata: " + errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Bekleyen ilan yok
        </h2>
        <p className="text-slate-600 max-w-md">
          Şu anda moderasyon bekleyen ilan bulunmuyor. Yeni ilanlar
          eklendiğinde buradan inceleyebilir ve onaylayabilirsin.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Bekleyen İlanlar
        </h1>
        <p className="text-slate-600">
          Moderasyon bekleyen {listings.length} ilan listeleniyor
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters((f) => ({ ...f, riskLevel: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Risk (hepsi)</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.minQualityScore}
            onChange={(e) => setFilters((f) => ({ ...f, minQualityScore: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-40"
            placeholder="Min kalite skoru"
          />
          <select
            value={filters.spamRisk}
            onChange={(e) => setFilters((f) => ({ ...f, spamRisk: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Spam Risk (hepsi)</option>
            <option value="true">Evet</option>
          </select>
          <select
            value={filters.priceAnomaly}
            onChange={(e) => setFilters((f) => ({ ...f, priceAnomaly: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Fiyat Anomali (hepsi)</option>
            <option value="true">Evet</option>
          </select>
          <select
            value={filters.flag}
            onChange={(e) => setFilters((f) => ({ ...f, flag: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Flag (hepsi)</option>
            <option value="SPAM_RATE_LIMIT">SPAM_RATE_LIMIT</option>
            <option value="DUPLICATE_PHONE">DUPLICATE_PHONE</option>
            <option value="DUPLICATE_IMAGE">DUPLICATE_IMAGE</option>
            <option value="SIMILAR_TEXT">SIMILAR_TEXT</option>
            <option value="PRICE_TOO_LOW">PRICE_TOO_LOW</option>
            <option value="PRICE_TOO_HIGH">PRICE_TOO_HIGH</option>
          </select>
          <button
            onClick={() =>
              setFilters({
                riskLevel: "",
                minQualityScore: "",
                spamRisk: "",
                priceAnomaly: "",
                flag: "",
              })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Temizle
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                İlan Başlığı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Şehir
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Fiyat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Kalite Skoru
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Risk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Flag
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Spam Risk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Fiyat Anomali
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {listings.map((listing) => (
              <tr key={listing._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">
                    {listing.title}
                  </div>
                  <div className="text-sm text-slate-500">
                    {listing.category}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {listing.createdBy?.name || "Bilinmiyor"}
                  </div>
                  <div className="text-sm text-slate-500">
                    {listing.createdBy?.email || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {listing.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {Number(listing.price).toLocaleString("tr-TR")} ₺
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                    {Math.round(listing.qualityScore ?? 0)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      listing.riskLevel === "high"
                        ? "bg-red-100 text-red-700"
                        : listing.riskLevel === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {listing.riskLevel || "low"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  <span
                    title={(listing.flags || [])
                      .map((f) => `${f.code || ""} - ${f.message || ""}`)
                      .join("\n")}
                  >
                    {listing.flags?.length || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      listing.flags?.some((f) =>
                        ["SPAM_RATE_LIMIT", "DUPLICATE_PHONE", "DUPLICATE_IMAGE", "SIMILAR_TEXT"].includes(
                          f.code
                        )
                      )
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                    title={(listing.flags || [])
                      .filter((f) =>
                        ["SPAM_RATE_LIMIT", "DUPLICATE_PHONE", "DUPLICATE_IMAGE", "SIMILAR_TEXT"].includes(
                          f.code
                        )
                      )
                      .map((f) => f.message || f.code)
                      .join("\n")}
                  >
                    {listing.flags?.some((f) =>
                      ["SPAM_RATE_LIMIT", "DUPLICATE_PHONE", "DUPLICATE_IMAGE", "SIMILAR_TEXT"].includes(f.code)
                    )
                      ? "Yes"
                      : "No"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      listing.flags?.some((f) => ["PRICE_TOO_LOW", "PRICE_TOO_HIGH"].includes(f.code))
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                    title={(listing.flags || [])
                      .filter((f) => ["PRICE_TOO_LOW", "PRICE_TOO_HIGH"].includes(f.code))
                      .map((f) => f.message || f.code)
                      .join("\n")}
                  >
                    {listing.flags?.some((f) => ["PRICE_TOO_LOW", "PRICE_TOO_HIGH"].includes(f.code))
                      ? "Yes"
                      : "No"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/listings/${listing._id}`}
                      className="bg-slate-200 text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                    >
                      Detay
                    </Link>
                    <button
                      onClick={() => handleApprove(listing._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => handleReject(listing._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Reddet
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
