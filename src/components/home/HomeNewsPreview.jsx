import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import newsApi from "../../api/newsApi";
import dayjs from "dayjs";

const TagBadge = ({ type }) => {
  const label = type === "sector" ? "Sektör" : "Cordy";
  const color =
    type === "sector"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded border ${color}`}>
      {label}
    </span>
  );
};

export default function HomeNewsPreview() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await newsApi.getNews();
        setItems((res || []).slice(0, 2));
      } catch (err) {
        setItems([]);
      }
    };
    load();
  }, []);

  if (!items.length) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-900">Haber & Güncellemeler</h2>
        <Link to="/news" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Tüm haberleri gör →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <article key={item._id} className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TagBadge type={item.type} />
              <span className="text-xs text-slate-500">
                {dayjs(item.publishedAt).format("DD MMM YYYY")}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h3>
            {(item.source?.name || item.sourceName) && (
              <p className="text-xs text-slate-500 mt-1">
                Kaynak: {item.source?.name || item.sourceName}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}



