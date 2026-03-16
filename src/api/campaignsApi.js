import axiosClient from "./axiosClient";

const campaignsApi = {
  // Public endpoints (not currently used by frontend, but available)
  async getCampaigns(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    const qs = query.toString();
    const { data } = await axiosClient.get(`/campaigns${qs ? `?${qs}` : ""}`);
    return data;
  },

  async getCampaignById(id) {
    const { data } = await axiosClient.get(`/campaigns/${id}`);
    return data;
  },

  // Admin endpoints
  async getAdminCampaigns(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.isActive !== undefined) query.set("isActive", params.isActive.toString());
    const qs = query.toString();
    const { data } = await axiosClient.get(`/admin/campaigns${qs ? `?${qs}` : ""}`);
    return data;
  },

  async createCampaign(campaignData) {
    const { data } = await axiosClient.post("/admin/campaigns", campaignData);
    return data;
  },

  async updateCampaign(id, campaignData) {
    const { data } = await axiosClient.put(`/admin/campaigns/${id}`, campaignData);
    return data;
  },

  async deleteCampaign(id) {
    const { data } = await axiosClient.delete(`/admin/campaigns/${id}`);
    return data;
  },

  async toggleCampaign(id) {
    const { data } = await axiosClient.patch(`/admin/campaigns/${id}/toggle`);
    return data;
  },
};

export default campaignsApi;
