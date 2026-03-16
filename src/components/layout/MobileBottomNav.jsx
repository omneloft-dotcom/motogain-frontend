import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthProvider";
import { Icon } from "@/ui/icons/Icon";

export default function MobileBottomNav() {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const items = [
    { to: "/dashboard", labelKey: "home.title", icon: "home" },
    { to: "/listings", labelKey: "listings.title", icon: "listings" },
    { to: "/favorites", labelKey: "listings.favorites", icon: "favorites" },
    { to: "/messages", labelKey: "messages.title", icon: "messages" },
    { to: "/profile", labelKey: "profile.title", icon: "profile" },
  ];

  const linkClass = ({ isActive }) =>
    [
      "flex-1 flex flex-col items-center justify-center gap-1 text-xs py-2",
      isActive
        ? "text-indigo-600 font-semibold"
        : "text-slate-500 hover:text-slate-700",
    ].join(" ");

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-200 shadow-[0_-6px_18px_rgba(15,23,42,0.08)] h-14 sm:h-16 px-1 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex h-full items-stretch">
        {items.map(({ to, labelKey, icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon name={icon} size={20} className="h-5 w-5" strokeWidth={1.75} />
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

