import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useToast } from "../../context/ToastContext";
import conversationsApi from "../../api/conversationsApi";
import TargetFavoriteIcon from '../icons/TargetFavoriteIcon';
import noImage from "../../assets/no-image.png";

// Safe price formatter - ALWAYS use Number, NEVER truncate digits
export const formatPriceFull = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("tr-TR") + " ₺";
};

// Dynamic font size based on price string length
const getPriceSizeClass = (priceText) => {
  if (!priceText) return "text-2xl";
  const len = priceText.length;
  if (len <= 8) return "text-2xl";       // e.g. "1.907 ₺"
  if (len <= 12) return "text-xl";       // e.g. "123.456 ₺"
  if (len <= 16) return "text-lg";       // e.g. "1.234.567 ₺"
  if (len <= 20) return "text-base";     // e.g. "123.456.789 ₺"
  return "text-sm";                       // very large numbers
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

const isPromotionsEnabled = false;

/**
 * ListingCard - Dark premium marketplace listing card
 * Hierarchy: Title → Price → Meta
 * Green ONLY for promotion badge (if enabled)
 */
export default function ListingCard({ listing, favorites, onToggle }) {
  const navigate = useNavigate();
  const { isFavorite: authIsFavorite, toggleFavorite, user } = useAuth();
  const { showToast } = useToast();
  const normalizeId = (v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object" && v._id) return String(v._id);
    return String(v);
  };
  const isOwner = user && normalizeId(user._id) === normalizeId(listing.createdBy);
  const favFromContext = useMemo(() => {
    if (Array.isArray(favorites)) return favorites.includes(listing._id);
    if (typeof authIsFavorite === "function") return authIsFavorite(listing._id);
    return false;
  }, [favorites, listing._id, authIsFavorite, user]);

  const [toggling, setToggling] = useState(false);
  const [ctaLoading, setCtaLoading] = useState(false);
  const [optimisticFav, setOptimisticFav] = useState(null);

  // Use optimistic state if set, otherwise use context state
  const fav = optimisticFav !== null ? optimisticFav : favFromContext;

  // Sync optimistic state when context updates
  useEffect(() => {
    setOptimisticFav(null);
  }, [favFromContext]);
  const [imageSrc, setImageSrc] = useState(listing.images?.[0] || noImage);
  const showPromoBadge = isPromotionsEnabled && listing?.promotion;

  // Update image when listing changes
  useEffect(() => {
    const firstImage = listing.images?.[0];

    // Handle both string URLs and object formats
    let imageUrl = noImage;
    if (typeof firstImage === 'string') {
      imageUrl = firstImage;
    } else if (firstImage && typeof firstImage === 'object') {
      // Handle Cloudinary object format
      imageUrl = firstImage.secure_url || firstImage.url || noImage;
    }

    setImageSrc(imageUrl);
  }, [listing._id, listing.images]);

  const handleImageError = () => {
    setImageSrc(noImage);
  };
  // 🔄 GELİŞTİRME 3: Fiyat formatı (kiralık için periyot ekle)
  const priceText = useMemo(() => {
    const basePrice = formatPriceFull(listing.price);
    if (listing.listingType === 'rent' && listing.rentalDetails?.period) {
      const periodMap = {
        daily: '/gün',
        weekly: '/hafta',
        monthly: '/ay'
      };
      return basePrice.replace(' ₺', '') + periodMap[listing.rentalDetails.period] || basePrice;
    }
    return basePrice;
  }, [listing.price, listing.listingType, listing.rentalDetails]);
  const timeText = useMemo(() => relTime(listing.createdAt), [listing.createdAt]);

  const handleToggle = async (e) => {
    e.preventDefault();
    if (toggling) return;
    try {
      setToggling(true);

      // Optimistic UI update - change icon immediately
      const newFavState = !fav;
      setOptimisticFav(newFavState);

      if (onToggle) {
        await onToggle(listing._id);
      } else {
        await toggleFavorite(listing._id);
      }
      showToast(newFavState ? "Favorilere eklendi" : "Favorilerden çıkarıldı", {
        actionLabel: !fav ? "Mesaj at" : null,
        onAction: !fav
          ? async () => {
              if (!user) {
                navigate("/login");
                return;
              }
              try {
                const { conversationId } = await conversationsApi.startConversation(
                  listing._id,
                  listing.createdBy
                );
                navigate(`/messages/${conversationId}`);
              } catch (err) {
                console.error("Mesaj açma hatası:", err);
              }
            }
          : null,
      });
    } catch (err) {
      console.error("Favori işlemi başarısız", err);
    } finally {
      setToggling(false);
    }
  };

  const handleMessage = async (e) => {
    e.preventDefault();
    if (isOwner) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (ctaLoading) return;
    try {
      setCtaLoading(true);
      const { conversationId } = await conversationsApi.startConversation(listing._id, listing.createdBy);
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      console.error("Mesaj başlatma hatası:", err);
    } finally {
      setCtaLoading(false);
    }
  };

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="block bg-card border border-primary/20 rounded-xl hover:bg-card-hover hover:border-primary/30 transition-all duration-150 overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full bg-card overflow-hidden">
        <img
          src={imageSrc}
          onError={handleImageError}
          className="h-full w-full object-cover"
          alt={listing.title}
        />

        {/* Promotion Badge - Green ONLY if promotion enabled */}
        {showPromoBadge && (
          <span className="absolute top-3 left-3 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 border border-primary/30">
            Öne Çıkan
          </span>
        )}

        {/* 🔄 GELİŞTİRME 3: İlan Tipi Badge */}
        <span className={`absolute ${showPromoBadge ? 'top-14' : 'top-3'} left-3 rounded-full text-xs font-semibold px-3 py-1 border ${
          listing.listingType === 'rent'
            ? 'bg-orange-100 text-orange-700 border-orange-300'
            : 'bg-blue-100 text-blue-700 border-blue-300'
        }`}>
          {listing.listingType === 'rent' ? 'KİRALIK' : 'SATILIK'}
        </span>

        {/* Favorite Button */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-black/30 hover:bg-black/35 disabled:opacity-50 transition-opacity duration-150"
        >
          <TargetFavoriteIcon isActive={fav} size={18} />
        </button>
      </div>

      {/* Inner Separation */}
      <div className="border-t border-border/20"></div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Title - Primary hierarchy */}
        <h3 className="text-base font-semibold text-text-primary line-clamp-2 leading-snug">
          {listing.title}
        </h3>

        {/* Price - Strong but not green, responsive size */}
        <p className={`font-bold text-text-primary leading-tight tabular-nums break-all ${getPriceSizeClass(priceText)}`}>
          {priceText}
        </p>

        {/* Meta: Location */}
        <p className="text-sm text-text-secondary">
          {listing.city || "-"}
        </p>

        {/* Meta: Category + Time */}
        <div className="text-xs text-text-muted flex gap-2 flex-wrap">
          {listing.category && <span>{listing.category}</span>}
          {timeText && <span>• {timeText}</span>}
        </div>

        {/* CTA - Secondary style only */}
        {!isOwner && (
          <div className="pt-2">
            <button
              onClick={handleMessage}
              disabled={ctaLoading}
              className="w-full rounded-lg border border-border text-text-secondary py-2 text-sm font-medium hover:bg-card-hover hover:text-text-primary transition-all disabled:opacity-60"
            >
              {ctaLoading ? "Açılıyor..." : "Mesaj"}
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
