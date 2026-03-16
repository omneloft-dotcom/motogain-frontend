import { useState } from "react";
import { Link } from "react-router-dom";
import authApi from "../../api/authApi";
import LegalFooter from "../../components/layout/LegalFooter";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("E-posta zorunlu");
      return;
    }
    try {
      setLoading(true);
      await authApi.forgotPassword(email.trim());
      setMessage("Eğer bu e-posta kayıtlıysa, sıfırlama talimatı gönderildi.");
    } catch (err) {
      // abuse-safe: generic response
      setMessage("Eğer bu e-posta kayıtlıysa, sıfırlama talimatı gönderildi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold mb-3 text-slate-900">Şifremi Unuttum</h1>
          <p className="text-sm text-slate-600 mb-4">
            Eğer bu e-posta kayıtlıysa, sıfırlama talimatı göndereceğiz.
          </p>
          {message && <div className="text-sm text-emerald-700 bg-emerald-50 p-2 rounded mb-3">{message}</div>}
          {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded mb-3">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta"
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-slate-900 text-white py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Gönderiliyor..." : "Gönder"}
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

