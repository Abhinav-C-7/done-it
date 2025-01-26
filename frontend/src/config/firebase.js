// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxdakGhbJE9x821UFKmoGDNs789KC4mtw",
  authDomain: "done-it-ce435.firebaseapp.com",
  projectId: "done-it-ce435",
  storageBucket: "done-it-ce435.firebasestorage.app",
  messagingSenderId: "967210285300",
  appId: "1:967210285300:web:599f599a9c9debc91106a1",
  measurementId: "G-CE7GS1MJVP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };
