import axiosClient from "./axiosClient";

/**
 * Matchings API Service (FAZ 16)
 */

const matchingsApi = {
  /**
   * Kurye için uygun ilanları getirir
   * GET /api/matchings/listings
   * Requires: JWT + Profile
   * Returns: Listings with matchScore, matchLevel, matchBreakdown
   */
  getMatchedListings: async () => {
    const res = await axiosClient.get("/matchings/listings");
    return res.data;
  },

  /**
   * İlan için uygun kuryeleri getirir
   * GET /api/matchings/listings/:listingId/couriers
   * Requires: JWT + (Admin OR Listing Owner)
   * Returns: Profiles with matchScore, matchLevel, matchBreakdown
   */
  getMatchedCouriers: async (listingId) => {
    const res = await axiosClient.get(`/matchings/listings/${listingId}/couriers`);
    return res.data;
  },
};

export default matchingsApi;
