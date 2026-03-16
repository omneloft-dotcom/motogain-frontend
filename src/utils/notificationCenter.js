export const NOTIFICATION_CENTER_SYNC_EVENT = "notification-center:sync";

export const resolveInAppBody = (item) => item?.longBody || item?.body || "-";

export const normalizeNotificationsFeed = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const normalizeUnreadCount = (payload) => {
  if (typeof payload === "number") return payload;
  if (typeof payload?.unreadCount === "number") return payload.unreadCount;
  if (typeof payload?.count === "number") return payload.count;
  return 0;
};

const normalize = (value) => String(value || "").trim().toLowerCase();

export const resolveNotificationTargetPath = (item) => {
  const type = normalize(item?.type);
  const deeplink = normalize(item?.deeplink || item?.metadata?.deeplink);
  const chatId = item?.metadata?.chatId || item?.chatId;
  const listingId = item?.metadata?.listingId || item?.listingId;

  if (type === "message") {
    if (chatId) return `/messages/${chatId}`;
    return "/messages";
  }

  if (["favorite_price_drop", "listing_price_change", "listing_status"].includes(type)) {
    if (listingId) return `/listings/${listingId}`;
    return "/listings";
  }

  if (type === "admin_announcement") {
    if (deeplink === "announcements") return "/announcements";
    if (deeplink === "news") return "/news";
    if (deeplink === "earnings") return "/courier-calendar";
    if (deeplink === "home" || deeplink === "today") return "/dashboard";
    return "/announcements";
  }

  if (type === "earnings_reminder" || deeplink === "earnings") {
    return "/courier-calendar";
  }

  if (type === "security") {
    return "/profile";
  }

  if (deeplink === "announcements") return "/announcements";
  if (deeplink === "news") return "/news";
  if (deeplink === "home" || deeplink === "today") return "/dashboard";

  return "/dashboard";
};

export const emitNotificationCenterSync = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATION_CENTER_SYNC_EVENT));
};
