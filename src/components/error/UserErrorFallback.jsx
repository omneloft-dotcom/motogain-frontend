/**
 * UserErrorFallback - Error UI for regular users
 * Shows user-friendly guidance without technical jargon
 */
export default function UserErrorFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-6">😕</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Bir Şeyler Ters Gitti
        </h1>
        <p className="text-slate-600 mb-6">
          Üzgünüz, bir sorun oluştu. Genellikle sayfayı yenilemek sorunu çözer.
          Sorun devam ederse lütfen daha sonra tekrar deneyin.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-700 mb-3">
            Aşağıdaki adımları deneyebilirsiniz:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 text-left">
              <span className="text-lg">🔄</span>
              <div>
                <p className="font-semibold text-slate-900">Sayfayı Yenile</p>
                <p className="text-slate-600">Genellikle yeterli olur</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-left">
              <span className="text-lg">🏠</span>
              <div>
                <p className="font-semibold text-slate-900">Ana Sayfaya Dön</p>
                <p className="text-slate-600">Yeni baştan başla</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-left">
              <span className="text-lg">📱</span>
              <div>
                <p className="font-semibold text-slate-900">Farklı Cihaz Dene</p>
                <p className="text-slate-600">Mobil veya masaüstü</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-left">
              <span className="text-lg">⏰</span>
              <div>
                <p className="font-semibold text-slate-900">Biraz Bekle</p>
                <p className="text-slate-600">Sonra tekrar dene</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Sayfayı Yenile
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-slate-200 text-slate-900 px-6 py-3 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Ana Sayfaya Dön
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          Sorun devam ederse destek ekibiyle iletişime geçebilirsiniz.
        </p>
      </div>
    </div>
  );
}
