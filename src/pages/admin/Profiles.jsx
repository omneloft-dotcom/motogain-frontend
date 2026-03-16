import { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import { TableSkeleton } from "../../components/common/Skeleton";

/**
 * Profiles - Admin profil görüntüleme (read-only)
 * FAZ 13: Sadece liste ve görüntüleme
 * FAZ 14: Profil tamamlanma yüzdesi gösterimi
 */

// Calculate profile completeness percentage
const calculateCompleteness = (profile) => {
  const fields = [
    profile.courierTypes?.length > 0,
    profile.location?.city,
    profile.location?.district,
    profile.platforms?.length > 0,
    profile.experienceYears > 0,
    profile.availability?.hours,
    profile.availability?.days?.length > 0,
    // Check if any vehicle info is filled
    profile.vehicle?.motor?.model ||
      profile.vehicle?.car?.type ||
      profile.vehicle?.bicycle?.type,
    // Check if any equipment is selected
    Object.values(profile.equipment || {}).some((v) => v === true),
  ];

  const filledFields = fields.filter(Boolean).length;
  const totalFields = fields.length;
  return Math.round((filledFields / totalFields) * 100);
};

// Count missing fields
const getMissingFieldsCount = (profile) => {
  const fields = [
    profile.courierTypes?.length > 0,
    profile.location?.city,
    profile.location?.district,
    profile.platforms?.length > 0,
    profile.experienceYears > 0,
    profile.availability?.hours,
    profile.availability?.days?.length > 0,
    profile.vehicle?.motor?.model ||
      profile.vehicle?.car?.type ||
      profile.vehicle?.bicycle?.type,
    Object.values(profile.equipment || {}).some((v) => v === true),
  ];

  return fields.filter((f) => !f).length;
};

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllProfiles();
      setProfiles(data);
    } catch (err) {
      console.error("Profiles fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Profiller
          </h1>
          <p className="text-slate-600">Profiller yükleniyor...</p>
        </div>
        <TableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Profiller
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Henüz profil yok
          </h2>
          <p className="text-slate-600 max-w-md">
            Henüz hiçbir kullanıcı profil oluşturmamış.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Profiller
        </h1>
        <p className="text-slate-600">
          Toplam {profiles.length} profil listeleniyor
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Kurye Tipleri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Platformlar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Lokasyon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Deneyim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Tamamlanma
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {profiles.map((profile) => {
              const completeness = calculateCompleteness(profile);
              const missingCount = getMissingFieldsCount(profile);

              return (
                <tr key={profile._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">
                      {profile.user?.name || "Bilinmiyor"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {profile.user?.email || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {profile.courierTypes.map((type) => (
                        <span
                          key={type}
                          className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                        >
                          {type.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      {profile.platforms.slice(0, 2).join(", ")}
                      {profile.platforms.length > 2 && (
                        <span className="text-slate-500">
                          {" "}
                          +{profile.platforms.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {profile.location?.city || "-"}
                    {profile.location?.district &&
                      ` / ${profile.location.district}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {profile.experienceYears || 0} yıl
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          completeness >= 80
                            ? "bg-green-100 text-green-800"
                            : completeness >= 50
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {completeness}%
                      </div>
                      {missingCount > 0 && (
                        <span className="text-xs text-slate-500">
                          ({missingCount} eksik)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {profiles.map((profile) => {
          const completeness = calculateCompleteness(profile);
          const missingCount = getMissingFieldsCount(profile);

          return (
            <div
              key={profile._id}
              className="bg-white border border-slate-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {profile.user?.name || "Bilinmiyor"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {profile.user?.email || "-"}
                  </p>
                </div>
                <div
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                    completeness >= 80
                      ? "bg-green-100 text-green-800"
                      : completeness >= 50
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {completeness}%
                </div>
              </div>

              {missingCount > 0 && (
                <p className="text-xs text-slate-500">
                  {missingCount} alan eksik
                </p>
              )}

              {profile.courierTypes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Kurye Tipleri:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {profile.courierTypes.map((type) => (
                      <span
                        key={type}
                        className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                      >
                        {type.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.platforms.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Platformlar:
                  </p>
                  <p className="text-sm text-slate-600">
                    {profile.platforms.join(", ")}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                <span className="text-slate-600">
                  📍 {profile.location?.city || "-"}
                </span>
                <span className="text-slate-600">
                  ⏱️ {profile.experienceYears || 0} yıl
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
