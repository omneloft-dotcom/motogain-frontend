import { useState, useEffect } from "react";
import PageShell from "../components/layout/PageShell";
import CampaignCard from "../components/club/CampaignCard";
import CampaignDetailModal from "../components/club/CampaignDetailModal";
import campaignsApi from "../api/campaignsApi";
import { Skeleton } from "../components/common/Skeleton";

const CATEGORY_LABELS = {
  tumu: "Tümü",
  yakit: "Yakıt",
  sigorta: "Sigorta",
  ekipman: "Ekipman",
  finans: "Finans",
  firsatlar: "Fırsatlar",
};

const CATEGORIES = ["tumu", "yakit", "sigorta", "ekipman", "finans", "firsatlar"];

function CampaignCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export default function Club() {
  const [activeTab, setActiveTab] = useState("tumu");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, [activeTab]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = activeTab === "tumu" ? {} : { category: activeTab };
      const response = await campaignsApi.getCampaigns(params);
      setCampaigns(response.items || []);
    } catch (err) {
      console.error("[CLUB][FETCH_ERROR]", err);
      setError("Kampanyalar yüklenemedi");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Cordy Club"
      description="Kurye dostu fırsatlar ve özel indirimler"
      intent="focus"
    >
      {/* Category Tabs */}
      <div className="flex gap-3 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${
              activeTab === cat
                ? "bg-primary text-white border-primary shadow-lg"
                : "bg-primary/5 text-text-secondary border-transparent hover:bg-primary/10"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Campaign Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-text-primary font-semibold mb-2">{error}</p>
          <button
            onClick={fetchCampaigns}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Tekrar Dene
          </button>
        </div>
      ) : campaigns.length > 0 ? (
        <div className={`grid gap-6 ${
          campaigns.length === 1
            ? "grid-cols-1 max-w-md mx-auto"
            : campaigns.length === 2
            ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}>
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id || campaign._id}
              campaign={campaign}
              onClick={() => setSelectedCampaign(campaign)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-text-primary font-semibold mb-2">
            Bu kategoride henüz aktif kampanya yok
          </p>
          <p className="text-text-secondary text-sm">
            Yeni kampanyalar çok yakında eklenecek
          </p>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </PageShell>
  );
}
