import { Link } from "react-router-dom";
import LegalFooter from "../../components/layout/LegalFooter";
import { useAuth } from "../../context/AuthProvider";

export default function BetaInfo() {
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
            <h1 className="text-3xl font-bold text-slate-900">CORDY BETA - Test Bilgilendirmesi</h1>
            <p className="text-sm text-slate-500">Son güncelleme: 24 Aralık 2025</p>
          </header>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
            <p className="font-semibold">⚠️ Platform Durumu: Test Aşaması</p>
            <p className="mt-1">
              Cordy şu anda <strong>kapalı beta test</strong> aşamasındadır ve henüz ticari kullanıma açık değildir.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Test Platformu Hakkında</h2>
            <p>
              Cordy şu anda <strong>kapalı beta test</strong> aşamasındadır. Platform henüz ticari
              kullanıma açık değildir ve test amaçlı çalıştırılmaktadır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Veri İşleme</h2>
            <p>Test sürecinde:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Hesap oluşturma için <strong>e-posta adresi</strong> gereklidir</li>
              <li>İlan ve mesajlaşma içerikleri <strong>test verisi</strong> olarak kaydedilir</li>
              <li>Gerçek/hassas kişisel bilgi paylaşmayınız</li>
              <li><strong>Finansal işlem yapılmamaktadır</strong></li>
            </ul>
            <p className="mt-3">
              Test süreci sona erdiğinde tüm veriler silinecek veya anonimleştirilecektir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Kullanım Koşulları</h2>
            <p>Beta testine katılarak:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Platformun test amaçlı olduğunu kabul edersiniz</li>
              <li>Hata ve eksiklikler olabileceğini bilirsiniz</li>
              <li>Geri bildirim sağlamayı taahhüt edersiniz</li>
              <li>Ticari amaçla kullanmayacağınızı onaylarsınız</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Sorumluluk</h2>
            <p>
              <strong>Geliştirici:</strong> Cordy Ekibi<br />
              <strong>İletişim:</strong> beta@cordy.contact
            </p>
            <p className="mt-2">
              Beta test verilerinizle ilgili taleplerinizi yukarıdaki adrese iletebilirsiniz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Gizlilik</h2>
            <p>Verileriniz:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Yalnızca test amaçlı işlenir</li>
              <li>Üçüncü taraflarla paylaşılmaz</li>
              <li>Test bitiminde silinir</li>
              <li>Pazarlama amaçlı kullanılmaz</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Tam Sürüm</h2>
            <p>Platform resmi lansmanı yapıldığında:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Şirket bilgileri eklenecek</li>
              <li>Tam KVKK metinleri yayınlanacak</li>
              <li>Ticari kullanıma açılacak</li>
              <li>Mevcut beta hesapları isteğe bağlı aktarılabilecek</li>
            </ul>
          </section>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}
