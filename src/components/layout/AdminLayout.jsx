import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AdminSidebar from "./AdminSidebar";
import LegalFooter from "./LegalFooter";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <LegalFooter />
    </div>
  );
}
