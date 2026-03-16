import { useEffect, useState } from "react";
import announcementsApi from "../api/announcementsApi";
import notificationsApi from "../api/notificationsApi";
import PageShell from "../components/layout/PageShell";
import { resolveInAppBody } from "../utils/notificationCenter";

const typeLabels = {
  INCENTIVE: "Teşvik",
  DISCOUNT: "İndirim",
  ANNOUNCEMENT: "Duyuru",
  PARTNER: "Partner",
  WARNING: "Uyarı",
};

const typeColors = {
  INCENTIVE: "bg-emerald-100 text-emerald-700",
  DISCOUNT: "bg-blue-100 text-blue-700",
  ANNOUNCEMENT: "bg-slate-100 text-slate-700",
  PARTNER: "bg-indigo-100 text-indigo-700",
  WARNING: "bg-amber-100 text-amber-800",
};

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [legacyRes, feedRes] = await Promise.allSettled([
          announcementsApi.list(),
          notificationsApi.getFeed(100),
        ]);

        const legacyItems = legacyRes.status === "fulfilled" ? legacyRes.value || [] : [];
        const feed = feedRes.status === "fulfilled" ? feedRes.value || [] : [];

        const notificationAnnouncements = feed
          .filter((item) => item?.type === "admin_announcement" || item?.deeplink === "announcements" || item?.metadata?.deeplink === "announcements")
          .map((item) => ({
            _id: `notif-${item._id}`,
            type: "ANNOUNCEMENT",
            title: item?.title || "Duyuru",
            description: resolveInAppBody(item),
            isPinned: false,
            startDate: item?.createdAt || null,
            endDate: null,
            createdAt: item?.createdAt || null,
          }));

        const deduped = [];
        const seen = new Set();

        [...notificationAnnouncements, ...legacyItems].forEach((item) => {
          const key = [item?.title, item?.description, item?.createdAt || item?.startDate].join("::");
          if (seen.has(key)) return;
          seen.add(key);
          deduped.push(item);
        });

        const merged = deduped.sort((a, b) => {
          const da = new Date(a?.createdAt || a?.startDate || 0).getTime();
          const db = new Date(b?.createdAt || b?.startDate || 0).getTime();
          return db - da;
        });

        setItems(merged);
      } catch (err) {
        setError("Duyurular alınamadı");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <PageShell
        title="Duyurular"
        description="Güncel bilgilere buradan ulaşabilirsiniz."
        intent="content"
      >
        <div className="max-w-4xl space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
              <div className="h-4 w-24 bg-card-hover rounded mb-2" />
              <div className="h-6 w-3/4 bg-card-hover rounded mb-3" />
              <div className="h-4 w-full bg-card-hover rounded" />
            </div>
          ))}
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Duyurular" intent="content">
        <p className="text-error">{error}</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Duyurular"
      description="Güncel bilgilere buradan ulaşabilirsiniz."
      intent="content"
    >
      {items.length === 0 ? (
        <div className="max-w-4xl rounded-xl border border-dashed border-border bg-card p-6 text-text-muted">
          Şu anda aktif duyuru bulunmuyor.
        </div>
      ) : (
        <div className="max-w-4xl space-y-3">
          {items.map((item) => (
            <button
              key={item._id}
              onClick={() => setSelected(item)}
              className={`w-full text-left rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card-hover/60 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                item.isPinned ? "ring-2 ring-primary/30" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${typeColors[item.type] || "bg-card-hover text-text-primary"
                      }`}
                  >
                    {typeLabels[item.type] || item.type}
                  </span>
                  <h3 className="text-lg font-semibold text-text-primary truncate">{item.title}</h3>
                </div>
                {item.isPinned && (
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    Sabit
                  </span>
                )}
              </div>
              {item.description && (
                <p className="mt-3 text-sm text-text-secondary whitespace-pre-line line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="mt-4 pt-3 border-t border-border/60 text-xs text-text-muted flex flex-wrap gap-3">
                {item.startDate && (
                  <span>Başlangıç: {new Date(item.startDate).toLocaleDateString()}</span>
                )}
                {item.endDate && (
                  <span>Bitiş: {new Date(item.endDate).toLocaleDateString()}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[1px] flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full md:max-w-2xl bg-slate-900 border border-slate-700 rounded-t-2xl md:rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Duyuru Detayı</span>
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-700 text-slate-100 hover:bg-slate-600"
              >
                Kapat
              </button>
            </div>

            <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white">{selected.title}</h3>
              <p className="mt-3 text-sm text-slate-200 whitespace-pre-line leading-6">
                {selected.description || "İçerik bulunamadı."}
              </p>

              <div className="mt-5 pt-4 border-t border-slate-700 text-xs text-slate-400 flex flex-wrap gap-4">
                {selected.startDate && (
                  <span>Başlangıç: {new Date(selected.startDate).toLocaleString("tr-TR")}</span>
                )}
                {selected.endDate && (
                  <span>Bitiş: {new Date(selected.endDate).toLocaleString("tr-TR")}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

