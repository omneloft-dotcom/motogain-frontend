import { Link } from "react-router-dom";
import noImage from "../../assets/no-image.png";
import TargetFavoriteIcon from "../icons/TargetFavoriteIcon";

export default function ListingList({
  listings = [],
  favorites = [],
  onToggle,
}) {
  const formatPriceFull = (value) => {
    if (value === null || value === undefined) return "₺";
    const raw = typeof value === "number" && Number.isFinite(value) ? Math.round(value).toString() : String(value);
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) return "₺";
    const withSep = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${withSep} ₺`;
  };

  return (
    <div className="bg-card rounded-xl border border-border/30 p-2">
      {listings.map((listing) => {
        const isFav = favorites.includes(listing._id);
        const imageUrl = listing.images?.[0] || noImage;

        return (
          <div
            key={listing._id}
            className="bg-card hover:bg-card-hover border-b border-border/30 last:border-b-0 border-l-2 border-l-primary/20 hover:border-l-primary/30 p-4 flex gap-4 relative transition-all"
          >
            <button
              onClick={() => onToggle(listing._id)}
              className="absolute right-3 top-3 p-2.5 rounded-full bg-black/30 hover:bg-black/35 transition-opacity duration-150"
            >
              <TargetFavoriteIcon isActive={isFav} size={18} />
            </button>

            <Link to={`/listings/${listing._id}`}>
              <img
                src={imageUrl}
                className="w-32 h-32 object-contain rounded-lg"
                alt={listing.title}
              />
            </Link>

            <div className="flex-1">
              <Link to={`/listings/${listing._id}`}>
                <h3 className="font-semibold text-lg text-text-primary hover:text-primary">{listing.title}</h3>
              </Link>
              <p className="text-text-muted">{listing.city}</p>
              <p className="text-text-primary font-bold text-lg mt-2 break-words">
                {formatPriceFull(listing.price)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
