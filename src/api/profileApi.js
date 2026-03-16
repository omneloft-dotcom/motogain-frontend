import axiosClient from "./axiosClient";

/**
 * Profile API Service
 * Handles courier profile CRUD operations
 */

const profileApi = {
  /**
   * Get current user's profile
   * Returns { profile: null } if doesn't exist
   */
  getMyProfile: async () => {
    const res = await axiosClient.get("/profile/me");
    return res.data;
  },

  /**
   * Create new profile
   * User can only have one profile
   */
  createProfile: async (profileData) => {
    const res = await axiosClient.post("/profile", profileData);
    return res.data;
  },

  /**
   * Update profile (upsert)
   * Creates if doesn't exist
   */
  updateProfile: async (profileData) => {
    const res = await axiosClient.put("/profile/me", profileData);
    return res.data;
  },

  /**
   * Update user info (phone, photo)
   * FAZ 14.1
   */
  updateUserInfo: async (userData) => {
    const res = await axiosClient.put("/auth/update-user", userData);
    return res.data;
  },

  /**
   * Get Cloudinary signature for photo upload
   * FAZ 14.1
   */
  getCloudinarySignature: async () => {
    const res = await axiosClient.get("/upload/signature");
    return res.data;
  },
};

export default profileApi;
