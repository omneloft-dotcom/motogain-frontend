// src/components/listings/ListingsList.jsx
import { Link } from "react-router-dom";
import noImage from "../../assets/no-image.png";

const ListingsList = ({ listings = [] }) => {
  if (!listings.length) {
    return (
      <p className="text-text-muted text-center py-10">
        Gösterilecek ilan bulunamadı.
      </p>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/30 p-2">
      {listings.map((listing) => {
        const imageUrl =
          listing.images?.length > 0 ? listing.images[0] : noImage;

        return (
          <Link
            key={listing._id}
            to={`/listings/${listing._id}`}
            className="flex gap-4 p-4 bg-card hover:bg-card-hover border-b border-border/30 last:border-b-0 border-l-2 border-l-primary/20 hover:border-l-primary/30 transition-all"
          >
            {/* LEFT: IMAGE */}
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-28 h-28 rounded-lg object-cover bg-background flex-shrink-0"
            />

            {/* RIGHT CONTENT */}
            <div className="flex flex-col justify-between flex-1">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  {listing.title}
                </h2>

                <p className="text-text-primary font-bold text-xl mt-1">
                  ₺ {Number(listing.price || 0).toLocaleString("tr-TR")}
                </p>

                <p className="text-text-muted text-sm mt-1">
                  {listing.city || "Şehir belirtilmemiş"}
                </p>

                <p className="text-text-muted text-xs mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                  Satıcı
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ListingsList;
