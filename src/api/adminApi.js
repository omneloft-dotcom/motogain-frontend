import axiosClient from "./axiosClient";

const adminApi = {
  // ========================================
  // LISTING MODERATION
  // ========================================
  getPendingListings: async (params = {}) => {
    const res = await axiosClient.get("/admin/pending-listings", { params });
    return res.data?.listings || res.data || [];
  },

  approveListing: async (id) => {
    const res = await axiosClient.post(`/admin/listings/${id}/approve`);
    return res.data;
  },

  rejectListing: async (id, reason) => {
    const res = await axiosClient.post(`/admin/listings/${id}/reject`, { reason });
    return res.data;
  },

  recheckListingQuality: async (id) => {
    const res = await axiosClient.post(`/admin/listings/${id}/recheck-quality`);
    return res.data;
  },

  recheckListingSpam: async (id) => {
    const res = await axiosClient.post(`/admin/listings/${id}/recheck-spam`);
    return res.data;
  },

  recheckListingPrice: async (id) => {
    const res = await axiosClient.post(`/admin/listings/${id}/recheck-price`);
    return res.data;
  },

  addListingNote: async (id, note) => {
    const res = await axiosClient.post(`/admin/listings/${id}/notes`, { note });
    return res.data;
  },

  deleteListingNote: async (id, noteId) => {
    const res = await axiosClient.delete(`/admin/listings/${id}/notes/${noteId}`);
    return res.data;
  },

  getRiskSummary: async (params = {}) => {
    const res = await axiosClient.get("/admin/risk-summary", { params });
    return res.data;
  },

  // ========================================
  // 📊 REPORTS / STATISTICS
  // ========================================
  getReports: async (params = {}) => {
    const res = await axiosClient.get("/admin/reports", { params });
    return res.data;
  },
  getUserReports: async (params = {}) => {
    const res = await axiosClient.get("/admin/reports/users", { params });
    return res.data;
  },
  getListingReports: async (params = {}) => {
    const res = await axiosClient.get("/admin/reports/listings", { params });
    return res.data;
  },
  exportReports: async (params = {}) => {
    const res = await axiosClient.get("/admin/reports/export", {
      params,
      responseType: "blob",
    });
    const disposition = res.headers?.["content-disposition"] || "";
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
    const filename = filenameMatch ? filenameMatch[1] : `reports_${new Date().toISOString().slice(0, 10)}.csv`;
    return { blob: res.data, filename };
  },

  // ========================================
  // 👥 USER MANAGEMENT
  // ========================================
  getAllUsers: async () => {
    const res = await axiosClient.get("/admin/users");
    return res.data.users || [];
  },

  getUserById: async (userId) => {
    const res = await axiosClient.get(`/admin/users/${userId}`);
    return res.data.user;
  },

  updateUserRole: async (userId, role) => {
    const res = await axiosClient.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  banUser: async (userId, reason) => {
    const res = await axiosClient.post(`/admin/users/${userId}/ban`, { reason });
    return res.data;
  },

  unbanUser: async (userId) => {
    const res = await axiosClient.post(`/admin/users/${userId}/unban`);
    return res.data;
  },

  // ========================================
  // 🚫 BAN MANAGEMENT
  // ========================================
  getBanLogs: async () => {
    const res = await axiosClient.get("/admin/bans");
    return res.data.logs || [];
  },

  // ========================================
  // 📋 LISTINGS MANAGEMENT
  // ========================================
  getAllListings: async () => {
    const res = await axiosClient.get("/admin/listings");
    return res.data.listings || [];
  },

  getListingById: async (id) => {
    const res = await axiosClient.get(`/admin/listings/detail/${id}`);
    return res.data;
  },

  giveBoost: async (id) => {
    const res = await axiosClient.post(`/admin/listings/${id}/boost`);
    return res.data;
  },

  removeBoost: async (id) => {
    const res = await axiosClient.delete(`/admin/listings/${id}/boost`);
    return res.data;
  },

  getBoostMetrics: async (params = {}) => {
    const res = await axiosClient.get("/admin/boost-metrics", { params });
    return res.data;
  },

  // ========================================
  // 👤 PROFILE MANAGEMENT (Read-Only)
  // ========================================
  getAllProfiles: async () => {
    const res = await axiosClient.get("/admin/profiles");
    return res.data.profiles || [];
  },

  getProfileByUserId: async (userId) => {
    const res = await axiosClient.get(`/admin/profiles/${userId}`);
    return res.data.profile;
  },

  // ========================================
  // 🔧 SYSTEM STATUS (Read-Only)
  // ========================================
  getSystemStatus: async () => {
    const res = await axiosClient.get("/admin/system-status");
    return res.data;
  },
};

export default adminApi;
