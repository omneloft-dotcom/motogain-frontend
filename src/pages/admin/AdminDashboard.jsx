// src/pages/admin/AdminDashboard.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../api/adminApi";
import { TableSkeleton } from "../../components/common/Skeleton";
import { isSoftLaunch } from "../../utils/isSoftLaunch";

const cards = [
  { label: "Bekleyen İlanlar", key: "pending", link: "/admin/pending-listings" },
  { label: "Toplam Kullanıcı", key: "users", link: "/admin/users" },
  { label: "Toplam İlan", key: "listings", link: "/admin/listings" },
  { label: "Red Edilen", key: "rejected", link: "/admin/pending-listings?status=rejected" },
  { label: "Yüksek Risk", key: "highRisk", link: "/admin/pending-listings?riskLevel=high" },
];

const quickActions = [
  { label: "Bekleyen İlanlar", link: "/admin/pending-listings" },
  { label: "Kullanıcı Yönetimi", link: "/admin/users" },
  { label: "Haber Yönetimi", link: "/admin/news" },
  { label: "Ban Yönetimi", link: "/admin/bans" },
  { label: "Raporlar", link: "/admin/reports" },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [risk, setRisk] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskLoading, setRiskLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getReports();
        setData(res);
      } catch (err) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
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
    loadRisk();
  }, []);

  useEffect(() => {
    const loadSystemStatus = async () => {
      try {
        const res = await adminApi.getSystemStatus();
        setSystemStatus(res);
      } catch (err) {
        setSystemStatus(null);
      }
    };
    loadSystemStatus();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">Moderasyon ve kontrol özetleri</p>
        </div>
        {isSoftLaunch && (
          <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
            Soft Launch Active
          </span>
        )}
      </div>

      {loading || !data ? (
        <TableSkeleton rows={2} columns={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((card) => (
            <MetricCard key={card.key} card={card} kpi={data?.kpis?.[card.key]} />
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Hızlı İşlemler</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((qa) => (
            <Link
              key={qa.link}
              to={qa.link}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              {qa.label}
            </Link>
          ))}
        </div>
      </div>

      {systemStatus && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-blue-900">
              🔧 Soft Launch Sistem Durumu
            </h2>
            <span
              className="text-xs text-blue-700 cursor-help"
              title="Bu ayarlar environment üzerinden yönetilir"
            >
              ℹ️ Read-only
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatusBadge
              label="Soft Launch"
              value={systemStatus.SOFT_LAUNCH}
            />
            <StatusBadge
              label="Invite Only"
              value={systemStatus.SOFT_LAUNCH_INVITE_ONLY}
            />
            <StatusBadge
              label="Rate Limiting"
              value={systemStatus.RATE_LIMIT_ENABLED}
            />
            <StatusBadge
              label="Promotions"
              value={systemStatus.FEATURE_PROMOTIONS}
            />
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-600">Environment</span>
              <span className="text-sm font-semibold text-slate-900">
                {systemStatus.NODE_ENV}
              </span>
            </div>
          </div>
        </div>
      )}

      {data?.warnings?.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-semibold">
            <span>⚠️ Uyarılar</span>
          </div>
          <ul className="space-y-1 text-sm text-amber-900">
            {data.warnings.map((w) => (
              <li key={w.code} className="flex items-center justify-between gap-2">
                <span>{w.message}</span>
                {w.link && (
                  <Link className="text-indigo-700 font-semibold" to={w.link}>
                    İncele →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Güven & Risk Özeti</h2>
          <div className="text-xs text-slate-500">
            {risk?.range?.from
              ? `${new Date(risk.range.from).toLocaleDateString("tr-TR")} - ${new Date(
                  risk.range.to
                ).toLocaleDateString("tr-TR")}`
              : "Son 7 gün"}
          </div>
        </div>
        {riskLoading ? (
          <TableSkeleton rows={1} columns={3} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Toplam İlan" value={risk?.totalListings ?? "—"} />
              <StatCard label="Yüksek Risk" value={risk?.riskDistribution?.high ?? "—"} highlight />
              <StatCard label="Spam Risk" value={risk?.spamRisk ?? "—"} />
              <StatCard label="Fiyat Anomali" value={risk?.priceAnomaly ?? "—"} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">En Sık Flag'ler</h3>
                {risk?.topFlags?.length ? (
                  <ul className="space-y-1 text-sm text-slate-800">
                    {risk.topFlags.map((f) => (
                      <li key={f._id || f.code} className="flex justify-between">
                        <span>{f._id || "-"}</span>
                        <span className="text-slate-500">{f.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-600">Kayıt yok.</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">En Çok Flag Alan İlanlar</h3>
                {risk?.topListings?.length ? (
                  <ul className="space-y-1 text-sm text-slate-800">
                    {risk.topListings.map((l) => (
                      <li key={l._id} className="flex items-center justify-between gap-2">
                        <span className="truncate">{l.title || l._id}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Risk: {l.riskLevel || "-"}</span>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                            {l.flagsCount || 0} flag
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-600">Kayıt yok.</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/admin/pending-listings?riskLevel=high"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Yüksek riskli ilanları incele
              </Link>
              <Link
                to="/admin/pending-listings?flag=SPAM_RATE_LIMIT"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Spam sinyalli ilanlar
              </Link>
              <Link
                to="/admin/pending-listings?flag=PRICE_TOO_HIGH"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Fiyat anomalisi
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">En Çok Red Alan Kategoriler</h3>
          {data?.moderation?.rejectCategories?.length ? (
            <ul className="space-y-1 text-sm text-slate-800">
              {data.moderation.rejectCategories.map((c) => (
                <li key={c.category || "other"} className="flex justify-between">
                  <span>{c.category || "Diğer"}</span>
                  <span className="text-slate-500">{c.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">Kayıt yok.</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Flag Yoğunluğu (Gün)</h3>
          {data?.risk?.flagDays?.length ? (
            <ul className="space-y-1 text-sm text-slate-800">
              {data.risk.flagDays.map((d) => (
                <li key={d.day} className="flex justify-between">
                  <span>{d.day}</span>
                  <span className="text-slate-500">{d.flags}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">Kayıt yok.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-600">{label}</span>
      <span
        className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
          value
            ? "bg-emerald-100 text-emerald-800"
            : "bg-slate-200 text-slate-700"
        }`}
      >
        {value ? "✓ Aktif" : "✗ Kapalı"}
      </span>
    </div>
  );
}

function MetricCard({ card, kpi }) {
  const delta = kpi?.delta ?? 0;
  const isUp = delta >= 0;
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-slate-500 font-semibold">{card.label}</p>
        <span
          className={`text-xs font-semibold ${
            isUp ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isUp ? "↑" : "↓"} {Math.abs(delta)}%
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-1">{kpi?.value ?? 0}</p>
      <Link to={card.link} className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
        İncele →
      </Link>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${
        highlight ? "ring-2 ring-red-200" : ""
      }`}
    >
      <p className="text-xs uppercase text-slate-500 font-semibold">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value ?? 0}</p>
    </div>
  );
}
