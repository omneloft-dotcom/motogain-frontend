import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import listingsApi from "../../api/listingsApi";
import ListingsGrid from "../../components/listings/ListingsGrid";
import ListingList from "../../components/listings/ListingList";
import { useAuth } from "../../context/AuthProvider";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import Toast from "../../components/common/Toast";
import EmptyState from "../../components/common/EmptyState";
import PageShell from "../../components/layout/PageShell"; // FAZ 18: UX polish
import useDebounce from "../../utils/useDebounce";
import {
  VEHICLE_BRANDS,
  EQUIPMENT_BRANDS,
  PART_BRANDS,
  TIRE_BRANDS,
} from "../../constants/brandData";

/**
 * ListingsPage - Tüm ilanlar + Filtreleme (FAZ 15)
 *
 * Features:
 * - City, category, price range filters
 * - Sorting options
 * - Mobile filter drawer
 * - URL query sync
 */

const CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
];

const CATEGORY_TREE = {
  "Taşıtlar": ["Motosiklet", "Scooter"],
  "Ekipman": [
    "Ayakkabı & Bot",
    "Kask",
    "Mont",
    "Pantolon",
    "Sweatshirt",
    "Tişört",
    "Tulum",
    "Yağmurluk",
    "Eldiven",
  ],
  "Yedek Parça": [
    "Debriyaj",
    "Egzoz",
    "Elektrik",
    "Fren",
    "Grenaj",
    "Havalandırma",
    "Motor",
    "Süspansiyon",
    "Şanzıman",
    "Yağlama",
    "Yakıt Sistemi",
    "Yönlendirme",
    "Jant",
    "Lastik",
  ],
  "Aksesuar": ["Görünüm", "Koruma", "Bakım Ürünleri", "Elektronik Aksesuar"],
};

