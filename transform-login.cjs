const fs = require('fs');

const content = `import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import LegalFooter from "../../components/layout/LegalFooter";

/**
 * Login - Dark premium auth form
 * Smart submit button: green ONLY when form valid
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setErr("E-posta veya şifre hatalı");
    }
  };

  const isValid = email.trim() && password.trim();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-card border border-border/60 rounded-xl p-6 w-full max-w-sm">
          <h1 className="text-xl font-semibold text-text-primary mb-4">Giriş Yap</h1>

          {err && <p className="text-error text-sm mb-3">{err}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1">E-posta</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                type="email"
                className="bg-background border border-border/60 rounded-lg p-2 w-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">Şifre</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                className="bg-background border border-border/60 rounded-lg p-2 w-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            <button
              type="submit"
              className={\`py-2 w-full rounded-lg font-semibold transition-colors \${
                isValid
                  ? "bg-primary text-background hover:bg-highlight"
                  : "bg-border text-text-muted cursor-not-allowed"
              }\`}
              disabled={!isValid}
            >
              Giriş Yap
            </button>
          </form>

          <div className="mt-4 text-sm flex flex-col gap-2">
            <Link
              to="/forgot-password"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Şifremi Unuttum?
            </Link>
            <Link
              to="/register"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Hesabınız yok mu? Kayıt olun
            </Link>
          </div>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}
`;

fs.writeFileSync('./src/pages/auth/Login.jsx', content, 'utf8');
console.log('✅ Login form transformed to dark premium design');
