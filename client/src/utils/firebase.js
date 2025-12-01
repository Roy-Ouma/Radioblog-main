import { initializeApp } from "firebase/app";
import { ref,getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "masenoradio-b8bd3.firebaseapp.com",
  projectId: "masenoradio-b8bd3",
  storageBucket: "masenoradio-b8bd3.firebasestorage.app",
  messagingSenderId: "692188852303",
  appId: "1:692188852303:web:357459e8e5916084a67a3a",
  measurementId: "G-2T6RMH17G9"
};

export const app = initializeApp(firebaseConfig);
const storage = getStorage();
const storageRef = ref(storage);
