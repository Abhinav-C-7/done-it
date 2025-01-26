import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

function OTPVerification() {
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { formData } = location.state || {};

    useEffect(() => {
        if (!formData) {
            navigate('/register');
            return;
        }

        // Initialize reCAPTCHA when component mounts
        const initializeRecaptcha = () => {
            try {
                if (!window.recaptchaVerifier) {
                    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                        size: 'normal',
                        callback: async (response) => {
                            console.log('reCAPTCHA solved, sending OTP...');
                            await sendOTP();
                        },
                        'expired-callback': () => {
                            setError('reCAPTCHA expired. Please try again.');
                        }
                    });
                    window.recaptchaVerifier.render();
                }
            } catch (error) {
                console.error('Error initializing reCAPTCHA:', error);
                setError('Error initializing verification. Please refresh and try again.');
            }
        };

        // Call initialize function
        initializeRecaptcha();

        // Cleanup on unmount
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    const sendOTP = async () => {
        if (!formData?.phone) {
            setError('Phone number is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const phoneNumber = formData.phone;
            console.log('Sending OTP to:', phoneNumber);

            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            setLoading(false);
        } catch (err) {
            console.error('Error sending OTP:', err);
            setLoading(false);
            setError('Error sending OTP. Please try again.');
            
            // Reset reCAPTCHA on error
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                    // Reinitialize reCAPTCHA
                    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                        size: 'normal',
                        callback: async (response) => {
                            console.log('reCAPTCHA solved, sending OTP...');
                            await sendOTP();
                        },
                        'expired-callback': () => {
                            setError('reCAPTCHA expired. Please try again.');
                        }
                    });
                    window.recaptchaVerifier.render();
                } catch (clearErr) {
                    console.error('Error resetting reCAPTCHA:', clearErr);
                }
            }
        }
    };

    const verifyOTP = async (e) => {
        e.preventDefault();
        if (!confirmationResult) {
            setError('Please complete the verification first');
            return;
        }

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await confirmationResult.confirm(otp);
            // After OTP verification, proceed with registration
            navigate('/login', { 
                state: { message: 'Registration successful! Please login to continue.' }
            });
        } catch (err) {
            console.error('Error verifying OTP:', err);
            setLoading(false);
            setError('Invalid OTP. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-8 pt-8 pb-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Phone</h2>
                        <p className="text-sm text-gray-600">
                            We'll send a verification code to {formData?.phone}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {!confirmationResult && (
                            <div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Please complete the verification below to receive your OTP
                                </p>
                                <div id="recaptcha-container" className="flex justify-center mb-4"></div>
                            </div>
                        )}

                        {confirmationResult && (
                            <form onSubmit={verifyOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Enter OTP
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        placeholder="Enter 6-digit code"
                                        maxLength="6"
                                        required
                                    />
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${
                                            loading
                                                ? 'bg-yellow-400 cursor-not-allowed'
                                                : 'bg-yellow-500 hover:bg-yellow-600'
                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200`}
                                    >
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OTPVerification;