import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const RazorpayCheckout = ({ serviceRequestId, amount, customerName, customerEmail, customerPhone }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const initPayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Create order on server
      const { data } = await axios.post(`${API_URL}/razorpay/create-order`, {
        amount,
        service_request_id: serviceRequestId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Razorpay order created:', data);
      
      // Initialize Razorpay
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Done-it Services",
        description: "Payment for service request",
        order_id: data.orderId,
        handler: async (response) => {
          try {
            console.log('Payment successful:', response);
            
            // Verify payment on server
            await axios.post(`${API_URL}/razorpay/verify-payment`, {
              ...response,
              service_request_id: serviceRequestId
            });
            
            // Payment successful
            navigate('/payment-success', { 
              state: { 
                orderId: data.orderId,
                paymentId: response.razorpay_payment_id,
                amount: amount
              } 
            });
          } catch (error) {
            console.error('Payment verification failed:', error);
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        notes: {
          service_request_id: serviceRequestId
        },
        theme: {
          color: "#F9C846" // Done-it brand color
        }
      };
      
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
      // Handle payment failure
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description}`);
      });
      
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="razorpay-checkout bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Complete Your Payment</h2>
      <p className="amount text-xl mb-6">Amount: ₹{amount}</p>
      
      {error && (
        <div className="error-message bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <button 
        onClick={initPayment} 
        disabled={loading}
        className="pay-button bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-md w-full transition duration-300"
      >
        {loading ? 'Processing...' : 'Pay with Razorpay'}
      </button>
    </div>
  );
};

export default RazorpayCheckout;
