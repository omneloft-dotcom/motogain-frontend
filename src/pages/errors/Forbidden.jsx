import ErrorState from "../../components/common/ErrorState";

/**
 * Forbidden (403) - Dark premium error page
 */
export default function Forbidden() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <ErrorState
        icon="⛔"
        title="Erişim reddedildi"
        message="Bu sayfaya erişim yetkiniz bulunmuyor."
        actionLabel="Ana Sayfaya Dön"
        actionOnClick={() => window.location.href = "/dashboard"}
        secondaryLabel={null}
        secondaryTo={null}
      />
    </div>
  );
}
