import axiosClient from "./axiosClient";

/**
 * Report a listing
 * @param {string} listingId - Listing ID to report
 * @param {string} reason - Reason for report
 * @param {string} [details] - Optional additional details
 * @returns {Promise<Object>} Response data
 */
export const reportListing = async (listingId, reason, details = null) => {
  const { data } = await axiosClient.post("/reports/listing", {
    listingId,
    reason,
    details,
  });
  return data;
};

/**
 * Report a user
 * @param {string} userId - User ID to report
 * @param {string} reason - Reason for report
 * @param {string} [details] - Optional additional details
 * @returns {Promise<Object>} Response data
 */
export const reportUser = async (userId, reason, details = null) => {
  const { data } = await axiosClient.post("/reports/user", {
    userId,
    reason,
    details,
  });
  return data;
};

export default {
  reportListing,
  reportUser,
};
