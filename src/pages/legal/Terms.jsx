import { Link } from "react-router-dom";
import LegalFooter from "../../components/layout/LegalFooter";
import { useAuth } from "../../context/AuthProvider";

export default function Terms() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 text-slate-800">
          <div className="mb-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              ← Ana Sayfa
            </Link>
          </div>
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Kullanım Şartları</h1>
            <p className="text-sm text-slate-500">Son güncelleme: 16 Mart 2026</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">1. Amaç ve Kapsam</h2>
            <p>
              Bu şartlar, Cordy platformunun kullanımına ilişkin kuralları belirler. Platformu
              kullanan herkes bu şartları kabul etmiş sayılır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">2. Hesap ve Güvenlik</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Hesap bilgilerinizi doğru ve güncel tutmanız gerekir.</li>
              <li>Hesap güvenliğinizden siz sorumlusunuz; yetkisiz erişim durumunda derhal bildiriniz.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">3. İlan ve İçerik Kuralları</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Yasalara aykırı, yanıltıcı veya üçüncü kişilerin haklarını ihlal eden içerikler yasaktır.</li>
              <li>İlanlarınızın doğruluğundan ve güncelliğinden siz sorumlusunuz.</li>
              <li>Moderasyon, güvenlik veya kalite amaçlarıyla ilanlar incelenebilir, askıya alınabilir veya kaldırılabilir.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">4. Mesajlaşma ve Etkileşim</h2>
            <p>
              Mesajlaşma yalnızca ilan sahipleri ve alıcılar arasındadır. Spam, taciz veya ticari olmayan
              amaçlı kullanım yasaktır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">5. Sorumluluk Reddi</h2>
            <p>
              Cordy, kullanıcılar arasındaki işlemlerin tarafı değildir; ilan içerikleri ve işlemlerden
              kullanıcılar sorumludur. Hizmet kesintileri veya içerik hatalarından doğan dolaylı
              zararlardan Cordy sorumlu değildir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">6. Fesih</h2>
            <p>
              Kullanım şartlarına aykırı davranışlar tespit edildiğinde hesaplar uyarılabilir,
              geçici olarak kısıtlanabilir veya kapatılabilir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">7. Değişiklikler</h2>
            <p>
              Cordy, kullanım şartlarını güncelleyebilir. Güncellemeler yayınlandığı tarihten itibaren
              geçerlidir; platformu kullanmaya devam etmeniz güncellemeleri kabul ettiğiniz anlamına gelir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">8. İletişim</h2>
            <p>Sorularınız için Cordy destek kanallarından bizimle iletişime geçebilirsiniz.</p>
          </section>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}

