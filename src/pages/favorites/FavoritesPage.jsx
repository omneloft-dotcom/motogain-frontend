import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useToast } from "../../context/ToastContext";
import ListingsGrid from "../../components/listings/ListingsGrid";
import { ListingCardSkeleton } from "../../components/common/Skeleton";
import PageShell from "../../components/layout/PageShell";
import TargetFavoriteIcon from "../../components/icons/TargetFavoriteIcon";

export default function FavoritesPage() {
  const { favoriteListings, favorites, toggleFavorite, loading, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [lastListing, setLastListing] = useState(null);

  // DEBUG: Log favorite listings data
  console.log("[FavoritesPage] favoriteListings:", favoriteListings);

  // FAZ 18: UX polish - Favori toggle + toast mesajı
  const handleToggleFavorite = async (listingId) => {
    const result = await toggleFavorite(listingId);
    if (result?.success) {
      const message =
        result.action === "added"
          ? "Favorilere eklendi ⭐"
          : "Favorilerden çıkarıldı";
      setLastListing(listingId);
      showToast(message, {
        type: "success",
        actionLabel: result.action === "added" ? "Mesaj at" : null,
        onAction:
          result.action === "added"
            ? () =>
                navigate("/messages", {
                  state: { listingId },
                })
            : null,
      });
    } else {
      showToast("Bir hata oluştu", { type: "error" });
    }
  };

  if (loading) {
    return (
      <PageShell title="Favorilerim" description="Favori ilanların yükleniyor...">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </PageShell>
    );
  }

  if (!favoriteListings || favoriteListings.length === 0) {
    return (
      <PageShell title="Favorilerim" description="Favori ilanların burada görünecek">
        <div className="bg-card rounded-xl border border-primary/10 p-12 text-center">
          <div className="flex justify-center mb-4">
            <TargetFavoriteIcon isActive={false} size={48} />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Henüz favori yok
          </h2>
          <p className="text-text-secondary">
            Beğendiğin ilanları favorilere ekleyerek buradan kolayca ulaşabilirsin
          </p>
          <Link
            to="/listings"
            className="inline-flex mt-4 px-4 py-2 rounded-lg bg-primary text-background text-sm font-semibold hover:bg-highlight transition-colors"
          >
            İlanlara göz at
          </Link>
        </div>
      </PageShell>
    );
  }

  // Transform favorites API response to flat listing shape for ListingCard
  const transformedListings = favoriteListings.map((fav) => ({
    ...fav.listing,
    images: fav.images || fav.listing?.images || [],
  }));

  return (
    <PageShell
      title="Favorilerim"
      description={`${favoriteListings.length} favori ilanın var`}
    >
      <ListingsGrid
        listings={transformedListings}
        favorites={favorites}
        onToggle={handleToggleFavorite}
      />
    </PageShell>
  );
}
