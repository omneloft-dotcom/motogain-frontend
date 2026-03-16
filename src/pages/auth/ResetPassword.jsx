import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import authApi from "../../api/authApi";
import { getErrorMessage } from "../../utils/errorHandler";
import LegalFooter from "../../components/layout/LegalFooter";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.newPassword) errs.newPassword = "Yeni şifre gerekli";
    if (form.newPassword && form.newPassword.length < 6)
      errs.newPassword = "Şifre en az 6 karakter olmalı";
    if (!form.confirm) errs.confirm = "Şifre tekrarı gerekli";
    if (form.newPassword && form.confirm && form.newPassword !== form.confirm) {
      errs.confirm = "Şifreler eşleşmiyor";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword(token, form.newPassword);
      setMessage("Şifre güncellendi. Giriş yapabilirsiniz.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold mb-3 text-slate-900">
            Şifre Sıfırla
          </h1>
          {message && (
            <div className="text-sm text-emerald-700 bg-emerald-50 p-2 rounded mb-3">
              {message}
            </div>
          )}
          {errors.form && (
            <div className="text-sm text-red-700 bg-red-50 p-2 rounded mb-3">
              {errors.form}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                placeholder="Yeni şifre"
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.newPassword ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-600">{errors.newPassword}</p>
              )}
            </div>
            <div className="space-y-1">
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Yeni şifre (tekrar)"
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.confirm ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errors.confirm && (
                <p className="text-xs text-red-600">{errors.confirm}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-slate-900 text-white py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
          <div className="mt-4 text-sm text-slate-600 flex justify-between">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700">
              Giriş ekranına dön
            </Link>
          </div>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}
