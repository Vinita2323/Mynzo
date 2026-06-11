// Import the Firebase scripts inside the service worker
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Initialize Firebase App in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDqQfly14F7Z4YHv6i1UVPyxuNMNYLSEuM",
  authDomain: "mynzo-814fe.firebaseapp.com",
  projectId: "mynzo-814fe",
  storageBucket: "mynzo-814fe.firebasestorage.app",
  messagingSenderId: "483350764702",
  appId: "1:483350764702:web:fdce822d002adcd3012f8f"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // If the payload already has a notification object, Firebase automatically displays it.
  // We only need to manually show it if it's a data-only message.
  if (!payload.notification) {
    const notificationTitle = payload.data?.title || "Mynzo Notification";
    const notificationOptions = {
      body: payload.data?.body || "",
      icon: payload.data?.image || "/HopeFinal.webp"
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }

  if (payload.data?.type === 'FORCE_LOGOUT') {
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'FORCE_LOGOUT' });
      });
    });
  }
});
