import { useEffect, useState } from "react";
import newsApi from "../../api/newsApi";
import { TableSkeleton } from "../../components/common/Skeleton";
import Toast from "../../components/common/Toast";

// Category labels for display
const CATEGORY_LABELS = {
  sektor: "Sektör",
  ekonomi: "Ekonomi",
  teknoloji: "Teknoloji",
  oyun: "Oyun",
  mobil: "Mobil",
  duyuru: "Duyuru",
  guncelleme: "Güncelleme",
  genel: "Genel",
};

export default function NewsSourcesManagement() {
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    website: "",
    feedUrl: "",
    logo: "",
    tags: "",
    allowedCategories: ["genel"],
    isActive: true,
  });

  const fetchData = async () => {
    try {
      const [sourcesRes, categoriesRes] = await Promise.all([
        newsApi.getAdminSources(),
        newsApi.getAdminCategories(),
      ]);
      setSources(sourcesRes);
      setCategories(categoriesRes);
    } catch (err) {
      setToast({ message: "Veriler yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (sourceId) => {
    try {
      await newsApi.toggleSource(sourceId);
      fetchData();
      setToast({ message: "Durum güncellendi", type: "success" });
    } catch (err) {
      setToast({ message: "Durum değiştirilemedi", type: "error" });
    }
  };

  const handleDelete = async (sourceId, force = false) => {
    const confirmMsg = force
      ? "Bu kaynağı kalıcı olarak silmek istediğinize emin misiniz?"
      : "Bu kaynağı devre dışı bırakmak istediğinize emin misiniz?";
    if (!confirm(confirmMsg)) return;

    try {
      await newsApi.deleteSource(sourceId, force);
      fetchData();
      setToast({
        message: force ? "Kaynak kalıcı olarak silindi" : "Kaynak devre dışı bırakıldı",
        type: "success",
      });
    } catch (err) {
      setToast({ message: "İşlem başarısız", type: "error" });
    }
  };

  const openModal = (source = null) => {
    if (source) {
      setEditingSource(source);
      setFormData({
        name: source.name || "",
        slug: source.slug || "",
        website: source.website || "",
        feedUrl: source.feedUrl || "",
        logo: source.logo || "",
        tags: (source.tags || []).join(", "),
        allowedCategories: source.allowedCategories || ["genel"],
        isActive: source.isActive !== false,
      });
    } else {
      setEditingSource(null);
      setFormData({
        name: "",
        slug: "",
        website: "",
        feedUrl: "",
        logo: "",
        tags: "",
        allowedCategories: ["genel"],
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSource(null);
  };

  const handleCategoryToggle = (categoryValue) => {
    setFormData((prev) => {
      const current = prev.allowedCategories || [];
      if (current.includes(categoryValue)) {
        // Remove category, but keep at least one
        const newCategories = current.filter((c) => c !== categoryValue);
        return {
          ...prev,
          allowedCategories: newCategories.length > 0 ? newCategories : current,
        };
      } else {
        // Add category
        return {
          ...prev,
          allowedCategories: [...current, categoryValue],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setToast({ message: "Kaynak adı zorunlu", type: "warning" });
      return;
    }
    if (formData.allowedCategories.length === 0) {
      setToast({ message: "En az bir kategori seçilmeli", type: "warning" });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || undefined,
      website: formData.website.trim() || null,
      feedUrl: formData.feedUrl.trim() || null,
      logo: formData.logo.trim() || null,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      allowedCategories: formData.allowedCategories,
      isActive: formData.isActive,
    };

    try {
      if (editingSource) {
        await newsApi.updateSource(editingSource._id, payload);
        setToast({ message: "Kaynak güncellendi", type: "success" });
      } else {
        await newsApi.createSource(payload);
        setToast({ message: "Kaynak oluşturuldu", type: "success" });
      }
      closeModal();
      fetchData();
    } catch (err) {
      setToast({
        message: err?.response?.data?.message || "İşlem başarısız",
        type: "error",
      });
    }
  };

  const getCategoryLabel = (value) => CATEGORY_LABELS[value] || value;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Haber Kaynakları
          </h1>
          <p className="text-slate-600">Kaynaklar yükleniyor...</p>
        </div>
        <TableSkeleton rows={6} columns={5} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Haber Kaynakları
          </h1>
          <p className="text-slate-600">
            Toplam {sources.length} kaynak listeleniyor
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Yeni Kaynak
        </button>
      </div>

      {/* Mobile Cards (<768px) */}
      <div className="md:hidden space-y-4">
        {sources.map((source) => (
          <div
            key={source._id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-slate-900">{source.name}</h3>
                <p className="text-sm text-slate-500">{source.slug}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={source.isActive}
                  onChange={() => handleToggle(source._id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            {source.website && (
              <a
                href={source.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline block mb-2"
              >
                {source.website}
              </a>
            )}
            {/* Allowed Categories */}
            {source.allowedCategories && source.allowedCategories.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-1">İzin verilen kategoriler:</p>
                <div className="flex flex-wrap gap-1">
                  {source.allowedCategories.map((cat, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium"
                    >
                      {getCategoryLabel(cat)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => openModal(source)}
                className="flex-1 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                Düzenle
              </button>
              <button
                onClick={() => handleDelete(source._id)}
                className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (≥768px) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Kaynak
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Website
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                İzin Verilen Kategoriler
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                Aktif
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sources.map((source) => (
              <tr key={source._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {source.logo ? (
                      <img
                        src={source.logo}
                        alt={source.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-slate-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {source.name}
                      </div>
                      <div className="text-xs text-slate-500">{source.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {source.website ? (
                    <a
                      href={source.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {source.website.replace(/^https?:\/\//, "").slice(0, 25)}
                      {source.website.length > 25 ? "..." : ""}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {source.allowedCategories && source.allowedCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {source.allowedCategories.slice(0, 4).map((cat, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium"
                        >
                          {getCategoryLabel(cat)}
                        </span>
                      ))}
                      {source.allowedCategories.length > 4 && (
                        <span className="text-xs text-slate-400">
                          +{source.allowedCategories.length - 4}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={source.isActive}
                      onChange={() => handleToggle(source._id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(source)}
                      className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-medium text-xs"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(source._id)}
                      className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-medium text-xs"
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sources.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-slate-900">
            Henüz kaynak yok
          </h3>
          <p className="mt-2 text-slate-500">
            Yeni bir haber kaynağı ekleyerek başlayın.
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingSource ? "Kaynağı Düzenle" : "Yeni Kaynak Ekle"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kaynak Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="NTV Ekonomi"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Slug (otomatik oluşturulur)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="ntv-ekonomi"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://ntv.com.tr"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    RSS Feed URL
                  </label>
                  <input
                    type="url"
                    value={formData.feedUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, feedUrl: e.target.value })
                    }
                    placeholder="https://ntv.com.tr/ekonomi.rss"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    RSS feed URL'si girilirse haberler otomatik çekilir
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) =>
                      setFormData({ ...formData, logo: e.target.value })
                    }
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Allowed Categories - Checkboxes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    İzin Verilen Kategoriler *
                  </label>
                  <p className="text-xs text-amber-600 mb-3 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    ⚠️ Bu kaynak sadece seçilen kategorilere haber gönderebilir.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <label
                        key={cat.value}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          formData.allowedCategories.includes(cat.value)
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.allowedCategories.includes(cat.value)}
                          onChange={() => handleCategoryToggle(cat.value)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Etiketler (virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="ekonomi, otomotiv, teknoloji"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                  <span className="text-sm text-slate-700">Aktif</span>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingSource ? "Güncelle" : "Oluştur"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
