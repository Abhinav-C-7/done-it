# Firebase Email Verification Setup

This document explains how to set up Firebase for email verification in the Done-it application.

## Steps to Configure Firebase

1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Give your project a name (e.g., "Done-it")

2. **Register your Web App**:
   - In the Firebase console, click on the web icon (</>) to add a web app
   - Register your app with a nickname (e.g., "Done-it Web")
   - Copy the Firebase configuration object that looks like this:

   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

3. **Update the Firebase Configuration**:
   - Open `src/firebase/config.js`
   - Replace the placeholder values with your actual Firebase configuration

4. **Enable Email Authentication**:
   - In the Firebase console, go to "Authentication" > "Sign-in method"
   - Enable "Email/Password" provider
   - Save the changes

5. **Customize Email Templates** (Optional):
   - In the Firebase console, go to "Authentication" > "Templates"
   - Customize the "Verification email" template to match your branding

## Database Schema Updates

The following columns have been added to the `customers` table:

- `email_verified` (BOOLEAN): Indicates whether the user's email has been verified
- `firebase_uid` (VARCHAR): Stores the Firebase user ID for authentication purposes

You can apply these changes by running the SQL migration script:

```
psql -d ondemand_service -f backend/migrations/add_email_verification.sql
```

## How Email Verification Works

1. When a user registers, a Firebase user is created and a verification email is sent
2. The user's information is stored temporarily in localStorage
3. When the user clicks the verification link in the email, they're directed to the `/verify-email` page
4. The verification page completes the Firebase authentication and creates the user in the backend database
5. The user is then redirected to the login page to sign in with their verified account

## Troubleshooting

- If verification emails aren't being received, check your spam folder
- Ensure your Firebase configuration is correct in `src/firebase/config.js`
- Check the browser console for any Firebase-related errors
- Verify that the email templates in Firebase are properly configured
