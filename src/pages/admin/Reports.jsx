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

function ReportsTable({ rows, type }) {
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white align-top text-slate-700">
            {rows.map((report) => (
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
              </tr>
            ))}
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
        <ReportsTable rows={activeRows} type={activeTab} />
      )}
    </div>
  );
}