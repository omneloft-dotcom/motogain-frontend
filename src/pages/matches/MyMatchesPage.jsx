import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import matchApi from "../../api/matchApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * FAZ 16: My Matches Page
 * Shows listings matched to the current courier's profile
 */

const SCORE_COLORS = {
  "🔥 Çok Uygun": "bg-green-100 text-green-800 border-green-300",
  "✅ Uygun": "bg-blue-100 text-blue-800 border-blue-300",
  "⚠️ Kısmen Uygun": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "💡 Düşük Uyum": "bg-gray-100 text-gray-800 border-gray-300",
};

export default function MyMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBreakdown, setExpandedBreakdown] = useState(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchApi.getMatchedListingsForMe();
      setMatches(data.matches || []);
    } catch (err) {
      console.error("Load matches error:", err);
      setError(err.response?.data?.message || "Eşleşmeler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const toggleBreakdown = (listingId) => {
    setExpandedBreakdown(expandedBreakdown === listingId ? null : listingId);
  };

  const getBreakdownText = (breakdown) => {
    const items = [];

    if (breakdown.location > 0) {
      items.push(`📍 Konum uyumu: ${breakdown.location} puan`);
    }

    if (breakdown.courierType > 0) {
      items.push(`🚴 Kurye tipi uyumu: ${breakdown.courierType} puan`);
    }

    if (breakdown.vehicle > 0) {
      items.push(`🏍️ Araç uyumu: ${breakdown.vehicle} puan`);
    }

    if (breakdown.availability > 0) {
      items.push(`📅 Müsaitlik uyumu: ${breakdown.availability} puan`);
    }

    if (breakdown.experience > 0) {
      items.push(`⭐ Deneyim: ${breakdown.experience} puan`);
    }

    return items;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Bana Uygun İlanlar</h1>
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Bana Uygun İlanlar</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profil Gerekli</h2>
          <p className="text-slate-600 max-w-md mb-6">{error}</p>
          <Link
            to="/profile"
            className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Profilimi Tamamla
          </Link>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Bana Uygun İlanlar</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Uygun İlan Bulunamadı</h2>
          <p className="text-slate-600 max-w-md mb-6">
            Şu anda profilinize uygun ilan yok. Yeni ilanlar eklendiğinde burada görünecektir.
          </p>
          <Link
            to="/listings"
            className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Tüm İlanları Gör
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bana Uygun İlanlar</h1>
        <p className="text-slate-600">Profilinize uygun {matches.length} ilan listeleniyor</p>
      </div>

      {/* Matches Grid */}
      <div className="space-y-4">
        {matches.map((match) => {
          const { listing, score, breakdown, matchLevel } = match;
          const isExpanded = expandedBreakdown === listing._id;
          const scoreColor = SCORE_COLORS[matchLevel] || "bg-gray-100 text-gray-800";

          return (
            <div
              key={listing._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link
                    to={`/listings/${listing._id}`}
                    className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-sm text-slate-500 mt-1">
                    {listing.category} • {listing.city}
                    {listing.district && ` / ${listing.district}`}
                  </p>
                </div>

                {/* Score Badge */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className={`px-4 py-2 rounded-lg border font-semibold ${scoreColor}`}>
                    {score}% Uyum
                  </div>
                  <div className="text-sm text-slate-600">{matchLevel}</div>
                </div>
              </div>

              {/* Listing Details */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600">
                {listing.price && (
                  <div>
                    <span className="font-semibold text-slate-900">
                      {Number(listing.price).toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                )}
                <div>📍 {listing.city}</div>
                <div>📦 {listing.category}</div>
              </div>

              {/* Breakdown Toggle */}
              <button
                onClick={() => toggleBreakdown(listing._id)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm mb-3 transition-colors"
              >
                {isExpanded ? "Detayları Gizle ▲" : "Neden Uygun? ▼"}
              </button>

              {/* Breakdown List */}
              {isExpanded && (
                <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
                  <h4 className="font-semibold text-slate-900 mb-2">Eşleşme Detayları:</h4>
                  <ul className="space-y-1 text-sm">
                    {getBreakdownText(breakdown).map((text, index) => (
                      <li key={index} className="text-slate-700">
                        {text}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 mt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500">Toplam Skor: {score}/100</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Link
                to={`/listings/${listing._id}`}
                className="block w-full bg-blue-600 text-white text-center px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                İlanı Görüntüle & Mesaj Gönder
              </Link>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Eşleştirme Nasıl Çalışır?</h3>
        <p className="text-blue-800 text-sm">
          Sistem, profilinizdeki bilgileri (şehir, kurye tipi, araç, deneyim, müsaitlik) ilanlarla
          karşılaştırarak uyum skoru hesaplar. Sadece %40 ve üzeri uyum oranına sahip ilanlar
          gösterilir.
        </p>
      </div>
    </div>
  );
}
