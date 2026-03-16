import axiosClient from "./axiosClient";

const authApi = {
  async login({ email, password }) {
    const { data } = await axiosClient.post("/auth/login", {
      email,
      password,
    });
    return data; // { token, user }
  },

  async googleLogin({ idToken }) {
    const { data } = await axiosClient.post("/auth/google", {
      idToken,
    });
    return data; // { accessToken, refreshToken, user }
  },

  async getMe() {
    const { data } = await axiosClient.get("/auth/me");
    return data;
  },

  async forgotPassword(email) {
    const { data } = await axiosClient.post("/auth/forgot-password", { email });
    return data;
  },

  async resetPassword(token, newPassword) {
    const { data } = await axiosClient.post(`/auth/reset-password/${token}`, {
      newPassword,
    });
    return data;
  },

  async changePassword(currentPassword, newPassword) {
    const { data } = await axiosClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  },

  async changeEmail(newEmail, password) {
    const { data } = await axiosClient.post("/auth/change-email", {
      newEmail,
      password,
    });
    return data;
  },

  async register({ name, email, password }) {
    const { data } = await axiosClient.post("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  },

  async deactivateAccount() {
    const { data } = await axiosClient.post("/auth/deactivate-account");
    return data;
  },

  async deleteAccount(password) {
    const { data } = await axiosClient.delete("/auth/me", {
      data: { password },
    });
    return data;
  },
};

export default authApi;
