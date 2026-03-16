// Mobile-friendly user card component
export default function UserCard({ user, currentUser, onBan, onUnban, onRoleChange, banningUserId, banReason, setBanReason, setBanningUserId }) {
  const isSelf = user._id === currentUser?._id;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
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
            {user.isBanned && (
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                Yasaklı
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ban Reason (if banned) */}
      {user.isBanned && user.banReason && (
        <div className="bg-red-50 border-l-2 border-red-500 p-2 rounded">
          <p className="text-xs text-red-800">
            <span className="font-semibold">Sebep:</span> {user.banReason}
          </p>
        </div>
      )}

      {/* Registration Date */}
      <p className="text-xs text-slate-500">
        Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
      </p>

      {/* Actions */}
      {isSelf ? (
        <div className="text-xs text-slate-500 italic text-center py-2">
          (Kendinizi düzenleyemezsiniz)
        </div>
      ) : (
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
          {/* Ban/Unban */}
          {user.isBanned ? (
            <button
              onClick={() => onUnban(user._id)}
              className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              Yasağı Kaldır
            </button>
          ) : (
            <>
              {banningUserId === user._id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Ban sebebi..."
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onBan(user._id)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => {
                        setBanningUserId(null);
                        setBanReason("");
                      }}
                      className="flex-1 bg-slate-400 text-white px-3 py-2 rounded-lg hover:bg-slate-500 text-sm font-medium"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setBanningUserId(user._id)}
                  className="w-full bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  Yasakla
                </button>
              )}
            </>
          )}

          {/* Role Change */}
          {user.role !== "superadmin" && (
            <button
              onClick={() => onRoleChange(user._id, user.role)}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              {user.role === "admin" ? "User Yap" : "Admin Yap"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
