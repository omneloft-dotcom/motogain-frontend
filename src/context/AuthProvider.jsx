import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import authApi from "../api/authApi";
import favoritesApi from "../api/favoritesApi";
import notificationsApi from "../api/notificationsApi";
import { requestPushToken } from "../services/pushClient";

const AuthContext = createContext(null);

// Helper: Get stored auth object from localStorage
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Helper: Migrate old localStorage format to new format
const migrateOldAuth = () => {
  try {
    const oldToken = localStorage.getItem("token");
    const oldUser = localStorage.getItem("user");

    if (oldToken && !localStorage.getItem("auth")) {
      const authData = {
        accessToken: oldToken,
        refreshToken: oldToken,
        user: oldUser ? JSON.parse(oldUser) : null,
      };
      localStorage.setItem("auth", JSON.stringify(authData));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("Migrated old auth format to new format");
    }
  } catch (err) {
    console.error("Auth migration error:", err);
  }
};

// 🛡️ SAFE: Merge user data, preserving critical fields if new data is partial
const safeMergeUser = (prev, next) => {
  if (!next) return prev;
  if (!prev) return next;

  // If IDs differ, this is a different user (session corruption)
  if (prev._id && next._id && prev._id !== next._id) {
    return null; // Signal corruption
  }

  // Merge, but preserve role if next doesn't have it
  return {
    ...prev,
    ...next,
    role: next?.role ?? prev?.role,
    _id: next?._id ?? prev?._id,
    email: next?.email ?? prev?.email,
  };
};

