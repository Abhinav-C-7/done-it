import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Toast = ({ notification, onClose, autoClose = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300); // Wait for fade out animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'price_update':
        return (
          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" />
            </svg>
          </div>
        );
      case 'status':
        return (
          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const handlePayNow = () => {
    if (notification.reference_id) {
      // Always navigate to payment page with the order details
      navigate('/payment', {
        state: {
          paymentDetails: {
            paymentRequestId: notification.payment_id || `payment_${Date.now()}`,
            requestId: notification.reference_id,
            bookingFee: 0,
            servicePayment: true,
            orderDetails: {
              request_id: notification.reference_id,
              services: [{
                type: notification.service_type || 'Service',
                price: notification.amount || 1500, // Default price if not provided
                additionalCharges: 0,
                totalAmount: notification.amount || 1500
              }],
              total: notification.amount || 1500,
              payment_method: 'demo'
            }
          }
        }
      });
      
      // Close the toast after navigation
      setIsVisible(false);
      setTimeout(() => onClose(), 300);
    }
  };

  return (
    <div 
      className={`fixed bottom-5 right-5 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ zIndex: 9999 }}
    >
      <div className="p-4">
        <div className="flex items-start">
          {getIcon(notification.type)}
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {notification.message}
            </p>
            {notification.reference_id && (
              <div className="mt-2">
                <button
                  onClick={handlePayNow}
                  className="text-sm font-medium text-yellow-600 hover:text-yellow-500"
                >
                  Pay Now
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(), 300);
              }}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
