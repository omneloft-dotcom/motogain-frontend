/**
 * CampaignDetailModal - Web campaign detail modal
 * Aligned with mobile CampaignDetailScreen behavior
 */
import { useState } from "react";
import { submitCampaignLead } from "./campaignLeads";

export default function CampaignDetailModal({ campaign, onClose }) {
  if (!campaign) return null;

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState("");
  const [leadError, setLeadError] = useState("");
  const [leadForm, setLeadForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    note: "",
  });

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23191D1C" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="14"%3EGörsel Yüklenemedi%3C/text%3E%3C/svg%3E';
  };

  const handleCTA = () => {
    const campaignType = campaign.campaignType || "info";

    switch (campaignType) {
      case "code":
        // Copy promo code
        if (campaign.promoCode) {
          navigator.clipboard.writeText(campaign.promoCode).then(() => {
            alert(`Kampanya kodu kopyalandı: ${campaign.promoCode}`);
          }).catch(() => {
            alert(`Kampanya Kodu: ${campaign.promoCode}`);
          });
        } else {
          alert('Promosyon kodu bulunamadı');
        }
        break;

      case "affiliate":
        // Open external URL
        if (campaign.externalUrl) {
          window.open(campaign.externalUrl, '_blank', 'noopener,noreferrer');
        } else {
          alert('Link bulunamadı');
        }
        break;

      case "lead":
        // Lead campaign: open internal lead form
        setLeadSuccess("");
        setLeadError("");
        setShowLeadForm(true);
        break;

      case "info":
      default:
        // Info campaign
        alert('Kampanya detayları yakında eklenecek');
        break;
    }
  };

  const getCTALabel = () => {
    // Use custom label if provided
    if (campaign.ctaLabel && campaign.ctaLabel.trim()) {
      return campaign.ctaLabel.trim();
    }

    // Default mapping based on campaignType
    const campaignType = campaign.campaignType || "info";
    const defaultLabels = {
      lead: "Başvur",
      affiliate: "İncele",
      code: "Kodu Kopyala",
      info: "Detayları İncele",
    };

    return defaultLabels[campaignType] || "Detayları İncele";
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (leadLoading) return;

    if (!leadForm.fullName.trim() || !leadForm.phone.trim() || !leadForm.city.trim()) {
      setLeadError("Ad Soyad, Telefon ve Sehir zorunludur.");
      return;
    }

    setLeadLoading(true);
    setLeadError("");
    try {
      const res = await submitCampaignLead({
        campaignId: campaign.id || campaign._id,
        fullName: leadForm.fullName.trim(),
        phone: leadForm.phone.trim(),
        city: leadForm.city.trim(),
        note: leadForm.note.trim() || undefined,
        source: "web",
      });

      if (res?.success) {
        setLeadSuccess(res?.message || "Basvurunuz alindi.");
        setLeadForm({ fullName: "", phone: "", city: "", note: "" });
        return;
      }

      setLeadError(res?.message || "Basvuru gonderilemedi.");
    } catch (err) {
      setLeadError(err?.response?.data?.message || "Basvuru gonderilemedi.");
    } finally {
      setLeadLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-xl max-w-3xl w-full my-8 shadow-2xl">
        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] bg-backgroundDark rounded-t-xl overflow-hidden">
          <img
            src={campaign.imageUrl || campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-backgroundDark/60 to-transparent" />
          {campaign.badge && (
            <div className="absolute top-5 right-5 bg-primary px-4 py-2 rounded-lg shadow-lg">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {campaign.badge}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            {campaign.title}
          </h2>

          <p className="text-text-secondary mb-6 leading-relaxed">
            {campaign.shortDescription}
          </p>

          {/* Promo Code Display */}
          {campaign.promoCode && (
            <div className="bg-primary/10 border-2 border-primary border-dashed rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-bold text-primary uppercase tracking-wide">
                  Promosyon Kodu
                </span>
              </div>
              <div className="bg-primary/20 rounded-md p-3 text-center">
                <span className="text-2xl font-extrabold text-primary tracking-widest">
                  {campaign.promoCode}
                </span>
              </div>
            </div>
          )}

          {/* Date Info */}
          {(campaign.startDate || campaign.endDate) && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Geçerlilik Süresi
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary">
                {campaign.startDate && formatDate(campaign.startDate)}
                {campaign.startDate && campaign.endDate && ' - '}
                {campaign.endDate && formatDate(campaign.endDate)}
              </p>
            </div>
          )}

          {/* Campaign Details */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h3 className="text-lg font-bold text-text-primary">
                Kampanya Detayları
              </h3>
            </div>
            <p className="text-text-secondary leading-relaxed whitespace-pre-line">
              {campaign.description}
            </p>
          </div>

          {/* Lead Internal Form */}
          {showLeadForm && (campaign.campaignType || "info") === "lead" && (
            <form onSubmit={handleLeadSubmit} className="mt-6 border border-border rounded-lg p-4 bg-background/40 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-bold text-text-primary">Basvuru Formu</h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowLeadForm(false);
                    setLeadError("");
                    setLeadSuccess("");
                  }}
                  className="text-xs px-2 py-1 rounded border border-border text-text-secondary hover:bg-card-hover"
                >
                  Kapat
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  value={leadForm.fullName}
                  onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-text-primary"
                  placeholder="Ad Soyad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Telefon *</label>
                <input
                  type="text"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-text-primary"
                  placeholder="05xx xxx xx xx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Sehir *</label>
                <input
                  type="text"
                  value={leadForm.city}
                  onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-text-primary"
                  placeholder="Istanbul"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Not (Opsiyonel)</label>
                <textarea
                  rows={3}
                  value={leadForm.note}
                  onChange={(e) => setLeadForm({ ...leadForm, note: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-text-primary"
                  placeholder="Kisa notunuz"
                />
              </div>

              {leadError ? <p className="text-sm text-rose-600">{leadError}</p> : null}
              {leadSuccess ? <p className="text-sm text-emerald-600">{leadSuccess}</p> : null}

              <button
                type="submit"
                disabled={leadLoading}
                className="px-4 py-2 rounded-lg bg-primary text-white font-semibold disabled:opacity-60"
              >
                {leadLoading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-border rounded-lg text-text-secondary hover:bg-card-hover transition-colors font-semibold"
          >
            Kapat
          </button>
          {!showLeadForm && (
            <button
              onClick={handleCTA}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-bold shadow-lg"
            >
              {getCTALabel()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
