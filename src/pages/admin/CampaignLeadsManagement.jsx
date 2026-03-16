import { useEffect, useMemo, useState } from "react";
import campaignsApi from "../../api/campaignsApi";
import campaignLeadsApi from "../../api/campaignLeadsApi";
import { TableSkeleton } from "../../components/common/Skeleton";
import Toast from "../../components/common/Toast";

const statusOptions = ["new", "contacted", "converted", "closed"];

const statusLabelMap = {
  new: "Yeni",
  contacted: "Iletisime Gecildi",
  converted: "Donustu",
  closed: "Kapandi",
};

const sourceLabelMap = {
  web: "Web",
  mobile: "Mobile",
};

export default function CampaignLeadsManagement() {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState("");
  const [leads, setLeads] = useState([]);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const [campaignList, leadList] = await Promise.all([
        campaignsApi.getAdminCampaigns(),
        campaignLeadsApi.getAdminLeads(),
      ]);
      setCampaigns(Array.isArray(campaignList) ? campaignList : []);
      setLeads(Array.isArray(leadList) ? leadList : []);
    } catch {
      setCampaigns([]);
      setLeads([]);
      setToast({ type: "error", message: "Basvurular yuklenemedi" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const handleFilter = async (nextCampaignId) => {
    setCampaignId(nextCampaignId);
    setLoading(true);
    try {
      const leadList = await campaignLeadsApi.getAdminLeads({ campaignId: nextCampaignId || undefined });
      setLeads(Array.isArray(leadList) ? leadList : []);
    } catch {
      setLeads([]);
      setToast({ type: "error", message: "Filtreleme yapilamadi" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    if (!id || !status) return;

    setUpdatingId(id);
    try {
      await campaignLeadsApi.updateLeadStatus(id, status);
      setLeads((prev) => prev.map((item) => (item._id === id ? { ...item, status } : item)));
      setToast({ type: "success", message: "Durum guncellendi" });
    } catch {
      setToast({ type: "error", message: "Durum guncellenemedi" });
    } finally {
      setUpdatingId(null);
    }
  };

  const campaignOptions = useMemo(
    () => (Array.isArray(campaigns) ? campaigns : []).map((c) => ({ id: c._id, title: c.title })),
    [campaigns]
  );

  if (loading && leads.length === 0) {
    return <TableSkeleton rows={8} columns={8} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kampanya Basvurulari</h1>
          <p className="text-sm text-slate-600 mt-1">Toplam {leads.length} lead kaydi listeleniyor</p>
        </div>

        <div className="w-full md:w-[320px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Kampanya Filtresi</label>
          <select
            value={campaignId}
            onChange={(e) => handleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="">Tum Kampanyalar</option>
            {campaignOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-10 text-center text-slate-500">Bu filtre icin lead kaydi bulunamadi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kampanya</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sehir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Not</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kaynak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-800 max-w-[220px] truncate" title={lead?.campaign?.title || "-"}>
                      {lead?.campaign?.title || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{lead.fullName}</td>
                    <td className="px-6 py-4 text-slate-700">{lead.phone}</td>
                    <td className="px-6 py-4 text-slate-700">{lead.city}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-[220px] truncate" title={lead.note || ""}>{lead.note || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {sourceLabelMap[lead.source] || lead.source || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        disabled={updatingId === lead._id}
                        className="px-2 py-1 border border-slate-300 rounded-md bg-white text-xs font-medium"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{statusLabelMap[status]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
