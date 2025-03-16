import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    useEffect(() => {
        fetchTransactions();
        fetchPendingPayments();
    }, []);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            // In a real app, this would be an API call to fetch transaction history
            // For demo purposes, we'll use mock data
            const mockTransactions = [
                {
                    id: 'trans_1',
                    date: '2025-03-15',
                    type: 'Booking Fee',
                    service: 'AC Repair',
                    amount: 49,
                    status: 'Paid',
                    paymentId: 'pay_demo_123456'
                },
                {
                    id: 'trans_2',
                    date: '2025-03-10',
                    type: 'Service Payment',
                    service: 'Plumbing',
                    amount: 599,
                    status: 'Paid',
                    paymentId: 'pay_demo_789012'
                }
            ];
            
            // Simulate API delay
            setTimeout(() => {
                setTransactions(mockTransactions);
                setIsLoading(false);
            }, 800);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setIsLoading(false);
        }
    };

    const fetchPendingPayments = async () => {
        try {
            // In a real app, this would be an API call to fetch pending payments
            // For demo purposes, we'll use mock data
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
                }
            ];
            
            // Simulate API delay
            setTimeout(() => {
                setPendingPayments(mockPendingPayments);
            }, 800);
        } catch (error) {
            console.error('Error fetching pending payments:', error);
        }
    };

    const handlePayNow = (payment) => {
        // Navigate to payment page with the payment details
        navigate('/payment', {
            state: {
                paymentDetails: {
                    orderId: payment.requestId,
                    bookingFee: 0, // Not a booking fee
                    servicePayment: true,
                    orderDetails: {
                        request_id: payment.requestId,
                        services: [{
                            type: payment.service,
                            price: payment.baseAmount,
                            additionalCharges: payment.additionalCharges,
                            totalAmount: payment.totalAmount
                        }],
                        total: payment.totalAmount,
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
                                                                <h3 className="text-lg font-semibold text-gray-800">{payment.service}</h3>
                                                                <p className="text-sm text-gray-500">Request ID: {payment.requestId}</p>
                                                                <p className="text-sm text-gray-500">Date: {new Date(payment.date).toLocaleDateString()}</p>
                                                                <p className="text-sm text-gray-500">Serviceman: {payment.serviceman}</p>
                                                            </div>
                                                            <div className="mt-4 md:mt-0">
                                                                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                                    {payment.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-gray-50 p-4 rounded-md mb-4">
                                                            <h4 className="font-medium text-gray-700 mb-2">Price Breakdown</h4>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span>Base Service Charge</span>
                                                                <span>₹{payment.baseAmount}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span>Additional Charges</span>
                                                                <span>₹{payment.additionalCharges}</span>
                                                            </div>
                                                            {payment.notes && (
                                                                <p className="text-xs text-gray-500 mt-1 italic">{payment.notes}</p>
                                                            )}
                                                            <div className="flex justify-between font-medium text-gray-800 pt-2 mt-2 border-t border-gray-200">
                                                                <span>Total Amount</span>
                                                                <span>₹{payment.totalAmount}</span>
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
                                                                    {transaction.type}
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
