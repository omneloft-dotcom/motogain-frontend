const fs = require('fs');

const content = `import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import noImage from "../../assets/no-image.png";
import Toast from "../common/Toast";
import conversationsApi from "../../api/conversationsApi";
import { isPromotionsEnabled } from "../../utils/isPromotionsEnabled";

export const formatPriceFull = (value) => {
  if (value === null || value === undefined) return "₺";
  const raw = typeof value === "number" && Number.isFinite(value) ? Math.round(value).toString() : String(value);
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "₺";
  const withSep = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return \`\${withSep} ₺\`;
};

const relTime = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "Bugün";
  if (days === 1) return "1 gün önce";
  if (days < 7) return \`\${days} gün önce\`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return \`\${weeks} hf önce\`;
  const months = Math.floor(days / 30);
  return \`\${months} ay önce\`;
};

/**
 * ListingCard - Dark premium marketplace listing card
 * Hierarchy: Title → Price → Meta
 * Green ONLY for promotion badge (if enabled)
 */
export default function ListingCard({ listing, favorites, onToggle }) {
  const navigate = useNavigate();
  const { isFavorite: authIsFavorite, toggleFavorite, user } = useAuth();
  const normalizeId = (v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object" && v._id) return String(v._id);
    return String(v);
  };
  const isOwner = user && normalizeId(user._id) === normalizeId(listing.createdBy);
  const fav = useMemo(() => {
    if (Array.isArray(favorites)) return favorites.includes(listing._id);
    if (typeof authIsFavorite === "function") return authIsFavorite(listing._id);
    return false;
  }, [favorites, listing._id, authIsFavorite, user]);

  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState("");
  const [ctaLoading, setCtaLoading] = useState(false);
  const showPromoBadge = isPromotionsEnabled && listing?.promotion;

  const imageUrl = listing.images?.[0] || noImage;
  const priceText = useMemo(() => formatPriceFull(listing.price), [listing.price]);
  const timeText = useMemo(() => relTime(listing.createdAt), [listing.createdAt]);

  const handleToggle = async (e) => {
    e.preventDefault();
    if (toggling) return;
    try {
      setToggling(true);
      if (onToggle) {
        await onToggle(listing._id);
      } else {
        await toggleFavorite(listing._id);
      }
      setToast({
        message: fav ? "Favorilerden çıkarıldı" : "Favorilere eklendi",
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
                navigate(\`/messages/\${conversationId}\`);
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
      navigate(\`/messages/\${conversationId}\`);
    } catch (err) {
      console.error("Mesaj başlatma hatası:", err);
    } finally {
      setCtaLoading(false);
    }
  };

  return (
    <Link
      to={\`/listings/\${listing._id}\`}
      className="block bg-card border border-border/60 rounded-xl hover:bg-card-hover transition-all duration-150 overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full bg-background overflow-hidden">
        <img src={imageUrl} className="h-full w-full object-contain" alt={listing.title} />

        {/* Promotion Badge - Green ONLY if promotion enabled */}
        {showPromoBadge && (
          <span className="absolute top-3 left-3 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 border border-primary/30">
            Öne Çıkan
          </span>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/90 border border-border flex items-center justify-center text-lg hover:scale-105 transition disabled:opacity-50"
        >
          {fav ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Title - Primary hierarchy */}
        <h3 className="text-base font-semibold text-text-primary line-clamp-2 leading-snug">
          {listing.title}
        </h3>

        {/* Price - Strong but not green */}
        <p className="text-2xl font-bold text-text-primary leading-tight tabular-nums">
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

      {toast && (
        <Toast
          message={toast.message || toast}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
          onClose={() => setToast("")}
        />
      )}
    </Link>
  );
}
`;

fs.writeFileSync('./src/components/listings/ListingCard.jsx', content, 'utf8');
console.log('✅ ListingCard transformed to dark premium design');