export default function AuthProvider({ children }) {
  // Migrate old localStorage format if needed (one-time cleanup)
  migrateOldAuth();

  const storedAuth = getStoredAuth();
  const [user, setUser] = useState(storedAuth?.user || null);
  const [token, setToken] = useState(storedAuth?.accessToken || null);
  const [loading, setLoading] = useState(true);
  const [favoriteListings, setFavoriteListings] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [pushRegistered, setPushRegistered] = useState(false);

  // Guard against React.StrictMode double-execution
  const initRef = useRef(false);

  // 🔐 LOGIN
  const login = async (email, password) => {
    const res = await authApi.login({ email, password });

    const authData = {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      user: res.user,
    };

    localStorage.setItem("auth", JSON.stringify(authData));
    setToken(authData.accessToken);
    setUser(authData.user);

    // Load favorites (non-blocking)
    try {
      const favs = await favoritesApi.getMyFavorites();
      setFavoriteListings(favs || []);
      setFavoriteIds(favs?.map((f) => f.listingId || f._id) || []);
    } catch (favErr) {
      console.error("[AuthProvider] Failed to load favorites after login (non-fatal):", favErr.message);
      setFavoriteListings([]);
      setFavoriteIds([]);
    }

    await registerDeviceIfPossible();
  };

  // 🔐 GOOGLE LOGIN
  const googleLogin = async (idToken) => {
    const res = await authApi.googleLogin({ idToken });

    const authData = {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      user: res.user,
    };

    localStorage.setItem("auth", JSON.stringify(authData));
    setToken(authData.accessToken);
    setUser(authData.user);

    // Load favorites (non-blocking)
    try {
      const favs = await favoritesApi.getMyFavorites();
      setFavoriteListings(favs || []);
      setFavoriteIds(favs?.map((f) => f.listingId || f._id) || []);
    } catch (favErr) {
      console.error("[AuthProvider] Failed to load favorites after Google login (non-fatal):", favErr.message);
      setFavoriteListings([]);
      setFavoriteIds([]);
    }

    await registerDeviceIfPossible();
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("auth");
    setToken(null);
    setUser(null);
    setFavoriteListings([]);
    setFavoriteIds([]);
  };

  // 🔐 SETUP API ERROR HANDLER (for 401 refresh failures)
  useEffect(() => {
    const handleAxiosError = (error) => {
      // apiClient marks logout-needed errors with _shouldLogout
      if (error?._shouldLogout && token) {
        console.warn("[AuthProvider] Session expired (refresh failed), logging out");
        logout();
      }
    };

    // We can't intercept axios errors here directly, but we can set a global handler
    // The logout will happen via the _shouldLogout flag and component error handling
    // See: ProtectedRoute and AdminRoute for where API calls are made
  }, [token]);

  // ⭐ CHECK IF LISTING IS FAVORITE
  const isFavorite = useCallback((listingId) => {
    return favoriteIds.includes(listingId);
  }, [favoriteIds]);

  // ⭐ TOGGLE FAVORITE (FAZ 18: başarı/hata durumu döndür)
  const toggleFavorite = async (listingId) => {
    try {
      const wasInFavorites = favoriteIds.includes(listingId);
      await favoritesApi.toggleFavorite(listingId);
      const favs = await favoritesApi.getMyFavorites();
      setFavoriteListings(favs || []);
      setFavoriteIds(favs?.map((f) => f.listingId || f._id) || []);

      // FAZ 18: Kullanıcıya geri bildirim için mesaj döndür
      return {
        success: true,
        action: wasInFavorites ? "removed" : "added",
      };
    } catch (err) {
      console.error("Toggle favorite error:", err);
      return { success: false };
    }
  };

  // 🔄 REFRESH USER (FAZ 14.1)
  const refreshUser = async () => {
    try {
      const me = await authApi.getMe();

      // 🔒 CRITICAL: Session corruption detection (SAFE MODE)
      const storedAuth = getStoredAuth();
      if (!storedAuth?.user) {
        console.warn("[AuthProvider] No stored user in refreshUser");
        return;
      }

      const merged = safeMergeUser(storedAuth.user, me);

      // Logout only if definite corruption (different user ID)
      if (merged === null) {
        console.error("[AuthProvider] ⚠️ USER ID MISMATCH in refreshUser - LOGGING OUT!", {
          storedId: storedAuth.user?._id,
          fetchedId: me?._id,
          message: "Different user detected. Forcing logout."
        });
        logout();
        return;
      }

      setUser(merged);

      // Update auth object in localStorage with merged user data
      if (storedAuth) {
        storedAuth.user = merged;
        localStorage.setItem("auth", JSON.stringify(storedAuth));
      }
    } catch (err) {
      console.error("Refresh user error:", err);
    }
  };

  const registerDeviceIfPossible = async () => {
    try {
      if (!token) return;
      const deviceToken = await requestPushToken();
      if (!deviceToken) return;
      await notificationsApi.registerDevice(deviceToken, "web");
      setPushRegistered(true);
    } catch (err) {
      // silent fail - push is optional
    }
  };

  // 🔄 Sayfa yenilenince kullanıcıyı getir
  useEffect(() => {
    const init = async () => {
      // Prevent double-execution in React.StrictMode
      if (initRef.current) {
        return;
      }
      initRef.current = true;

      const storedAuth = getStoredAuth();

      if (!storedAuth?.accessToken) {
        setLoading(false);
        return;
      }

      // Set initial auth state from localStorage
      setToken(storedAuth.accessToken);
      setUser(storedAuth.user);

      try {
        // Verify token is still valid by fetching fresh user data
        const me = await authApi.getMe();

        // 🔒 CRITICAL: Session corruption detection (SAFE MODE)
        // Merge user data, check for corruption
        const merged = safeMergeUser(storedAuth.user, me);

        // Logout only if definite corruption (different user ID)
        if (merged === null) {
          console.error("[AuthProvider] ⚠️ USER ID MISMATCH - LOGGING OUT!", {
            storedId: storedAuth.user?._id,
            fetchedId: me?._id,
            message: "Different user detected. Forcing logout."
          });
          logout();
          setLoading(false);
          return;
        }

        // Warn if role differs (but don't logout - could be partial response)
        if (storedAuth.user?.role && me?.role && storedAuth.user.role !== me.role) {
          console.warn("[AuthProvider] ⚠️ Role changed:", {
            oldRole: storedAuth.user.role,
            newRole: me.role,
            userId: me._id,
            message: "Role updated from server."
          });
        }

        setUser(merged);

        // Update stored auth with merged user data
        storedAuth.user = merged;
        localStorage.setItem("auth", JSON.stringify(storedAuth));

        // Load favorites (non-blocking - don't fail auth if favorites fail)
        try {
          const favs = await favoritesApi.getMyFavorites();
          setFavoriteListings(favs || []);
          setFavoriteIds(favs?.map((f) => f.listingId || f._id) || []);
        } catch (favErr) {
          console.error("[AuthProvider] Failed to load favorites (non-fatal):", favErr.message);
          // Continue with empty favorites - don't break auth init
          setFavoriteListings([]);
          setFavoriteIds([]);
        }

        if (!pushRegistered) {
          await registerDeviceIfPossible();
        }
      } catch (err) {
        // Token invalid (or refresh failed with _shouldLogout flag)
        // Logout if: marked for logout, 401, or token error
        if (err?._shouldLogout || err.response?.status === 401) {
          console.warn("[AuthProvider] Token invalid/expired on init, logging out");
          logout();
        } else {
          // Network error or other API error, don't force logout yet
          console.error("[AuthProvider] Init error:", err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    init();

    // Cleanup function to reset guard on unmount (for hot-reload in dev)
    return () => {
      initRef.current = false;
    };
  }, []); // Run only once on mount

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      googleLogin,
      logout,
      refreshUser,
      favorites: favoriteIds,
      favoriteListings,
      isFavorite,
      toggleFavorite,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin" || user?.role === "superadmin",
    }),
    [user, token, loading, favoriteIds, favoriteListings]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ✅ TEK VE DOĞRU HOOK
export const useAuth = () => useContext(AuthContext);
