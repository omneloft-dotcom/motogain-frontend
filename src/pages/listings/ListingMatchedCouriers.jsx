import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import matchApi from "../../api/matchApi";
import conversationsApi from "../../api/conversationsApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * FAZ 16: Listing Matched Couriers Page
 * Shows couriers matched to a specific listing
 */

const SCORE_COLORS = {
  "🔥 Çok Uygun": "bg-green-100 text-green-800 border-green-300",
  "✅ Uygun": "bg-blue-100 text-blue-800 border-blue-300",
  "⚠️ Kısmen Uygun": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "💡 Düşük Uyum": "bg-gray-100 text-gray-800 border-gray-300",
};

export default function ListingMatchedCouriers() {
  const { id: listingId } = useParams();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBreakdown, setExpandedBreakdown] = useState(null);

  useEffect(() => {
    loadMatches();
  }, [listingId]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchApi.getMatchedCouriersForListing(listingId);
      setMatches(data.matches || []);
    } catch (err) {
      console.error("Load matched couriers error:", err);
      setError(err.response?.data?.message || "Kuryeler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const toggleBreakdown = (profileId) => {
    setExpandedBreakdown(expandedBreakdown === profileId ? null : profileId);
  };

  const handleStartConversation = async (courierId) => {
    try {
      const { conversationId } = await conversationsApi.startConversation(listingId, courierId);
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      console.error("Start conversation error:", err);
    }
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
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Uygun Kuryeler</h1>
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Uygun Kuryeler</h1>
        <div className="text-center py-20 text-red-600">{error}</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Uygun Kuryeler</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Uygun Kurye Bulunamadı</h2>
          <p className="text-slate-600 max-w-md">
            Bu ilana uygun kurye profili bulunmuyor. Kurye kayıt oldukça burada görünecektir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Uygun Kuryeler</h1>
        <p className="text-slate-600">İlanınıza uygun {matches.length} kurye listeleniyor</p>
      </div>

      {/* Matches Grid */}
      <div className="space-y-4">
        {matches.map((match) => {
          const { profile, score, breakdown, matchLevel } = match;
          const isExpanded = expandedBreakdown === profile._id;
          const scoreColor = SCORE_COLORS[matchLevel] || "bg-gray-100 text-gray-800";

          return (
            <div
              key={profile._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                  {/* Profile Photo */}
                  {profile.user?.photo && (
                    <img
                      src={profile.user.photo}
                      alt={profile.user?.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                    />
                  )}
                  {!profile.user?.photo && (
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {profile.user?.name || "Kurye"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {profile.location?.city || "Şehir belirtilmemiş"}
                      {profile.location?.district && ` / ${profile.location.district}`}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.courierTypes?.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
                        >
                          {type.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score Badge */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className={`px-4 py-2 rounded-lg border font-semibold ${scoreColor}`}>
                    {score}%
                  </div>
                  <div className="text-xs text-slate-600">{matchLevel}</div>
                </div>
              </div>

              {/* Courier Details */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600">
                <div>📍 {profile.location?.city || "Şehir yok"}</div>
                {profile.experienceYears !== undefined && (
                  <div>⏱️ {profile.experienceYears} yıl deneyim</div>
                )}
                {profile.platforms?.length > 0 && (
                  <div>🏢 {profile.platforms.join(", ")}</div>
                )}
              </div>

              {/* Breakdown Toggle */}
              <button
                onClick={() => toggleBreakdown(profile._id)}
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
              <button
                onClick={() => handleStartConversation(profile.user._id)}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                💬 Mesaj Gönder
              </button>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Eşleştirme Nasıl Çalışır?</h3>
        <p className="text-blue-800 text-sm">
          Sistem, kuryelerin profillerini (şehir, kurye tipi, araç, deneyim, müsaitlik) ilanınızla
          karşılaştırarak uyum skoru hesaplar. Sadece %40 ve üzeri uyum oranına sahip kuryeler
          gösterilir.
        </p>
      </div>
    </div>
  );
}
