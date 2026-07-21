importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// We need to pass the same config here, but it's hard to use env vars in service worker easily.
// For now, we will wait for initialization from the client side or initialize it directly if needed.
// However, Firebase 9+ with compat layer needs it directly initialized here to receive background push.
// The easiest way is to let the client register the SW, and Firebase Messaging handles it.
// Wait, Firebase requires the config to be present here for background messages.
// We can use an URL query param trick when registering, or we can just read from the message event.

firebase.initializeApp({
  apiKey: "AIzaSyAKwEYEMDyj2HuhreICVbGRQSq_rLrT5fo",
  authDomain: "telenurse-65eed.firebaseapp.com",
  projectId: "telenurse-65eed",
  storageBucket: "telenurse-65eed.firebasestorage.app",
  messagingSenderId: "304143137006",
  appId: "1:304143137006:web:43a05b88847abde6d5dbff"
});

// We will let the client initialize this service worker.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'TeleNurse Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body,
    icon: '/logo.png',
    data: {
      url: payload.data?.url || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it.
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
