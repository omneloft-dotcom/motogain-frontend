import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { Icon } from "@/ui/icons/Icon";

export default function UserDropdown({ user }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const avatarFallback = useMemo(
    () => user?.name?.charAt(0)?.toUpperCase() || "U",
    [user?.name]
  );

  const roleLabel = useMemo(() => {
    if (user?.role === "admin" || user?.role === "superadmin") return "admin";
    return user?.role || "user";
  }, [user?.role]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on outside click or ESC
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!open) return;
      const menuEl = menuRef.current;
      const buttonEl = buttonRef.current;
      if (menuEl?.contains(event.target) || buttonEl?.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const renderAvatar = () => {
    if (user?.photo) {
      return (
        <img
          src={user.photo}
          alt={user.name}
          className="h-9 w-9 rounded-full object-cover border border-slate-200"
        />
      );
    }
    return (
      <div className="h-9 w-9 rounded-full bg-slate-700 text-white flex items-center justify-center text-sm font-semibold">
        {avatarFallback}
      </div>
    );
  };

  const menuItems = [
    { label: "İlanlarım", to: "/my-listings" },
    { label: "Favorilerim", to: "/favorites" },
    { label: "Mesajlar", to: "/messages" },
    { label: "Tekliflerim", to: "/offers" },
    { label: "Profilim", to: "/profile" },
  ];

  const adminItems =
    user?.role === "admin" || user?.role === "superadmin"
      ? [{ label: "Admin Paneli", to: "/admin/dashboard" }]
      : [];

  const baseMenuItemClass =
    "flex items-center justify-between w-full px-3 py-3 text-sm text-slate-800 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm hover:bg-slate-50 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {renderAvatar()}
        <Icon
          name="chevron"
          size={16}
          className={`h-4 w-4 text-slate-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute top-full mt-3 w-[calc(100vw-1.5rem)] sm:w-72 left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 rounded-xl bg-white border border-slate-200 shadow-lg shadow-slate-200/70 py-3 z-40"
        >
          <div className="px-3 pb-3 flex items-center gap-3">
            {renderAvatar()}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.name || "Kullanıcı"}
              </p>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {roleLabel}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200" />

          <div className="px-2 py-2">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={baseMenuItemClass}
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                <span className="text-xs text-slate-400">↗</span>
              </Link>
            ))}

            <div className="my-2 h-px bg-slate-200" />

            <button
              type="button"
              onClick={handleLogout}
              className={`${baseMenuItemClass} text-red-600 hover:bg-red-50`}
            >
              <span>Çıkış Yap</span>
            </button>

            {adminItems.length > 0 && (
              <>
                <div className="my-2 h-px bg-slate-200" />
                {adminItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={baseMenuItemClass}
                    onClick={() => setOpen(false)}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-slate-400">↗</span>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

