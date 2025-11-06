// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const messaging = getMessaging(app);
export const storage = getStorage(app);