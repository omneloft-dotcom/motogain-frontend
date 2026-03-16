import { X } from "lucide-react";

export default function FilterChips({ filters, setFilters }) {
  const chips = [];

  if (filters.city) {
    chips.push({ key: "city", label: filters.city });
  }

  if (filters.category) {
    chips.push({ key: "category", label: filters.category });
  }

  if (filters.minPrice || filters.maxPrice) {
    let label = "";
    if (filters.minPrice)
      label += Number(filters.minPrice).toLocaleString("tr-TR");
    else label += "0";

    label += " - ";

    if (filters.maxPrice) {
      label += Number(filters.maxPrice).toLocaleString("tr-TR");
    } else {
      label += "∞";
    }

    chips.push({ key: "price", label });
  }

  if (filters.sort && filters.sort !== "newest") {
    const sortLabels = {
      newest: "En Yeni",
      oldest: "En Eski",
      priceAsc: "Fiyat Artan",
      priceDesc: "Fiyat Azalan",
    };
    chips.push({ key: "sort", label: sortLabels[filters.sort] });
  }

  const clear = (key) => {
    if (key === "price") {
      setFilters({ ...filters, minPrice: "", maxPrice: "" });
    } else if (key === "sort") {
      setFilters({ ...filters, sort: "newest" });
    } else {
      setFilters({ ...filters, [key]: "" });
    }
  };

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-2 py-2 bg-white border-b">
      {chips.map((chip, i) => (
        <div
          key={i}
          className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full text-sm border"
        >
          {chip.label}
          <button onClick={() => clear(chip.key)}>
            <X size={14} className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>
      ))}
    </div>
  );
}
