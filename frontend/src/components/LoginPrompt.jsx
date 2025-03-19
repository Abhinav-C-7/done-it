import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPrompt = ({ message, redirectPath, onClose }) => {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/login', { 
      state: { 
        message: message || 'Please log in to continue',
        redirectTo: redirectPath
      } 
    });
  };

  const handleRegister = () => {
    navigate('/register', { 
      state: { 
        message: 'Create an account to continue',
        redirectTo: redirectPath
      } 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V7a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3h4a3 3 0 003-3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Authentication Required</h2>
          <p className="text-gray-600 mt-2">
            {message || 'Please log in or create an account to access this feature'}
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleLogin}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Log In
          </button>
          <button
            onClick={handleRegister}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors"
          >
            Create Account
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
