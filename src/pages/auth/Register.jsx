import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import { isSoftLaunch } from "../../utils/isSoftLaunch";
import LegalFooter from "../../components/layout/LegalFooter";

/**
 * Register - Dark premium registration form
 * Smart submit button: green ONLY when form valid
 */
export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [inviteInfo, setInviteInfo] = useState("");
  const [betaAccepted, setBetaAccepted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInviteInfo("");

    if (isSoftLaunch && !betaAccepted) {
      setError("Beta test koşullarını kabul etmelisiniz.");
      return;
    }

    try {
      await authApi.register(form);
      navigate("/login");
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Bir hata oluştu";
      if (status === 403 && msg.includes("Soft launch")) {
        setInviteInfo(msg);
        setError("");
      } else {
        setError(msg);
      }
    }
  };

  const isValid = 
    form.name.trim() && 
    form.email.trim() && 
    form.password.trim() && 
    (!isSoftLaunch || betaAccepted);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border/60 rounded-xl p-6 w-full max-w-sm"
        >
          <h1 className="text-xl font-semibold text-text-primary mb-4">Kayıt Ol</h1>

          {isSoftLaunch && (
            <div className="mb-3 rounded-lg border border-warning/60 bg-card px-3 py-2 text-xs text-text-secondary">
              Bu platform beta aşamasındadır. Geri bildirimleriniz değerlidir.
            </div>
          )}

          {inviteInfo && (
            <div className="mb-3 rounded-lg border border-warning/60 bg-card px-3 py-2 text-xs text-text-secondary">
              {inviteInfo}
            </div>
          )}

          {error && <p className="text-error text-sm mb-3">{String(error)}</p>}

          <div className="mb-3">
            <label className="block text-sm text-text-secondary mb-1">Ad Soyad</label>
            <input
              type="text"
              name="name"
              placeholder="Ad Soyad"
              onChange={handleChange}
              className="bg-background border border-border/60 rounded-lg p-2 w-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm text-text-secondary mb-1">E-posta</label>
            <input
              type="email"
              name="email"
              placeholder="ornek@email.com"
              onChange={handleChange}
              className="bg-background border border-border/60 rounded-lg p-2 w-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-text-secondary mb-1">Şifre</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="bg-background border border-border/60 rounded-lg p-2 w-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          {isSoftLaunch && (
            <label className="flex items-start gap-2 mb-4 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={betaAccepted}
                onChange={(e) => setBetaAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 flex-shrink-0"
              />
              <span>
                Beta test platformu olduğunu, verilerimin test amaçlı işleneceğini
                ve test bitiminde silineceğini anladım.{" "}
                <Link to="/beta-info" className="text-primary hover:text-highlight underline transition-colors">
                  Detaylı bilgi
                </Link>
              </span>
            </label>
          )}

          <button
            type="submit"
            className={`py-2 w-full rounded-lg font-semibold transition-colors ${
              isValid
                ? "bg-primary text-background hover:bg-highlight"
                : "bg-border text-text-muted cursor-not-allowed"
            }`}
            disabled={!isValid}
          >
            Kayıt Ol
          </button>

          <div className="mt-4 text-sm text-center">
            <Link
              to="/login"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Zaten hesabınız var mı? Giriş yapın
            </Link>
          </div>
        </form>
      </div>
      <LegalFooter />
    </div>
  );
}
