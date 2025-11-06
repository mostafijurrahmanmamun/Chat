// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// "Default" Firebase configuration (prevents errors)
const firebaseConfig = {
  apiKey: "AIzaSyDIw_VR0cpV4TeS9sHwmKaff0S-rNxKRUI",
  authDomain: "rownak-d6b1d.firebaseapp.com",
  databaseURL: "https://rownak-d6b1d-default-rtdb.firebaseio.com",
  projectId: "rownak-d6b1d",
  storageBucket: "rownak-d6b1d.appspot.com",
  messagingSenderId: "57490753147",
  appId: "1:57490753147:web:0efd2ece63917bf6a604de",
  measurementId: "G-94GV5J43TH"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});