import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ---------------------------------------------------------------------------
// Fill these in from your Firebase console: Project settings > General > Your apps
// ---------------------------------------------------------------------------
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBj_fxtJFkTgw_Y1TdXl_NFA0d2ChAPNkA",
  authDomain: "fitnessapp-d0192.firebaseapp.com",
  projectId: "fitnessapp-d0192",
  storageBucket: "fitnessapp-d0192.firebasestorage.app",
  messagingSenderId: "81656833549",
  appId: "1:81656833549:web:733bb4e34f704c8d4c9744",
  measurementId: "G-0D48LGYS6M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// initializeAuth must only be called once, and needs AsyncStorage persistence on RN
// so the session survives app restarts. On web (Expo web) fall back to getAuth.
let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // initializeAuth throws if called twice (e.g. fast refresh) - reuse existing instance
    auth = getAuth(app);
  }
}

const db = getFirestore(app);

export { app, auth, db };
