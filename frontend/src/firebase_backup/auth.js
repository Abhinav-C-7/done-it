// Firebase authentication functions
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateProfile,
  deleteUser,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from './config';
import axios from 'axios';

// API URL from environment variables (Vite format)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Check if email exists in customers database
export const checkEmailInDatabase = async (email) => {
  try {
    console.log('Checking email in database:', email);
    const response = await axios.post(`${API_URL}/auth/check-email-exists`, { email });
    console.log('Email check response:', response.data);
    return response.data.exists;
  } catch (error) {
    console.error('Error checking email in database:', error);
    // If we can't connect to the backend, assume email doesn't exist in database
    // This allows registration to proceed even if backend is down
    return false;
  }
};

// Create a new user with email and password
export const createUserWithEmail = async (email, password) => {
  try {
    // First check if email exists in Firebase
    const methods = await fetchSignInMethodsForEmail(auth, email);
    const emailExistsInFirebase = methods.length > 0;
    console.log('Email exists in Firebase:', emailExistsInFirebase);
    
    let emailExistsInDatabase = false;
    try {
      // Then check if email exists in our database
      emailExistsInDatabase = await checkEmailInDatabase(email);
      console.log('Email exists in database:', emailExistsInDatabase);
    } catch (error) {
      console.error('Error checking email in database, proceeding with registration:', error);
      // If we can't check the database, proceed with registration
    }
    
    // If email exists in both Firebase and database, we can't register
    if (emailExistsInFirebase && emailExistsInDatabase) {
      throw new Error('This email is already registered. Please use a different email or login.');
    }
    
    let user;
    
    if (!emailExistsInFirebase) {
      try {
        // Email doesn't exist in Firebase, so create a new user
        console.log('Creating new user in Firebase:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        console.log('User created successfully:', user.uid);
        
        // Send verification email
        console.log('Sending verification email to new user');
        await sendVerificationEmail(user);
        
        return user;
      } catch (error) {
        console.error('Error creating user in Firebase:', error);
        throw error;
      }
    } else {
      // Email exists in Firebase but not in database
      console.log('Email exists in Firebase but not in database:', email);
      
      // Return a placeholder user object
      return {
        email,
        emailVerified: false,
        existsInFirebase: true
      };
    }
  } catch (error) {
    console.error('Error in createUserWithEmail:', error);
    
    // If email already exists in Firebase but not in database, we should allow this
    if (error.code === 'auth/email-already-in-use') {
      let emailExistsInDatabase = false;
      try {
        emailExistsInDatabase = await checkEmailInDatabase(email);
      } catch (dbError) {
        console.error('Error checking email in database:', dbError);
        // If we can't check the database, assume it doesn't exist there
      }
      
      if (!emailExistsInDatabase) {
        // Email exists in Firebase but not in database - this is fine
        console.log('Email exists in Firebase but not in database (from error handler)');
        
        // Return a placeholder user object instead of throwing an error
        return {
          email,
          emailVerified: false,
          existsInFirebase: true
        };
      } else {
        // Email exists in both Firebase and database
        throw new Error('This email is already registered. Please use a different email or login.');
      }
    }
    
    throw error;
  }
};

// Send verification email to user
export const sendVerificationEmail = async (user) => {
  try {
    // Configure action code settings for email verification
    const actionCodeSettings = {
      // URL you want to redirect back to
      url: `${window.location.origin}/verify-email`,
      // This must be true for email link sign-in
      handleCodeInApp: true,
    };
    
    console.log('Sending verification email with redirect URL:', actionCodeSettings.url);
    
    // Store the email in localStorage for verification
    localStorage.setItem('emailForSignIn', user.email);
    
    // Send email verification link
    await sendEmailVerification(user, actionCodeSettings);
    console.log('Verification email sent successfully');
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Check if the current URL is an email verification link
export const isEmailVerificationLink = (url) => {
  const isVerificationLink = isSignInWithEmailLink(auth, url);
  console.log('Checking if URL is verification link:', url, isVerificationLink);
  return isVerificationLink;
};

// Complete the sign-in process with email link
export const completeSignInWithEmailLink = async (email, url) => {
  try {
    console.log('Completing sign-in with email link:', email, url);
    const result = await signInWithEmailLink(auth, email, url);
    
    // Clear email from storage
    localStorage.removeItem('emailForSignIn');
    
    return result.user;
  } catch (error) {
    console.error('Error completing sign-in with email link:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
