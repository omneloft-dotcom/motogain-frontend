import { Link } from "react-router-dom";

export default function ConversationHeader({ conversation }) {
  if (!conversation || !conversation.listing) {
    return null;
  }

  const { listing } = conversation;
  const thumbnail = listing.images?.[0] || null;

  return (
    <div className="sticky top-0 z-10 mb-4 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-background">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <span className="text-2xl">📦</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="truncate text-lg font-semibold text-text-primary">
            {listing.title}
          </h2>
          {listing.price && (
            <p className="mt-1 text-base font-semibold text-primary">
              {Number(listing.price).toLocaleString("tr-TR")} ₺
            </p>
          )}
          {listing.city && (
            <p className="mt-1 text-sm text-text-secondary">📍 {listing.city}</p>
          )}
        </div>

        <Link
          to={`/listings/${listing._id}`}
          className="flex-shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-background transition hover:bg-highlight"
        >
          İlana Git
        </Link>
      </div>
    </div>
  );
}