const SORT_OPTIONS = [
  { value: "newest", label: "En Yeni" },
  { value: "price_asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "price_desc", label: "Fiyat: Yüksekten Yükseğe" },
];

// Combine all brands for the filter
const ALL_BRANDS = [
  ...VEHICLE_BRANDS,
  ...EQUIPMENT_BRANDS,
  ...PART_BRANDS,
  ...TIRE_BRANDS,
].sort();

// Year validation constants
const MIN_YEAR = 1950;
const MAX_YEAR = new Date().getFullYear() + 1; // Allow next year for new models

// Default filter values - MUST be a constant for reset consistency
const DEFAULT_FILTERS = {
  q: "",
  city: "",
  parentCategory: "",
  category: "",
  brand: "",
  model: "",
  yearMin: "",
  yearMax: "",
  mileageMin: "",
  mileageMax: "",
  condition: "",
  priceMin: "",
  priceMax: "",
  sort: "newest",
};

// Parse price input: extract digits and convert to Number
// Returns Number if valid, empty string if empty/invalid
const parsePriceInput = (v) => {
  if (v === "" || v === null || v === undefined) return "";
  const digits = String(v).replace(/\D/g, "");
  if (!digits) return "";
  const num = Number(digits);
  if (!Number.isFinite(num)) return "";
  return num;
};

// Parse year input: extract digits only, keep as STRING for typing
const parseYearInput = (v) => (v ?? "").toString().replace(/\D/g, "").slice(0, 4);

// Current year for validation
const CURRENT_YEAR = new Date().getFullYear();

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState(null); // FAZ 18: UX polish
  // 🔄 GELİŞTİRME 3: İlan tipi tab state
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'sale');

  const { favorites, toggleFavorite } = useAuth();

  // Parse URL params BEFORE initializing state - convert to Number
  const rawPriceMin = searchParams.get("priceMin");
  const rawPriceMax = searchParams.get("priceMax");
  const parsedPriceMin = parsePriceInput(rawPriceMin);
  const parsedPriceMax = parsePriceInput(rawPriceMax);

  // Validate price range: if priceMin > priceMax, reset both
  let validPriceMin = parsedPriceMin;
  let validPriceMax = parsedPriceMax;
  if (parsedPriceMin !== "" && parsedPriceMax !== "" && parsedPriceMin > parsedPriceMax) {
    validPriceMin = "";
    validPriceMax = "";
  }

  // Parse year URL params - keep as string, validate range
  const rawYearMin = searchParams.get("yearMin");
  const rawYearMax = searchParams.get("yearMax");
  const parsedYearMin = parseYearInput(rawYearMin);
  const parsedYearMax = parseYearInput(rawYearMax);

  // Validate year range: if yearMin > yearMax, reset both
  let validYearMin = parsedYearMin;
  let validYearMax = parsedYearMax;
  const numYearMin = parsedYearMin ? Number(parsedYearMin) : 0;
  const numYearMax = parsedYearMax ? Number(parsedYearMax) : 0;
  if (parsedYearMin && parsedYearMax && numYearMin > numYearMax) {
    validYearMin = "";
    validYearMax = "";
  }

  // Filter state from URL (with sanitized prices and years)
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    parentCategory: searchParams.get("parentCategory") || "",
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    model: searchParams.get("model") || "",
    yearMin: validYearMin,
    yearMax: validYearMax,
    mileageMin: searchParams.get("mileageMin") || "",
    mileageMax: searchParams.get("mileageMax") || "",
    condition: searchParams.get("condition") || "",
    priceMin: validPriceMin,
    priceMax: validPriceMax,
    sort: searchParams.get("sort") || "newest",
  });
  // Debounce only the search query (q), not the dropdown filters
  const debouncedSearchQuery = useDebounce(filters.q, 400);

  // Reset filters on hard reload (CTRL+SHIFT+R or browser reload)
  useEffect(() => {
    const navEntry = performance.getEntriesByType?.('navigation')?.[0];
    const isReload = navEntry?.type === 'reload' || performance.navigation?.type === 1;

    if (isReload) {
      // Step 1: Clear URL params
      setSearchParams({}, { replace: true });
      // Step 2: Reset filters state to defaults
      setFilters(DEFAULT_FILTERS);
    }
    // Only run once on mount - intentionally empty deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync filters to URL (separate effect to avoid setState during render)
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== "") {
        newParams.set(k, String(v));
      }
    });
    setSearchParams(newParams, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch listings when filters change - SINGLE authoritative effect
  // All filter dependencies are explicit to avoid stale closure issues
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        
        // Safe year values: ensure yearMin <= yearMax before API call
        const numYearMin = filters.yearMin ? Number(filters.yearMin) : null;
        const numYearMax = filters.yearMax ? Number(filters.yearMax) : null;
        let safeYearMin = filters.yearMin;
        let safeYearMax = filters.yearMax;
        
        if (numYearMin && numYearMax && numYearMin > numYearMax) {
          // If yearMin > yearMax, use yearMax for both (safer)
          safeYearMin = filters.yearMax;
        }
        
        // Build activeFilters from current filter values
        const activeFilters = {
          q: debouncedSearchQuery,
          city: filters.city,
          parentCategory: filters.parentCategory,
          category: filters.category,
          brand: filters.brand,
          model: filters.model,
          yearMin: safeYearMin,
          yearMax: safeYearMax,
          condition: filters.condition,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          mileageMin: filters.mileageMin,
          mileageMax: filters.mileageMax,
          sort: filters.sort,
          // 🔄 GELİŞTİRME 3: İlan tipi filtresi
          type: activeTab,
        };
        // DEBUG: verify filter values before API call
        console.log("[ListingsPage] filters->", activeFilters);
        const data = await listingsApi.getListings(activeFilters);
        setListings(data);
      } catch (err) {
        logError("ListingsPage - fetchListings", err);
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [
    debouncedSearchQuery,
    filters.city,
    filters.parentCategory,
    filters.category,
    filters.brand,
    filters.model,
    filters.yearMin,
    filters.yearMax,
    filters.condition,
    filters.priceMin,
    filters.priceMax,
    filters.mileageMin,
    filters.mileageMax,
    filters.sort,
    activeTab, // 🔄 GELİŞTİRME 3: Tab değiştiğinde veri çek
  ]);

  const updateFilter = (key, value) => {
    // Use functional setState to preserve other filters
    setFilters(prev => ({ ...prev, [key]: value }));
    // URL sync happens in separate useEffect
  };

  // 🔄 GELİŞTİRME 3: Tab değiştirme fonksiyonu
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ type: tab }, { replace: true });
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    filters.q ||
    filters.city ||
    filters.parentCategory ||
    filters.category ||
    filters.brand ||
    filters.model ||
    filters.yearMin ||
    filters.yearMax ||
    filters.condition ||
    filters.priceMin ||
    filters.priceMax ||
    filters.mileageMin ||
    filters.mileageMax ||
    filters.sort;

  // FAZ 18: UX polish - Favori toggle + toast mesajı
  const handleToggleFavorite = async (listingId) => {
    const result = await toggleFavorite(listingId);
    if (result?.success) {
      const message =
        result.action === "added"
          ? "Favorilere eklendi ⭐"
          : "Favorilerden çıkarıldı";
      setToast({ message, type: "success" });
    } else {
      setToast({ message: "Bir hata oluştu", type: "error" });
    }
  };

  return (
    <PageShell
      title="Tüm İlanlar"
      description={`${listings.length} ilan listeleniyor${hasActiveFilters ? " (filtrelenmiş)" : ""}`}
    >
      {/* 🔄 GELİŞTİRME 3: Tab Yapısı - Satılık/Kiralık */}
      <div className="mb-4 flex gap-2 border-b border-border">
        <button
          onClick={() => handleTabChange('sale')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === 'sale'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Satılık
        </button>
        <button
          onClick={() => handleTabChange('rent')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === 'rent'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Kiralık
        </button>
      </div>

      {/* Search + View Toggle + Filter Toggle - Single Row */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1">
          <input
            type="search"
            value={filters.q}
            onChange={(e) => updateFilter("q", e.target.value)}
            placeholder="İlan, kategori veya kelime ara…"
            className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 rounded-lg transition-colors text-sm ${
              view === "grid"
                ? "bg-card-hover text-text-primary border border-primary/60"
                : "bg-card text-text-secondary border border-border hover:bg-card-hover hover:text-text-primary"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 rounded-lg transition-colors text-sm ${
              view === "list"
                ? "bg-card-hover text-text-primary border border-primary/60"
                : "bg-card text-text-secondary border border-border hover:bg-card-hover hover:text-text-primary"
            }`}
          >
            Liste
          </button>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-card border border-border text-text-secondary px-3 py-2 rounded-lg hover:bg-card-hover hover:text-text-primary transition-colors text-sm flex-shrink-0"
        >
          {showFilters ? "Filtreleri Gizle" : "Filtreler"} 🔍
        </button>
      </div>

      {/* Filters Panel - Collapsed by Default */}
      <div
        className={`mb-6 bg-card/50 rounded-lg border border-primary/10 p-4 ${
          showFilters ? "block" : "hidden"
        }`}
      >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* City Filter */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Şehir
            </label>
            <select
              value={filters.city}
              onChange={(e) => updateFilter("city", e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
            >
              <option value="">Tüm Şehirler</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Parent Category Filter */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Ana Kategori
            </label>
            <select
              value={filters.parentCategory}
              onChange={(e) => {
                const value = e.target.value;
                // Use functional setState to preserve other filters (prices, sort, etc.)
                setFilters(prev => ({
                  ...prev,
                  parentCategory: value,
                  category: "" // Reset dependent field only
                }));
                // URL sync happens in separate useEffect
              }}
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
            >
              <option value="">Tüm Ana Kategoriler</option>
              {Object.keys(CATEGORY_TREE).map((pc) => (
                <option key={pc} value={pc}>
                  {pc}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Alt Kategori
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
              disabled={!filters.parentCategory}
            >
              <option value="">Tüm Alt Kategoriler</option>
              {(CATEGORY_TREE[filters.parentCategory] || []).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Marka
            </label>
            <select
              value={filters.brand}
              onChange={(e) => {
                const value = e.target.value;
                // Use functional setState to preserve other filters (prices, sort, etc.)
                setFilters(prev => ({
                  ...prev,
                  brand: value,
                  model: "" // Reset dependent field only
                }));
                // URL sync happens in separate useEffect
              }}
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
            >
              <option value="">Tüm Markalar</option>
              {ALL_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Model Filter */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Model
            </label>
            <input
              type="text"
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
              value={filters.model}
              onChange={(e) => updateFilter("model", e.target.value)}
              placeholder="Model ara..."
            />
          </div>

          {/* Year Min */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Yıl (Min)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={filters.yearMin}
              onChange={(e) => {
                const value = parseYearInput(e.target.value);
                setFilters((prev) => ({
                  ...prev,
                  yearMin: value,
                  // Auto-adjust yearMax if yearMin > yearMax
                  yearMax: prev.yearMax && value && Number(value) > Number(prev.yearMax)
                    ? value
                    : prev.yearMax,
                }));
              }}
              onBlur={() => {
                if (!filters.yearMin) return;
                const year = Number(filters.yearMin);
                if (isNaN(year) || year < MIN_YEAR || year > CURRENT_YEAR) {
                  updateFilter("yearMin", "");
                }
              }}
              placeholder="1999"
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
            />
          </div>

          {/* Year Max */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Yıl (Max)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={filters.yearMax}
              onChange={(e) => {
                const value = parseYearInput(e.target.value);
                setFilters((prev) => ({
                  ...prev,
                  yearMax: value,
                  // Auto-adjust yearMin if yearMax < yearMin
                  yearMin: prev.yearMin && value && Number(value) < Number(prev.yearMin)
                    ? value
                    : prev.yearMin,
                }));
              }}
              onBlur={() => {
                if (!filters.yearMax) return;
                const year = Number(filters.yearMax);
                if (isNaN(year) || year < MIN_YEAR || year > CURRENT_YEAR) {
                  updateFilter("yearMax", "");
                }
              }}
              placeholder="2024"
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
            />
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Durum
            </label>
            <select
              value={filters.condition}
              onChange={(e) => updateFilter("condition", e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
            >
              <option value="">Hepsi</option>
              <option value="sifir">Sıfır</option>
              <option value="ikinci_el">İkinci El</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Min Fiyat
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={filters.priceMin}
              onChange={(e) => updateFilter("priceMin", parsePriceInput(e.target.value))}
              placeholder="0"
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Max Fiyat
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={filters.priceMax}
              onChange={(e) => updateFilter("priceMax", parsePriceInput(e.target.value))}
              placeholder="10000000"
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
            />
          </div>

          {/* Min Mileage */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Min KM
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={filters.mileageMin}
              onChange={(e) => updateFilter("mileageMin", parsePriceInput(e.target.value))}
              placeholder="0"
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
            />
          </div>

          {/* Max Mileage */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Max KM
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={filters.mileageMax}
              onChange={(e) => updateFilter("mileageMax", parsePriceInput(e.target.value))}
              placeholder="500000"
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Sıralama
            </label>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary/60 transition-colors"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-3">
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:text-highlight font-medium transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">İlanlar yükleniyor...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <EmptyState
          icon="🔍"
          title="İlan bulunamadı"
          description={
            hasActiveFilters
              ? "Filtrelerinize uygun ilan bulunamadı. Filtreleri değiştirmeyi deneyin."
              : "Henüz hiç ilan yok. İlk ilanı siz ekleyin."
          }
          actionLabel={hasActiveFilters ? "Filtreleri Temizle" : "İlan Ekle"}
          actionOnClick={hasActiveFilters ? clearFilters : undefined}
          actionTo={!hasActiveFilters ? "/listings/create" : undefined}
          secondaryLabel={!hasActiveFilters ? "İlanları Keşfet" : undefined}
          secondaryTo={!hasActiveFilters ? "/listings" : undefined}
        />
      )}

      {/* Listings */}
      {!loading && listings.length > 0 && (
        <>
          {view === "grid" ? (
            <ListingsGrid
              listings={listings}
              favorites={favorites}
              onToggle={handleToggleFavorite}
            />
          ) : (
            <ListingList
              listings={listings}
              favorites={favorites}
              onToggle={handleToggleFavorite}
            />
          )}
        </>
      )}

      {/* FAZ 18: Toast mesajı */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </PageShell>
  );
}