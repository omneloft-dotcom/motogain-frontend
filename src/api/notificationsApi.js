import axiosClient from "./axiosClient";
import { normalizeNotificationsFeed, normalizeUnreadCount } from "../utils/notificationCenter";

const notificationsApi = {
  async registerDevice(deviceToken, platform = "web") {
    const { data } = await axiosClient.post("/notifications/register-device", {
      deviceToken,
      platform,
    });
    return data;
  },

  async getFeed(limit = 20) {
    const { data } = await axiosClient.get("/notifications/feed", {
      params: { limit },
    });
    return normalizeNotificationsFeed(data?.data);
  },

  async getUnreadCount() {
    const { data } = await axiosClient.get("/notifications/unread-count");
    return normalizeUnreadCount(data?.data);
  },

  async markRead(id) {
    const { data } = await axiosClient.patch(`/notifications/${id}/read`);
    return data?.data || data;
  },

  async markAllRead() {
    const { data } = await axiosClient.patch("/notifications/read-all");
    return data?.data || data;
  },
};

export default notificationsApi;




