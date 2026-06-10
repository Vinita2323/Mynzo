import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDqQfly14F7Z4YHv6i1UVPyxuNMNYLSEuM",
  authDomain: "mynzo-814fe.firebaseapp.com",
  projectId: "mynzo-814fe",
  storageBucket: "mynzo-814fe.firebasestorage.app",
  messagingSenderId: "483350764702",
  appId: "1:483350764702:web:fdce822d002adcd3012f8f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestFcmToken = async () => {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: "BBtui-cRa__fy8b1X9vohUGOB2VkPZ5VXvwIb64WbRIlY9DROpn871PGCiuQo12-DJqhrlH4WtepMc15xpnoJns"
      });
      return token;
    } else {
      console.log('Permission not granted for notifications');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
