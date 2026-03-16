import { useState } from "react";
import DropdownFilter from "./DropdownFilter";
import { ChevronDown } from "lucide-react";

export default function FilterBar({ filters, setFilters }) {
  const [openKey, setOpenKey] = useState(null);

  const toggle = (key) => {
    setOpenKey(openKey === key ? null : key);
  };

  return (
    <div className="flex gap-3 overflow-x-auto py-3 px-2 border-b bg-white sticky top-0 z-[50]">
      {/* Şehir */}
      <div className="relative">
        <button
          onClick={() => toggle("city")}
          className="flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm text-gray-700 bg-gray-50"
        >
          {filters.city || "Şehir"}
          <ChevronDown size={14} />
        </button>

        {openKey === "city" && (
          <DropdownFilter
            options={["İstanbul", "Ankara", "İzmir", "Bursa", "Samsun"]}
            onSelect={(city) => setFilters({ ...filters, city })}
            onClose={() => setOpenKey(null)}
          />
        )}
      </div>

      {/* Ana Kategori */}
      <div className="relative">
        <button
          onClick={() => toggle("parentCategory")}
          className="flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm text-gray-700 bg-gray-50"
        >
          {filters.parentCategory || "Ana Kategori"}
          <ChevronDown size={14} />
        </button>

        {openKey === "parentCategory" && (
          <DropdownFilter
            options={[
              "Taşıtlar",
              "Ekipman",
              "Yedek Parça",
              "Aksesuar",
            ]}
            onSelect={(parentCategory) =>
              setFilters({ ...filters, parentCategory, category: "" })
            }
            onClose={() => setOpenKey(null)}
          />
        )}
      </div>

      {/* Alt Kategori */}
      <div className="relative">
        <button
          onClick={() => toggle("category")}
          className="flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm text-gray-700 bg-gray-50"
          disabled={!filters.parentCategory}
        >
          {filters.category || "Alt Kategori"}
          <ChevronDown size={14} />
        </button>

        {openKey === "category" && (
          <DropdownFilter
            options={
              filters.parentCategory === "Taşıtlar"
                ? ["Motosiklet", "Scooter"]
                : filters.parentCategory === "Ekipman"
                ? [
                    "Ayakkabı & Bot",
                    "Kask",
                    "Mont",
                    "Pantolon",
                    "Sweatshirt",
                    "Tişört",
                    "Tulum",
                    "Yağmurluk",
                    "Eldiven",
                  ]
                : filters.parentCategory === "Yedek Parça"
                ? [
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
                  ]
                : filters.parentCategory === "Aksesuar"
                ? ["Görünüm", "Koruma", "Bakım Ürünleri", "Elektronik Aksesuar"]
                : []
            }
            onSelect={(category) => setFilters({ ...filters, category })}
            onClose={() => setOpenKey(null)}
          />
        )}
      </div>

      {/* Fiyat aralığı */}
      <div className="relative">
        <button
          onClick={() => toggle("price")}
          className="flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm text-gray-700 bg-gray-50"
        >
          {filters.minPrice || filters.maxPrice ? "Fiyat (seçili)" : "Fiyat"}
          <ChevronDown size={14} />
        </button>

        {openKey === "price" && (
          <DropdownFilter
            options={[
              ["0 - 500", { min: 0, max: 500 }],
              ["500 - 1.000", { min: 500, max: 1000 }],
              ["1.000 - 5.000", { min: 1000, max: 5000 }],
              ["5.000 - 10.000", { min: 5000, max: 10000 }],
              ["10.000+", { min: 10000, max: null }],
            ]}
            onSelect={(range) =>
              setFilters({
                ...filters,
                minPrice: range.min?.toString() || "",
                maxPrice: range.max?.toString() || "",
              })
            }
            onClose={() => setOpenKey(null)}
          />
        )}
      </div>

      {/* Sıralama */}
      <div className="relative">
        <button
          onClick={() => toggle("sort")}
          className="flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm text-gray-700 bg-gray-50"
        >
          {(() => {
            const map = {
              newest: "En Yeni",
              oldest: "En Eski",
              priceAsc: "Fiyat Artan",
              priceDesc: "Fiyat Azalan",
            };
            return map[filters.sort] || "Sırala";
          })()}
          <ChevronDown size={14} />
        </button>

        {openKey === "sort" && (
          <DropdownFilter
            options={[
              ["En Yeni", "newest"],
              ["En Eski", "oldest"],
              ["Fiyat Artan", "priceAsc"],
              ["Fiyat Azalan", "priceDesc"],
            ]}
            onSelect={(sort) => setFilters({ ...filters, sort })}
            onClose={() => setOpenKey(null)}
          />
        )}
      </div>
    </div>
  );
}
