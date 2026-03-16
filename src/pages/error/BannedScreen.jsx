import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function BannedScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-4xl">🚫</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Hesabınız Yasaklandı
                </h1>
                <p className="text-red-100 text-sm">
                  Cordy platformuna erişiminiz kısıtlanmıştır
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            {/* User Info */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Kullanıcı</p>
                  <p className="font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    Yasaklı
                  </span>
                </div>
              </div>
            </div>

            {/* Ban Reason */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span>📋</span>
                Yasaklanma Sebebi
              </h2>
              <div className="bg-red-50 border-l-4 border-red-600 rounded-r-lg p-4">
                <p className="text-red-900 font-medium">
                  {user?.banReason || "Sebep belirtilmemiş"}
                </p>
              </div>
            </div>

            {/* Ban Date */}
            {user?.bannedAt && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">Yasaklanma Tarihi:</span>{" "}
                {new Date(user.bannedAt).toLocaleString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span>ℹ️</span>
                Ne Yapmalıyım?
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Yasaklanmanın yanlış olduğunu düşünüyorsanız, platform
                    yöneticileri ile iletişime geçebilirsiniz.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Topluluk kurallarımızı gözden geçirerek benzer durumlardan
                    kaçınabilirsiniz.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Hesabınız yeniden aktif edilene kadar platform özelliklerini
                    kullanamazsınız.
                  </span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
              <p className="text-sm text-slate-700 mb-2">
                <span className="font-semibold">Destek İletişim:</span>
              </p>
              <a
                href="mailto:support@cordy.com"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
              >
                support@cordy.com
              </a>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="w-full bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <span>🚪</span>
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Cordy © 2025 - Topluluk Kuralları ve Hizmet Şartları
        </p>
      </div>
    </div>
  );
}
