import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Updated to local backend URL

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serviceDetails, setServiceDetails] = useState(null);
    const [jobDetails, setJobDetails] = useState(null);
    const [paymentType, setPaymentType] = useState(null);
    const [serviceId, setServiceId] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [paymentRequestId, setPaymentRequestId] = useState(null);
    const [bookingFee, setBookingFee] = useState(49);
    const [totalAmount, setTotalAmount] = useState(0);
    
    // Get payment details from location state
    const paymentDetails = location.state?.paymentDetails;
    const isServicePayment = paymentDetails?.servicePayment || false;
    const serviceDetailsFromLocation = isServicePayment ? paymentDetails?.orderDetails?.services[0] : null;
    const paymentAmount = isServicePayment ? serviceDetailsFromLocation?.totalAmount : bookingFee;
    
    useEffect(() => {
        // Redirect if no payment details
        if (!paymentDetails) {
            navigate('/checkout');
            return;
        }
        
        // Extract payment information from location state
        if (paymentDetails) {
            if (paymentDetails.servicePayment) {
                setPaymentType('service');
                setRequestId(paymentDetails.requestId);
                setPaymentRequestId(paymentDetails.paymentRequestId);
                setTotalAmount(paymentDetails.orderDetails.services[0].totalAmount);
            } else {
                setPaymentType('booking');
                setServiceId(paymentDetails.serviceId);
                setBookingFee(paymentDetails.bookingFee || 49);
            }
        }
        
        const fetchJobDetails = async () => {
            if (!paymentType) return;
            
            try {
                setIsLoading(true);
                
                if (paymentType === 'booking' && serviceId) {
                    // For booking payments, fetch service details if serviceId exists
                    const response = await axios.get(`${API_BASE_URL}/services/${serviceId}`);
                    setServiceDetails(response.data);
                } else if (paymentType === 'service' && requestId) {
                    // For service payments, fetch job details
                    const token = localStorage.getItem('token');
                    const response = await axios.get(
                        `${API_BASE_URL}/services/request/${requestId}`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    setJobDetails(response.data);
                }
                
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching details:', error);
                setError('Failed to load service details. Please try again.');
                setIsLoading(false);
            }
        };
        
        fetchJobDetails();
    }, [paymentDetails, navigate, serviceId, paymentType, requestId]);
    
    const handlePayment = async () => {
        setIsProcessing(true);
        
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simulate successful payment
            setPaymentSuccess(true);
            
            // Simulate redirect after showing success message
            setTimeout(() => {
                // Create service requests after successful payment
                const demoResponse = {
                    razorpay_order_id: paymentDetails.orderId,
                    razorpay_payment_id: 'pay_demo_' + Date.now(),
                };
                
                handlePaymentSuccess(demoResponse.razorpay_payment_id);
            }, 2000);
        } catch (error) {
            console.error('Error processing payment:', error);
            setIsProcessing(false);
            alert('Payment failed. Please try again.');
        }
    };
    
    const handlePaymentSuccess = (paymentId) => {
        setIsLoading(true);
        
        // Record payment in database
        const paymentData = {
            paymentId,
            amount: paymentType === 'booking' ? bookingFee : totalAmount,
            serviceId: paymentType === 'booking' ? serviceId : null,
            requestId: paymentType === 'service' ? requestId : null,
            paymentType: paymentType === 'booking' ? 'booking_fee' : 'service_payment',
            serviceType: paymentType === 'booking' 
                ? serviceDetails?.title || 'Service Booking'
                : jobDetails?.service_type || 'Service Payment'
        };
        
        // Make the API call for recording payment
        axios.post(`${API_BASE_URL}/services/record-payment`, paymentData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(() => {
            // Update payment request status if this is a service payment
            if (paymentType === 'service' && requestId && paymentRequestId) {
                axios.put(`${API_BASE_URL}/services/update-payment-request/${paymentRequestId}`, 
                    { status: 'paid' },
                    { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
                ).catch(err => console.error('Error updating payment request:', err));
            }
        })
        .catch(error => {
            console.error('Error recording payment:', error);
            setError('Payment was successful, but we had trouble recording it. Please contact support.');
        });
        
        setIsLoading(false);
        setPaymentSuccess(true);
        
        // Redirect after a delay
        setTimeout(() => {
            // For both booking and service payments, redirect to order-confirmation page
            navigate('/order-confirmation', { 
                state: { 
                    orderDetails: paymentType === 'booking' 
                        ? {
                            request_id: `REQ-${Date.now()}`,
                            services: [{
                                title: serviceDetails?.title || 'Service Booking',
                                quantity: 1,
                                price: bookingFee
                            }],
                            total: bookingFee,
                            scheduled_date: paymentDetails?.formData?.date || new Date().toISOString(),
                            time_slot: paymentDetails?.formData?.timeSlot || '09:00 AM - 11:00 AM',
                            address: paymentDetails?.formData?.address || 'Your address',
                            landmark: paymentDetails?.formData?.landmark || '',
                            city: paymentDetails?.formData?.city || 'Your city',
                            pincode: paymentDetails?.formData?.pincode || '000000',
                            payment_method: 'online',
                            payment_id: paymentId
                        }
                        : {
                            request_id: requestId || `REQ-${Date.now()}`,
                            services: [{
                                title: jobDetails?.service_type || 'Service Payment',
                                quantity: 1,
                                price: totalAmount
                            }],
                            total: totalAmount,
                            scheduled_date: jobDetails?.scheduled_date || new Date().toISOString(),
                            time_slot: jobDetails?.time_slot || '09:00 AM - 11:00 AM',
                            address: jobDetails?.address || 'Service address',
                            landmark: jobDetails?.landmark || '',
                            city: jobDetails?.city || 'Service city',
                            pincode: jobDetails?.pincode || '000000',
                            payment_method: 'online',
                            payment_id: paymentId
                        }
                } 
            });
        }, 2000);
    };

    if (!paymentDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto pt-24 pb-12 px-4">
                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Payment</h1>
                    
                    {paymentSuccess ? (
                        <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
                            <p className="text-gray-600 mb-4">
                                {isServicePayment 
                                    ? "Your service payment has been completed." 
                                    : "Your service request has been confirmed."}
                            </p>
                            <p className="text-gray-500 text-sm">
                                Redirecting to confirmation page...
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="border border-gray-200 rounded-lg p-4 mb-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    {isServicePayment ? "Service Payment" : "Booking Fee"}
                                </h2>
                                
                                {isServicePayment && (
                                    <div className="mb-4 bg-gray-50 p-4 rounded-md">
                                        <h3 className="font-medium text-gray-700 mb-2">{serviceDetailsFromLocation.type}</h3>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Base Service Charge</span>
                                            <span>₹{serviceDetailsFromLocation.price}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Additional Charges</span>
                                            <span>₹{serviceDetailsFromLocation.additionalCharges}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-gray-800 pt-2 mt-2 border-t border-gray-200">
                                            <span>Total Amount</span>
                                            <span>₹{serviceDetailsFromLocation.totalAmount}</span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-600">
                                        {isServicePayment ? "Amount to Pay" : "Booking Fee"}
                                    </span>
                                    <span className="font-medium text-gray-800">₹{paymentAmount}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-3">
                                    {isServicePayment 
                                        ? "This payment completes your service request." 
                                        : "This booking fee confirms your service request. It is fully refundable if canceled before a serviceman accepts the request"}
                                </p>
                            </div>
                            
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h2>
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center">
                                        <input
                                            id="demo-payment"
                                            name="payment-method"
                                            type="radio"
                                            checked={true}
                                            readOnly
                                            className="h-4 w-4 text-yellow-400 border-gray-300"
                                        />
                                        <label htmlFor="demo-payment" className="ml-3 block text-gray-700">
                                            Demo Payment (Instant Success)
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500'} transition-colors shadow-md flex items-center justify-center`}
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>Pay ₹{paymentAmount}</>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
