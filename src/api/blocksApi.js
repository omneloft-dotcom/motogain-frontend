import axiosClient from "./axiosClient";

/**
 * Block a user
 * @param {string} userId - User ID to block
 * @returns {Promise<Object>} Response data
 */
export const blockUser = async (userId) => {
  const { data } = await axiosClient.post("/blocks", {
    userId,
  });
  return data;
};

/**
 * Unblock a user
 * @param {string} userId - User ID to unblock
 * @returns {Promise<Object>} Response data
 */
export const unblockUser = async (userId) => {
  const { data } = await axiosClient.delete(`/blocks/${userId}`);
  return data;
};

/**
 * Get list of blocked users
 * @returns {Promise<Object>} Response data
 */
export const getBlockedUsers = async () => {
  const { data } = await axiosClient.get("/blocks");
  return data;
};

/**
 * Check if a user is blocked
 * @param {string} userId - User ID to check
 * @returns {Promise<Object>} Response data with isBlocked boolean
 */
export const checkIfBlocked = async (userId) => {
  const { data } = await axiosClient.get(`/blocks/check/${userId}`);
  return data;
};

export default {
  blockUser,
  unblockUser,
  getBlockedUsers,
  checkIfBlocked,
};
