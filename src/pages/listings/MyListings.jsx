import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import listingsApi from "../../api/listingsApi";
import Toast from "../../components/common/Toast";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import StatusBadge from "../../components/listings/StatusBadge";
import CloseListingModal from "../../components/listings/CloseListingModal";
import PageShell from "../../components/layout/PageShell";

/**
 * MyListings - Kullanıcının kendi ilanları (FAZ 15)
 *
 * Features:
 * - Status bazlı filtreleme
 * - Status'a göre aksiyonlar
 * - Mobile + Desktop responsive
 * - FAZ 18: Standart status badge + sade kapatma modal'ı
 */

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [toast, setToast] = useState(null);
  const [closeModal, setCloseModal] = useState({ isOpen: false, listing: null });
  const navigate = useNavigate();

  useEffect(() => {
    loadListings();
  }, [statusFilter]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await listingsApi.getUserListings(statusFilter || null);
      setListings(data);
    } catch (err) {
      logError("MyListings - loadListings", err);
      setToast({ message: getErrorMessage(err), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listingId) => {
    navigate(`/listings/${listingId}/edit`);
  };

  const handleCloseClick = (listing) => {
    setCloseModal({ isOpen: true, listing });
  };

  const handleCloseConfirm = async (closeReason) => {
    if (!closeModal.listing) return;

    try {
      await listingsApi.closeListing(closeModal.listing._id, closeReason);
      setToast({ message: "İlan başarıyla kapatıldı", type: "success" });
      setCloseModal({ isOpen: false, listing: null });
      loadListings();
    } catch (err) {
      logError("MyListings - handleCloseConfirm", err);
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  if (loading) {
    return (
      <PageShell title="İlanlarım" description="İlanlar yükleniyor...">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="İlanlarım"
      description={`Toplam ${listings.length} ilan listeleniyor`}
    >

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === ""
                ? "bg-primary text-background"
                : "bg-card text-text-secondary hover:bg-card-hover"
            }`}
          >
            Tümü
          </button>
          {["pending_approval", "active", "inactive", "expired"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === status
                  ? "bg-primary text-background"
                  : "bg-card text-text-secondary hover:bg-card-hover"
              }`}
            >
              <StatusBadge status={status} size="sm" />
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {listings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {statusFilter ? "Bu statüde ilan yok" : "Henüz ilan oluşturmadın"}
          </h2>
          <p className="text-text-secondary max-w-md mb-6">
            {statusFilter
              ? "Farklı bir statü seç veya yeni ilan oluştur"
              : "İlk ilanını oluşturarak ekipmanlarını satışa sunabilirsin"}
          </p>
          {!statusFilter && (
            <Link
              to="/listings/create"
              className="bg-primary text-background px-6 py-3 rounded-lg hover:bg-highlight transition-colors"
            >
              İlan Oluştur
            </Link>
          )}
        </div>
      )}

      {/* Desktop Table */}
      {listings.length > 0 && (
        <div className="hidden md:block bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-card-hover">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  İlan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Lokasyon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-slate-200">
              {listings.map((listing) => {
                const isPending = listing.status === "pending_approval";
                const isActive = listing.status === "active";
                const isInactive = listing.status === "inactive";
                const isExpired = listing.status === "expired";
                const isReadonly = isInactive || isExpired;

                return (
                  <tr key={listing._id} className="hover:bg-card-hover">
                    <td className="px-6 py-4">
                      <Link
                        to={`/listings/${listing._id}`}
                        className="text-sm font-medium text-text-primary hover:text-blue-600"
                      >
                        {listing.title}
                      </Link>
                      <div className="text-sm text-slate-500">
                        {listing.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-text-primary">
                      {listing.price} ₺
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {listing.city}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={listing.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(listing.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {(isPending || isActive) && (
                          <button
                            onClick={() => handleEdit(listing._id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Düzenle
                          </button>
                        )}
                        {isActive && (
                          <button
                            onClick={() => handleCloseClick(listing)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            Kapat
                          </button>
                        )}
                        {isReadonly && (
                          <span className="text-sm text-slate-400">
                            Salt okunur
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
      )}

      {/* Mobile Cards */}
      {listings.length > 0 && (
        <div className="md:hidden space-y-4">
          {listings.map((listing) => {
            const isPending = listing.status === "pending_approval";
            const isActive = listing.status === "active";
            const isInactive = listing.status === "inactive";

            return (
              <div
                key={listing._id}
                className="bg-card border border-border/40 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <Link to={`/listings/${listing._id}`} className="flex-1">
                    <h3 className="font-semibold text-text-primary hover:text-blue-600">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-slate-500">{listing.category}</p>
                  </Link>
                  <StatusBadge status={listing.status} size="sm" showIcon={false} />
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t border-border/40">
                  <span className="font-semibold text-text-primary">
                    {listing.price} ₺
                  </span>
                  <span className="text-text-secondary">📍 {listing.city}</span>
                </div>

                <div className="text-xs text-slate-500">
                  {new Date(listing.createdAt).toLocaleDateString("tr-TR")}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {(isPending || isActive) && (
                    <button
                      onClick={() => handleEdit(listing._id)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Düzenle
                    </button>
                  )}
                  {isActive && (
                    <button
                      onClick={() => handleCloseClick(listing)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Kapat
                    </button>
                  )}
                  {isInactive && (
                    <div className="flex-1 text-center text-sm text-slate-400 py-2">
                      Kapalı
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* FAZ 18: Close Listing Modal */}
      <CloseListingModal
        isOpen={closeModal.isOpen}
        listingTitle={closeModal.listing?.title || ""}
        onClose={() => setCloseModal({ isOpen: false, listing: null })}
        onConfirm={handleCloseConfirm}
      />
    </PageShell>
  );
}
