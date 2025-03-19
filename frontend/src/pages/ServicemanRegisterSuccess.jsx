import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ServicemanRegisterSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Automatically redirect to login page after 5 seconds
        const timer = setTimeout(() => {
            navigate('/login');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md p-8 text-center">
                <div className="flex justify-center mb-6">
                    <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Registration Successful!</h1>
                <p className="text-gray-600 mb-6">
                    Your application has been submitted successfully. Please wait for admin approval.
                    You will be notified via email once your application is approved.
                </p>
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <p className="text-gray-700 font-medium">What happens next?</p>
                    <ol className="text-left text-gray-600 mt-2 pl-5 list-decimal">
                        <li>Our admin team will review your application</li>
                        <li>You'll receive an email notification about the status</li>
                        <li>Once approved, you can login and start accepting jobs</li>
                    </ol>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    You will be redirected to the login page in a few seconds...
                </p>
                <button 
                    onClick={() => navigate('/login')} 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
};

export default ServicemanRegisterSuccess;
