import ErrorState from "../../components/common/ErrorState";

/**
 * Unauthorized (401) - Dark premium error page
 */
export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <ErrorState
        icon="🔒"
        title="Giriş gerekli"
        message="Bu sayfayı görüntülemek için giriş yapmanız gerekiyor."
        actionLabel="Giriş Yap"
        actionOnClick={() => window.location.href = "/login"}
        secondaryLabel="Kayıt Ol"
        secondaryTo="/register"
      />
    </div>
  );
}
