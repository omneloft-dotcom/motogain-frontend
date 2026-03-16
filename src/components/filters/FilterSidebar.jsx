import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FilterSidebar({ filters, setFilters }) {
  const [open, setOpen] = useState({
    city: true,
    parentCategory: true,
    category: true,
    price: true,
  });

  // güvenli tanımlar
  const cities = filters.cities || [];
  const parentCategories = filters.parentCategories || [];
  const categories = filters.categories || [];
  const prices = filters.prices || [];

  const toggleList = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleMulti = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key] || [];
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter((v) => v !== value) };
      } else {
        return { ...prev, [key]: [...arr, value] };
      }
    });
  };

  return (
    <div className="w-64 border-r p-4 bg-white min-h-screen overflow-y-auto sticky top-0">
      <h2 className="font-semibold text-lg mb-4">Filtreler</h2>

      {/* Şehir */}
      <div className="mb-4">
        <button
          onClick={() => toggleList("city")}
          className="flex justify-between w-full text-left font-medium"
        >
          Şehir{" "}
          {open.city ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {open.city && (
          <div className="mt-2 flex flex-col gap-2">
            {["İstanbul", "Ankara", "İzmir", "Bursa", "Samsun"].map((city) => (
              <div
                key={city}
                onClick={() => toggleMulti("cities", city)}
                className={`px-3 py-2 rounded cursor-pointer border ${
                  cities.includes(city)
                    ? "bg-gray-200 border-gray-400"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {city}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ana Kategori */}
      <div className="mb-4">
        <button
          onClick={() => toggleList("parentCategory")}
          className="flex justify-between w-full text-left font-medium"
        >
          Ana Kategori{" "}
          {open.parentCategory ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {open.parentCategory && (
          <div className="mt-2 flex flex-col gap-2">
            {["Taşıtlar", "Ekipman", "Yedek Parça", "Aksesuar"].map((cat) => (
              <div
                key={cat}
                onClick={() => toggleMulti("parentCategories", cat)}
                className={`px-3 py-2 rounded cursor-pointer border ${
                  parentCategories.includes(cat)
                    ? "bg-gray-200 border-gray-400"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {cat}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alt Kategori */}
      <div className="mb-4">
        <button
          onClick={() => toggleList("category")}
          className="flex justify-between w-full text-left font-medium"
          disabled={parentCategories.length === 0}
        >
          Alt Kategori{" "}
          {open.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {open.category && (
          <div className="mt-2 flex flex-col gap-2">
            {[
              { group: "Taşıtlar", items: ["Motosiklet", "Scooter"] },
              {
                group: "Ekipman",
                items: [
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
              },
              {
                group: "Yedek Parça",
                items: [
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
              },
              {
                group: "Aksesuar",
                items: ["Görünüm", "Koruma", "Bakım Ürünleri", "Elektronik Aksesuar"],
              },
            ]
              .filter((g) => parentCategories.length === 0 || parentCategories.includes(g.group))
              .flatMap((g) => g.items)
              .map((cat) => (
                <div
                  key={cat}
                  onClick={() => toggleMulti("categories", cat)}
                  className={`px-3 py-2 rounded cursor-pointer border ${
                    categories.includes(cat)
                      ? "bg-gray-200 border-gray-400"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Fiyat */}
      <div className="mb-4">
        <button
          onClick={() => toggleList("price")}
          className="flex justify-between w-full text-left font-medium"
        >
          Fiyat{" "}
          {open.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {open.price && (
          <div className="mt-2 flex flex-col gap-2">
            {[
              "0 - 500",
              "500 - 1000",
              "1000 - 5000",
              "5000 - 10000",
              "10000+",
            ].map((p) => (
              <div
                key={p}
                onClick={() => toggleMulti("prices", p)}
                className={`px-3 py-2 rounded cursor-pointer border ${
                  prices.includes(p)
                    ? "bg-gray-200 border-gray-400"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {p}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
