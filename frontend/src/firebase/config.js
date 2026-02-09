// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
let auth;

try {
  // Check if Firebase app has already been initialized
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Set persistence to local to maintain the session
  // and configure auth settings
  auth.useDeviceLanguage();
} catch (error) {
  // If Firebase app is already initialized, get the existing app
  if (error.code === 'app/duplicate-app') {
    console.log('Firebase already initialized, using existing app');
    app = initializeApp();
    auth = getAuth(app);
  } else {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

export { app, auth };
