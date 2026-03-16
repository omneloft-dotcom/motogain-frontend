import { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import { TableSkeleton } from "../../components/common/Skeleton";
import AdminListingCard from "../../components/admin/AdminListingCard";
import StatusBadge from "../../components/listings/StatusBadge";

export default function AllListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchListings = async () => {
    try {
      const res = await adminApi.getAllListings();
      setListings(res);
    } catch (err) {
      console.error("Listings fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings.filter((listing) => {
    if (filterStatus === "all") return true;
    return listing.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Tüm İlanlar
          </h1>
          <p className="text-slate-600">İlanlar yükleniyor...</p>
        </div>
        <TableSkeleton rows={10} columns={6} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Tüm İlanlar
        </h1>
        <p className="text-slate-600">
          Toplam {listings.length} ilan listeleniyor
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Tümü ({listings.length})
        </button>
        <button
          onClick={() => setFilterStatus("pending_approval")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "pending_approval"
              ? "bg-yellow-600 text-white"
              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          }`}
        >
          Beklemede ({listings.filter((l) => l.status === "pending_approval").length})
        </button>
        <button
          onClick={() => setFilterStatus("active")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "active"
              ? "bg-green-600 text-white"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          Yayında ({listings.filter((l) => l.status === "active").length})
        </button>
        <button
          onClick={() => setFilterStatus("inactive")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "inactive"
              ? "bg-slate-600 text-white"
              : "bg-slate-100 text-slate-800 hover:bg-slate-200"
          }`}
        >
          Kapandı ({listings.filter((l) => l.status === "inactive").length})
        </button>
        <button
          onClick={() => setFilterStatus("expired")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "expired"
              ? "bg-orange-600 text-white"
              : "bg-orange-100 text-orange-800 hover:bg-orange-200"
          }`}
        >
          Süresi Doldu ({listings.filter((l) => l.status === "expired").length})
        </button>
      </div>

      {filteredListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            İlan bulunamadı
          </h2>
          <p className="text-slate-600 max-w-md">
            Seçilen filtreye uygun ilan bulunmuyor.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards (<768px) */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredListings.map((listing) => (
              <AdminListingCard
                key={listing._id}
                listing={listing}
              />
            ))}
          </div>

          {/* Desktop Table (≥768px) */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    İlan Başlığı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Oluşturulma
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredListings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {listing.title}
                      </div>
                      <div className="text-sm text-slate-500">
                        {listing.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {listing.createdBy?.name || "Bilinmiyor"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {listing.createdBy?.email || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {listing.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {Number(listing.price).toLocaleString("tr-TR")} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={listing.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(listing.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
