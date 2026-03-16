/**
 * CampaignCard - Web campaign card component
 * Aligned with mobile ClubScreen campaign cards
 */
export default function CampaignCard({ campaign, onClick }) {
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23F3F4F6" width="400" height="200"/%3E%3Ctext x="50%25" y="45%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="16" font-weight="500"%3EGörsel Yüklenemedi%3C/text%3E%3Ctext x="50%25" y="60%25" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3E🖼️%3C/text%3E%3C/svg%3E';
  };

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative w-full aspect-[2/1] bg-gray-100">
        <img
          src={campaign.imageUrl || campaign.image}
          alt={campaign.title}
          className="w-full h-full object-cover object-center"
          onError={handleImageError}
        />
        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/40 to-transparent" />
        {campaign.badge && (
          <div className="absolute top-3 right-3 bg-primary px-3 py-1.5 rounded-lg shadow-lg">
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {campaign.badge}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2 leading-tight">
          {campaign.title}
        </h3>
        <p className="text-sm text-text-secondary mb-4 line-clamp-2 leading-relaxed">
          {campaign.shortDescription}
        </p>

        <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
          <span>Detayları İncele</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
