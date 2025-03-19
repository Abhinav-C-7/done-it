import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const { user } = useAuth();
    
    // Get payment details from location state
    const paymentDetails = location.state?.paymentDetails;
    const bookingFee = paymentDetails?.bookingFee || 49;
    const isServicePayment = paymentDetails?.servicePayment || false;
    const serviceDetails = isServicePayment ? paymentDetails?.orderDetails?.services[0] : null;
    const paymentAmount = isServicePayment ? serviceDetails?.totalAmount : bookingFee;
    const paymentRequestId = isServicePayment ? paymentDetails?.paymentRequestId : null;
    
    useEffect(() => {
        // Redirect if no payment details
        if (!paymentDetails) {
            navigate('/checkout');
        }
    }, [paymentDetails, navigate]);

    // Function to decode JWT token without external library
    const decodeJWT = (token) => {
        try {
            // JWT tokens are made of three parts: header.payload.signature
            // We only need the payload part which is the second part
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.error('Invalid token format');
                return null;
            }
            
            // Base64 decode the payload part
            const payload = parts[1];
            // Convert base64url to base64
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            // Decode base64 to string and parse as JSON
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    // Function to get user ID from token
    const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            
            const decoded = decodeJWT(token);
            console.log('Decoded token:', decoded);
            
            // Return the ID from the token
            return decoded?.id;
        } catch (error) {
            console.error('Error getting user ID from token:', error);
            return null;
        }
    };

    // Function to create service requests in the database
    const createServiceRequests = async (paymentId) => {
        try {
            // Get the order details from payment details
            const orderDetails = paymentDetails.orderDetails;
            const formData = paymentDetails.formData;
            
            // Ensure we have the necessary data
            if (!orderDetails || !formData) {
                throw new Error('Missing order details or form data');
            }
            
            // Get customer ID from multiple sources to ensure we have it
            let customerId = null;
            
            // First try to get it from the user object in context
            if (user && user.id) {
                customerId = user.id;
                console.log('Using customer ID from user context:', customerId);
            } 
            // Then try to get it from the JWT token
            else {
                customerId = getUserIdFromToken();
                console.log('Using customer ID from JWT token:', customerId);
            }
            
            // If still no customer ID, throw an error
            if (!customerId) {
                throw new Error('Could not determine customer ID. Please log in again.');
            }
            
            // Create a service request for each service in the order
            const orderPromises = orderDetails.services.map(async (item) => {
                // Parse and clean amount, add booking fee divided by number of items
                const bookingFeePerItem = bookingFee / orderDetails.services.length;
                const serviceFeePerItem = 0; // Adjust if you have a service fee
                const itemPrice = parseFloat(item.price);
                const cleanAmount = itemPrice + bookingFeePerItem + serviceFeePerItem;
                
                const requestData = {
                    customer_id: customerId,
                    service_type: item.type,
                    description: `Service requested for ${item.type}. Includes booking fee: ₹${bookingFeePerItem.toFixed(2)}`,
                    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                    address: formData.address.trim(),
                    landmark: (formData.landmark || '').trim(),
                    city: formData.city.trim(),
                    pincode: formData.pincode.toString().trim(),
                    scheduled_date: new Date(formData.date).toISOString().split('T')[0],
                    time_slot: formData.timeSlot.trim(),
                    payment_method: 'demo',
                    payment_id: paymentId,
                    amount: cleanAmount
                };
                
                console.log('Creating service request with data:', requestData);
                const response = await fetch(`${API_BASE_URL}/services/request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(requestData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Server error response:', errorData);
                    throw new Error(errorData.message || 'Failed to create service request');
                }
                
                const responseData = await response.json();
                console.log('Service request created:', responseData);
                return responseData;
            });
            
            const createdRequests = await Promise.all(orderPromises);
            console.log('All service requests created:', createdRequests);
            
            // Return the first created request as the main order
            return createdRequests[0];
        } catch (error) {
            console.error('Error creating service requests:', error);
            throw error;
        }
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simulate successful payment
            setPaymentSuccess(true);
            
            // If this is a service payment, show rating after payment success
            if (isServicePayment) {
                setShowRating(true);
                
                // Create payment response with unique ID
                const demoResponse = {
                    razorpay_order_id: paymentDetails.orderId || paymentDetails.requestId,
                    razorpay_payment_id: 'pay_demo_' + Date.now(),
                };
                
                try {
                    // For service payments, update the payment status to 'paid'
                    const token = localStorage.getItem('token');
                    
                    if (!token) {
                        throw new Error('No authentication token found');
                    }
                    
                    // Update payment request status to 'paid'
                    const response = await fetch(`${API_BASE_URL}/customer/payment-requests/${paymentRequestId}/pay`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            paymentId: demoResponse.razorpay_payment_id
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Server error response:', errorData);
                        throw new Error(errorData.message || 'Failed to update payment status');
                    }
                    
                    const responseData = await response.json();
                    console.log('Payment status updated:', responseData);
                    
                    // Don't redirect - wait for user to submit rating
                } catch (error) {
                    console.error('Failed to update payment status:', error);
                    alert('Payment was successful but we encountered an error updating your payment status. Please contact support.');
                }
            } else {
                // For booking fee payments, handle differently
                // Simulate redirect after showing success message
                setTimeout(async () => {
                    // Create payment response with unique ID
                    const demoResponse = {
                        razorpay_order_id: paymentDetails.orderId || paymentDetails.requestId,
                        razorpay_payment_id: 'pay_demo_' + Date.now(),
                    };
                    
                    try {
                        // Create service requests in the database
                        const createdRequest = await createServiceRequests(demoResponse.razorpay_payment_id);
                        
                        // Add the request_id to the order details
                        const updatedOrderDetails = {
                            ...paymentDetails.orderDetails,
                            payment_id: demoResponse.razorpay_payment_id,
                            request_id: createdRequest.request_id
                        };
                        
                        // For booking fee payments, redirect to order confirmation
                        navigate('/order-confirmation', { 
                            state: { 
                                orderDetails: updatedOrderDetails
                            } 
                        });
                    } catch (error) {
                        console.error('Failed to create service request:', error);
                        alert('Payment was successful but we encountered an error creating your service request. Please contact support.');
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            setIsProcessing(false);
            alert('Payment failed. Please try again.');
        }
    };

    const handleRatingClick = (value) => {
        setRating(value);
    };
    
    const handleSubmitReview = async () => {
        if (rating === 0) {
            alert('Please select a rating before submitting');
            return;
        }
        
        setIsSubmittingReview(true);
        
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Log payment details for debugging
            console.log('Payment details:', paymentDetails);
            
            // Get service_request_id from the payment request
            const requestId = paymentDetails.requestId || paymentDetails.orderId;
            
            // For service payments, the serviceman_id should be in the payment request
            let servicemanId;
            
            if (isServicePayment && paymentDetails.servicemanId) {
                servicemanId = paymentDetails.servicemanId;
            } else if (isServicePayment && paymentDetails.orderDetails && paymentDetails.orderDetails.serviceman_id) {
                servicemanId = paymentDetails.orderDetails.serviceman_id;
            } else {
                // Fetch the service request to get the serviceman_id
                try {
                    const serviceResponse = await fetch(`${API_BASE_URL}/customer/service-requests/${requestId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (!serviceResponse.ok) {
                        throw new Error('Failed to fetch service request details');
                    }
                    
                    const serviceData = await serviceResponse.json();
                    servicemanId = serviceData.assigned_serviceman;
                    console.log('Retrieved serviceman_id from service request:', servicemanId);
                } catch (fetchError) {
                    console.error('Error fetching service request:', fetchError);
                    // Fallback to a direct database query on the backend
                    servicemanId = null;
                }
            }
            
            // Prepare the review data
            const reviewData = {
                service_request_id: parseInt(requestId),
                rating,
                comment
            };
            
            // Only include serviceman_id if we have it
            if (servicemanId) {
                reviewData.serviceman_id = servicemanId;
            }
            
            console.log('Submitting review with data:', reviewData);
            
            // Submit the review
            const response = await axios.post(
                `${API_BASE_URL}/customer/reviews`,
                reviewData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            console.log('Review submitted:', response.data);
            setReviewSubmitted(true);
            
            // Redirect after a short delay
            setTimeout(() => {
                navigate('/transactions', { 
                    state: { 
                        paymentSuccess: true,
                        reviewSubmitted: true
                    } 
                });
            }, 2000);
        } catch (error) {
            console.error('Error submitting review:', error);
            
            // Show more detailed error information
            if (error.response) {
                console.error('Error response data:', error.response.data);
            }
            
            alert('Failed to submit review. Please try again.');
            setIsSubmittingReview(false);
        }
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
                    
                    {paymentSuccess && showRating && !reviewSubmitted ? (
                        <div className="text-center py-6">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
                            <p className="text-gray-600 mb-6">
                                Your service payment has been completed. Please rate your experience.
                            </p>
                            
                            <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Rate Your Experience</h3>
                                
                                <div className="flex justify-center space-x-2 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingClick(star)}
                                            className="focus:outline-none"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-8 w-8 ${
                                                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                                }`}
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                                />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                                        Additional Comments (Optional)
                                    </label>
                                    <textarea
                                        id="comment"
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                        placeholder="Share your experience..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    ></textarea>
                                </div>
                                
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={isSubmittingReview || rating === 0}
                                    className={`w-full py-2 px-4 rounded-lg font-medium text-white ${
                                        isSubmittingReview || rating === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-yellow-400 hover:bg-yellow-500'
                                    } transition-colors shadow-sm`}
                                >
                                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </div>
                    ) : paymentSuccess && reviewSubmitted ? (
                        <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Thank You for Your Feedback!</h2>
                            <p className="text-gray-600 mb-4">
                                Your review has been submitted successfully.
                            </p>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Thank You for Choosing Done-it!</h3>
                            <p className="text-gray-500 text-sm">
                                Redirecting to transactions page...
                            </p>
                        </div>
                    ) : paymentSuccess ? (
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
                                {isServicePayment
                                    ? "Redirecting to transactions page..."
                                    : "Redirecting to confirmation page..."}
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
                                        <h3 className="font-medium text-gray-700 mb-2">{serviceDetails.type}</h3>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Base Service Charge</span>
                                            <span>₹{serviceDetails.price}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Additional Charges</span>
                                            <span>₹{serviceDetails.additionalCharges}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-gray-800 pt-2 mt-2 border-t border-gray-200">
                                            <span>Total Amount</span>
                                            <span>₹{serviceDetails.totalAmount}</span>
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
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
