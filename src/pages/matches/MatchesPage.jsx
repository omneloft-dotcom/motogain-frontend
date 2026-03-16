import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import matchingsApi from "../../api/matchingsApi";
import { useAuth } from "../../context/AuthProvider";
import { getErrorMessage, logError } from "../../utils/errorHandler";

/**
 * MatchesPage - Kurye için uygun ilanlar (FAZ 16)
 *
 * Features:
 * - Skor bazlı eşleştirme
 * - Uyum seviyesi gösterimi
 * - "Neden Uygun?" breakdown dropdown
 * - Profil olmayan kullanıcıya uyarı
 */

const SCORE_COLORS = {
  "🔥 Çok Uygun": "bg-green-100 text-green-800 border-green-300",
  "✅ Uygun": "bg-blue-100 text-blue-800 border-blue-300",
  "⚠️ Kısmen Uygun": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "❌ Uygun Değil": "bg-red-100 text-red-800 border-red-300",
};

export default function MatchesPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBreakdown, setExpandedBreakdown] = useState(null);

  useEffect(() => {
    loadMatchedListings();
  }, []);

  const loadMatchedListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchingsApi.getMatchedListings();
      setListings(data);
    } catch (err) {
      logError("MatchesPage - loadMatchedListings", err);
      const errMsg = getErrorMessage(err);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleBreakdown = (listingId) => {
    setExpandedBreakdown(
      expandedBreakdown === listingId ? null : listingId
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Bana Uygun İlanlar
        </h1>
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">İlanlar eşleştiriliyor...</p>
        </div>
      </div>
    );
  }

  // Error state (profile missing)
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Bana Uygun İlanlar
        </h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Profil Gerekli
          </h2>
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

  // Empty state
  if (listings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Bana Uygun İlanlar
        </h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Uygun İlan Bulunamadı
          </h2>
          <p className="text-slate-600 max-w-md mb-6">
            Şu anda profilinize uygun ilan yok. Yeni ilanlar eklendiğinde
            burada görünecektir.
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Bana Uygun İlanlar
        </h1>
        <p className="text-slate-600">
          Profilinize uygun {listings.length} ilan listeleniyor
        </p>
      </div>

      {/* Listings Grid */}
      <div className="space-y-4">
        {listings.map((listing) => {
          const isExpanded = expandedBreakdown === listing._id;
          const scoreColor =
            SCORE_COLORS[listing.matchLevel] || "bg-gray-100 text-gray-800";

          return (
            <div
              key={listing._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link
                    to={`/listings/${listing._id}`}
                    className="text-xl font-bold text-slate-900 hover:text-blue-600"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-sm text-slate-500 mt-1">
                    {listing.category} • {listing.city}
                  </p>
                </div>

                {/* Score Badge */}
                <div className="flex flex-col items-end gap-2">
                  <div
                    className={`px-4 py-2 rounded-lg border font-semibold ${scoreColor}`}
                  >
                    {listing.matchScore}% Uyum
                  </div>
                  <div className="text-sm text-slate-600">
                    {listing.matchLevel}
                  </div>
                </div>
              </div>

              {/* Listing Details */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600">
                <div>
                  <span className="font-semibold text-slate-900">
                    {listing.price} ₺
                  </span>
                </div>
                <div>📍 {listing.city}</div>
                <div>📦 {listing.category}</div>
              </div>

              {/* Breakdown Toggle */}
              <button
                onClick={() => toggleBreakdown(listing._id)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm mb-3"
              >
                {isExpanded ? "Detayları Gizle ▲" : "Neden Uygun? ▼"}
              </button>

              {/* Breakdown List */}
              {isExpanded && (
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Eşleşme Detayları:
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {listing.matchBreakdown.map((reason, index) => (
                      <li key={index} className="text-slate-700">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Link
                  to={`/listings/${listing._id}`}
                  className="flex-1 bg-slate-900 text-white text-center px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  İlanı Görüntüle
                </Link>
                <Link
                  to={`/messages?listing=${listing._id}`}
                  className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mesaj Gönder
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Eşleştirme Nasıl Çalışır?
        </h3>
        <p className="text-blue-800 text-sm">
          Sistem, profilinizdeki bilgileri (şehir, kurye tipi, araç, ekipman,
          deneyim, platform) ilanlarla karşılaştırarak uyum skoru hesaplar.
          Sadece %40 ve üzeri uyum oranına sahip ilanlar gösterilir.
        </p>
      </div>
    </div>
  );
}
