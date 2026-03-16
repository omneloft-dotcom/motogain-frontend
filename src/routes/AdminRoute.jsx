import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

/**
 * AdminRoute - Protects admin-only routes
 * Requires user.role to be 'admin' or 'superadmin'
 * If role mismatch detected, logs out and redirects to login
 */
export default function AdminRoute() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not admin - logout and redirect
  const isAdmin = user.role === "admin" || user.role === "superadmin";
  if (!isAdmin) {
    console.warn("[AdminRoute] ⚠️ Non-admin user attempted admin access. Logging out.", {
      userId: user._id,
      role: user.role
    });

    // Clear auth and redirect
    logout();

    return (
      <Navigate
        to="/login"
        replace
        state={{
          message: "Bu sayfaya erişim yetkiniz yok. Lütfen admin hesabıyla giriş yapın."
        }}
      />
    );
  }

  return <Outlet />;
}
