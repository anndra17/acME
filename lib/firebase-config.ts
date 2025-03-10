/**
 * Firebase configuration and initialization module.
 * This module handles the setup of Firebase services for the application.
 * @module
 */
import { initializeApp } from "firebase/app";

// IGNORE IMPORT ERROR, this is a valid import, still investigating
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Firebase configuration object containing necessary credentials and endpoints
 * @type {Object}
 */
const firebaseConfig = {
  apiKey: "AIzaSyCNoKc2k2mdhCA-yM4MVTvvqdu1Bg36wmE",
  authDomain: "acme-e3cf3.firebaseapp.com",
  projectId: "acme-e3cf3",
  storageBucket: "acme-e3cf3.firebasestorage.app",
  messagingSenderId: "871343347788",
  appId: "1:871343347788:web:f46d57147762b7ce8a3ce9",
  measurementId: "G-MP1WYMP95R"
};


// ============================================================================
// Firebase Initialization
// ============================================================================

/**
 * Initialize Firebase application instance
 * @type {FirebaseApp}
 */
const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase Authentication service
 * @type {Auth}
 */
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth };
export default app;