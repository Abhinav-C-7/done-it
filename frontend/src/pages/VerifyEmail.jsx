import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import Navbar from "../components/Navbar";
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";
import axios from 'axios';

// API URL from environment variables (Vite format)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function VerifyEmail() {
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { register } = useAuth();
    const [pendingUser, setPendingUser] = useState({});

    useEffect(() => {
        const completeRegistration = async () => {
            try {
                console.log('Starting registration completion process');
                setVerifying(true);
                
                // Get the pending registration data
                const pendingRegistration = JSON.parse(localStorage.getItem('pendingRegistration') || '{}');
                console.log('Retrieved pending registration:', pendingRegistration);
                setPendingUser(pendingRegistration);
                
                if (!pendingRegistration.email || !pendingRegistration.full_name || !pendingRegistration.password) {
                    setError('Registration data not found. Please try registering again.');
                    setVerifying(false);
                    return;
                }
                
                try {
                    // First check if email exists in database
                    const emailCheckResponse = await axios.post(`${API_URL}/auth/check-email-exists`, {
                        email: pendingRegistration.email
                    });
                    
                    // If email already exists in database, show login message
                    if (emailCheckResponse.data.exists) {
                        setError('This email is already registered in our database. Please log in instead.');
                        setVerifying(false);
                        return;
                    }
                    
                    // Register the user in your backend
                    await register({
                        ...pendingRegistration,
                        email_verified: true
                    });
                    
                    // Clear pending registration
                    localStorage.removeItem('pendingRegistration');
                    
                    setSuccess(true);
                    setVerifying(false);
                } catch (err) {
                    console.error('Registration error:', err);
                    setError(err.message || 'Failed to complete registration. Please try again.');
                    setVerifying(false);
                }
            } catch (err) {
                console.error('Verification error:', err);
                setError(err.message || 'Failed to verify email. Please try again.');
                setVerifying(false);
            }
        };
        
        completeRegistration();
    }, [register, location]);
    
    const handleTryAgain = () => {
        navigate('/register');
    };
    
    const handleResendVerification = async () => {
        try {
            setVerifying(true);
            const user = auth.currentUser;
            
            if (!user) {
                setError('No user found. Please try registering again.');
                setVerifying(false);
                return;
            }
            
            await user.sendEmailVerification();
            setError('Verification email resent. Please check your inbox.');
            setVerifying(false);
        } catch (err) {
            console.error('Error resending verification email:', err);
            setError(err.message || 'Failed to resend verification email.');
            setVerifying(false);
        }
    };
    
    const handleConfirmRegistration = async () => {
        try {
            setVerifying(true);
            const pendingRegistration = JSON.parse(localStorage.getItem('pendingRegistration') || '{}');
            
            if (!pendingRegistration.email || !pendingRegistration.full_name || !pendingRegistration.password) {
                setError('Registration data not found. Please try registering again.');
                setVerifying(false);
                return;
            }
            
            // Register the user in your backend
            await register({
                ...pendingRegistration,
                email_verified: true
            });
            
            // Clear pending registration
            localStorage.removeItem('pendingRegistration');
            
            setSuccess(true);
            setVerifying(false);
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to complete registration. Please try again.');
            setVerifying(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar posticon={post} homeicon={homefull} profileicon={profile} hideAuthButtons={true} />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Email Verification</h2>
                    
                    {verifying ? (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p>Processing your registration...</p>
                        </div>
                    ) : success ? (
                        <div className="text-center">
                            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
                                <p className="font-semibold">Registration Successful!</p>
                                <p>Your account has been created successfully.</p>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                            >
                                Go to Login
                            </button>
                        </div>
                    ) : (
                        <div>
                            {error ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <div className="bg-blue-100 text-blue-700 p-4 rounded-lg mb-4">
                                    <p>To complete your registration, please confirm your details below:</p>
                                </div>
                            )}
                            
                            {!error && (
                                <div className="mb-6">
                                    <div className="border rounded-lg p-4 mb-4">
                                        <h3 className="font-semibold mb-2">Registration Details</h3>
                                        <p><span className="font-medium">Name:</span> {pendingUser.full_name || 'Not provided'}</p>
                                        <p><span className="font-medium">Email:</span> {pendingUser.email || 'Not provided'}</p>
                                        {pendingUser.phone_number && (
                                            <p><span className="font-medium">Phone:</span> {pendingUser.phone_number}</p>
                                        )}
                                    </div>
                                    
                                    <button
                                        onClick={handleConfirmRegistration}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 mb-2"
                                        disabled={verifying}
                                    >
                                        Confirm Registration
                                    </button>
                                    
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300"
                                    >
                                        Edit Details
                                    </button>
                                </div>
                            )}
                            
                            {error && (
                                <div className="text-center">
                                    <button
                                        onClick={handleTryAgain}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
