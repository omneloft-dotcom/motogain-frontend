import axios from "axios";
import { logError } from "../utils/errorHandler";
import { config } from "../config/env";

const getBaseURL = () => {
  // Use centralized config (production-safe, validated)
  return config.apiUrl + "/api/v1";
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Refresh lock to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

// 🔒 SECURITY FIX: Prevent multiple simultaneous logout redirects during 401 storm
let isHandlingLogout = false;

// Helper to reset logout flag (safety mechanism in case redirect fails)
const resetLogoutFlag = () => {
  setTimeout(() => {
    isHandlingLogout = false;
  }, 5000); // Reset after 5s (redirect should complete well before this)
};

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

// 🔐 Request Interceptor: Add token to every request
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const authData = localStorage.getItem("auth");
      const auth = authData ? JSON.parse(authData) : null;
      const token = auth?.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // If JSON parse fails, ignore
    }
    return config;
  },
  (error) => {
    logError("Request Interceptor", error);
    return Promise.reject(error);
  }
);

// 📡 Response Interceptor: Handle errors globally with auto-refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    logError("API Response Error", error);

    // Handle network errors
    if (!error.response) {
      // Network error or timeout
      if (error.code === "ECONNABORTED") {
        error.message = "İstek zaman aşımına uğradı";
      } else if (error.message === "Network Error") {
        error.message = "Bağlantı sorunu";
      }
      return Promise.reject(error);
    }

    // Skip refresh logic for auth endpoints to prevent infinite loops
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/logout') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/google');

    if (isAuthEndpoint && error.response?.status === 401) {
      // Auth endpoints fail → clear auth and redirect (only if not already on login)
      if (!isHandlingLogout) {
        isHandlingLogout = true;
        resetLogoutFlag(); // Safety reset in case redirect fails
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && !currentPath.startsWith("/auth/")) {
          console.warn("[axiosClient] Auth endpoint 401 - clearing session");
          localStorage.removeItem("auth");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
      return Promise.reject(error);
    }

    // 🔥 CRITICAL: If already retried after refresh and still 401 → logout (no loop)
    if (error.response?.status === 401 && originalRequest._retry) {
      console.warn("[axiosClient] 401 after refresh retry - session expired, logging out");

      // Clear queue - all pending requests will fail
      processQueue(new Error('Session expired after refresh'), null);
      isRefreshing = false;

      // 🔒 SECURITY FIX: Only trigger logout once, even if multiple 401s arrive
      if (!isHandlingLogout) {
        isHandlingLogout = true;
        resetLogoutFlag(); // Safety reset in case redirect fails

        // Trigger logout (only if not already on login)
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && !currentPath.startsWith("/auth/")) {
          localStorage.removeItem("auth");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }

      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (token expired) - FIRST TIME only
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another request is already refreshing, queue this one
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Ensure headers object exists
            if (!originalRequest.headers) {
              originalRequest.headers = {};
            }
            // 🔒 CRITICAL FIX: Explicitly inject new token (don't rely on interceptor)
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retry = true;

            // CRITICAL FIX: Ensure request data is preserved for POST/PUT/PATCH
            if (originalRequest.data && typeof originalRequest.data === 'string') {
              try {
                originalRequest.data = JSON.parse(originalRequest.data);
              } catch {
                // data is already in correct format or not JSON
              }
            }

            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token
        const authData = localStorage.getItem("auth");
        const auth = authData ? JSON.parse(authData) : null;
        const refreshToken = auth?.refreshToken;

        if (!refreshToken) {
          console.warn("[axiosClient] No refresh token available - logging out");

          // No refresh token, trigger logout
          processQueue(new Error('No refresh token'), null);
          isRefreshing = false;

          if (!isHandlingLogout) {
            isHandlingLogout = true;
            resetLogoutFlag(); // Safety reset in case redirect fails
            const currentPath = window.location.pathname;
            if (currentPath !== "/login" && !currentPath.startsWith("/auth/")) {
              localStorage.removeItem("auth");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            }
          }

          return Promise.reject(error);
        }

        // Call refresh endpoint (bypass interceptor with raw axios)
        const response = await axios.post(
          `${getBaseURL()}/auth/refresh`,
          { refreshToken },
          { timeout: 10000 }
        );

        // Validate refresh response
        if (!response.data?.success || !response.data?.data?.accessToken) {
          throw new Error('Refresh failed: Invalid response');
        }

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        console.log("[axiosClient] Token refreshed successfully, retrying original request");

        // Update stored auth with new tokens
        const updatedAuth = {
          ...auth,
          accessToken,
          refreshToken: newRefreshToken || refreshToken, // Use new refresh token if provided
        };
        localStorage.setItem("auth", JSON.stringify(updatedAuth));

        // 🔒 CRITICAL FIX: Update axios default header so ALL future requests use new token
        axiosClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        // Process queued requests with new token
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry original request with new token
        // Ensure headers object exists
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        // 🔒 CRITICAL FIX: Explicitly inject new token (don't rely on interceptor)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // CRITICAL FIX: Ensure request data is preserved for POST/PUT/PATCH
        // Some axios versions lose the body data on retry if it was already serialized
        if (originalRequest.data && typeof originalRequest.data === 'string') {
          try {
            originalRequest.data = JSON.parse(originalRequest.data);
          } catch {
            // data is already in correct format or not JSON
          }
        }

        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.warn("[axiosClient] Token refresh failed - logging out", refreshError.message);

        // Refresh failed, trigger logout
        processQueue(refreshError, null);
        isRefreshing = false;

        if (!isHandlingLogout) {
          isHandlingLogout = true;
          resetLogoutFlag(); // Safety reset in case redirect fails
          const currentPath = window.location.pathname;
          if (currentPath !== "/login" && !currentPath.startsWith("/auth/")) {
            localStorage.removeItem("auth");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
