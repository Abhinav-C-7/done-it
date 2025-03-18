import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchTransactions();
        fetchPendingPayments();
    }, []);

    // Check if returning from a successful payment
    useEffect(() => {
        if (location.state?.paymentSuccess) {
            // Refresh the data
            fetchTransactions();
            fetchPendingPayments();
        }
    }, [location.state]);

    const fetchTransactions = async () => {
        try {
            console.log('Using mock transaction data instead of API call');
            
            // Mock transaction data
            const mockTransactions = [
                {
                    id: 'pay_1',
                    date: '2025-03-15',
                    service: 'Plumbing Service',
                    amount: 1200,
                    status: 'Completed',
                    paymentType: 'service_payment'
                },
                {
                    id: 'pay_2',
                    date: '2025-03-10',
                    service: 'Electrical Repair',
                    amount: 850,
                    status: 'Completed',
                    paymentType: 'service_payment'
                }
            ];
            
            setTransactions(mockTransactions);
            setIsLoading(false);
        } catch (error) {
            console.error('Error setting mock transactions:', error);
            setTransactions([]);
            setIsLoading(false);
        }
    };

    const fetchPendingPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token exists:', token ? 'Yes' : 'No');
            
            if (!token) {
                console.error('No authentication token found');
                // Fall back to mock data if no token
                useMockPendingPayments();
                return;
            }
            
            // Log the first few characters of the token for debugging (don't log the full token)
            console.log('Token preview:', token.substring(0, 10) + '...');
            
            try {
                // Try to decode the token to see if it's valid (client-side only)
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log('Token payload:', payload);
                    
                    // Check if the token has the expected customer ID
                    if (!payload.id) {
                        console.error('Token missing id field');
                    } else if (payload.type !== 'customer') {
                        console.error('User is not a customer, type:', payload.type);
                    }
                } else {
                    console.error('Token does not have the expected format');
                }
            } catch (tokenError) {
                console.error('Error decoding token:', tokenError);
            }
            
            console.log('Fetching pending payments from API...');
            
            const response = await fetch('http://localhost:3000/api/services/pending-payments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                console.error(`Failed to fetch pending payments: ${response.status} ${response.statusText}`);
                
                // Try to get more error details if available
                try {
                    const errorData = await response.json();
                    console.error('Error details:', errorData);
                } catch (jsonError) {
                    console.error('Could not parse error response');
                }
                
                // Fall back to mock data if API fails
                useMockPendingPayments();
                return;
            }
            
            const data = await response.json();
            console.log('Pending payments response:', data);
            
            if (!data.pendingPayments || !Array.isArray(data.pendingPayments)) {
                console.error('Invalid pending payments data format:', data);
                // Fall back to mock data if invalid format
                useMockPendingPayments();
                return;
            }
            
            if (data.pendingPayments.length === 0) {
                console.log('No pending payments found');
                setPendingPayments([]);
                setIsLoading(false);
                return;
            }
            
            // Map the API response to our component's expected format
            const formattedPayments = data.pendingPayments.map(payment => {
                console.log('Processing payment:', payment);
                return {
                    id: payment.id,
                    requestId: payment.request_id,
                    date: new Date(payment.created_at).toLocaleDateString(),
                    service: payment.service_type,
                    baseAmount: payment.base_amount || payment.amount,
                    additionalCharges: payment.additional_charges || 0,
                    totalAmount: payment.amount,
                    status: 'Pending Payment',
                    serviceman: payment.serviceman_name || 'Assigned Serviceman',
                    notes: payment.notes || ''
                };
            });
            
            console.log('Formatted payments:', formattedPayments);
            setPendingPayments(formattedPayments);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching pending payments:', error);
            // Fall back to mock data if error
            useMockPendingPayments();
        }
    };
    
    const useMockPendingPayments = () => {
        console.log('Using mock pending payments data');
        // Mock pending payments
        const mockPendingPayments = [
            {
                id: 'req_1',
                requestId: 'req_ac_123',
                date: '2025-03-16',
                service: 'AC Repair',
                baseAmount: 799,
                additionalCharges: 350,
                totalAmount: 1149,
                status: 'Pending Payment',
                serviceman: 'Rahul K.',
                notes: 'Compressor repair required additional parts'
            },
            {
                id: 'req_2',
                requestId: 'req_plumb_456',
                date: '2025-03-17',
                service: 'Plumbing',
                baseAmount: 500,
                additionalCharges: 200,
                totalAmount: 700,
                status: 'Pending Payment',
                serviceman: 'Vikram S.',
                notes: 'Fixed leaking pipe and replaced valve'
            }
        ];
        
        setPendingPayments(mockPendingPayments);
    };

    const handlePayNow = (payment) => {
        // Navigate to payment page with payment details
        navigate('/payment', {
            state: {
                paymentDetails: {
                    servicePayment: true,
                    paymentRequestId: payment.id,
                    requestId: payment.requestId,
                    orderDetails: {
                        services: [
                            {
                                type: payment.service,
                                price: payment.baseAmount,
                                additionalCharges: payment.additionalCharges,
                                totalAmount: payment.totalAmount
                            }
                        ]
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
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviceman</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {pendingPayments.map((payment) => (
                                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {payment.date}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {payment.service}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {payment.serviceman}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    ₹{payment.totalAmount}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                        {payment.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    <button
                                                                        onClick={() => handlePayNow(payment)}
                                                                        className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                                                                    >
                                                                        Pay Now
                                                                    </button>
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
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {transactions.map((transaction) => (
                                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {new Date(transaction.date).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                                    {transaction.paymentType}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                                    {transaction.service}
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
