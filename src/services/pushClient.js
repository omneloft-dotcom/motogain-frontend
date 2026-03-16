let messaging;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const ensureMessaging = async () => {
  if (messaging) return messaging;
  if (!firebaseConfig.apiKey || !firebaseConfig.messagingSenderId) return null;

  // Dynamic import to avoid bundling failures when config is missing
  const [{ initializeApp }, { getMessaging }] = await Promise.all([
    import("firebase/app"),
    import("firebase/messaging"),
  ]);

  const app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  return messaging;
};

export const requestPushToken = async () => {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const msg = await ensureMessaging();
  if (!msg) return null;

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const { getToken } = await import("firebase/messaging");
    const token = await getToken(msg, { vapidKey, serviceWorkerRegistration: registration });
    return token || null;
  } catch (err) {
    console.error("push token error", err);
    return null;
  }
};

export const listenForegroundMessages = async (handler) => {
  const msg = await ensureMessaging();
  if (!msg) return () => {};
  const { onMessage } = await import("firebase/messaging");
  const unsubscribe = onMessage(msg, handler);
  return unsubscribe;
};

