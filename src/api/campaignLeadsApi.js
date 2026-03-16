import axiosClient from "./axiosClient";

const campaignLeadsApi = {
  async submitLead(payload) {
    const { data } = await axiosClient.post("/campaign-leads", payload);
    return data;
  },

  async getAdminLeads(params = {}) {
    const query = new URLSearchParams();
    if (params.campaignId) query.set("campaignId", params.campaignId);
    const qs = query.toString();
    const { data } = await axiosClient.get(`/admin/campaign-leads${qs ? `?${qs}` : ""}`);
    return data?.data || [];
  },

  async updateLeadStatus(id, status) {
    const { data } = await axiosClient.patch(`/admin/campaign-leads/${id}/status`, { status });
    return data;
  },
};

export default campaignLeadsApi;
