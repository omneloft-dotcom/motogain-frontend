// src/components/admin/ListingCardAdmin.jsx

import ApproveRejectButtons from "./ApproveRejectButtons";

/*
  Props:
  - listing: {
      _id,
      title,
      price,
      city,
      category,
      images: string[]
    }
  - onApprove: () => void
  - onReject: () => void
  - isApproving: boolean
  - isRejecting: boolean
*/

const ListingCardAdmin = ({
  listing,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}) => {
  const { title, price, city, category, images = [] } = listing;

  const hasImages = images && images.length > 0;
  const firstImage = hasImages ? images[0] : null;

  const formattedPrice =
    typeof price === "number"
      ? price.toLocaleString("tr-TR", {
          style: "currency",
          currency: "TRY",
          maximumFractionDigits: 0,
        })
      : price;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Fotoğraf Grid */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {hasImages ? (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
            {images.slice(0, 4).map((img, index) => (
              <div
                key={index}
                className={`relative ${
                  index === 0 && images.length > 1
                    ? "col-span-2 row-span-2 sm:col-span-1 sm:row-span-2"
                    : ""
                }`}
              >
                <img
                  src={img}
                  alt={`${title} - ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white">
                    +{images.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            Fotoğraf bulunmuyor
          </div>
        )}

        {/* Üstte ufak etiket */}
        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
          Pending
        </div>
      </div>

      {/* İçerik */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
            {title || "Başlık yok"}
          </h3>
          {formattedPrice && (
            <span className="shrink-0 text-sm font-semibold text-emerald-600">
              {formattedPrice}
            </span>
          )}
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {city && (
            <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5">
              {city}
            </span>
          )}
          {category && (
            <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5">
              {category}
            </span>
          )}
          <span className="ml-auto inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px]">
            #{listing._id?.slice(-6)}
          </span>
        </div>

        <ApproveRejectButtons
          onApprove={onApprove}
          onReject={onReject}
          isApproving={isApproving}
          isRejecting={isRejecting}
        />
      </div>
    </div>
  );
};

export default ListingCardAdmin;
