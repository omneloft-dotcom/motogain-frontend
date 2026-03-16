// src/api/apiClient.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Single-flight protection for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor — Add access token to all requests
api.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem("auth");
    let accessToken = null;

    try {
      const authObj = auth ? JSON.parse(auth) : null;
      accessToken = authObj?.accessToken;
    } catch {
      accessToken = localStorage.getItem("motogain_token"); // Fallback for old format
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — Handle 401 with refresh + retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for auth endpoints to prevent loops
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/logout');

    if (isAuthEndpoint) {
      // Auth endpoint failed, return error (don't refresh)
      return Promise.reject(error);
    }

    // If already retried after refresh and still 401 → logout (prevent loop)
    if (error.response?.status === 401 && originalRequest._retry) {
      // Clear queue and signal logout by rejecting with logout marker
      processQueue(new Error('Session expired'), null);
      isRefreshing = false;
      return Promise.reject({ ...error, _shouldLogout: true });
    }

    // Handle first 401 — attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another request is refreshing, queue this one
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retry = true;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const auth = localStorage.getItem("auth");
        const authObj = auth ? JSON.parse(auth) : null;
        const refreshToken = authObj?.refreshToken;

        if (!refreshToken) {
          // No refresh token, signal logout
          processQueue(new Error('No refresh token'), null);
          isRefreshing = false;
          return Promise.reject({ ...error, _shouldLogout: true });
        }

        // Call refresh endpoint
        const response = await axios.post(
          `http://localhost:5000/api/auth/refresh`,
          { refreshToken },
          { timeout: 10000 }
        );

        // Validate response
        if (!response.data?.success || !response.data?.data?.accessToken) {
          throw new Error('Invalid refresh response');
        }

        const newAuth = {
          ...authObj,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
        };

        // Update localStorage
        localStorage.setItem("auth", JSON.stringify(newAuth));

        // Process queued requests with new token
        processQueue(null, newAuth.accessToken);
        isRefreshing = false;

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAuth.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, signal logout
        processQueue(refreshError, null);
        isRefreshing = false;
        return Promise.reject({ ...error, _shouldLogout: true });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
