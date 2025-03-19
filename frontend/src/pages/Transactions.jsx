import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Check if coming from a successful payment
    const paymentSuccess = location.state?.paymentSuccess;
    const reviewSubmitted = location.state?.reviewSubmitted;
    
    useEffect(() => {
        // Clear location state after reading it
        if (location.state) {
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        fetchPaymentRequests();
    }, []);

    const fetchPaymentRequests = async () => {
        try {
            setIsLoading(true);
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.error('No authentication token found');
                setIsLoading(false);
                return;
            }
            
            console.log('Fetching payment requests with token:', token ? 'Token exists' : 'No token');
            
            // Fetch all payment requests
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/customer/payment-requests`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                console.log('Payment requests API response:', response.data);
                
                // Filter for paid and pending transactions
                const paidTransactions = response.data.filter(payment => payment.status === 'paid');
                const pendingPaymentRequests = response.data.filter(payment => payment.status === 'pending');
                
                console.log('Filtered pending payments:', pendingPaymentRequests.length);
                console.log('Filtered paid transactions:', paidTransactions.length);
                
                setTransactions(paidTransactions);
                setPendingPayments(pendingPaymentRequests);
            } catch (apiError) {
                console.error('API Error details:', {
                    message: apiError.message,
                    status: apiError.response?.status,
                    statusText: apiError.response?.statusText,
                    data: apiError.response?.data
                });
                
                // Set empty arrays to avoid undefined errors
                setTransactions([]);
                setPendingPayments([]);
            }
            
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching payment requests:', error);
            setIsLoading(false);
        }
    };

    const handlePayNow = (payment) => {
        // Navigate to payment page with the payment details
        navigate('/payment', {
            state: {
                paymentDetails: {
                    paymentRequestId: payment.id,
                    requestId: payment.request_id,
                    bookingFee: 0, // Not a booking fee
                    servicePayment: true,
                    orderDetails: {
                        request_id: payment.request_id,
                        services: [{
                            type: payment.service_type,
                            price: payment.amount,
                            additionalCharges: 0,
                            totalAmount: payment.amount
                        }],
                        total: payment.amount,
                        payment_method: 'demo'
                    }
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-8 pt-24">
                    <div className="max-w-5xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Transactions</h1>
                        
                        {paymentSuccess && (
                            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">
                                            Payment Successful
                                        </h3>
                                        <div className="mt-2 text-sm text-green-700">
                                            <p>Your payment has been processed successfully.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {reviewSubmitted && (
                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            Thank You for Your Feedback!
                                        </h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>Your review has been submitted successfully. We appreciate your feedback!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'pending' 
                                    ? 'text-yellow-600 border-b-2 border-yellow-500' 
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('pending')}
                            >
                                Pending Payments
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'history' 
                                    ? 'text-yellow-600 border-b-2 border-yellow-500' 
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('history')}
                            >
                                Payment History
                            </button>
                        </div>
                        
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'pending' && (
                                    <>
                                        {pendingPayments.length > 0 ? (
                                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                                {pendingPayments.map((payment) => (
                                                    <div key={payment.id} className="p-6 border-b border-gray-100 last:border-b-0">
                                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                                                            <div>
                                                                <div>
                                                                    <h3 className="text-lg font-semibold text-gray-800">{payment.service_type}</h3>
                                                                    <p className="text-sm text-gray-500">Request ID: {payment.request_id}</p>
                                                                    <p className="text-sm text-gray-500">Date: {new Date(payment.created_at).toLocaleDateString()}</p>
                                                                    <p className="text-sm text-gray-500">Serviceman ID: {payment.serviceman_id}</p>
                                                                    {payment.notes && (
                                                                        <p className="text-sm text-gray-500">Notes: {payment.notes}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 md:mt-0">
                                                                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                                    {payment.status === 'pending' ? 'Pending Payment' : payment.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-gray-50 p-4 rounded-md mb-4">
                                                            <h4 className="font-medium text-gray-700 mb-2">Price</h4>
                                                            <div className="flex justify-between font-medium text-gray-800">
                                                                <span>Total Amount</span>
                                                                <span>₹{payment.amount}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <button
                                                            onClick={() => handlePayNow(payment)}
                                                            className="w-full md:w-auto px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md transition-colors shadow-sm"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-800 mb-2">No Pending Payments</h3>
                                                <p className="text-gray-500">You don't have any pending payments at the moment.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                {activeTab === 'history' && (
                                    <>
                                        {transactions.length > 0 ? (
                                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviceman ID</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {transactions.map((transaction) => (
                                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {new Date(transaction.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                                    {transaction.service_type}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                                    {transaction.serviceman_id}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                                    ₹{transaction.amount}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                        {transaction.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-800 mb-2">No Transaction History</h3>
                                                <p className="text-gray-500">You haven't made any payments yet.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
