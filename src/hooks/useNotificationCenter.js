import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import notificationsApi from "../api/notificationsApi";
import {
  NOTIFICATION_CENTER_SYNC_EVENT,
  emitNotificationCenterSync,
} from "../utils/notificationCenter";

export default function useNotificationCenter({ limit = 100, enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const inFlightRef = useRef(false);

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (!enabled) {
        setLoading(false);
        return;
      }

      if (inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      if (!silent) setLoading(true);
      if (silent) setRefreshing(true);

      try {
        const [feed, unread] = await Promise.all([
          notificationsApi.getFeed(limit),
          notificationsApi.getUnreadCount(),
        ]);

        setItems(feed || []);
        setUnreadCount(unread || 0);
      } catch {
        setItems([]);
        setUnreadCount(0);
      } finally {
        inFlightRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [enabled, limit]
  );

  const markOneAsRead = useCallback(async (id) => {
    if (!id) return;

    setItems((prev) => prev.map((item) => (item?._id === id ? { ...item, isRead: true } : item)));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationsApi.markRead(id);
    } catch {
      await refresh({ silent: true });
      return;
    }

    emitNotificationCenterSync();
  }, [refresh]);

  const markAllAsRead = useCallback(async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationsApi.markAllRead();
    } catch {
      await refresh({ silent: true });
      setMarkingAll(false);
      return;
    }

    setMarkingAll(false);
    emitNotificationCenterSync();
  }, [markingAll, refresh, unreadCount]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled) return;

    const onFocus = () => refresh({ silent: true });
    const onSync = () => refresh({ silent: true });

    window.addEventListener("focus", onFocus);
    window.addEventListener(NOTIFICATION_CENTER_SYNC_EVENT, onSync);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(NOTIFICATION_CENTER_SYNC_EVENT, onSync);
    };
  }, [enabled, refresh]);

  const unreadItems = useMemo(() => items.filter((item) => !item?.isRead), [items]);

  return {
    items,
    unreadItems,
    unreadCount,
    loading,
    refreshing,
    markingAll,
    refresh,
    markOneAsRead,
    markAllAsRead,
  };
}
