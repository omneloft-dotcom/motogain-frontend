import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthProvider";
import useNotificationCenter from "../../hooks/useNotificationCenter";
import {
  resolveInAppBody,
  resolveNotificationTargetPath,
} from "../../utils/notificationCenter";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString("tr-TR");
};

const resolveTypeLabel = (type, t) => {
  const normalizedType = String(type || "").trim().toLowerCase();
  return t(`notificationsCenter.typeLabels.${normalizedType}`, {
    defaultValue: t("notificationsCenter.typeLabels.default"),
  });
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    items,
    unreadCount,
    loading,
    refreshing,
    markingAll,
    refresh,
    markOneAsRead,
    markAllAsRead,
  } = useNotificationCenter({ limit: 100, enabled: !!user });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Bildirim Merkezi</h1>
          <p className="text-sm text-slate-600 mt-1">Push kacirilsan bile tum bildirimlerin burada kalir.</p>
          <p className="text-xs text-slate-500 mt-1">Okunmamis: {unreadCount}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refresh({ silent: true })}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
            disabled={refreshing}
          >
            {refreshing ? "Yenileniyor..." : "Yenile"}
          </button>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
            disabled={markingAll || unreadCount === 0}
          >
            {markingAll ? "Isleniyor..." : "Tumunu okundu yap"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-slate-500">Yukleniyor...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-slate-500">
            <p className="font-medium text-slate-700">Henuz bildirim yok.</p>
            <p className="text-xs mt-1">Yeni aktiviteler oldugunda burada listelenecek.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => {
              const route = resolveNotificationTargetPath(item);
              const rowClass = item.isRead
                ? "p-4 bg-white"
                : "p-4 bg-emerald-50/40";

              return (
                <li key={item._id} className={rowClass}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs tracking-wide text-slate-500">{resolveTypeLabel(item.type, t)}</p>
                      <h3 className="font-semibold text-slate-900 mt-1 truncate">{item.title}</h3>
                      <p className="text-sm text-slate-700 mt-1 line-clamp-2 break-words">{resolveInAppBody(item)}</p>
                      <p className="text-xs text-slate-500 mt-2">{formatDate(item.createdAt)}</p>
                    </div>

                    <div className="flex gap-2">
                      {!item.isRead && (
                        <button
                          onClick={() => markOneAsRead(item._id)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                          Okundu
                        </button>
                      )}
                      <Link
                        to={route}
                        onClick={() => !item.isRead && markOneAsRead(item._id)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Ac
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
