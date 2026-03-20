import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../api/adminApi";

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("tr-TR");
  } catch {
    return "-";
  }
};

const formatReason = (value) => {
  if (!value) return "-";
  return value.replaceAll("_", " ");
};

const getReporterLabel = (user) => {
  if (!user) return "Silinmiş kullanıcı";
  const parts = [user.name, user.email].filter(Boolean);
  return parts.join(" • ") || "Silinmiş kullanıcı";
};

const getUserTargetLabel = (report) => {
  if (!report?.reportedUser) return "Silinmiş kullanıcı";
  const parts = [
    report.reportedUser.name,
    report.reportedUser.email,
    report.reportedUser.isBanned ? "🔴 Banlı" : null,
  ].filter(Boolean);
  return parts.join(" • ") || "Silinmiş kullanıcı";
};

const getListingTargetLabel = (report) => {
  if (!report?.listing) return "Silinmiş ilan";
  const parts = [
    report.listing.title,
    report.listing.price != null ? `${report.listing.price.toLocaleString("tr-TR")} ₺` : null,
    report.listing.city,
  ].filter(Boolean);
  return parts.join(" • ") || "Silinmiş ilan";
};

function ReportsTable({ rows, type, onBanUser, onRemoveListing, onDismiss, actionLoading }) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="text-4xl mb-2">✓</div>
        <p className="text-sm font-semibold text-green-800">Aktif rapor bulunmuyor</p>
        <p className="text-xs text-green-700 mt-1">Tüm raporlar çözülmüş durumda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((report) => {
        const isLoading = actionLoading[report._id];
        const isOpen = report.status === "OPEN";

        return (
          <div
            key={report._id}
            className={`rounded-xl border-2 bg-white p-4 shadow-sm transition ${
              isOpen ? "border-l-4 border-l-amber-500 border-slate-200" : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Report Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {formatReason(report.reason)}
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(report.createdAt)}</span>
                </div>

                <div className="text-sm">
                  <span className="font-semibold text-slate-700">Hedef: </span>
                  <span className="text-slate-900">
                    {type === "users" ? getUserTargetLabel(report) : getListingTargetLabel(report)}
                  </span>
                </div>

                {report.details && (
                  <div className="text-sm text-slate-600 bg-slate-50 rounded p-2">
                    {report.details}
                  </div>
                )}

                <div className="text-xs text-slate-500">
                  Raporlayan: {getReporterLabel(report.reportedBy)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                {type === "users" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onBanUser(report._id, report.reportedUser?._id)}
                      disabled={isLoading || report.reportedUser?.isBanned}
                      className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {report.reportedUser?.isBanned ? "Zaten Banlı" : "Kullanıcıyı Banla"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismiss(report._id)}
                      disabled={isLoading}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Yok Say
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onRemoveListing(report._id, report.listing?._id)}
                      disabled={isLoading || report.listing?.status === "inactive"}
                      className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {report.listing?.status === "inactive" ? "Zaten Kaldırılmış" : "İlanı Kaldır"}
                    </button>
                    {report.listing?._id && (
                      <Link
                        to={`/admin/listings/${report.listing._id}`}
                        className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 text-center"
                      >
                        İncele
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => onDismiss(report._id)}
                      disabled={isLoading}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Yok Say
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userReports, setUserReports] = useState([]);
  const [listingReports, setListingReports] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [feedback, setFeedback] = useState({ visible: false, message: "", type: "" });
  const [metrics, setMetrics] = useState({
    banUser: 0,
    removeListing: 0,
    dismiss: 0,
  });

  // Load metrics from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("reportMetrics");
      if (stored) {
        setMetrics(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load metrics:", err);
    }
  }, []);

  // Save metrics to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("reportMetrics", JSON.stringify(metrics));
    } catch (err) {
      console.error("Failed to save metrics:", err);
    }
  }, [metrics]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const [userRes, listingRes] = await Promise.all([
        adminApi.getUserReports({ status: "OPEN" }),
        adminApi.getListingReports({ status: "OPEN" }),
      ]);
      setUserReports((userRes?.reports || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setListingReports((listingRes?.reports || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err?.response?.data?.message || "Raporlar alınamadı.");
      setUserReports([]);
      setListingReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const showFeedback = (message, type = "success") => {
    setFeedback({ visible: true, message, type });
    setTimeout(() => setFeedback({ visible: false, message: "", type: "" }), 3000);
  };

  const handleBanUser = async (reportId, userId) => {
    if (!userId) {
      showFeedback("Kullanıcı bilgisi bulunamadı", "error");
      return;
    }

    if (!window.confirm("Bu kullanıcıyı banlamak istediğinize emin misiniz?")) return;

    try {
      setActionLoading((prev) => ({ ...prev, [reportId]: true }));
      await adminApi.resolveUserReport(reportId, {
        actionType: "BAN_USER",
        resolutionNote: "Rapor üzerine banlandı",
      });
      await loadReports();
      setMetrics((prev) => ({ ...prev, banUser: prev.banUser + 1 }));
      showFeedback("Kullanıcı banlandı ve rapor çözüldü");
    } catch (err) {
      showFeedback(err?.response?.data?.message || "İşlem başarısız", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  const handleRemoveListing = async (reportId, listingId) => {
    if (!listingId) {
      showFeedback("İlan bilgisi bulunamadı", "error");
      return;
    }

    if (!window.confirm("Bu ilanı kaldırmak istediğinize emin misiniz?")) return;

    try {
      setActionLoading((prev) => ({ ...prev, [reportId]: true }));
      await adminApi.resolveListingReport(reportId, {
        actionType: "DELETE_LISTING",
        resolutionNote: "Rapor üzerine kaldırıldı",
      });
      await loadReports();
      setMetrics((prev) => ({ ...prev, removeListing: prev.removeListing + 1 }));
      showFeedback("İlan kaldırıldı ve rapor çözüldü");
    } catch (err) {
      showFeedback(err?.response?.data?.message || "İşlem başarısız", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  const handleDismiss = async (reportId) => {
    if (!window.confirm("Bu raporu yok saymak istediğinize emin misiniz?")) return;

    try {
      setActionLoading((prev) => ({ ...prev, [reportId]: true }));
      if (activeTab === "users") {
        await adminApi.rejectUserReport(reportId, { rejectionReason: "Geçersiz rapor" });
      } else {
        await adminApi.rejectListingReport(reportId, { rejectionReason: "Geçersiz rapor" });
      }
      await loadReports();
      setMetrics((prev) => ({ ...prev, dismiss: prev.dismiss + 1 }));
      showFeedback("Rapor yok sayıldı");
    } catch (err) {
      showFeedback(err?.response?.data?.message || "İşlem başarısız", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  const activeRows = activeTab === "users" ? userReports : listingReports;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rapor Moderasyonu</h1>
          <p className="mt-1 text-sm text-slate-600">
            Açık raporlar en yeniden eskiye sıralanır
          </p>
        </div>
        <button
          type="button"
          onClick={loadReports}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Yenileniyor..." : "Yenile"}
        </button>
      </div>

      {/* Moderation Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase text-red-600">Ban</p>
          <p className="mt-2 text-3xl font-bold text-red-900">{metrics.banUser}</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-xs font-semibold uppercase text-orange-600">İlan Kaldır</p>
          <p className="mt-2 text-3xl font-bold text-orange-900">{metrics.removeListing}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-600">Yok Say</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.dismiss}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            activeTab === "users"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          Kullanıcı Bildirimleri
          {userReports.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              {userReports.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("listings")}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            activeTab === "listings"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          İlan Bildirimleri
          {listingReports.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              {listingReports.length}
            </span>
          )}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Raporlar yükleniyor...
        </div>
      ) : (
        <ReportsTable
          rows={activeRows}
          type={activeTab}
          onBanUser={handleBanUser}
          onRemoveListing={handleRemoveListing}
          onDismiss={handleDismiss}
          actionLoading={actionLoading}
        />
      )}

      {feedback.visible && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
            feedback.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
