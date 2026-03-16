import { NavLink } from "react-router-dom";

export default function SideNavNewsLink() {
  return (
    <NavLink
      to="/news"
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg ${
          isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`
      }
    >
      <span>Haber & Güncellemeler</span>
    </NavLink>
  );
}




