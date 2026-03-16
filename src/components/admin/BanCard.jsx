// Mobile-friendly banned user card component
export default function BanCard({ user, onUnban }) {
  return (
    <div className="bg-white border border-red-200 rounded-lg p-4 space-y-3">
      {/* User Info */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{user.name}</h3>
          <p className="text-sm text-slate-500">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.role === "admin" || user.role === "superadmin"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {user.role}
            </span>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
              Yasaklı
            </span>
          </div>
        </div>
      </div>

      {/* Ban Reason (emphasized) */}
      {user.banReason && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
          <p className="text-xs font-semibold text-red-900 mb-1">Ban Sebebi:</p>
          <p className="text-sm text-red-800">{user.banReason}</p>
        </div>
      )}

      {/* Ban Date */}
      {user.bannedAt && (
        <p className="text-xs text-slate-500">
          Yasaklanma: {new Date(user.bannedAt).toLocaleDateString("tr-TR")} {new Date(user.bannedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}

      {/* Registration Date */}
      <p className="text-xs text-slate-500">
        Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
      </p>

      {/* Action - Unban Button */}
      <div className="pt-2 border-t border-slate-200">
        <button
          onClick={() => onUnban(user._id)}
          className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
        >
          Yasağı Kaldır
        </button>
      </div>
    </div>
  );
}
