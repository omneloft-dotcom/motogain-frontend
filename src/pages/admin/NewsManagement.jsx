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

export default function NewsManagement() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    imageUrl: "",
    sourceName: "",
    sourceUrl: "",
    category: "genel",
    type: "sector",
    status: "published",
    publishedAt: new Date().toISOString().slice(0, 16),
  });

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await newsApi.getAdminNews();
      setNewsItems(data);
    } catch (err) {
      setToast({ message: "Haberler yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (newsId) => {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) return;

    try {
      await newsApi.deleteNews(newsId);
      fetchNews();
      setToast({ message: "Haber silindi", type: "success" });
    } catch (err) {
      setToast({ message: "Haber silinemedi", type: "error" });
    }
  };

  const openModal = (news = null) => {
    if (news) {
      setEditingNews(news);
      setFormData({
        title: news.title || "",
        summary: news.summary || "",
        content: news.content || "",
        imageUrl: news.imageUrl || "",
        sourceName: news.sourceName || "",
        sourceUrl: news.sourceUrl || "",
        category: news.category || "genel",
        type: news.type || "sector",
        status: news.status || "published",
        publishedAt: news.publishedAt
          ? new Date(news.publishedAt).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
      });
    } else {
      setEditingNews(null);
      setFormData({
        title: "",
        summary: "",
        content: "",
        imageUrl: "",
        sourceName: "",
        sourceUrl: "",
        category: "genel",
        type: "sector",
        status: "published",
        publishedAt: new Date().toISOString().slice(0, 16),
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNews(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setToast({ message: "Başlık zorunlu", type: "error" });
      return;
    }

    if (!formData.sourceName.trim()) {
      setToast({ message: "Kaynak adı zorunlu", type: "error" });
      return;
    }

    try {
      const payload = {
        ...formData,
        ingestionMethod: "manual",
        publishedAt: new Date(formData.publishedAt).toISOString(),
      };

      if (editingNews) {
        await newsApi.updateNews(editingNews._id, payload);
        setToast({ message: "Haber güncellendi", type: "success" });
      } else {
        await newsApi.createNews(payload);
        setToast({ message: "Haber oluşturuldu", type: "success" });
      }

      closeModal();
      fetchNews();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "İşlem başarısız",
        type: "error",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Haber Yönetimi</h1>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Haber Yönetimi</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Yeni Haber Ekle
        </button>
      </div>

      {/* News List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card-hover border-b border-border">
            <tr>
              <th className="text-left p-4 text-text-primary font-semibold">Başlık</th>
              <th className="text-left p-4 text-text-primary font-semibold">Kaynak</th>
              <th className="text-left p-4 text-text-primary font-semibold">Kategori</th>
              <th className="text-left p-4 text-text-primary font-semibold">Tür</th>
              <th className="text-left p-4 text-text-primary font-semibold">Durum</th>
              <th className="text-left p-4 text-text-primary font-semibold">Yayın Tarihi</th>
              <th className="text-right p-4 text-text-primary font-semibold">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {newsItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-text-muted">
                  Henüz haber bulunmuyor
                </td>
              </tr>
            ) : (
              newsItems.map((news) => (
                <tr key={news._id} className="border-b border-border hover:bg-card-hover">
                  <td className="p-4">
                    <div className="max-w-md">
                      <p className="text-text-primary font-medium line-clamp-2">{news.title}</p>
                      {news.ingestionMethod === "manual" && (
                        <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Manuel
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-text-secondary">{news.sourceName || "-"}</td>
                  <td className="p-4 text-text-secondary">
                    {CATEGORY_LABELS[news.category] || news.category}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {news.type === "sector" ? "Sektör" : "Uygulama"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        news.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {news.status === "published" ? "Yayında" : "Gizli"}
                    </span>
                  </td>
                  <td className="p-4 text-text-secondary text-sm">
                    {news.publishedAt
                      ? new Date(news.publishedAt).toLocaleDateString("tr-TR")
                      : "-"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(news)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(news._id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-text-primary">
                {editingNews ? "Haberi Düzenle" : "Yeni Haber Ekle"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Başlık *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Özet</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-text-muted mt-1">
                  {formData.summary.length}/500 karakter
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">İçerik</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Görsel URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>

              {/* Source Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Kaynak Adı *
                </label>
                <input
                  type="text"
                  name="sourceName"
                  value={formData.sourceName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="MotoGain Editör"
                  required
                />
              </div>

              {/* Source URL */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Kaynak Linki
                </label>
                <input
                  type="url"
                  name="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>

              {/* Category, Type, Status - Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Kategori *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Haber Türü
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="sector">Sektör</option>
                    <option value="app">Uygulama</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Durum</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="published">Yayında</option>
                    <option value="hidden">Gizli</option>
                  </select>
                </div>
              </div>

              {/* Published At */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Yayın Tarihi
                </label>
                <input
                  type="datetime-local"
                  name="publishedAt"
                  value={formData.publishedAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-card-hover transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingNews ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
