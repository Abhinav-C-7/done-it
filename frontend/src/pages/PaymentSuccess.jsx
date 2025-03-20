import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = () => {
  const location = useLocation();
  const { orderId, paymentId, amount } = location.state || {};

  if (!orderId) {
    return (
      <div className="payment-success-container flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Payment Session</h2>
          <p className="text-gray-700 mb-6">We couldn't find your payment details.</p>
          <Link 
            to="/dashboard" 
            className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-md text-center transition duration-300"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="success-icon flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-6xl" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-green-600 mb-4">Payment Successful!</h2>
        <p className="text-center text-gray-700 mb-6">Your service request has been confirmed.</p>
        
        <div className="payment-details bg-gray-50 p-4 rounded-md mb-6">
          <div className="detail-row flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium text-gray-600">Order ID:</span>
            <span className="text-gray-800">{orderId}</span>
          </div>
          <div className="detail-row flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium text-gray-600">Payment ID:</span>
            <span className="text-gray-800">{paymentId}</span>
          </div>
          <div className="detail-row flex justify-between py-2">
            <span className="font-medium text-gray-600">Amount Paid:</span>
            <span className="text-gray-800 font-bold">₹{amount}</span>
          </div>
        </div>
        
        <p className="text-center text-gray-600 mb-6">A confirmation has been sent to your email.</p>
        
        <div className="action-buttons grid grid-cols-1 gap-3">
          <Link 
            to="/dashboard" 
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-md text-center transition duration-300"
          >
            Go to Dashboard
          </Link>
          <Link 
            to="/my-bookings" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md text-center transition duration-300"
          >
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
