// FAZ 18: Mobile-friendly admin listing card component
import StatusBadge from "../listings/StatusBadge";

export default function AdminListingCard({ listing }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Listing Image */}
      <div className="relative h-48 bg-slate-100">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-5xl">📦</span>
          </div>
        )}

        {/* Status Badge Overlay */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={listing.status} size="sm" />
        </div>
      </div>

      {/* Listing Info */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-lg line-clamp-2">
          {listing.title}
        </h3>

        {/* Price */}
        <p className="text-2xl font-bold text-slate-900">
          {Number(listing.price).toLocaleString("tr-TR")} ₺
        </p>

        {/* Category & City */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <span>📂</span>
            {listing.category}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <span>📍</span>
            {listing.city}
          </span>
        </div>

        {/* User Info */}
        <div className="pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Sahibi:</p>
          <p className="text-sm font-medium text-slate-900">
            {listing.createdBy?.name || "Bilinmiyor"}
          </p>
          <p className="text-xs text-slate-500">
            {listing.createdBy?.email || "-"}
          </p>
        </div>

        {/* Created Date */}
        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Oluşturulma: {new Date(listing.createdAt).toLocaleDateString("tr-TR")}
          </p>
        </div>

        {/* View Details Button */}
        <button
          onClick={() => window.open(`/listing/${listing._id}`, '_blank')}
          className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm mt-2"
        >
          Detayları Görüntüle
        </button>
      </div>
    </div>
  );
}
