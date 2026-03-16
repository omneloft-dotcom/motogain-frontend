import { Link } from "react-router-dom";
import LegalFooter from "../../components/layout/LegalFooter";
import { useAuth } from "../../context/AuthProvider";

export default function Privacy() {
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
            <h1 className="text-3xl font-bold text-slate-900">Gizlilik Politikası</h1>
            <p className="text-sm text-slate-500">Son güncelleme: 16 Mart 2026</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Toplanan Veriler</h2>
            <p>Cordy platformunu kullanırken aşağıdaki bilgileriniz işlenir:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Hesap Bilgileri:</strong> Ad, e-posta adresi, şifre (şifrelenmiş)</li>
              <li><strong>Profil Bilgileri:</strong> Telefon numarası, konum (şehir), profil fotoğrafı</li>
              <li><strong>İlan Verileri:</strong> Oluşturduğunuz ilanların başlık, açıklama, fiyat, kategori, fotoğrafları</li>
              <li><strong>Mesajlaşma:</strong> Diğer kullanıcılarla yaptığınız konuşmalar</li>
              <li><strong>Favoriler:</strong> Favori olarak işaretlediğiniz ilanlar</li>
              <li><strong>Konum Bilgisi:</strong> Hava durumu özelliği için yaklaşık konum (izninizle)</li>
              <li><strong>Cihaz ve Kullanım Verileri:</strong> Cihaz tipi, işletim sistemi, uygulama kullanım istatistikleri</li>
              <li><strong>Bildirim Tokenleri:</strong> Push bildirimleri için cihaz tanımlayıcıları</li>
              <li><strong>Log ve Hata Verileri:</strong> Uygulama çökme raporları, hata ayıklama logları (anonim)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Verilerin Kullanım Amaçları</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Hesap oluşturma ve kimlik doğrulama</li>
              <li>İlan yayınlama ve görüntüleme hizmeti</li>
              <li>Kullanıcılar arası mesajlaşma</li>
              <li>Hava durumu ve konum tabanlı özellikler</li>
              <li>Bildirim gönderimi (yeni mesaj, favori ilan güncellemeleri)</li>
              <li>Platform güvenliği ve spam önleme</li>
              <li>Hata tespiti ve performans iyileştirme</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Veri Paylaşımı</h2>
            <p>Verileriniz yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşılır:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Hizmet Sağlayıcılar:</strong> Bulut depolama (Cloudinary), veritabanı, push bildirimi servisleri</li>
              <li><strong>Yasal Zorunluluklar:</strong> Mahkeme kararı veya yasal talep durumunda</li>
              <li>Verileriniz pazarlama amaçlı üçüncü taraflara satılmaz veya kiralanmaz</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Veri Saklama Süresi</h2>
            <p>
              Verileriniz hesabınız aktif olduğu sürece saklanır. Hesabınızı kalıcı olarak sildiğinizde:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Kullanıcı kaydınız, ilanlarınız, mesajlarınız, favorileriniz silinir</li>
              <li>Profil fotoğraflarınız ve ilan görselleri bulut depolamadan kaldırılır</li>
              <li>Bazı log kayıtları yasal saklama yükümlülüğü nedeniyle 30 gün tutulabilir</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Güvenlik</h2>
            <p>
              Verileriniz şifreli bağlantı (HTTPS) üzerinden iletilir ve güvenli sunucularda saklanır.
              Şifreler bcrypt ile hashlenerek korunur. Tüm sistemlerimiz düzenli güvenlik güncellemeleriyle korunur.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Çerezler</h2>
            <p>
              Platform, oturum yönetimi ve temel işlevsellik için gerekli çerezler kullanır.
              Reklam veya izleme çerezi kullanılmamaktadır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Hesap Silme</h2>
            <p>
              Hesabınızı ve tüm verilerinizi kalıcı olarak silmek için:{" "}
              <Link to="/delete-account" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
                Hesap Silme Sayfası
              </Link>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Haklarınız (KVKK Uyarınca)</h2>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Silme veya yok edilmesini talep etme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonuç doğması halinde itiraz etme</li>
            </ul>
            <p className="mt-2">
              Taleplerinizi <a href="mailto:support@usecordy.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">support@usecordy.com</a> adresine iletebilirsiniz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">İletişim</h2>
            <p>
              <strong>Veri Sorumlusu:</strong> Cordy
            </p>
            <p>
              <strong>Destek:</strong> <a href="mailto:support@usecordy.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">support@usecordy.com</a>
            </p>
            <p>
              <strong>Genel:</strong> <a href="mailto:info@usecordy.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">info@usecordy.com</a>
            </p>
          </section>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}
