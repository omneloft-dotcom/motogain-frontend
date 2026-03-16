import { Link } from "react-router-dom";
import LegalFooter from "../../components/layout/LegalFooter";
import { useAuth } from "../../context/AuthProvider";

export default function Kvkk() {
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
            <h1 className="text-3xl font-bold text-slate-900">KVKK Aydınlatma Metni</h1>
            <p className="text-sm text-slate-500">Son güncelleme: 16 Mart 2026</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">1. Veri Sorumlusu</h2>
            <p>
              Cordy olarak kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu
              ("KVKK") uyarınca koruyor ve işliyoruz. Bu metin, veri sorumlusu olarak yükümlülüklerimiz
              kapsamında sizi bilgilendirmek için hazırlanmıştır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">2. İşlenen Kişisel Veriler</h2>
            <p>
              Platforma üyelik, ilan oluşturma ve iletişim süreçlerinde ad, soyad, e-posta, telefon,
              profil bilgileri, ilan içerikleri, mesajlaşma ve işlem kayıtları ile cihaz/oturum
              verileri işlenebilir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">3. İşleme Amaçları</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Üyelik, kimlik doğrulama ve hesap yönetimi</li>
              <li>İlan yayınlama, içerik güvenliği ve moderasyon</li>
              <li>Mesajlaşma ve kullanıcılar arası iletişimin sağlanması</li>
              <li>Dolandırıcılık ve kötüye kullanımın önlenmesi</li>
              <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">4. Hukuki Sebepler</h2>
            <p>
              Kişisel veriler; sözleşmenin kurulması/ifası, meşru menfaat, hukuki yükümlülüklerin
              yerine getirilmesi ve açık rıza (gerekli hallerde) hukuki sebeplerine dayanarak
              işlenmektedir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">5. Aktarım</h2>
            <p>
              Veriler; yasal gereklilikler veya hizmet sağlayıcı iş ortaklarımızla sınırlı olmak üzere
              KVKK'ya uygun şekilde yurtiçinde paylaşılabilir. Yurt dışına aktarım yapılması halinde
              gerekli hukuki izinler ve koruma tedbirleri uygulanır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">6. Saklama Süresi</h2>
            <p>
              Kişisel veriler, ilgili mevzuatta öngörülen veya işleme amacına uygun makul süre boyunca
              saklanır; süre dolduğunda silinir, yok edilir veya anonimleştirilir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">7. Haklarınız</h2>
            <p>
              KVKK uyarınca; verilerinize erişme, düzeltme, silme, işlemeyi kısıtlama, itiraz etme ve
              açık rızayı geri çekme haklarına sahipsiniz. Başvurularınızı yazılı veya kayıtlı
              elektronik iletişim kanallarından Cordy'ye iletebilirsiniz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">8. İletişim</h2>
            <p>
              KVKK kapsamındaki talepleriniz ve sorularınız için Cordy destek kanallarından bize
              ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}

