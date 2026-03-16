import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import BannedScreen from "../../pages/error/BannedScreen";
import LegalFooter from "./LegalFooter";

export default function MainLayout() {
  const { user } = useAuth();

  // If user is banned, show ban screen instead of normal layout
  if (user?.isBanned) {
    return <BannedScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 pb-20 md:pb-4 bg-slate-50">
          <Outlet />
        </main>
      </div>

      <LegalFooter />

      <MobileBottomNav />
    </div>
  );
}
