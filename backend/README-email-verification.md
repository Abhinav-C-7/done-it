# Email Verification System for Done-it

This document explains the email verification system implemented for the Done-it application.

## Overview

The email verification system uses Nodemailer to send verification codes to users during registration. The process is as follows:

1. User enters their email and name on the registration form
2. Backend sends a 6-digit verification code to the user's email
3. User enters the verification code along with their password and other details
4. Backend verifies the code and creates the user account if valid

## Database Structure

The system uses a new table called `verification_codes` with the following structure:

```sql
CREATE TABLE verification_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
);
```

## Configuration

To use the email verification system, you need to set up the following environment variables in your `.env` file:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

For Gmail accounts, you'll need to use an "App Password" rather than your regular password. You can generate one in your Google Account security settings.

## API Endpoints

### 1. Send Verification Code

```
POST /api/verification/send-code
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "full_name": "User Name"
}
```

**Response:**
```json
{
  "message": "Verification code sent successfully",
  "email": "user@example.com"
}
```

### 2. Verify Code and Register

```
POST /api/verification/verify-and-register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "verification_code": "123456",
  "password": "securepassword",
  "full_name": "User Name",
  "phone_number": "1234567890" // optional
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "User Name"
  }
}
```

### 3. Resend Verification Code

```
POST /api/verification/resend-code
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "full_name": "User Name"
}
```

**Response:**
```json
{
  "message": "Verification code resent successfully",
  "email": "user@example.com"
}
```

## Testing

You can test the email verification system using the provided test script:

```
node test-verification.js
```

Make sure to update the test email address in the script before running it.

## Security Considerations

- Verification codes expire after 10 minutes
- Each code can only be used once
- Old unused codes for the same email are deleted when a new code is generated
- Passwords are hashed before storing in the database using bcrypt
