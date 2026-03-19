import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthProvider";
import { useSocket } from "../../context/SocketProvider";
import { useEffect, useState } from "react";
import conversationsApi from "../../api/conversationsApi";
import { Icon } from "@/ui/icons/Icon";

const groupsConfig = [
  {
    titleKey: "navigation.general",
    defaultOpen: true,
    items: [
      { label: "home.title", to: "/dashboard" },
      { label: "listings.title", to: "/listings" },
      { label: "announcements.title", to: "/announcements" },
      { label: "news.title", to: "/news" },
    ],
  },
  {
    titleKey: "navigation.myArea",
    defaultOpen: true,
    items: [
      { label: "listings.myListings", to: "/my-listings" },
      { label: "listings.favorites", to: "/favorites" },
      { label: "messages.title", to: "/messages" },
      { label: "courier.title", to: "/courier-calendar" },
    ],
  },
  {
    titleKey: "navigation.community",
    defaultOpen: true,
    items: [
      { label: "club.title", to: "/club" },
    ],
  },
  {
    titleKey: "navigation.account",
    defaultOpen: false,
    items: [
      { label: "profile.personalInfo", to: "/profile" },
      { label: "profile.settings", to: "/profile/settings" },
      { label: "courier.guide", to: "/kurye-rehberi" },
    ],
  },
];

function SidebarGroup({ titleKey, items, isOpen, onToggle, t }) {
  const chevronClasses = `h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`;
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wide text-text-muted font-semibold hover:text-text-secondary transition-colors"
      >
        <span>{t(titleKey)}</span>
        <Icon
          name="chevron"
          size={16}
          className={chevronClasses}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div className="mt-1 space-y-1">
          {items.map((item) =>
            item.disabled ? (
              <div
                key={item.label}
                title={t("common.comingSoon")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-text-muted bg-card/40 cursor-not-allowed border border-border/30"
                aria-disabled="true"
              >
                <span className="flex-1">{t(item.label)}</span>
                <span className="text-[10px] font-semibold uppercase text-text-muted">
                  {t("common.comingSoon")}
                </span>
              </div>
            ) : (
              <NavLink key={item.label} to={item.to} className={navLinkClass}>
                {t(item.label)}
              </NavLink>
            )
          )}
        </div>
      )}
    </div>
  );
}

const navLinkClass = ({ isActive }) =>
  [
    "block px-4 py-2.5 rounded-lg transition-all border-l-2",
    isActive
      ? "bg-card-hover text-text-primary font-semibold border-primary"
      : "text-text-secondary hover:bg-card hover:text-text-primary border-transparent",
  ].join(" ");

export default function Sidebar() {
  const { user, isAdmin } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState(() =>
    (isAdmin
      ? [{ titleKey: "navigation.admin", defaultOpen: true }, ...groupsConfig]
      : groupsConfig
    ).reduce((acc, group) => {
      acc[group.titleKey] = group.defaultOpen;
      return acc;
    }, {})
  );

  useEffect(() => {
    // Only run if user is authenticated
    if (!user) return;

    let interval;
    const load = async () => {
      try {
        await conversationsApi.getConversations();
      } catch (err) {
        if (err.response?.status === 401) {
          console.warn("[Sidebar] 401 error - stopping conversation polling");
          if (interval) clearInterval(interval);
          return;
        }
        console.error("Unread count yüklenemedi:", err);
      }
    };

    load();
    interval = setInterval(load, 20000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handleInboxUpdate = () => {
      console.log("📬 Sidebar: Inbox update received");
    };
    socket.on("inbox_update", handleInboxUpdate);
    return () => {
      socket.off("inbox_update", handleInboxUpdate);
    };
  }, [socket]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Use centralized isAdmin from AuthProvider (production-safe)
  const adminGroups = isAdmin
    ? [
        {
          titleKey: "navigation.admin",
          defaultOpen: true,
          items: [
            { label: "admin.dashboard", to: "/admin/dashboard" },
            { label: "admin.pendingListings", to: "/admin/pending-listings" },
            { label: "admin.listingDetail", to: "/admin/listings" },
            { label: "admin.users", to: "/admin/users" },
            { label: "admin.banManagement", to: "/admin/bans" },
            { label: "admin.reports", to: "/admin/reports" },
            { label: "admin.newsSources", to: "/admin/news-sources" },
            { label: "Haber Yönetimi", to: "/admin/news" },
            { label: "Kampanyalar", to: "/admin/campaigns" },
            { label: "Kampanya Başvuruları", to: "/admin/campaign-leads" },
            { label: "Bildirim Merkezi", to: "/admin/push-broadcast" },
          ],
        },
      ]
    : [];

  if (!user) return null;

  const toggleGroup = (title) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const resolvedOpenGroups =
    isAdmin && openGroups["navigation.admin"] === undefined
      ? { ...openGroups, ["navigation.admin"]: true }
      : openGroups;

  const navigationGroups = isAdmin ? [...adminGroups, ...groupsConfig] : groupsConfig;

  const sidebarContent = (
    <nav className="flex flex-col gap-4">
      {navigationGroups.map((group) => (
        <SidebarGroup
          key={group.titleKey}
          titleKey={group.titleKey}
          items={group.items}
          isOpen={resolvedOpenGroups[group.titleKey]}
          onToggle={() => toggleGroup(group.titleKey)}
          t={t}
        />
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-card text-text-primary p-2 rounded-lg border border-border hover:bg-card-hover transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-card border-r border-border/60 min-h-screen p-4">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 w-64 bg-card border-r border-border h-full p-4 z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
