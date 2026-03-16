import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import newsApi from "../api/newsApi";
import dayjs from "dayjs";
import PageShell from "../components/layout/PageShell";
import { useAuth } from "../context/AuthProvider";

// Category labels
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

const CategoryBadge = ({ category }) => {
  if (!category) return null;
  const label = CATEGORY_LABELS[category] || category;
  const colorMap = {
    sektor: "bg-purple-50 text-purple-700 border-purple-200",
    ekonomi: "bg-green-50 text-green-700 border-green-200",
    teknoloji: "bg-blue-50 text-blue-700 border-blue-200",
    oyun: "bg-pink-50 text-pink-700 border-pink-200",
    mobil: "bg-orange-50 text-orange-700 border-orange-200",
    duyuru: "bg-red-50 text-red-700 border-red-200",
    guncelleme: "bg-emerald-50 text-emerald-700 border-emerald-200",
    genel: "bg-slate-50 text-slate-700 border-slate-200",
  };
  const color = colorMap[category] || colorMap.genel;
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded border ${color}`}>
      {label}
    </span>
  );
};

export default function NewsUpdates() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Favorites state
  const [hasFavorites, setHasFavorites] = useState(false);
  const [favoritesApplied, setFavoritesApplied] = useState(false);
  const [prioritizeFavorites, setPrioritizeFavorites] = useState(true);

  // Filter state - initialized from URL
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get("category") || "";
  });
  const [selectedSources, setSelectedSources] = useState(() => {
    const sourceParam = searchParams.get("source");
    return sourceParam ? sourceParam.split(",").filter(Boolean) : [];
  });

  // UI state
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(true);

  // Sync filters to URL (excluding prioritizeFavorites)
  const updateURL = useCallback((category, sources) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (sources.length > 0) params.set("source", sources.join(","));
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Load categories and sources on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [categoriesRes, sourcesRes] = await Promise.all([
          newsApi.getCategories(),
          newsApi.getSources(),
        ]);
        setCategories(categoriesRes || []);
        setSources(sourcesRes || []);
      } catch (err) {
        setCategories([]);
        setSources([]);
      }
    };
    loadMetadata();
  }, []);

  // Load news when filters change
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const params = { prioritizeFavorites };
        if (selectedCategory) params.category = selectedCategory;
        if (selectedSources.length > 0) params.sources = selectedSources;
        const res = await newsApi.getNews(params);
        
        // Handle new response format
        if (res && typeof res === "object" && "items" in res) {
          setItems(res.items || []);
          setHasFavorites(res.hasFavorites || false);
          setFavoritesApplied(res.favoritesApplied || false);
        } else {
          // Backward compatibility with array response
          setItems(Array.isArray(res) ? res : []);
          setHasFavorites(false);
          setFavoritesApplied(false);
        }
      } catch (err) {
        setItems([]);
        setHasFavorites(false);
        setFavoritesApplied(false);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };
    loadNews();
    updateURL(selectedCategory, selectedSources);
  }, [selectedCategory, selectedSources, prioritizeFavorites, updateURL]);

  // Handle category change
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // Handle source toggle
  const handleSourceToggle = useCallback((slug) => {
    setSelectedSources((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      return [...prev, slug];
    });
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSelectedCategory("");
    setSelectedSources([]);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return selectedCategory !== "" || selectedSources.length > 0;
  }, [selectedCategory, selectedSources]);

  // Selected sources count text
  const sourceCountText = useMemo(() => {
    if (selectedSources.length === 0) return null;
    return `${selectedSources.length} kaynak seçildi`;
  }, [selectedSources.length]);

  if (initialLoad && loading) {
    return (
      <PageShell
        title="Haber & Güncellemeler"
        description="Sektörden ve Cordy'den son haberler."
        intent="content"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Haber & Güncellemeler"
      description="Sektörden ve Cordy'den son haberler."
      intent="content"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <aside className="lg:w-64 shrink-0">
          {/* Favorite Prioritization Toggle - Only show if user is authenticated and has favorites */}
          {user && hasFavorites && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={prioritizeFavorites}
                    onChange={(e) => setPrioritizeFavorites(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </div>
                <div>
                  <span className="text-sm font-medium text-amber-800">
                    Favorilerimi önceliklendir
                  </span>
                  {favoritesApplied && prioritizeFavorites && (
                    <p className="text-xs text-amber-600 mt-0.5">
                      ⭐ Favori kaynaklarına göre sıralanıyor
                    </p>
                  )}
                </div>
              </label>
            </div>
          )}

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                Kategoriler
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <button
                  onClick={() => handleCategoryChange("")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors text-left ${
                    selectedCategory === ""
                      ? "bg-primary text-white border-primary"
                      : "bg-card text-text-secondary border-border hover:bg-surface"
                  }`}
                >
                  Tümü
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors text-left ${
                      selectedCategory === cat.value
                        ? "bg-primary text-white border-primary"
                        : "bg-card text-text-secondary border-border hover:bg-surface"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Source Filter - Collapsible */}
          {sources.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setIsSourcePanelOpen((prev) => !prev)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface transition-colors"
              >
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    Haber Kaynakları
                  </h3>
                  {sourceCountText && (
                    <p className="text-xs text-primary mt-0.5">{sourceCountText}</p>
                  )}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 text-text-muted transition-transform ${
                    isSourcePanelOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isSourcePanelOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {sources.map((source) => (
                    <label
                      key={source.slug}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedSources.includes(source.slug)
                          ? "bg-primary/10"
                          : "hover:bg-surface"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(source.slug)}
                        onChange={() => handleSourceToggle(source.slug)}
                        className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                      />
                      <div className="flex items-center gap-2 min-w-0">
                        {source.logo ? (
                          <img
                            src={source.logo}
                            alt=""
                            className="w-5 h-5 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded bg-surface flex items-center justify-center shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-text-muted"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                              />
                            </svg>
                          </div>
                        )}
                        <span className="text-sm text-text-primary truncate">
                          {source.name}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="w-full mt-4 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Filtreleri Temizle
            </button>
          )}
        </aside>

        {/* News List */}
        <main className="flex-1 min-w-0">
          {loading && !initialLoad && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-12 w-12 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-text-primary">
                Haber bulunamadı
              </h3>
              <p className="mt-2 text-text-muted">
                Seçilen filtrelere uygun haber bulunmuyor.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-primary hover:text-highlight font-medium"
                >
                  Filtreleri temizle
                </button>
              )}
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) => (
                <article
                  key={item._id}
                  className={`rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow ${
                    item.isFavoriteSource
                      ? "border-amber-300 ring-1 ring-amber-100"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.isFavoriteSource && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-700">
                          ⭐ Favori
                        </span>
                      )}
                      <CategoryBadge category={item.category} />
                      <span className="text-xs text-text-muted">
                        {dayjs(item.publishedAt).format("DD MMM YYYY")}
                      </span>
                    </div>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-text-primary">
                    {item.title}
                  </h2>
                  {item.summary && (
                    <p className="mt-1 text-sm text-text-secondary line-clamp-3">
                      {item.summary}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-sm text-text-secondary flex-wrap">
                    {(item.source?.name || item.sourceName) && (
                      <span className="inline-flex items-center gap-1.5">
                        {item.source?.logo && (
                          <img
                            src={item.source.logo}
                            alt=""
                            className="w-4 h-4 rounded object-cover"
                          />
                        )}
                        <span className="font-medium">
                          {item.source?.name || item.sourceName}
                        </span>
                      </span>
                    )}
                    {item.type === "sector" && item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-highlight font-medium inline-flex items-center gap-1"
                      >
                        Habere git
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageShell>
  );
}
