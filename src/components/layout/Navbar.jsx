import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import UserDropdown from "./UserDropdown";
import { isSoftLaunch } from "../../utils/isSoftLaunch";
import cordyIcon from "../../assets/branding/cordy-icon.svg";
import { Bell, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import useNotificationCenter from "../../hooks/useNotificationCenter";
import {
  resolveInAppBody,
  resolveNotificationTargetPath,
} from "../../utils/notificationCenter";
import { useTranslation } from "react-i18next";

const resolveTypeLabel = (type, t) => {
  const normalizedType = String(type || "").trim().toLowerCase();
  return t(`notificationsCenter.typeLabels.${normalizedType}`, {
    defaultValue: t("notificationsCenter.typeLabels.default"),
  });
};

export default function Navbar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    items,
    unreadCount,
    refresh,
    markOneAsRead,
  } = useNotificationCenter({
    limit: 6,
    enabled: !!user,
  });

  useEffect(() => {
    if (open) {
      refresh({ silent: true });
    }
  }, [open, refresh]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const previewItems = useMemo(() => items.slice(0, 5), [items]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-900 hover:opacity-80 transition-opacity">
          <img src={cordyIcon} alt="Cordy" className="w-6 h-6" />
          <span className="font-semibold text-lg tracking-tight">Cordy</span>
        </Link>

        <nav className="flex items-center gap-4">
          {isSoftLaunch && (
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              BETA
            </span>
          )}
          {!user && (
            <Link
              to="/login"
              className="text-sm text-slate-700 hover:text-slate-900"
            >
              Giriş
            </Link>
          )}

          {user && (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Bildirimler"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Bildirimler</p>
                      <Link to="/notifications" className="text-xs text-emerald-700 hover:text-emerald-800" onClick={() => setOpen(false)}>
                        Tumunu gor
                      </Link>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {previewItems.length === 0 ? (
                        <div className="p-4 text-sm text-slate-500">Yeni bildirim yok.</div>
                      ) : (
                        previewItems.map((item) => {
                          const target = resolveNotificationTargetPath(item);

                          return (
                            <Link
                              key={item._id}
                              to={target}
                              onClick={() => {
                                if (!item?.isRead) {
                                  markOneAsRead(item?._id);
                                }
                                setOpen(false);
                              }}
                              className={`block px-3 py-2 border-b border-slate-100 hover:bg-slate-50 ${item.isRead ? "bg-white" : "bg-emerald-50/50"}`}
                            >
                              <p className="text-xs text-slate-500">{resolveTypeLabel(item.type, t)}</p>
                              <p className="text-sm font-medium text-slate-900 mt-0.5">{item.title}</p>
                              <p className="text-xs text-slate-600 line-clamp-2 break-words">{resolveInAppBody(item)}</p>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/messages"
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Mesajlar"
              >
                <MessageSquare size={20} />
              </Link>

              <UserDropdown user={user} />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
