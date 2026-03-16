import { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import { StatCardSkeleton } from "../../components/common/Skeleton";
import { Link } from "react-router-dom";

const tabs = ["Genel Durum", "Kullanıcılar", "İlanlar", "Etkileşim", "Arama", "Moderasyon", "Risk"];

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(getDateString(7));
  const [to, setTo] = useState(getDateString(0));
  const [activeTab, setActiveTab] = useState("Genel Durum");
  const [viewMode, setViewMode] = useState("today"); // today | weekly
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [boostMetrics, setBoostMetrics] = useState(null);
  const [boostWindow, setBoostWindow] = useState("7");
  const [boostLoading, setBoostLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReports({ from, to });
      setStats(res);
    } catch (err) {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoostMetrics = async (windowParam = boostWindow) => {
    try {
      setBoostLoading(true);
      const res = await adminApi.getBoostMetrics({ window: windowParam });
      setBoostMetrics(res);
    } catch (err) {
      setBoostMetrics(null);
    } finally {
      setBoostLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBoostMetrics(boostWindow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boostWindow]);
  const handleRangeApply = () => {
    fetchReports();
  };

  const handleExport = async () => {
    try {
      setExportError(null);
      setExporting(true);
      const { blob, filename } = await adminApi.exportReports({ from, to });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `reports_${to || getDateString(0)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setExportError("CSV indirilemedi");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">İstatistikler ve Raporlar</h1>
            <p className="text-slate-600">İstatistikler yükleniyor...</p>
          </div>
          <DateFilter from={from} to={to} setFrom={setFrom} setTo={setTo} onApply={handleRangeApply} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">İstatistikler yüklenemedi</h2>
        <p className="text-slate-600 max-w-md">Bir hata oluştu. Lütfen tarih aralığını kontrol edin.</p>
      </div>
    );
  }

  const userDailyTotal =
    stats.users?.daily?.reduce((acc, d) => acc + (d.count || 0), 0) ?? 0;
  const listingDailyTotal =
    stats.listings?.daily?.reduce((acc, d) => acc + (d.count || 0), 0) ?? 0;
  const pendingDailyTotal =
    stats.listings?.pendingDaily?.reduce((acc, d) => acc + (d.count || 0), 0) ?? 0;
  const riskDistribution =
    stats.risk?.timeseries?.reduce(
      (acc, d) => ({
        low: acc.low + (d.low || 0),
        medium: acc.medium + (d.medium || 0),
        high: acc.high + (d.high || 0),
      }),
      { low: 0, medium: 0, high: 0 }
    ) || { low: 0, medium: 0, high: 0 };
  const weeklyKpis = stats.weekly?.kpis || {};
  const kpiSource = viewMode === "weekly" ? weeklyKpis : stats.kpis || {};
  const snapshot = stats.snapshot?.today;
  const avgWait = stats.moderation?.avgWaitTime;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">İstatistikler ve Raporlar</h1>
          <p className="text-slate-600">
            {formatRange(stats.range?.from, stats.range?.to)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <DateFilter from={from} to={to} setFrom={setFrom} setTo={setTo} onApply={handleRangeApply} />
          <ExportButton onClick={handleExport} loading={exporting} error={exportError} />
        </div>
      </div>

      {snapshot && (
        <SnapshotCard
          title="Bugün Özeti"
          data={[
            { label: "Yeni Kullanıcı", value: snapshot.newUsers },
            { label: "Yeni İlan", value: snapshot.newListings },
            { label: "Bekleyen", value: snapshot.pending },
            { label: "Yüksek Risk", value: snapshot.highRisk },
            {
              label: "Ortalama İnceleme",
              value: formatWait(snapshot.avgWaitTime),
            },
          ]}
        />
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
              activeTab === tab
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Genel Durum" && (
        <CardSection title="Genel Durum">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            <KpiCard
              label="Kullanıcı"
              value={kpiSource.users?.value ?? 0}
              delta={viewMode === "weekly" ? kpiSource.users?.deltaPercent : kpiSource.users?.delta}
              direction={
                viewMode === "weekly"
                  ? kpiSource.users?.direction
                  : kpiSource.users
                  ? kpiSource.users?.delta >= 0
                    ? "up"
                    : "down"
                  : undefined
              }
              periodLabel={viewMode === "weekly" ? "WoW" : "DoD"}
            />
            <KpiCard
              label="İlan"
              value={kpiSource.listings?.value ?? 0}
              delta={viewMode === "weekly" ? kpiSource.listings?.deltaPercent : kpiSource.listings?.delta}
              direction={
                viewMode === "weekly"
                  ? kpiSource.listings?.direction
                  : kpiSource.listings
                  ? kpiSource.listings?.delta >= 0
                    ? "up"
                    : "down"
                  : undefined
              }
              periodLabel={viewMode === "weekly" ? "WoW" : "DoD"}
            />
            <KpiCard
              label="Pending"
              value={kpiSource.pending?.value ?? 0}
              delta={viewMode === "weekly" ? kpiSource.pending?.deltaPercent : kpiSource.pending?.delta}
              direction={
                viewMode === "weekly"
                  ? kpiSource.pending?.direction
                  : kpiSource.pending
                  ? kpiSource.pending?.delta >= 0
                    ? "up"
                    : "down"
                  : undefined
              }
              periodLabel={viewMode === "weekly" ? "WoW" : "DoD"}
            />
            <KpiCard
              label="Yüksek Riskli"
              value={kpiSource.highRisk?.value ?? 0}
              delta={viewMode === "weekly" ? kpiSource.highRisk?.deltaPercent : kpiSource.highRisk?.delta}
              direction={
                viewMode === "weekly"
                  ? kpiSource.highRisk?.direction
                  : kpiSource.highRisk
                  ? kpiSource.highRisk?.delta >= 0
                    ? "up"
                    : "down"
                  : undefined
              }
              periodLabel={viewMode === "weekly" ? "WoW" : "DoD"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ListTable
              title="Günlük Yeni Kullanıcı"
              items={stats.users?.daily || []}
              columns={[
                { key: "_id", label: "Tarih" },
                { key: "count", label: "Adet" },
              ]}
              emptyText="Veri yok"
            />
            <ListTable
              title="Günlük Yeni İlan"
              items={stats.listings?.daily || []}
              columns={[
                { key: "_id", label: "Tarih" },
                { key: "count", label: "Adet" },
              ]}
              emptyText="Veri yok"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 p-3">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Risk & Moderasyon Özeti</h3>
              <div className="space-y-1 text-sm text-slate-800">
                <div>Low: {riskDistribution.low}</div>
                <div>Medium: {riskDistribution.medium}</div>
                <div>High: {riskDistribution.high}</div>
                <div>
                  Onaylanan %: {stats.moderation?.approvalRate ?? 0} | Reddedilen %:{" "}
                  {stats.moderation?.rejectionRate ?? 0}
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">En Sık Flag'ler</h3>
              <ListTable
                items={stats.risk?.topFlags || []}
                columns={[
                  { key: "code", label: "Flag" },
                  { key: "count", label: "Adet" },
                  {
                    key: "action",
                    label: "",
                    render: (item) => (
                      <Link
                        to={`/admin/pending-listings?flag=${item.code}`}
                        className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold"
                      >
                        İncele
                      </Link>
                    ),
                  },
                ]}
                emptyText="Kayıt yok"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ListTable
              title="En Çok Favori Alan"
              items={(stats.interactions?.topFavorites || []).slice(0, 5)}
              columns={[
                { key: "title", label: "İlan" },
                { key: "count", label: "Favori" },
              ]}
              emptyText="Kayıt yok"
            />
            <ListTable
              title="En Çok Mesaj Alan"
              items={(stats.interactions?.topMessages || []).slice(0, 5)}
              columns={[
                { key: "title", label: "İlan" },
                { key: "count", label: "Mesaj" },
              ]}
              emptyText="Kayıt yok"
            />
          </div>
        </CardSection>
      )}

      {activeTab === "Kullanıcılar" && (
        <CardSection title="Kullanıcı Raporları">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <MiniStat label="Yeni Kullanıcı (günlük toplam)" value={userDailyTotal} />
            <MiniStat label="Toplam Kullanıcı" value={stats.users?.total ?? 0} />
            <MiniStat label="Günlük ortalama" value={avg(stats.users?.daily)} suffix="/gün" />
          </div>
          <ListTable
            items={stats.users?.daily || []}
            columns={[
              { key: "_id", label: "Tarih" },
              { key: "count", label: "Yeni Kullanıcı" },
            ]}
          />
        </CardSection>
      )}

      {activeTab === "İlanlar" && (
        <CardSection title="İlan Raporları">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <MiniStat label="Yeni İlan (günlük toplam)" value={listingDailyTotal} />
            <MiniStat label="Toplam İlan" value={stats.listings?.total ?? 0} />
            <MiniStat label="Günlük Pending" value={pendingDailyTotal} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ListTable
              title="Günlük Yeni İlan"
              items={stats.listings?.daily || []}
              columns={[
                { key: "_id", label: "Tarih" },
                { key: "count", label: "Yeni İlan" },
              ]}
            />
            <ListTable
              title="Günlük Pending"
              items={stats.listings?.pendingDaily || []}
              columns={[
                { key: "_id", label: "Tarih" },
                { key: "count", label: "Pending" },
              ]}
            />
          </div>
        </CardSection>
      )}

      {activeTab === "Etkileşim" && (
        <CardSection title="Etkileşim Raporları">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ListTable
              title="En Çok Favori Alan"
              items={stats.interactions?.topFavorites || []}
              columns={[
                { key: "title", label: "İlan" },
                { key: "count", label: "Favori" },
              ]}
              emptyText="Kayıt yok"
            />
            <ListTable
              title="En Çok Görüntülenen"
              items={stats.interactions?.topViews || []}
              columns={[
                { key: "title", label: "İlan" },
                { key: "count", label: "Görüntüleme" },
              ]}
              emptyText="Takip verisi yok"
            />
            <ListTable
              title="En Çok Mesaj Alan"
              items={stats.interactions?.topMessages || []}
              columns={[
                { key: "title", label: "İlan" },
                { key: "count", label: "Mesajlaşma" },
              ]}
              emptyText="Kayıt yok"
            />
          </div>
          <div className="mt-3 text-sm">
            <Link to="/admin/listings" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Tüm ilanları incele
            </Link>
          </div>
        </CardSection>
      )}

      {activeTab === "Arama" && (
        <CardSection title="Arama Raporları">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ListTable
              title="En Çok Aranan Kategoriler"
              items={stats.searches?.topCategories || []}
              columns={[
                { key: "category", label: "Kategori" },
                { key: "count", label: "Arama" },
              ]}
              emptyText="Kayıt yok"
            />
            <ListTable
              title="En Çok Aranan Kelimeler"
              items={stats.searches?.topKeywords || []}
              columns={[
                { key: "keyword", label: "Kelimeler" },
                { key: "count", label: "Arama" },
              ]}
              emptyText="Kayıt yok"
            />
          </div>
        </CardSection>
      )}

      {activeTab === "Moderasyon" && (
        <CardSection title="Moderasyon Raporları">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            <MiniStat label="Onaylanan" value={stats.moderation?.approved ?? 0} />
            <MiniStat label="Reddedilen" value={stats.moderation?.rejected ?? 0} />
            <MiniStat label="Onay Oranı" value={stats.moderation?.approvalRate ?? 0} suffix="%" />
            <MiniStat label="Red Oranı" value={stats.moderation?.rejectionRate ?? 0} suffix="%" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <WaitStat label="Ortalama İnceleme (Bugün)" wait={avgWait?.today} />
            <WaitStat label="Ortalama İnceleme (Son 7 Gün)" wait={avgWait?.last7Days} />
            <WaitStat label="Genel Ortalama" wait={avgWait?.overall} />
          </div>
          <ListTable
            title="En Sık Red Sebepleri"
            items={stats.moderation?.topRejectReasons || []}
            columns={[
              { key: "reason", label: "Sebep" },
              { key: "count", label: "Adet" },
            ]}
            emptyText="Kayıt yok"
          />
          <div className="mt-3 text-sm">
            <Link to="/admin/pending-listings" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Pending ilanları incele
            </Link>
          </div>
        </CardSection>
      )}

      {activeTab === "Risk" && (
        <CardSection title="Risk Raporları">
          <ListTable
            items={stats.risk?.timeseries || []}
            columns={[
              { key: "_id", label: "Tarih" },
              { key: "low", label: "Low" },
              { key: "medium", label: "Medium" },
              { key: "high", label: "High" },
            ]}
            emptyText="Kayıt yok"
          />
          <div className="mt-3 text-sm">
            <Link to="/admin/pending-listings?riskLevel=high" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Yüksek riskli ilanları incele
            </Link>
          </div>
        </CardSection>
      )}

      <CardSection title="Boost Etki Analizi">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">
            Son {boostMetrics?.windowDays || boostWindow} gün
          </p>
          <select
            value={boostWindow}
            onChange={(e) => setBoostWindow(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="7">7 gün</option>
            <option value="14">14 gün</option>
            <option value="30">30 gün</option>
          </select>
        </div>

        {boostLoading ? (
          <div className="text-sm text-slate-600">Metrikler yükleniyor...</div>
        ) : !boostMetrics ? (
          <div className="text-sm text-red-600">Boost metrikleri alınamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-600 uppercase">
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2">Boostlu</th>
                  <th className="px-3 py-2">Normal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                <BoostRow
                  label="İlan Sayısı"
                  boosted={boostMetrics.boosted?.listingsCount ?? "—"}
                  normal={boostMetrics.normal?.listingsCount ?? "—"}
                />
                <BoostRow
                  label="Ortalama Favori"
                  boosted={formatMetric(boostMetrics.boosted?.avgFavorites)}
                  normal={formatMetric(boostMetrics.normal?.avgFavorites)}
                />
                <BoostRow
                  label="Ortalama Mesaj"
                  boosted={formatMetric(boostMetrics.boosted?.avgMessages)}
                  normal={formatMetric(boostMetrics.normal?.avgMessages)}
                />
                <BoostRow
                  label="İlk Etkileşime Kadar Süre (saat)"
                  boosted={formatMetric(boostMetrics.boosted?.avgTimeToFirstInteraction)}
                  normal={formatMetric(boostMetrics.normal?.avgTimeToFirstInteraction)}
                />
              </tbody>
            </table>
          </div>
        )}
      </CardSection>
    </div>
  );
}

function CardSection({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function MiniStat({ label, value, suffix }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500 uppercase font-semibold">{label}</p>
      <p className="text-xl font-bold text-slate-900">
        {value ?? 0}
        {suffix ? ` ${suffix}` : ""}
      </p>
    </div>
  );
}

function KpiCard({ label, value, delta, direction, periodLabel }) {
  const hasDelta = delta !== undefined && delta !== null;
  const trend =
    direction === "down" ? "text-red-600" : direction === "up" ? "text-emerald-600" : "text-slate-600";
  const arrow = direction === "down" ? "▼" : direction === "up" ? "▲" : "";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value ?? "—"}</p>
      {hasDelta && (
        <p className={`text-sm font-semibold mt-1 ${trend}`}>
          {arrow && <span className="mr-1">{arrow}</span>}
          {Math.abs(delta ?? 0)}% {periodLabel || ""}
        </p>
      )}
    </div>
  );
}

function WaitStat({ label, wait }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-1">{formatWait(wait)}</p>
    </div>
  );
}

function ListTable({ title, items, columns, emptyText = "Veri yok" }) {
  const data = items || [];
  return (
    <div className="rounded-lg border border-slate-200">
      {title && <div className="px-3 py-2 border-b border-slate-200 text-sm font-semibold text-slate-800">{title}</div>}
      <div className="divide-y divide-slate-200">
        {data.length === 0 && <div className="px-3 py-3 text-sm text-slate-500">{emptyText}</div>}
        {data.map((item, idx) => (
          <div key={idx} className="px-3 py-2 text-sm flex flex-wrap gap-3">
            {columns.map((col) => {
              if (col.render) {
                return (
                  <div key={col.key} className="flex-1 min-w-[120px]">
                    <p className="text-xs text-slate-500">{col.label}</p>
                    {col.render(item)}
                  </div>
                );
              }
              return (
                <div key={col.key} className="flex-1 min-w-[120px]">
                  <p className="text-xs text-slate-500">{col.label}</p>
                  <p className="font-semibold text-slate-900">{item[col.key] ?? "-"}</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DateFilter({ from, to, setFrom, setTo, onApply }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="border border-slate-200 rounded px-2 py-1 text-sm"
      />
      <span className="text-slate-500 text-sm">-</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="border border-slate-200 rounded px-2 py-1 text-sm"
      />
      <button
        onClick={onApply}
        className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
      >
        Uygula
      </button>
    </div>
  );
}

function ViewToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
      {[
        { key: "today", label: "Bugün" },
        { key: "weekly", label: "Haftalık" },
      ].map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-3 py-2 text-sm font-semibold ${
            value === opt.key ? "bg-slate-900 text-white" : "bg-white text-slate-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function BoostRow({ label, boosted, normal }) {
  return (
    <tr>
      <td className="px-3 py-2 font-semibold text-slate-800">{label}</td>
      <td className="px-3 py-2">{boosted ?? "—"}</td>
      <td className="px-3 py-2">{normal ?? "—"}</td>
    </tr>
  );
}

function formatMetric(val) {
  if (val === null || val === undefined || val === "—") return "—";
  const num = Number(val);
  if (Number.isNaN(num)) return "—";
  return num.toFixed(2);
}

function ExportButton({ onClick, loading, error }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={onClick}
        disabled={loading}
        className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "İndiriliyor..." : "CSV Dışa Aktar"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

function SnapshotCard({ title, data = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="text-xs font-semibold text-slate-500">Bugün</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {data.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs text-slate-500 uppercase font-semibold">{item.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{item.value ?? "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getDateString(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function formatRange(from, to) {
  if (!from || !to) return "Son 7 gün";
  return `${new Date(from).toLocaleDateString("tr-TR")} - ${new Date(to).toLocaleDateString("tr-TR")}`;
}

function avg(arr = []) {
  if (!arr.length) return 0;
  const total = arr.reduce((acc, a) => acc + (a.count || 0), 0);
  return Math.round(total / arr.length);
}

function formatWait(wait) {
  if (!wait || Number.isNaN(wait.minutes) || Number.isNaN(wait.hours)) return "—";
  const minutes = wait.minutes ?? 0;
  const hours = wait.hours ?? 0;
  if (minutes === 0 && hours === 0) return "—";
  return `${minutes} dk (~${hours} sa)`;
}
