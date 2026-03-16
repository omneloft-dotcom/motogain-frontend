import ErrorState from "../../components/common/ErrorState";

/**
 * ServerError (500) - Dark premium error page
 */
export default function ServerError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <ErrorState
        icon="⚠️"
        title="Bir sorun oluştu"
        message="Sunucu hatası. Lütfen daha sonra tekrar deneyin."
        actionLabel="Sayfayı Yenile"
        actionOnClick={() => window.location.reload()}
        secondaryLabel="Ana Sayfaya Dön"
        secondaryTo="/dashboard"
      />
    </div>
  );
}
