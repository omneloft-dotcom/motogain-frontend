import axiosClient from "./axiosClient";

const adminNotificationsApi = {
  async list() {
    const { data } = await axiosClient.get("/admin/notifications");
    return data?.data || [];
  },

  async detail(id) {
    const { data } = await axiosClient.get(`/admin/notifications/${id}`);
    return data?.data || null;
  },

  async send(payload) {
    const { data } = await axiosClient.post("/admin/notifications/send", payload);
    return data;
  },
};

export default adminNotificationsApi;
