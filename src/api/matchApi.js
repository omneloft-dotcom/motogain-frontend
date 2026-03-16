import axiosClient from "./axiosClient";

/**
 * FAZ 16: Matching API Service
 */

const matchApi = {
  /**
   * Get matched couriers for a listing
   * GET /api/match/listing/:listingId
   */
  getMatchedCouriersForListing: async (listingId) => {
    const res = await axiosClient.get(`/match/listing/${listingId}`);
    return res.data;
  },

  /**
   * Get matched listings for current courier
   * GET /api/match/courier/me
   */
  getMatchedListingsForMe: async () => {
    const res = await axiosClient.get("/match/courier/me");
    return res.data;
  },
};

export default matchApi;
