import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block px-4 py-2 rounded-lg ${
    isActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"
  }`;

export default function AdminSidebar() {
  return (
    <aside className="w-64 border-r bg-white p-4 space-y-2">
      <NavLink to="/admin/dashboard" className={linkClass}>
        Admin Dashboard
      </NavLink>

      <NavLink to="/admin/listings/pending" className={linkClass}>
        Onay Bekleyen İlanlar
      </NavLink>

      <NavLink to="/admin/users" className={linkClass}>
        Kullanıcılar
      </NavLink>

      <NavLink to="/admin/news-sources" className={linkClass}>
        Haber Kaynakları
      </NavLink>

      <NavLink to="/admin/news" className={linkClass}>
        Haber Yönetimi
      </NavLink>

      <NavLink to="/admin/campaigns" className={linkClass}>
        Kampanyalar
      </NavLink>

      <NavLink to="/admin/campaign-leads" className={linkClass}>
        Kampanya Başvuruları
      </NavLink>

      <NavLink to="/admin/push-broadcast" className={linkClass}>
        Bildirim Merkezi
      </NavLink>

      <NavLink to="/admin/bans" className={linkClass}>
        Yasaklılar
      </NavLink>

      <NavLink to="/admin/reports" className={linkClass}>
        Raporlar
      </NavLink>
    </aside>
  );
}
