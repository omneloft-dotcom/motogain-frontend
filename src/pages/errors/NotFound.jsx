import ErrorState from "../../components/common/ErrorState";

/**
 * NotFound (404) - Dark premium error page
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <ErrorState
        icon="🔍"
        title="Sayfa bulunamadı"
        message="Aradığınız sayfa mevcut değil veya taşınmış olabilir."
        actionLabel="Ana Sayfaya Dön"
        actionOnClick={() => window.location.href = "/dashboard"}
        secondaryLabel="İlanları Keşfet"
        secondaryTo="/listings"
      />
    </div>
  );
}
