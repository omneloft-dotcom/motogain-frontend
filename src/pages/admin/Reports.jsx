import { useEffect, useMemo, useState } from "react";
import adminApi from "../../api/adminApi";

const tabs = [
  { key: "users", label: "Kullanıcı Bildirimleri" },
  { key: "listings", label: "İlan Bildirimleri" },
];

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
    report.reportedUser.role,
    report.reportedUser.isBanned ? "Banlı" : null,
  ].filter(Boolean);
  return parts.join(" • ") || "Silinmiş kullanıcı";
};

const getListingTargetLabel = (report) => {
  if (!report?.listing) return "Silinmiş ilan";
  const owner = report.listing.createdBy;
  const parts = [
    report.listing.title,
    report.listing.price != null ? `${report.listing.price.toLocaleString("tr-TR")} ₺` : null,
    report.listing.city,
    report.listing.status,
    owner?.name || owner?.email ? `Sahip: ${[owner?.name, owner?.email].filter(Boolean).join(" • ")}` : null,
  ].filter(Boolean);
  return parts.join(" • ") || "Silinmiş ilan";
};

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function ResolveModal({ visible, type, onClose, onSubmit, loading }) {
  const [actionType, setActionType] = useState("NONE");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    onSubmit({ actionType, resolutionNote: note });
  };

  if (!visible) return null;

  const actionOptions = type === "users"
    ? [
        { value: "NONE", label: "No action" },
        { value: "BAN_USER", label: "Ban user" },
      ]
    : [
        { value: "NONE", label: "No action" },
        { value: "DELETE_LISTING", label: "Delete listing" },
        { value: "BAN_USER", label: "Ban listing owner" },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-slate-900">Resolve Report</h2>
        <p className="mt-1 text-sm text-slate-600">Choose action and provide optional note.</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            >
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Resolution Note (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter reason or note..."
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Resolving..." : "Resolve"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportsTable({ rows, type, onReview, onResolve, onReject, actionLoading }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Kayıt bulunamadı.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">Target Info</th>
              <th className="px-4 py-3">Reported By</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white align-top text-slate-700">
            {rows.map((report) => {
              const isLoading = actionLoading[report._id];
              const isOpen = report.status === "OPEN";
              const isReviewed = report.status === "REVIEWED";
              return (
                <tr key={report._id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{type === "users" ? "User" : "Listing"}</td>
                  <td className="px-4 py-3">{formatReason(report.reason)}</td>
                  <td className="px-4 py-3 whitespace-pre-wrap">{report.details || "-"}</td>
                  <td className="px-4 py-3 whitespace-pre-wrap">
                    {type === "users" ? getUserTargetLabel(report) : getListingTargetLabel(report)}
                  </td>
                  <td className="px-4 py-3 whitespace-pre-wrap">{getReporterLabel(report.reportedBy)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(report.createdAt)}</td>
                  <td className="px-4 py-3">{report.status || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {isOpen && (
                        <button
                          type="button"
                          onClick={() => onReview(report._id)}
                          disabled={isLoading}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                        >
                          Review
                        </button>
                      )}
                      {(isOpen || isReviewed) && (
                        <>
                          <button
                            type="button"
                            onClick={() => onResolve(report._id)}
                            disabled={isLoading}
                            className="rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                          >
                            Resolve
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(report._id)}
                            disabled={isLoading}
                            className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
  const [resolveModal, setResolveModal] = useState({ visible: false, reportId: null });
  const [feedback, setFeedback] = useState({ visible: false, message: "", type: "" });

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const [userRes, listingRes] = await Promise.all([
        adminApi.getUserReports(),
        adminApi.getListingReports(),
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

  const handleReview = async (reportId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [reportId]: true }));
      if (activeTab === "users") {
        await adminApi.reviewUserReport(reportId);
      } else {
        await adminApi.reviewListingReport(reportId);
      }
      await loadReports();
      showFeedback("Report marked as reviewed");
    } catch (err) {
      showFeedback(err?.response?.data?.message || "Failed to review report", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  const handleResolve = (reportId) => {
    setResolveModal({ visible: true, reportId });
  };

  const handleResolveSubmit = async (payload) => {
    const { reportId } = resolveModal;
    try {
      setActionLoading((prev) => ({ ...prev, [reportId]: true }));
      if (activeTab === "users") {
        await adminApi.resolveUserReport(reportId, payload);
      } else {
        await adminApi.resolveListingReport(reportId, payload);
      }
      await loadReports();
      setResolveModal({ visible: false, reportId: null });
      showFeedback("Report resolved successfully");
    } catch (err) {
      showFeedback(err?.response?.data?.message || "Failed to resolve report", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  const handleReject = async (reportId) => {
    if (!window.confirm("Are you sure you want to reject this report?")) return;
    try {
      setActionLoading((prev) => ({ ...prev, [reportId]: true }));
      if (activeTab === "users") {
        await adminApi.rejectUserReport(reportId, { rejectionReason: "Rejected by admin" });
      } else {
        await adminApi.rejectListingReport(reportId, { rejectionReason: "Rejected by admin" });
      }
      await loadReports();
      showFeedback("Report rejected");
    } catch (err) {
      showFeedback(err?.response?.data?.message || "Failed to reject report", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  const activeRows = useMemo(
    () => (activeTab === "users" ? userReports : listingReports),
    [activeTab, listingReports, userReports]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rapor Takibi</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kullanıcı ve ilan bildirimleri en yeniden eskiye sıralanır.
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

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Kullanıcı Bildirimi" value={userReports.length} />
        <SummaryCard label="İlan Bildirimi" value={listingReports.length} />
        <SummaryCard label="Açık Durum" value={[...userReports, ...listingReports].filter((item) => item.status === "OPEN").length} />
        <SummaryCard label="Toplam" value={userReports.length + listingReports.length} />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Raporlar yükleniyor...</div>
      ) : (
        <ReportsTable
          rows={activeRows}
          type={activeTab}
          onReview={handleReview}
          onResolve={handleResolve}
          onReject={handleReject}
          actionLoading={actionLoading}
        />
      )}

      <ResolveModal
        visible={resolveModal.visible}
        type={activeTab}
        onClose={() => setResolveModal({ visible: false, reportId: null })}
        onSubmit={handleResolveSubmit}
        loading={actionLoading[resolveModal.reportId]}
      />

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