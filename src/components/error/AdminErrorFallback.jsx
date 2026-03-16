/**
 * AdminErrorFallback - Error UI specifically for admin panel
 * Shows admin-specific guidance and actions
 */
export default function AdminErrorFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Admin Panelinde Hata
        </h1>
        <p className="text-slate-600 mb-6">
          Admin panelinde beklenmedik bir hata oluştu. Bu sorunu teknik ekip ile
          paylaşabilirsiniz.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            Ne Yapmalısınız?
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Sayfayı yenilemeyi deneyin</li>
            <li>Hata devam ederse farklı bir tarayıcı kullanın</li>
            <li>Konsol hatalarını (F12) kontrol edin</li>
            <li>Gerekirse admin panelinden çıkış yapıp tekrar girin</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Sayfayı Yenile
          </button>
          <button
            onClick={() => (window.location.href = "/admin/reports")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Admin Anasayfaya Dön
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-slate-200 text-slate-900 px-6 py-3 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Kullanıcı Anasayfası
          </button>
        </div>
      </div>
    </div>
  );
}
