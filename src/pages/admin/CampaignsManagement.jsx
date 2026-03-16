import { useEffect, useState } from "react";
import campaignsApi from "../../api/campaignsApi";
import axiosClient from "../../api/axiosClient";
import { TableSkeleton } from "../../components/common/Skeleton";
import Toast from "../../components/common/Toast";

const CATEGORY_LABELS = {
  yakit: "Yakıt",
  sigorta: "Sigorta",
  ekipman: "Ekipman",
  finans: "Finans",
  firsatlar: "Fırsatlar",
};

const CATEGORIES = ["yakit", "sigorta", "ekipman", "finans", "firsatlar"];

const CAMPAIGN_TYPE_LABELS = {
  lead: "Lead (Başvuru)",
  affiliate: "Affiliate (Link)",
  code: "Kod",
  info: "Bilgi",
};

const CAMPAIGN_TYPES = ["lead", "affiliate", "code", "info"];

export default function CampaignsManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: "yakit",
    campaignType: "info",
    ctaLabel: "",
    badge: "",
    imageUrl: "",
    promoCode: "",
    externalUrl: "",
    startDate: "",
    endDate: "",
    isActive: true,
    sortOrder: 0,
  });

  const fetchCampaigns = async () => {
    try {
      const data = await campaignsApi.getAdminCampaigns();
      setCampaigns(data);
    } catch (err) {
      setToast({ message: "Kampanyalar yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const openModal = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        title: campaign.title || "",
        shortDescription: campaign.shortDescription || "",
        description: campaign.description || "",
        category: campaign.category || "yakit",
        campaignType: campaign.campaignType || "info",
        ctaLabel: campaign.ctaLabel || "",
        badge: campaign.badge || "",
        imageUrl: campaign.imageUrl || "",
        promoCode: campaign.promoCode || "",
        externalUrl: campaign.externalUrl || "",
        startDate: campaign.startDate ? campaign.startDate.split("T")[0] : "",
        endDate: campaign.endDate ? campaign.endDate.split("T")[0] : "",
        isActive: campaign.isActive !== false,
        sortOrder: campaign.sortOrder || 0,
      });
    } else {
      setEditingCampaign(null);
      // Default to 30 days from today
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      const endDateStr = endDate.toISOString().split("T")[0];

      setFormData({
        title: "",
        shortDescription: "",
        description: "",
        category: "yakit",
        campaignType: "info",
        ctaLabel: "",
        badge: "",
        imageUrl: "",
        promoCode: "",
        externalUrl: "",
        startDate: today,
        endDate: endDateStr,
        isActive: true,
        sortOrder: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setToast({ message: "Görsel yüklenemedi. Lütfen JPG, PNG veya WEBP formatında bir görsel seçin.", type: "error" });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setToast({ message: "Dosya boyutu 5MB'ı geçemez", type: "error" });
      return;
    }

    try {
      setUploading(true);
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const response = await axiosClient.post("/upload/campaign-images", formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = response.data.data?.imageUrl || response.data.imageUrl;
      setFormData({ ...formData, imageUrl });
      setToast({ message: "Görsel yüklendi", type: "success" });
    } catch (err) {
      console.error("Image upload error:", err);
      setToast({ message: err.response?.data?.error?.message || "Görsel yüklenemedi", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setToast({ message: "Başlık zorunlu", type: "warning" });
      return;
    }
    if (!formData.shortDescription.trim()) {
      setToast({ message: "Kısa açıklama zorunlu", type: "warning" });
      return;
    }
    if (!formData.description.trim()) {
      setToast({ message: "Detay açıklama zorunlu", type: "warning" });
      return;
    }
    if (!formData.startDate) {
      setToast({ message: "Başlangıç tarihi zorunlu", type: "warning" });
      return;
    }
    if (!formData.endDate) {
      setToast({ message: "Bitiş tarihi zorunlu", type: "warning" });
      return;
    }

    const payload = {
      title: formData.title.trim(),
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim(),
      category: formData.category,
      campaignType: formData.campaignType,
      ctaLabel: formData.ctaLabel.trim() || null,
      badge: formData.badge.trim() || null,
      imageUrl: formData.imageUrl.trim() || null,
      promoCode: formData.promoCode.trim() || null,
      externalUrl: formData.externalUrl.trim() || null,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
      sortOrder: parseInt(formData.sortOrder, 10) || 0,
    };

    try {
      if (editingCampaign) {
        await campaignsApi.updateCampaign(editingCampaign._id, payload);
        setToast({ message: "Kampanya güncellendi", type: "success" });
      } else {
        await campaignsApi.createCampaign(payload);
        setToast({ message: "Kampanya oluşturuldu", type: "success" });
      }
      closeModal();
      fetchCampaigns();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "İşlem başarısız", type: "error" });
    }
  };

  const handleToggle = async (campaignId) => {
    try {
      await campaignsApi.toggleCampaign(campaignId);
      setToast({ message: "Durum güncellendi", type: "success" });
      fetchCampaigns();
    } catch (err) {
      setToast({ message: "Durum değiştirilemedi", type: "error" });
    }
  };

  const handleDelete = async (campaignId) => {
    if (!confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) return;

    try {
      await campaignsApi.deleteCampaign(campaignId);
      setToast({ message: "Kampanya silindi", type: "success" });
      fetchCampaigns();
    } catch (err) {
      setToast({ message: "Kampanya silinemedi", type: "error" });
    }
  };

  if (loading) return <TableSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kampanya Yönetimi</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Yeni Kampanya
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Campaigns Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Başlık</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori / Tip</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih Aralığı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sıra</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Kampanya bulunamadı
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                    <div className="text-xs text-gray-500">{campaign.shortDescription}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {CATEGORY_LABELS[campaign.category]}
                      </span>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {CAMPAIGN_TYPE_LABELS[campaign.campaignType || "info"]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(campaign.startDate).toLocaleDateString("tr-TR")} -{" "}
                    {new Date(campaign.endDate).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        campaign.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {campaign.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.sortOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggle(campaign._id)}
                      className={`mr-4 ${
                        campaign.isActive
                          ? "text-orange-600 hover:text-orange-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                      title={campaign.isActive ? "Pasife Al" : "Aktife Al"}
                    >
                      {campaign.isActive ? "Pasife Al" : "Aktife Al"}
                    </button>
                    <button
                      onClick={() => openModal(campaign)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(campaign._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingCampaign ? "Kampanyayı Düzenle" : "Yeni Kampanya Oluştur"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kısa Açıklama *
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detay Açıklama *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campaign Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kampanya Tipi *
                  </label>
                  <select
                    value={formData.campaignType}
                    onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {CAMPAIGN_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {CAMPAIGN_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Lead: Başvuru formu | Affiliate: Harici link | Kod: Promosyon kodu | Bilgi: Sadece bilgilendirme
                  </p>
                </div>

                {/* CTA Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CTA Buton Yazısı (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={formData.ctaLabel}
                    onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: Başvur, İncele, Kodu Kopyala"
                    maxLength={30}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Boş bırakılırsa otomatik belirlenir (Lead→Başvur, Affiliate→İncele, Kod→Kodu Kopyala, Bilgi→Detayları İncele)
                  </p>
                </div>

                {/* Badge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: Popüler, Yeni, Süreli"
                  />
                </div>

                {/* Image Upload/URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Görsel (İsteğe bağlı)
                  </label>

                  {/* Upload Button */}
                  <div className="mb-3">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      {uploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Görsel Yükle
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                    <span className="ml-3 text-xs text-gray-500">veya URL girin</span>
                  </div>

                  {/* Manual URL Input */}
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />

                  {/* Preview */}
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="h-32 w-auto rounded-md border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG veya WEBP formatında, maksimum 5MB
                  </p>
                </div>

                {/* Conditional Fields Based on Campaign Type */}
                {formData.campaignType === "code" && (
                  <div className="border-2 border-purple-200 bg-purple-50 p-4 rounded-md">
                    <label className="block text-sm font-medium text-purple-900 mb-1">
                      Promosyon Kodu * (Kod kampanyası için gerekli)
                    </label>
                    <input
                      type="text"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="ILKYUKLE100"
                      required={formData.campaignType === "code"}
                    />
                  </div>
                )}

                {formData.campaignType === "affiliate" && (
                  <div className="border-2 border-purple-200 bg-purple-50 p-4 rounded-md">
                    <label className="block text-sm font-medium text-purple-900 mb-1">
                      Harici Link * (Affiliate kampanyası için gerekli)
                    </label>
                    <input
                      type="url"
                      value={formData.externalUrl}
                      onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://..."
                      required={formData.campaignType === "affiliate"}
                    />
                  </div>
                )}

                {formData.campaignType === "lead" && (
                  <div className="border-2 border-purple-200 bg-purple-50 p-4 rounded-md space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-purple-900 mb-1">
                        Başvuru Formu Linki
                      </label>
                      <input
                        type="url"
                        value={formData.externalUrl}
                        onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://example.com/basvuru-formu"
                      />
                      <p className="mt-1 text-xs text-purple-700">
                        Kullanıcı "Başvur" butonuna tıkladığında bu linke yönlendirilir. Boş bırakılırsa placeholder mesajı gösterilir.
                      </p>
                    </div>
                    <p className="text-sm text-purple-900">
                      <strong>Lead kampanyası:</strong> Kullanıcı "Başvur" butonuna tıkladığında bu linke yönlendirilir.
                      {formData.ctaLabel && ` Buton yazısı: "${formData.ctaLabel}"`}
                    </p>
                  </div>
                )}

                {formData.campaignType === "info" && (
                  <div className="border-2 border-gray-200 bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Bilgi kampanyası:</strong> Sadece bilgilendirme amaçlı, özel aksiyon yok.
                    </p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlangıç Tarihi *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bitiş Tarihi *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Active & Sort Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Aktif</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sıra Numarası
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingCampaign ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
