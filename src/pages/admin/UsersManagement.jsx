import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import adminApi from "../../api/adminApi";
import { TableSkeleton } from "../../components/common/Skeleton";
import Toast from "../../components/common/Toast";
import UserCard from "../../components/admin/UserCard";

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banReason, setBanReason] = useState("");
  const [banningUserId, setBanningUserId] = useState(null);
  const [unbanningUserId, setUnbanningUserId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getAllUsers();
      setUsers(res);
    } catch (err) {
      console.error("Users fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBan = async (userId) => {
    if (!banReason.trim()) {
      setToast({ message: "Lütfen ban sebebi giriniz", type: "warning" });
      return;
    }

    try {
      await adminApi.banUser(userId, banReason);
      setBanReason("");
      setBanningUserId(null);
      fetchUsers();
      setToast({ message: "Kullanıcı başarıyla yasaklandı", type: "success" });
    } catch (err) {
      console.error("Ban error:", err);
      setToast({ message: "Ban işlemi başarısız", type: "error" });
    }
  };

  const handleUnban = async (userId) => {
    if (!confirm("Bu kullanıcının yasağını kaldırmak istediğinize emin misiniz?")) {
      return;
    }

    try {
      setUnbanningUserId(userId);
      await adminApi.unbanUser(userId);
      fetchUsers();
      setToast({ message: "Yasak başarıyla kaldırıldı", type: "success" });
    } catch (err) {
      console.error("Unban error:", err);
      setToast({ message: "Unban işlemi başarısız", type: "error" });
    } finally {
      setUnbanningUserId(null);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    if (currentUser.role !== "superadmin") {
      setToast({ message: "Rol değiştirme sadece superadmin için izinli", type: "warning" });
      return;
    }

    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmMsg = `Bu kullanıcının rolünü ${newRole} olarak değiştirmek istediğinize emin misiniz?`;

    if (!confirm(confirmMsg)) return;

    try {
      await adminApi.updateUserRole(userId, newRole);
      fetchUsers();
      setToast({ message: `Rol başarıyla ${newRole} olarak güncellendi`, type: "success" });
    } catch (err) {
      console.error("Role change error:", err);
      setToast({ message: "Rol değiştirme başarısız", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Kullanıcı Yönetimi
          </h1>
          <p className="text-slate-600">Kullanıcılar yükleniyor...</p>
        </div>
        <TableSkeleton rows={8} columns={5} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Kullanıcı Yönetimi
        </h1>
        <p className="text-slate-600">
          Toplam {users.length} kullanıcı listeleniyor
        </p>
      </div>

      {/* Mobile Cards (<768px) */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            currentUser={currentUser}
            onBan={handleBan}
            onUnban={handleUnban}
            onRoleChange={handleRoleChange}
            banningUserId={banningUserId}
            unbanningUserId={unbanningUserId}
            banReason={banReason}
            setBanReason={setBanReason}
            setBanningUserId={setBanningUserId}
          />
        ))}
      </div>

      {/* Desktop Table (≥768px) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Kayıt Tarihi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">
                    {user.name}
                  </div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "admin" || user.role === "superadmin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isBanned ? (
                    <div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Yasaklı
                      </span>
                      <div className="text-xs text-slate-500 mt-1">
                        {user.banReason || "Yasak nedeni belirtilmedi"}
                      </div>
                      {user.bannedAt && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(user.bannedAt).toLocaleDateString("tr-TR")}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Aktif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user._id === currentUser?._id ? (
                    <div className="text-xs text-slate-500 italic">
                      (Kendinizi düzenleyemezsiniz)
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {/* Ban/Unban Controls */}
                      {user.isBanned ? (
                        <button
                          onClick={() => handleUnban(user._id)}
                          disabled={unbanningUserId === user._id}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {unbanningUserId === user._id ? "Kaldırılıyor..." : "Yasağı Kaldır"}
                        </button>
                      ) : (
                        <>
                          {banningUserId === user._id ? (
                            <div className="flex flex-col gap-1">
                              <input
                                type="text"
                                placeholder="Ban sebebi..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                className="border rounded px-2 py-1 text-xs"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleBan(user._id)}
                                  className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                >
                                  Onayla
                                </button>
                                <button
                                  onClick={() => {
                                    setBanningUserId(null);
                                    setBanReason("");
                                  }}
                                  className="bg-slate-400 text-white px-2 py-1 rounded text-xs hover:bg-slate-500"
                                >
                                  İptal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setBanningUserId(user._id)}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium text-xs"
                            >
                              Yasakla
                            </button>
                          )}
                        </>
                      )}

                      {/* Role Change */}
                      {user.role !== "superadmin" && (
                        <button
                          onClick={() => handleRoleChange(user._id, user.role)}
                          disabled={currentUser.role !== "superadmin"}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs disabled:opacity-50"
                        >
                          {user.role === "admin" ? "User Yap" : "Admin Yap"}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
