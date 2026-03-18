import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import listingsApi from "../../api/listingsApi";
import conversationsApi from "../../api/conversationsApi";
import matchingsApi from "../../api/matchingsApi";
import messagesApi from "../../api/messagesApi";
import reportsApi from "../../api/reportsApi";
import blocksApi from "../../api/blocksApi";
import { useAuth } from "../../context/AuthProvider";
import { useToast } from "../../context/ToastContext";
import ImageSwipeCarousel from "../../components/listings/ImageSwipeCarousel";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatPriceFull } from "../../components/listings/ListingCard";
import { isPromotionsEnabled } from "../../utils/isPromotionsEnabled";
import TargetFavoriteIcon from "../../components/icons/TargetFavoriteIcon";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, favorites, toggleFavorite } = useAuth();
  const { showToast } = useToast();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [ctaLoading, setCtaLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [optimisticFav, setOptimisticFav] = useState(null);

  // FAZ 16: Matching Couriers Tab
  const [activeTab, setActiveTab] = useState("details");
  const [matchedCouriers, setMatchedCouriers] = useState([]);
  const [couriersLoading, setCouriersLoading] = useState(false);
  const [expandedBreakdown, setExpandedBreakdown] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const data = await listingsApi.getListingById(id);
        setListing(data);
      } catch (err) {
        console.error("İlan yüklenemedi:", err);
        setError("İlan bulunamadı.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id]);

  const handleMessageSeller = async () => {
    if (!user) {
      navigate("/login", { state: { redirect: `/listings/${id}` } });
      return;
    }
    if (ctaLoading) return;
    if (isOwner) return;
    if (!listing || !listing._id) {
      setError("İlan bilgisi yüklenemedi. Lütfen sayfayı yenileyin.");
      return;
    }
    try {
      setCtaLoading(true);
      setError("");
      if (!sellerId) {
        setError("Satıcı bilgisi bulunamadı.");
        return;
      }
      const { conversationId } = await conversationsApi.startConversation(listing._id, sellerId);
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      console.error("Mesaj başlatma hatası:", err);
      setError("Mesaj başlatılamadı. Lütfen tekrar deneyin.");
    } finally {
      setCtaLoading(false);
    }
  };

  const handleMakeOffer = () => {
    setShowOfferModal(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();

    if (!listing || !listing._id) {
      setError("İlan bilgisi yüklenemedi. Lütfen sayfayı yenileyin.");
      return;
    }

    try {
      setError("");

      // First, start/get conversation with the seller
      if (!sellerId) {
        setError("Satıcı bilgisi bulunamadı.");
        return;
      }
      const { conversationId } = await conversationsApi.startConversation(listing._id, sellerId);

      // Send the offer through the conversation
      await messagesApi.sendOffer(conversationId, Number(offerPrice));

      // Close modal and reset form
      setShowOfferModal(false);
      setOfferPrice("");

      // Navigate to the conversation
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      console.error("Teklif gönderme hatası:", err);
      setError("Teklif gönderilemedi. Lütfen tekrar deneyin.");
      setShowOfferModal(false);
    }
  };

  // FAZ 16: Load Matched Couriers
  const loadMatchedCouriers = async () => {
    try {
      setCouriersLoading(true);
      const data = await matchingsApi.getMatchedCouriers(id);
      setMatchedCouriers(data);
    } catch (err) {
      console.error("Matched couriers error:", err);
    } finally {
      setCouriersLoading(false);
    }
  };

  const toggleBreakdown = (courierId) => {
    setExpandedBreakdown(expandedBreakdown === courierId ? null : courierId);
  };

  const handleStartConversationWithCourier = async (courierId) => {
    if (!listing || !listing._id) {
      setError("İlan bilgisi yüklenemedi. Lütfen sayfayı yenileyin.");
      return;
    }
    try {
      const { conversationId } = await conversationsApi.startConversation(
        listing._id,
        courierId
      );
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      console.error("Conversation start error:", err);
      setError("Mesaj başlatılamadı. Lütfen tekrar deneyin.");
    }
  };

  // 🔒 MODERATION: Report listing
  const handleReportListing = async () => {
    if (!user) {
      navigate("/login", { state: { redirect: `/listings/${id}` } });
      return;
    }
    if (!listing || !listing._id) return;

    const reason = prompt("Şikayet nedeni:\n(Spam, Yanıltıcı içerik, Uygunsuz içerik, vb.)");
    if (!reason || reason.trim() === "") {
      return; // User cancelled or empty reason
    }

    try {
      await reportsApi.reportListing(listing._id, reason.trim());
      showToast("Şikayetiniz alındı. İnceleme süreci başlatıldı.", { type: "success" });
    } catch (err) {
      console.error("Report listing error:", err);
      showToast("Şikayet gönderilemedi. Lütfen tekrar deneyin.", { type: "error" });
    }
  };

  // 🔒 MODERATION: Block user
  const handleBlockUser = async () => {
    if (!user) {
      navigate("/login", { state: { redirect: `/listings/${id}` } });
      return;
    }
    if (!sellerId) {
      showToast("Kullanıcı bilgisi bulunamadı.", { type: "error" });
      return;
    }

    const confirmed = confirm("Bu kullanıcıyı engellemek istiyor musunuz?\n\nEngelledikten sonra bu kullanıcının ilanlarını göremez ve size mesaj gönderemez.");
    if (!confirmed) return;

    try {
      await blocksApi.blockUser(sellerId);
      showToast("Kullanıcı engellendi.", { type: "success" });
      // Optionally navigate away from blocked user's listing
      setTimeout(() => navigate("/listings"), 1500);
    } catch (err) {
      console.error("Block user error:", err);
      const message = err.response?.data?.message || "Kullanıcı engellenemedi. Lütfen tekrar deneyin.";
      showToast(message, { type: "error" });
    }
  };

  // Helper function to safely normalize any ID format
  const normalizeId = (v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") {
      if (v._id) return String(v._id);
      return String(v);
    }
    return String(v);
  };

  const relTime = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return "Bugün";
    if (days === 1) return "1 gün önce";
    if (days < 7) return `${days} gün önce`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} hf önce`;
    const months = Math.floor(days / 30);
    return `${months} ay önce`;
  };

  // Helper: Filter out MongoDB ObjectIds from being displayed as names
  const isObjectId = (value) => {
    if (typeof value !== 'string') return false;
    return /^[a-fA-F0-9]{24}$/.test(value.trim());
  };

  // Helper: Extract safe seller display name from canonical detail
  const getSellerName = () => {
    if (!listing) return null;

    // Try createdBy.name (canonical populated field from backend)
    const createdByName = listing.createdBy?.name;
    if (createdByName && typeof createdByName === 'string' && createdByName.trim() && !isObjectId(createdByName)) {
      return createdByName.trim();
    }

    // Try other potential seller name fields
    const candidates = [
      listing.sellerName,
      listing.createdByName,
      listing.contactName,
      listing.ownerName
    ];

    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'string' && candidate.trim() && !isObjectId(candidate)) {
        return candidate.trim();
      }
    }

    return null;
  };

  // Helper: Check if listing is available for interactions
  const isListingAvailable = () => {
    if (!listing) return false;
    const status = listing.status;
    // Backend allows "active" or "approved" (legacy) for non-admin users
    return status === 'active' || status === 'approved';
  };

  const userId = normalizeId(user?._id || user?.id);
  const listingCanonicalId = normalizeId(listing?._id || listing?.id || id);
  const ownerId = normalizeId(listing?.createdBy?._id || listing?.createdBy || listing?.sellerId || listing?.ownerId);
  const sellerId = normalizeId(listing?.createdBy?._id || listing?.createdBy || listing?.sellerId || listing?.ownerId);
  const isOwner = Boolean(userId && ownerId && userId === ownerId);
  const canonicalListingUrl = `https://cordy.app/listings/${id || listingCanonicalId}`;

  const favFromContext = useMemo(() => {
    if (!listingCanonicalId || !Array.isArray(favorites)) return false;
    return favorites.map(normalizeId).includes(listingCanonicalId);
  }, [favorites, listingCanonicalId]);

  useEffect(() => {
    setOptimisticFav(null);
  }, [listingCanonicalId]);

  const isFavorite = optimisticFav !== null ? optimisticFav : favFromContext;

  useEffect(() => {
    if (optimisticFav === null) return;
    if (optimisticFav === favFromContext) {
      setOptimisticFav(null);
    }
  }, [favFromContext, optimisticFav]);

  useEffect(() => {
    if (optimisticFav === null) return undefined;

    const timeout = window.setTimeout(() => {
      setOptimisticFav(null);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [optimisticFav]);

  useEffect(() => {
    setExpandedDesc(false);
  }, [listingCanonicalId]);

  // 🔄 GELİŞTİRME 3: Fiyat formatı (kiralık için periyot ekle)
  const priceText = useMemo(() => {
    if (!listing) return '—';
    const basePrice = formatPriceFull(listing.price);
    if (listing.listingType === 'rent' && listing.rentalDetails?.period) {
      const periodMap = {
        daily: '/gün',
        weekly: '/hafta',
        monthly: '/ay'
      };
      const periodSuffix = periodMap[listing.rentalDetails.period];
      return periodSuffix ? `${basePrice.replace(' ₺', '')}${periodSuffix}` : basePrice;
    }
    return basePrice;
  }, [listing]);
  const postedText = useMemo(() => {
    if (!listing?.createdAt) return "";
    try {
      return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(listing.createdAt));
    } catch {
      return relTime(listing?.createdAt);
    }
  }, [listing?.createdAt]);

  const formatDetailValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return value.toLocaleString("tr-TR");
    if (typeof value === "string") return value.trim();
    return String(value);
  };

  const createDetailRow = (label, value) => {
    const displayValue = formatDetailValue(value);
    if (!displayValue) return null;
    return { label, value: displayValue };
  };

  const locationText =
    listing?.city ||
    listing?.location?.city ||
    listing?.location?.address ||
    listing?.location ||
    "Konum belirtilmedi";

  const sellerName = getSellerName() || "Satıcı";
  const listingTypeLabel = listing?.listingType === "rent" ? "Kiralık" : "Satılık";
  const vehicleInfoRows = [
    createDetailRow("Marka", listing?.brand),
    createDetailRow("Model", listing?.model),
    createDetailRow("Yıl", listing?.modelYear || listing?.year),
    createDetailRow("KM", listing?.mileage || listing?.km ? `${formatDetailValue(listing?.mileage || listing?.km)} km` : ""),
  ].filter(Boolean);
  const additionalInfoRows = [
    createDetailRow("Durum", listing?.condition === "sifir" ? "Sıfır" : listing?.condition === "used" || listing?.condition === "ikinci_el" ? "İkinci El" : listing?.condition),
    createDetailRow("Kategori", listing?.category),
    createDetailRow("Ana kategori", listing?.parentCategory),
    createDetailRow("Motor hacmi", listing?.engineCapacity ? `${listing.engineCapacity} cc` : ""),
    createDetailRow("Yakıt tipi", listing?.fuelType),
    createDetailRow("Vites", listing?.transmission),
    createDetailRow("Renk", listing?.color),
    createDetailRow("Hasar durumu", listing?.damageStatus),
    createDetailRow("Bakım kategorisi", listing?.maintenanceCategory),
    createDetailRow("Viskozite", listing?.viscosity),
    createDetailRow("Standart", listing?.standard),
    createDetailRow("Hacim", listing?.volume),
    createDetailRow("Kiralama periyodu", listing?.rentalDetails?.period === "daily" ? "Günlük" : listing?.rentalDetails?.period === "weekly" ? "Haftalık" : listing?.rentalDetails?.period === "monthly" ? "Aylık" : ""),
    createDetailRow("Minimum süre", listing?.rentalDetails?.minDuration),
    createDetailRow("Maksimum süre", listing?.rentalDetails?.maxDuration),
    createDetailRow("Depozito", listing?.rentalDetails?.deposit ? formatPriceFull(listing.rentalDetails.deposit) : ""),
    createDetailRow("Kask", listing?.rentalDetails?.includesHelmet ? "Dahil" : ""),
    createDetailRow("Sigorta", listing?.rentalDetails?.includesInsurance ? "Dahil" : ""),
  ].filter(Boolean);

  // Load matched couriers when switching to that tab
  useEffect(() => {
    if (activeTab === "couriers" && (isOwner || isAdmin) && listing) {
      loadMatchedCouriers();
    }
  }, [activeTab, isOwner, isAdmin, listing]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="text-center py-20 text-gray-500">İlan bulunamadı.</div>
    );
  }

  const SCORE_COLORS = {
    "🔥 Çok Uygun": "bg-green-100 text-green-800 border-green-300",
    "✅ Uygun": "bg-blue-100 text-blue-800 border-blue-300",
    "⚠️ Kısmen Uygun": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "❌ Uygun Değil": "bg-red-100 text-red-800 border-red-300",
  };

  const descLimit = 500;
  const isLongDesc = (listing.description || "").length > descLimit;
  const descText = expandedDesc ? listing.description : (listing.description || "").slice(0, descLimit);

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate("/login", { state: { redirect: `/listings/${id}` } });
      return;
    }
    if (favLoading) return;
    try {
      setFavLoading(true);

      // Optimistic UI update
      const newFavState = !isFavorite;
      setOptimisticFav(newFavState);

      const result = await toggleFavorite(listingCanonicalId);
      if (!result?.success) {
        setOptimisticFav(!newFavState);
      }
    } catch (err) {
      console.error("Favori hatası:", err);
      setOptimisticFav((current) => (current === null ? current : !current));
    } finally {
      setFavLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  };

  const handleShare = async () => {
    const shareText = [
      "🏍 Cordy'de bir ilan buldum",
      "",
      listing?.title || "",
      `💰 ${priceText || "₺Belirtilmedi"}`,
      `📍 ${locationText}`,
      "",
      canonicalListingUrl,
    ].join("\n");

    try {
      if (navigator?.share) {
        await navigator.share({
          title: listing?.title || "Cordy İlan",
          text: shareText,
          url: canonicalListingUrl,
        });
        setShareFeedback("");
        return;
      }
    } catch {
      // Fall through to clipboard copy when native share is unavailable or fails.
    }

    try {
      await copyToClipboard(canonicalListingUrl);
      setShareFeedback("Link kopyalandı");
      window.setTimeout(() => setShareFeedback(""), 1800);
    } catch {
      setShareFeedback("Bağlantı paylaşılamadı");
      window.setTimeout(() => setShareFeedback(""), 1800);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 pt-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
        <div className="w-full">
          <ImageSwipeCarousel images={listing.images} />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-96px)] lg:self-start lg:overflow-y-auto">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
              {listingTypeLabel}
            </div>
            <div className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{priceText}</div>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-900 sm:text-[2rem]">
              {listing.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">📍 {locationText}</span>
              {postedText && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">🗓️ {postedText}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-3 sm:flex-nowrap">
              {!isOwner && (
                <button
                  onClick={handleMessageSeller}
                  disabled={ctaLoading || !isListingAvailable()}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>✉</span>
                  <span>{ctaLoading ? "Gönderiliyor..." : "Mesaj Gönder"}</span>
                </button>
              )}
              <button
                onClick={handleToggleFavorite}
                disabled={favLoading}
                className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  isFavorite
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
                type="button"
              >
                <TargetFavoriteIcon isActive={isFavorite} size={20} />
                <span>{isFavorite ? "Favoride" : "Favoriye Ekle"}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                type="button"
              >
                <span>↗</span>
                <span>Paylaş</span>
              </button>
            </div>
            {shareFeedback ? <div className="text-xs font-medium text-slate-500">{shareFeedback}</div> : null}
          </div>

          {!isListingAvailable() && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-amber-900">
                    Bu ilan şu anda aktif değil
                  </div>
                  <div className="text-xs text-amber-700 mt-1">
                    {listing.status === 'pending_approval' && 'İlan onay bekliyor.'}
                    {listing.status === 'inactive' && 'İlan pasif durumda.'}
                    {listing.status === 'expired' && 'İlanın süresi dolmuş.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isPromotionsEnabled && (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">
                    İlanınızı öne çıkarın (Yakında)
                  </h3>
                  <p className="text-xs text-amber-800">
                    Bu özellik yakında aktif olacaktır.
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="rounded-md border border-amber-200 bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 opacity-70 cursor-not-allowed"
                >
                  Yakında
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Araç Bilgileri</div>
          {vehicleInfoRows.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {vehicleInfoRows.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-right font-medium text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Araç detayları bulunmuyor.</p>
          )}
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Satıcı Bilgisi</div>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-600 text-lg font-bold text-white">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-semibold text-slate-900">{sellerName}</div>
              <div className="mt-0.5 text-sm text-slate-500">📍 {locationText}</div>
              {listing.phone ? <div className="mt-1 text-sm text-slate-500">📞 {listing.phone}</div> : null}
            </div>
          </div>
          {!isOwner && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleMessageSeller}
                disabled={ctaLoading || !isListingAvailable()}
                className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ctaLoading ? "Gönderiliyor..." : "Mesaj Gönder"}
              </button>
              {listing.phone ? (
                <a
                  href={`tel:${listing.phone}`}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  Ara
                </a>
              ) : null}
            </div>
          )}

          {/* 🔒 MODERATION ACTIONS (subtle, non-redesign) */}
          {!isOwner && user && sellerId && (
            <div className="mt-4 flex gap-4 border-t border-slate-100 pt-3 text-xs">
              <button
                onClick={handleReportListing}
                className="text-slate-500 hover:text-red-600 transition-colors"
              >
                ⚠️ İlanı şikayet et
              </button>
              <button
                onClick={handleBlockUser}
                className="text-slate-500 hover:text-red-600 transition-colors"
              >
                🚫 Kullanıcıyı engelle
              </button>
            </div>
          )}
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Açıklama</div>
          <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700">
            {listing.description ? `${descText}${!expandedDesc && isLongDesc ? "..." : ""}` : "Açıklama girilmemiş."}
          </p>
          {isLongDesc && (
            <button
              onClick={() => setExpandedDesc(!expandedDesc)}
              className="mt-3 text-sm font-semibold text-slate-900 hover:text-slate-700"
            >
              {expandedDesc ? "Daha az göster" : "Devamını göster"}
            </button>
          )}
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Ek Bilgiler</div>
          {additionalInfoRows.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-y-0">
              {additionalInfoRows.map((item) => (
                <div key={`${item.label}-${item.value}`} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-right font-medium text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Ek alan bulunmuyor.</p>
          )}
        </section>
      </div>

      {!isOwner && (
        <div className="mt-6 flex flex-col gap-2.5 sm:max-w-sm">
          <button
            onClick={handleMakeOffer}
            disabled={!isListingAvailable()}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-[15px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            💰 Teklif Ver
          </button>
        </div>
      )}

      {/* Sticky CTA (mobile) */}
      {!isOwner && (
        <div className="fixed md:hidden bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg px-4 py-3 flex gap-3">
          <button
            onClick={handleToggleFavorite}
            disabled={favLoading}
            className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 transition ${
              isFavorite
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {isFavorite ? <TargetFavoriteIcon isActive={true} size={24} /> : <TargetFavoriteIcon isActive={false} size={24} />}
          </button>
          <button
            onClick={handleMessageSeller}
            disabled={ctaLoading || !isListingAvailable()}
            className="flex-1 py-3 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {ctaLoading ? "Gönderiliyor..." : "Mesaj at"}
          </button>
        </div>
      )}

      {/* FAZ 17.5: Matched Couriers section hidden */}
      {false && activeTab === "couriers" && (isOwner || isAdmin) && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Uygun Kuryeler</h2>

          {/* Loading State */}
          {couriersLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-4 text-slate-600">Kuryeler eşleştiriliyor...</p>
            </div>
          )}

          {/* Empty State */}
          {!couriersLoading && matchedCouriers.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Uygun Kurye Bulunamadı
              </h3>
              <p className="text-sm text-slate-600">
                Bu ilana uygun kurye profili bulunmuyor.
              </p>
            </div>
          )}

          {/* Couriers List */}
          {!couriersLoading && matchedCouriers.length > 0 && (
            <div className="space-y-4">
              {matchedCouriers.map((courier) => {
                const isExpanded = expandedBreakdown === courier._id;
                const scoreColor =
                  SCORE_COLORS[courier.matchLevel] || "bg-gray-100 text-gray-800";

                return (
                  <div
                    key={courier._id}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Courier Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {courier.user?.name || "Kurye"}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {courier.location?.city || "Şehir belirtilmemiş"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {courier.courierTypes?.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="flex flex-col items-end gap-2">
                        <div
                          className={`px-4 py-2 rounded-lg border font-semibold ${scoreColor}`}
                        >
                          {courier.matchScore}%
                        </div>
                        <div className="text-xs text-slate-600">
                          {courier.matchLevel}
                        </div>
                      </div>
                    </div>

                    {/* Courier Details */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600">
                      <div>📍 {courier.location?.city}</div>
                      {courier.experienceYears !== undefined && (
                        <div>⏱️ {courier.experienceYears} yıl deneyim</div>
                      )}
                      {courier.platforms?.length > 0 && (
                        <div>🏢 {courier.platforms.join(", ")}</div>
                      )}
                    </div>

                    {/* Breakdown Toggle */}
                    <button
                      onClick={() => toggleBreakdown(courier._id)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm mb-3"
                    >
                      {isExpanded ? "Detayları Gizle ▲" : "Neden Uygun? ▼"}
                    </button>

                    {/* Breakdown List */}
                    {isExpanded && (
                      <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
                        <h4 className="font-semibold text-slate-900 mb-2">
                          Eşleşme Detayları:
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {courier.matchBreakdown.map((reason, index) => (
                            <li key={index} className="text-slate-700">
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleStartConversationWithCourier(courier.user._id)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      💬 Mesaj Gönder
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Admin/Owner Metadata Section */}
      {(isAdmin || isOwner) && listing && (
        <section className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            📋 Teknik Detaylar {isAdmin && "(Admin)"}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">İlan ID:</span>
              <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200">{listing._id}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Satıcı ID:</span>
              <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200">{sellerId || "—"}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Durum:</span>
              <span className="text-xs font-medium">{listing.status || "—"}</span>
            </div>
            {listing.createdAt && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Oluşturulma:</span>
                <span className="text-xs">{new Date(listing.createdAt).toLocaleString("tr-TR")}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Teklif Ver</h3>
            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Teklif Fiyatı (₺)
                </label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Teklif miktarınızı girin"
                  required
                  min="1"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  İlan fiyatı: {formatPriceFull(listing?.price)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1 py-2 px-4 rounded-lg border-2 border-gray-200 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Teklif Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
