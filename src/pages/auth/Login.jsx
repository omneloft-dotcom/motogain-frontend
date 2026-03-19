import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import LegalFooter from "../../components/layout/LegalFooter";

/**
 * Login - Dark premium auth form
 * Smart submit button: green ONLY when form valid
 */
export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const hasInitializedGoogle = useRef(false);
  const hasRenderedButton = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showGoogleSection, setShowGoogleSection] = useState(false);

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

  const handleGoogleResponse = async (response) => {
    setErr("");
    try {
      await googleLogin(response.credential);
      navigate("/dashboard");
    } catch (error) {
      setErr(error.response?.data?.message || "Google ile giriş başarısız");
    }
  };

  useEffect(() => {
    // Use centralized config (production-safe, validated)
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Graceful degradation: hide Google section if not configured
    if (!clientId || clientId.trim() === '' || clientId.includes('your-google-client-id')) {
      setShowGoogleSection(false);
      return;
    }

    // Show section immediately if clientId exists (fixes render deadlock)
    setShowGoogleSection(true);

    let timeoutId = null;

    // Wait for Google Identity Services script to load
    const initGoogle = () => {
      // Guard: prevent duplicate initialization
      if (!window.google?.accounts?.id || hasInitializedGoogle.current) {
        return;
      }

      try {
        hasInitializedGoogle.current = true;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });

        // Delay button render to ensure ref is mounted
        timeoutId = setTimeout(() => {
          if (googleButtonRef.current && !hasRenderedButton.current) {
            try {
              // Clear container before render (handles re-renders safely)
              googleButtonRef.current.innerHTML = '';

              window.google.accounts.id.renderButton(googleButtonRef.current, {
                theme: "outline",
                size: "large",
                text: "continue_with",
                locale: "tr",
              });

              hasRenderedButton.current = true;
            } catch (renderError) {
              // Silent fail - button area will remain empty
            }
          }
        }, 100);
      } catch (error) {
        // Silent fail - section still shows but button won't render
      }
    };

    // Try immediate init, or wait for script load
    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      // Wait for GIS script to load (max 5 seconds)
      const loadTimeout = setTimeout(() => {
        // Keep section visible even if script times out
      }, 5000);
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          clearTimeout(loadTimeout);
          initGoogle();
        }
      }, 100);

      return () => {
        clearInterval(interval);
        clearTimeout(loadTimeout);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [googleLogin, navigate]);

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
              className={`py-2 w-full rounded-lg font-semibold transition-colors ${
                isValid
                  ? "bg-primary text-background hover:bg-highlight"
                  : "bg-border text-text-muted cursor-not-allowed"
              }`}
              disabled={!isValid}
            >
              Giriş Yap
            </button>
          </form>

          {showGoogleSection && (
            <>
              <div className="my-4 flex items-center gap-3">
                <div className="flex-1 h-px bg-border/60"></div>
                <span className="text-xs text-text-muted">VEYA</span>
                <div className="flex-1 h-px bg-border/60"></div>
              </div>

              <div ref={googleButtonRef} className="w-full"></div>
            </>
          )}

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
