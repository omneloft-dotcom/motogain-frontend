import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import { useAuth } from "../../context/AuthProvider";

/**
 * Delete Account Page
 * Google Play Policy Compliance: Publicly accessible account deletion
 *
 * Features:
 * - Accessible without login (users can login here)
 * - Password confirmation required
 * - Clear warning about permanent deletion
 * - Cascade deletion info
 */
export default function DeleteAccount() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [step, setStep] = useState(user ? "confirm" : "login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Login step state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Confirm step state
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });

      if (response.success) {
        // Store token temporarily for deletion
        localStorage.setItem("token", response.data.accessToken);
        setStep("confirm");
      } else {
        setError(response.error?.message || "Giriş başarısız");
      }
    } catch (err) {
      setError("Giriş sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (confirmText !== "SİL") {
      setError("Lütfen 'SİL' yazarak onaylayın");
      return;
    }

    if (!confirmPassword) {
      setError("Lütfen şifrenizi girin");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.deleteAccount(confirmPassword);

      if (response.success) {
        setSuccess(true);

        // Clear all auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // If logged in via context, logout
        if (logout) {
          logout();
        }

        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        setError(response.error?.message || "Hesap silinemedi");
      }
    } catch (err) {
      setError("Hesap silme sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Hesabınız Silindi
          </h2>
          <p className="text-gray-600 mb-6">
            Hesabınız ve tüm verileriniz kalıcı olarak silindi.
            Ana sayfaya yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hesap Silme
          </h1>
          <p className="text-gray-600">
            Hesabınızı kalıcı olarak silmek için aşağıdaki adımları takip edin.
          </p>
        </div>

        {/* Warning Box */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Dikkat: Bu işlem geri alınamaz!
              </h3>
              <div className="text-sm text-red-700">
                <p className="mb-2">Hesabınız silindiğinde:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tüm ilanlarınız silinecek</li>
                  <li>Tüm mesajlarınız silinecek</li>
                  <li>Favori ilanlarınız silinecek</li>
                  <li>Profil bilgileriniz silinecek</li>
                  <li>Bu işlem geri alınamaz</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Login (if not logged in) */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Adım 1: Giriş Yapın
              </h2>
              <p className="text-gray-600 mb-4">
                Hesabınızı silmek için önce giriş yapmanız gerekiyor.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap ve Devam Et"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Ana sayfaya dön
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Confirm deletion */}
        {step === "confirm" && (
          <form onSubmit={handleDelete} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Adım 2: Silme İşlemini Onaylayın
              </h2>
              {user && (
                <p className="text-gray-600 mb-4">
                  <strong>{user.email}</strong> hesabını silmek üzeresiniz.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifrenizi Girin
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={loading}
                placeholder="Mevcut şifreniz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Onay için "SİL" yazın
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={loading}
                placeholder="SİL"
              />
              <p className="text-xs text-gray-500 mt-1">
                Onaylamak için yukarıdaki kutuya "SİL" yazın (büyük harflerle)
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"
                disabled={loading}
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Siliniyor..." : "Hesabı Kalıcı Olarak Sil"}
              </button>
            </div>
          </form>
        )}

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Hesabınızı silme konusunda yardıma mı ihtiyacınız var?{" "}
            <a
              href="mailto:support@usecordy.com"
              className="text-red-600 hover:text-red-700"
            >
              Destek ekibimizle iletişime geçin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
