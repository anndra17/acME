// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNoKc2k2mdhCA-yM4MVTvvqdu1Bg36wmE",
  authDomain: "acme-e3cf3.firebaseapp.com",
  projectId: "acme-e3cf3",
  storageBucket: "acme-e3cf3.firebasestorage.app",
  messagingSenderId: "871343347788",
  appId: "1:871343347788:web:f46d57147762b7ce8a3ce9",
  measurementId: "G-MP1WYMP95R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export  { auth };