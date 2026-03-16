import axiosClient from "./axiosClient";

/**
 * Dashboard API Service (FAZ 15)
 */

const dashboardApi = {
  /**
   * Get user dashboard summary
   * Returns: totalListings, activeListings, agreedListings, closedListings, unreadMessagesCount, favoriteCount
   */
  getSummary: async () => {
    const res = await axiosClient.get("/dashboard/summary");
    return res.data;
  },
};

export default dashboardApi;
