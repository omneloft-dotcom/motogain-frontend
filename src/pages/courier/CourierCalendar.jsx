import { useTranslation } from "react-i18next";
import { Smartphone, TrendingUp, Calendar, Clock, Package, Download } from "lucide-react";
import PageShell from "../../components/layout/PageShell";

/**
 * CourierCalendar - Mobile-First Handoff Page
 *
 * Product Decision: Earnings tracking is now mobile-first.
 * Web serves as a clean handoff to direct users to the mobile app.
 *
 * Design Philosophy:
 * - Premium, intentional UI (not an error state)
 * - Clear value proposition for mobile
 * - Smooth onboarding flow
 * - Historical data preservation message
 */

export default function CourierCalendar() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Kazanç Takibi
          </h1>
          <p className="text-text-secondary">
            Detaylı kazanç girişi ve analizi için mobil uygulamayı kullanın
          </p>
        </div>

        {/* Mobile Handoff Card */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Mobil Uygulamada Daha Güçlü
              </h2>
              <p className="text-text-secondary">
                Kazanç takibi özellikleri şimdi mobil uygulamada. Daha hızlı, daha pratik ve offline çalışma desteğiyle günlük kazançlarınızı anında kaydedin.
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Gelir/Gider Takibi</h3>
                <p className="text-xs text-text-muted">Platform bazlı detaylı kayıt</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Takvim Görünümü</h3>
                <p className="text-xs text-text-muted">Aylık kazanç geçmişi</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Çalışma Saati</h3>
                <p className="text-xs text-text-muted">Otomatik ortalama hesaplama</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Teslimat Sayısı</h3>
                <p className="text-xs text-text-muted">Performans istatistikleri</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href="https://cordy.app/download"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Download className="w-5 h-5" />
            Mobil Uygulamayı İndir
          </a>
        </div>

        {/* Alternative Access Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Mobil Uygulamaya Nasıl Geçerim?
          </h3>
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                1
              </span>
              <p>
                <strong className="text-text-primary">Uygulamayı İndirin:</strong> iOS veya Android cihazınıza Cordy mobil uygulamasını yükleyin
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                2
              </span>
              <p>
                <strong className="text-text-primary">Giriş Yapın:</strong> Web'de kullandığınız hesap bilgilerinizle giriş yapın
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                3
              </span>
              <p>
                <strong className="text-text-primary">Kazanç Takibi:</strong> Ana menüden "Kazanç Takibi" bölümüne gidin ve kayıt yapmaya başlayın
              </p>
            </div>
          </div>
        </div>

        {/* Historical Data Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Not:</strong> Mobil uygulamada giriş yaptığınızda, varsa web'deki geçmiş kazanç kayıtlarınız otomatik olarak içe aktarılacaktır.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
