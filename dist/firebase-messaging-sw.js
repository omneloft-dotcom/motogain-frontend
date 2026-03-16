/* global importScripts, firebase */
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: self?.VITE_FIREBASE_API_KEY || "",
  authDomain: self?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: self?.VITE_FIREBASE_PROJECT_ID || "",
  messagingSenderId: self?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: self?.VITE_FIREBASE_APP_ID || "",
};

if (firebaseConfig.messagingSenderId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    const deepLink = payload.data?.deepLink;
    self.registration.showNotification(title || "MotoGain", {
      body: body || "",
      data: { deepLink },
    });
  });

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const deepLink = event.notification?.data?.deepLink;
    if (deepLink) {
      event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            if ("focus" in client) {
              client.postMessage({ type: "OPEN_DEEPLINK", deepLink });
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(deepLink);
          }
        })
      );
    }
  });
}




