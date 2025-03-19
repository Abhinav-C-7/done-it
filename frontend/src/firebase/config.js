// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeWSMOLWTkJUxXA0mGBvZ3_2BXP9NQcB0",
  authDomain: "done-it-879af.firebaseapp.com",
  projectId: "done-it-879af",
  storageBucket: "done-it-879af.appspot.com",
  messagingSenderId: "267928427692",
  appId: "1:267928427692:web:206ce74aaa7c2df66e5309"
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
