import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function AdminProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const allowed = ["admin", "superadmin"].includes(user.role);
  if (!allowed) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
