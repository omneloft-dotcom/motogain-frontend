import { useMemo, useEffect, useCallback } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import newsApi from "../api/newsApi";
import { useAuth } from "../context/AuthProvider";
import Toast from "../components/common/Toast";
import { getErrorMessage } from "../utils/errorHandler";

const MAX_FAVORITE_SOURCES = 10;

// 🛡️ SAFE: Normalize to array (handles string/object/null)
const normalizeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

function ConfirmModal({ open, onCancel, onConfirm, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-slate-900">Hesabı devre dışı bırak</h3>
          <p className="mt-1 text-sm text-slate-600">
            Bu işlem hesabını devre dışı bırakır ve çıkış yapılır. İlanların pasif kalır.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "İşlem yapılıyor..." : "Evet, devre dışı bırak"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { logout, refreshUser, user } = useAuth();

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [emailErrors, setEmailErrors] = useState({});
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [deactivateError, setDeactivateError] = useState("");
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // Favorite news sources state
  const [allSources, setAllSources] = useState([]);
  const [favoriteSources, setFavoriteSources] = useState([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [togglingSourceId, setTogglingSourceId] = useState(null);

  const [toast, setToast] = useState(null);

  const currentEmail = useMemo(() => user?.email || "", [user]);

  // 🛡️ SAFE: Normalize favoriteSources to array
  const favoriteSourcesArr = useMemo(() => normalizeArray(favoriteSources), [favoriteSources]);

  // Load sources and favorites
  useEffect(() => {
    const loadSources = async () => {
      try {
        const [sourcesRes, favoritesRes] = await Promise.all([
          newsApi.getSources(),
          newsApi.getFavoriteSources(),
        ]);
        setAllSources(sourcesRes || []);
        setFavoriteSources(favoritesRes || []);
      } catch (err) {
        setAllSources([]);
        setFavoriteSources([]);
      } finally {
        setSourcesLoading(false);
      }
    };
    loadSources();
  }, []);

  // Toggle favorite source
  const handleToggleFavorite = useCallback(async (sourceId) => {
    setTogglingSourceId(sourceId);
    try {
      const res = await newsApi.toggleFavoriteSource(sourceId);
      setFavoriteSources(res.favorites || []);
      setToast({ type: "success", message: res.message });
    } catch (err) {
      const msg = err?.response?.data?.message || "İşlem başarısız";
      setToast({ type: "error", message: msg });
    } finally {
      setTogglingSourceId(null);
    }
  }, []);

  // Check if source is favorite
  const isFavorite = useCallback((sourceId) => {
    return favoriteSourcesArr.some((f) => f._id === sourceId);
  }, [favoriteSourcesArr]);

  const favoriteCount = favoriteSourcesArr.length;

  const validatePasswordForm = () => {
    const errors = {};
    if (!pwForm.currentPassword) errors.currentPassword = "Mevcut şifre gerekli";
    if (!pwForm.newPassword) errors.newPassword = "Yeni şifre gerekli";
    if (pwForm.newPassword && pwForm.newPassword.length < 6)
      errors.newPassword = "Yeni şifre en az 6 karakter olmalı";
    if (!pwForm.confirm) errors.confirm = "Yeni şifre tekrarı gerekli";
    if (pwForm.newPassword && pwForm.confirm && pwForm.newPassword !== pwForm.confirm) {
      errors.confirm = "Şifreler eşleşmiyor";
    }
    return errors;
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwErrors({});
    setPwSuccess("");

    const validation = validatePasswordForm();
    if (Object.keys(validation).length) {
      setPwErrors(validation);
      return;
    }

    try {
      setPwLoading(true);
      await authApi.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwSuccess("Şifre güncellendi");
      setToast({ type: "success", message: "Şifren başarıyla güncellendi" });
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwErrors({ form: getErrorMessage(err) });
    } finally {
      setPwLoading(false);
    }
  };

  const validateEmailForm = () => {
    const errors = {};
    if (!emailForm.newEmail) errors.newEmail = "Yeni e-posta gerekli";
    if (emailForm.newEmail && !/^\S+@\S+\.\S+$/.test(emailForm.newEmail)) {
      errors.newEmail = "Geçerli bir e-posta girin";
    }
    if (!emailForm.password) errors.password = "Şifre gerekli";
    return errors;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailErrors({});
    setEmailSuccess("");

    const validation = validateEmailForm();
    if (Object.keys(validation).length) {
      setEmailErrors(validation);
      return;
    }

    try {
      setEmailLoading(true);
      const res = await authApi.changeEmail(emailForm.newEmail, emailForm.password);

      if (res?.token) {
        localStorage.setItem("token", res.token);
      }

      setEmailSuccess("E-posta güncellendi");
      setToast({ type: "success", message: "E-posta adresin güncellendi" });
      setEmailForm({ newEmail: "", password: "" });
      await refreshUser();
    } catch (err) {
      setEmailErrors({ form: getErrorMessage(err) });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDeactivateClick = () => {
    setDeactivateError("");
    if (!confirmDeactivate) {
      setDeactivateError("Onay kutusunu işaretleyin");
      return;
    }
    setShowDeactivateModal(true);
  };

  const handleDeactivateConfirm = async () => {
    try {
      setDeactivateLoading(true);
      await authApi.deactivateAccount();
      await logout();
      navigate("/");
    } catch (err) {
      setDeactivateError(getErrorMessage(err));
    } finally {
      setDeactivateLoading(false);
      setShowDeactivateModal(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">Profil Ayarları</h1>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Şifre Değiştir</h2>
          <p className="text-sm text-slate-600">Güvenliğin için mevcut şifreni doğrula.</p>
        </div>
        <form className="space-y-4" onSubmit={handlePwSubmit}>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Mevcut Şifre</label>
            <input
              type="password"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                pwErrors.currentPassword ? "border-red-500" : "border-slate-300"
              }`}
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            />
            {pwErrors.currentPassword && (
              <p className="text-xs text-red-600">{pwErrors.currentPassword}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Yeni Şifre</label>
              <input
                type="password"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  pwErrors.newPassword ? "border-red-500" : "border-slate-300"
                }`}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
              {pwErrors.newPassword && <p className="text-xs text-red-600">{pwErrors.newPassword}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  pwErrors.confirm ? "border-red-500" : "border-slate-300"
                }`}
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              />
              {pwErrors.confirm && <p className="text-xs text-red-600">{pwErrors.confirm}</p>}
            </div>
          </div>
          {pwErrors.form && <p className="text-sm text-red-600">{pwErrors.form}</p>}
          {pwSuccess && <p className="text-sm text-emerald-600">{pwSuccess}</p>}
          <button
            type="submit"
            disabled={pwLoading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {pwLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Email Değiştir</h2>
          <p className="text-sm text-slate-600">
            Mevcut e-posta: <span className="font-semibold text-slate-800">{currentEmail}</span>
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleEmailSubmit}>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Yeni E-posta</label>
            <input
              type="email"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                emailErrors.newEmail ? "border-red-500" : "border-slate-300"
              }`}
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
            />
            {emailErrors.newEmail && <p className="text-xs text-red-600">{emailErrors.newEmail}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Mevcut Şifre</label>
            <input
              type="password"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                emailErrors.password ? "border-red-500" : "border-slate-300"
              }`}
              value={emailForm.password}
              onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
            />
            {emailErrors.password && <p className="text-xs text-red-600">{emailErrors.password}</p>}
          </div>
          {emailErrors.form && <p className="text-sm text-red-600">{emailErrors.form}</p>}
          {emailSuccess && <p className="text-sm text-emerald-600">{emailSuccess}</p>}
          <button
            type="submit"
            disabled={emailLoading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {emailLoading ? "Güncelleniyor..." : "E-postayı Güncelle"}
          </button>
        </form>
      </section>

      {/* Favorite News Sources */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Favori Haber Kaynaklarım</h2>
          <p className="text-sm text-slate-600">
            Favori kaynaklarından gelen haberler öncelikli olarak gösterilir.
          </p>
          <p className="text-sm text-amber-600 mt-1">
            {favoriteCount} / {MAX_FAVORITE_SOURCES} seçildi
          </p>
        </div>

        {sourcesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400"></div>
          </div>
        ) : allSources.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">Henüz haber kaynağı bulunmuyor.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allSources.map((source) => {
              const isSourceFavorite = isFavorite(source._id);
              const isToggling = togglingSourceId === source._id;
              const isMaxReached = favoriteCount >= MAX_FAVORITE_SOURCES && !isSourceFavorite;

              return (
                <button
                  key={source._id}
                  onClick={() => handleToggleFavorite(source._id)}
                  disabled={isToggling || isMaxReached}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    isSourceFavorite
                      ? "bg-amber-50 border-amber-300"
                      : isMaxReached
                      ? "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {/* Star Icon */}
                  <div className={`shrink-0 ${isToggling ? "animate-pulse" : ""}`}>
                    {isSourceFavorite ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-amber-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-slate-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Source Info */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {source.logo ? (
                      <img
                        src={source.logo}
                        alt=""
                        className="w-6 h-6 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {source.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-5">
        <div>
          <h2 className="text-lg font-semibold text-red-700">Hesap Yönetimi</h2>
          <p className="text-sm text-red-600">Hesabını devre dışı bırakmak geri alınamaz.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="deactivateConfirm"
            type="checkbox"
            className="h-4 w-4"
            checked={confirmDeactivate}
            onChange={(e) => setConfirmDeactivate(e.target.checked)}
          />
          <label htmlFor="deactivateConfirm" className="text-sm text-red-700">
            Hesabımı devre dışı bırakmayı onaylıyorum
          </label>
        </div>
        {deactivateError && <p className="text-sm text-red-600">{deactivateError}</p>}
        <button
          type="button"
          disabled={!confirmDeactivate || deactivateLoading}
          onClick={handleDeactivateClick}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deactivateLoading ? "İşlem yapılıyor..." : "Hesabı Devre Dışı Bırak"}
        </button>

        {/* Permanent Account Deletion */}
        <div className="mt-6 pt-6 border-t border-red-300">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            Hesabı Kalıcı Olarak Sil
          </h3>
          <p className="text-xs text-red-700 mb-3">
            Hesabınızı kalıcı olarak silmek istiyorsanız, tüm verileriniz (ilanlar, mesajlar, favoriler)
            silinecektir. Bu işlem geri alınamaz.
          </p>
          <button
            type="button"
            onClick={() => navigate("/delete-account")}
            className="text-sm text-red-700 hover:text-red-900 underline font-medium"
          >
            Hesabımı kalıcı olarak sil →
          </button>
        </div>
      </section>

      <ConfirmModal
        open={showDeactivateModal}
        onCancel={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivateConfirm}
        loading={deactivateLoading}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={2800}
        />
      )}
    </div>
  );
}
