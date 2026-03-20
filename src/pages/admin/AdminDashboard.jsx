// src/pages/admin/AdminDashboard.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../api/adminApi";
import { TableSkeleton } from "../../components/common/Skeleton";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [risk, setRisk] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskLoading, setRiskLoading] = useState(true);
  const [openUserReportsCount, setOpenUserReportsCount] = useState(0);
  const [openListingReportsCount, setOpenListingReportsCount] = useState(0);
  const [reportsLoading, setReportsLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await adminApi.getReports();
      setData(res);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRisk = async () => {
    try {
      setRiskLoading(true);
      const res = await adminApi.getRiskSummary();
      setRisk(res);
    } catch (err) {
      setRisk(null);
    } finally {
      setRiskLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setReportsLoading(true);
      const [userRes, listingRes] = await Promise.all([
        adminApi.getUserReports({ status: "OPEN" }),
        adminApi.getListingReports({ status: "OPEN" }),
      ]);
      setOpenUserReportsCount(userRes?.reports?.length || 0);
      setOpenListingReportsCount(listingRes?.reports?.length || 0);
    } catch (err) {
      setOpenUserReportsCount(0);
      setOpenListingReportsCount(0);
    } finally {
      setReportsLoading(false);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const res = await adminApi.getSystemStatus();
      setSystemStatus(res);
    } catch (err) {
      setSystemStatus(null);
    }
  };

  const loadAll = () => {
    loadData();
    loadRisk();
    loadReports();
    loadSystemStatus();
  };

  useEffect(() => {
    loadAll();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAll();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Combined loading state for action cards
  const actionLoading = loading || riskLoading || reportsLoading;

  // Live status message
  const pendingListings = data?.kpis?.pending?.value ?? 0;
  const totalReports = openUserReportsCount + openListingReportsCount;
  let statusMessage = "";
  let statusColor = "";

  if (pendingListings > 0) {
    statusMessage = `🔴 ${pendingListings} ilan inceleme bekliyor`;
    statusColor = "border-red-300 bg-red-50 text-red-900";
  } else if (totalReports > 0) {
    statusMessage = `⚠️ ${totalReports} yeni rapor var`;
    statusColor = "border-amber-300 bg-amber-50 text-amber-900";
  } else {
    statusMessage = "✓ Sistem stabil, bekleyen işlem yok";
    statusColor = "border-green-300 bg-green-50 text-green-900";
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-600">Moderasyon ve kontrol merkezi</p>
      </div>

      {/* LIVE STATUS BAR */}
      {!actionLoading && (
        <div className={`rounded-xl border-2 px-4 py-3 font-semibold text-sm ${statusColor}`}>
          {statusMessage}
        </div>
      )}

      {/* WARNINGS / ALERTS (Conditional) */}
      {data?.warnings?.length > 0 && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 font-semibold mb-3">
            <span className="text-lg">⚠️</span>
            <span>Dikkat Gerektiren Durumlar</span>
          </div>
          <ul className="space-y-2">
            {data.warnings.map((w) => (
              <li key={w.code} className="flex items-start justify-between gap-3 text-sm text-amber-900">
                <span className="flex-1">{w.message}</span>
                {w.link && (
                  <Link
                    to={w.link}
                    className="shrink-0 whitespace-nowrap rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition"
                  >
                    İncele →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ACIL İŞLEMLER (Extended - 6 Cards) */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Acil İşlemler</h2>
        {actionLoading ? (
          <TableSkeleton rows={2} columns={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Bekleyen İlanlar */}
            <Link
              to="/admin/pending-listings"
              className="block rounded-xl border-2 border-red-200 bg-red-50 p-5 shadow-sm transition hover:border-red-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs uppercase font-bold tracking-wide text-slate-600">
                  Bekleyen İlanlar
                </p>
                {pendingListings > 0 && (
                  <span className="text-red-500 text-lg leading-none">●</span>
                )}
              </div>
              <p className="text-4xl font-bold text-red-900 mb-2">
                {pendingListings}
              </p>
              <p className="text-xs text-slate-600 mb-3">Onay bekleyen ilanlar</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                <span>İncele</span>
                <span>→</span>
              </div>
            </Link>

            {/* Yüksek Risk */}
            <Link
              to="/admin/pending-listings?riskLevel=high"
              className="block rounded-xl border-2 border-orange-200 bg-orange-50 p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs uppercase font-bold tracking-wide text-slate-600">
                  Yüksek Risk
                </p>
                {(data?.kpis?.highRisk?.value ?? 0) > 0 && (
                  <span className="text-orange-500 text-lg leading-none">●</span>
                )}
              </div>
              <p className="text-4xl font-bold text-orange-900 mb-2">
                {data?.kpis?.highRisk?.value ?? 0}
              </p>
              <p className="text-xs text-slate-600 mb-3">Acil inceleme gerekli</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                <span>İncele</span>
                <span>→</span>
              </div>
            </Link>

            {/* Kullanıcı Raporları */}
            <Link
              to="/admin/reports"
              className="block rounded-xl border-2 border-indigo-200 bg-indigo-50 p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs uppercase font-bold tracking-wide text-slate-600">
                  Kullanıcı Raporları
                </p>
                {openUserReportsCount > 0 && (
                  <span className="text-indigo-500 text-lg leading-none">●</span>
                )}
              </div>
              <p className="text-4xl font-bold text-indigo-900 mb-2">
                {openUserReportsCount}
              </p>
              <p className="text-xs text-slate-600 mb-3">Açık kullanıcı raporu</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                <span>İncele</span>
                <span>→</span>
              </div>
            </Link>

            {/* İlan Raporları */}
            <Link
              to="/admin/reports"
              className="block rounded-xl border-2 border-blue-200 bg-blue-50 p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs uppercase font-bold tracking-wide text-slate-600">
                  İlan Raporları
                </p>
                {openListingReportsCount > 0 && (
                  <span className="text-blue-500 text-lg leading-none">●</span>
                )}
              </div>
              <p className="text-4xl font-bold text-blue-900 mb-2">
                {openListingReportsCount}
              </p>
              <p className="text-xs text-slate-600 mb-3">Açık ilan raporu</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                <span>İncele</span>
                <span>→</span>
              </div>
            </Link>

            {/* Spam Sinyalli */}
            <Link
              to="/admin/pending-listings?spamRisk=true"
              className="block rounded-xl border-2 border-amber-200 bg-amber-50 p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs uppercase font-bold tracking-wide text-slate-600">
                  Spam Sinyalli
                </p>
                {(risk?.spamRisk ?? 0) > 0 && (
                  <span className="text-amber-500 text-lg leading-none">●</span>
                )}
              </div>
              <p className="text-4xl font-bold text-amber-900 mb-2">
                {risk?.spamRisk ?? 0}
              </p>
              <p className="text-xs text-slate-600 mb-3">Spam şüphesi taşıyan</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                <span>İncele</span>
                <span>→</span>
              </div>
            </Link>

            {/* Fiyat Anomali */}
            <Link
              to="/admin/pending-listings?priceAnomaly=true"
              className="block rounded-xl border-2 border-purple-200 bg-purple-50 p-5 shadow-sm transition hover:border-purple-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs uppercase font-bold tracking-wide text-slate-600">
                  Fiyat Anomali
                </p>
                {(risk?.priceAnomaly ?? 0) > 0 && (
                  <span className="text-purple-500 text-lg leading-none">●</span>
                )}
              </div>
              <p className="text-4xl font-bold text-purple-900 mb-2">
                {risk?.priceAnomaly ?? 0}
              </p>
              <p className="text-xs text-slate-600 mb-3">Anormal fiyat tespiti</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                <span>İncele</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* GÜVEN & RİSK ÖZETİ */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Güven & Risk Özeti</h2>
          <div className="text-xs text-slate-500">
            {risk?.range?.from
              ? `${new Date(risk.range.from).toLocaleDateString("tr-TR")} - ${new Date(
                  risk.range.to
                ).toLocaleDateString("tr-TR")}`
              : "Son 7 gün"}
          </div>
        </div>

        {riskLoading ? (
          <TableSkeleton rows={2} columns={3} />
        ) : (
          <div className="space-y-5">
            {/* Risk Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-xs uppercase text-red-600 font-semibold mb-1">Yüksek Risk</p>
                <p className="text-2xl font-bold text-red-900">
                  {risk?.riskDistribution?.high ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs uppercase text-amber-600 font-semibold mb-1">Spam Risk</p>
                <p className="text-2xl font-bold text-amber-900">{risk?.spamRisk ?? 0}</p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <p className="text-xs uppercase text-purple-600 font-semibold mb-1">Fiyat Anomali</p>
                <p className="text-2xl font-bold text-purple-900">{risk?.priceAnomaly ?? 0}</p>
              </div>
            </div>

            {/* Top Problems (Top Flags & Listings) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Flags */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3">En Sık Flag'ler</h3>
                {risk?.topFlags?.length > 0 ? (
                  <ul className="space-y-2">
                    {risk.topFlags.map((f) => (
                      <li key={f._id || f.code} className="flex items-center justify-between text-sm">
                        <span className="text-slate-800 font-medium">{f._id || "—"}</span>
                        <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {f.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-green-600 text-2xl">✓</span>
                    <p className="text-sm text-slate-600 mt-1">Sorun tespit edilmedi</p>
                  </div>
                )}
              </div>

              {/* Top Listings */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3">En Çok Flag Alan İlanlar</h3>
                {risk?.topListings?.length > 0 ? (
                  <ul className="space-y-2">
                    {risk.topListings.map((l) => (
                      <li key={l._id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-slate-800 font-medium flex-1">
                          {l.title || l._id}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-500">{l.riskLevel || "—"}</span>
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            {l.flagsCount || 0}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-green-600 text-2xl">✓</span>
                    <p className="text-sm text-slate-600 mt-1">Sorun tespit edilmedi</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Links */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200">
              <Link
                to="/admin/pending-listings"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Tüm bekleyen ilanlar →
              </Link>
              <Link
                to="/admin/reports"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Tüm raporlar →
              </Link>
              <Link
                to="/admin/bans"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Ban yönetimi →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* PLATFORM ÖZETİ */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Platform Özeti</h2>
        {loading ? (
          <TableSkeleton rows={1} columns={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-slate-500 font-semibold">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {data?.kpis?.users?.value ?? 0}
              </p>
              <Link
                to="/admin/users"
                className="inline-block mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Yönet →
              </Link>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-slate-500 font-semibold">Toplam İlan</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {data?.kpis?.listings?.value ?? 0}
              </p>
              <Link
                to="/admin/listings"
                className="inline-block mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Yönet →
              </Link>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-slate-500 font-semibold">Red Edilen</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {data?.kpis?.rejected?.value ?? 0}
              </p>
              <Link
                to="/admin/pending-listings"
                className="inline-block mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                İncele →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* SYSTEM CONFIGURATION FOOTER */}
      {systemStatus && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <span className="font-semibold text-slate-700">Sistem Yapılandırması:</span>
            <span className="text-slate-600">
              Soft Launch:{" "}
              <span className={systemStatus.SOFT_LAUNCH ? "text-green-700 font-semibold" : "text-slate-500"}>
                {systemStatus.SOFT_LAUNCH ? "Açık" : "Kapalı"}
              </span>
            </span>
            <span className="text-slate-600">
              Invite Only:{" "}
              <span className={systemStatus.SOFT_LAUNCH_INVITE_ONLY ? "text-green-700 font-semibold" : "text-slate-500"}>
                {systemStatus.SOFT_LAUNCH_INVITE_ONLY ? "Açık" : "Kapalı"}
              </span>
            </span>
            <span className="text-slate-600">
              Rate Limiting:{" "}
              <span className={systemStatus.RATE_LIMIT_ENABLED ? "text-green-700 font-semibold" : "text-slate-500"}>
                {systemStatus.RATE_LIMIT_ENABLED ? "Açık" : "Kapalı"}
              </span>
            </span>
            <span className="text-slate-600">
              Promotions:{" "}
              <span className={systemStatus.FEATURE_PROMOTIONS ? "text-green-700 font-semibold" : "text-slate-500"}>
                {systemStatus.FEATURE_PROMOTIONS ? "Açık" : "Kapalı"}
              </span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              Ortam:{" "}
              <span className="font-semibold text-slate-800 uppercase">
                {systemStatus.NODE_ENV}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
