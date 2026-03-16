import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import adminApi from "../../api/adminApi";
import { TableSkeleton } from "../../components/common/Skeleton";

const riskBadge = (risk) => {
  if (risk === "high") return "bg-red-100 text-red-700";
  if (risk === "medium") return "bg-amber-100 text-amber-800";
  return "bg-emerald-100 text-emerald-700";
};

export default function ListingDetailAdmin() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getListingById(id);
      setListing(data);
    } catch (err) {
      setMessage("İlan getirilemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleRecheck = async () => {
    try {
      setMessage(null);
      await adminApi.recheckListingQuality(id);
      await load();
      setMessage("Kalite analizi güncellendi");
    } catch (err) {
      setMessage("Kalite analizi başarısız");
    }
  };

  if (loading) {
    return <TableSkeleton rows={4} columns={3} />;
  }

  if (!listing) {
    return (
      <div className="p-6">
        <p className="text-red-600">İlan bulunamadı</p>
        <Link to="/admin/pending-listings" className="text-indigo-600 hover:text-indigo-700">
          Geri dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{listing.title}</h1>
          <p className="text-sm text-slate-600">{listing.city}</p>
        </div>
        <Link
          to="/admin/pending-listings"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Geri
        </Link>
      </div>

      {message && <div className="text-sm text-slate-600">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-800">İlan Bilgisi</h2>
          <p className="text-sm text-slate-700">Fiyat: {listing.price} ₺</p>
          <p className="text-sm text-slate-700">Kategori: {listing.category}</p>
          <p className="text-sm text-slate-700">Durum: {listing.status}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Kalite Analizi</h2>
            <button
              onClick={handleRecheck}
              className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-800"
            >
              Yeniden Analiz Et
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-slate-900">
              {Math.round(listing.qualityScore ?? 0)}
            </span>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${riskBadge(
                listing.riskLevel
              )}`}
            >
              {listing.riskLevel || "low"}
            </span>
            <span className="text-xs text-slate-500">
              Flag sayısı: {listing.flags?.length || 0}
            </span>
          </div>
          {listing.flags?.length ? (
            <ul className="space-y-2">
              {listing.flags.map((f, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <span>{f.message}</span>
                    <span className="text-xs font-semibold text-slate-500">{f.severity}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">Flag bulunmuyor.</p>
          )}
        </div>
      </div>
    </div>
  );
}

