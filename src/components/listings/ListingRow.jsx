import { Link } from "react-router-dom";
import { useMemo } from "react";
import noImage from "../../assets/no-image.png";
import { formatPriceFull } from "./ListingCard";
import TargetFavoriteIcon from "../icons/TargetFavoriteIcon";

// Dynamic font size for row layout
const getRowPriceSizeClass = (priceText) => {
  if (!priceText) return "text-lg";
  const len = priceText.length;
  if (len <= 10) return "text-lg";
  if (len <= 14) return "text-base";
  if (len <= 18) return "text-sm";
  return "text-xs";
};

const ListingRow = ({ listing }) => {
  const photo = listing.images?.[0] || noImage;
  const priceText = useMemo(() => formatPriceFull(listing.price), [listing.price]);

  return (
    <div className="w-full bg-card border-b border-border/30 border-l-2 border-l-primary/20 py-4 px-4 flex flex-col hover:bg-card-hover hover:border-l-primary/30 transition-all">
      {/* ÜST BİLGİ */}
      <div className="flex gap-4 items-center">
        <div className="min-w-[64px] h-[64px] bg-background rounded-md flex items-center justify-center overflow-hidden">
          <img
            src={photo}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Metinler */}
        <div className="flex flex-col min-w-0 flex-1">
          <Link
            to={`/listings/${listing._id}`}
            className="font-semibold text-text-primary hover:text-primary line-clamp-2"
          >
            {listing.title}
          </Link>

          <span className={`text-text-primary font-semibold tabular-nums truncate ${getRowPriceSizeClass(priceText)}`}>
            {priceText}
          </span>

          <span className="text-xs text-text-muted">{listing.city}</span>
        </div>
      </div>

      {/* ALT BUTONLAR */}
      <div className="flex justify-around text-sm mt-3 pt-3 border-t border-border/30">
        <button className="text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors">
          💬 Mesaj
        </button>
        <button className="text-text-secondary hover:text-primary flex items-center gap-1 transition-colors">
          <TargetFavoriteIcon isActive={false} size={16} /> Favori
        </button>
        <button className="text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors">
          💰 Teklif Ver
        </button>
      </div>
    </div>
  );
};

export default ListingRow;
