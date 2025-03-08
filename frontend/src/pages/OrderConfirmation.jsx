import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderDetails } = location.state || {};

    if (!orderDetails) {
        navigate('/');
        return null;
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Order Confirmed!</h1>
                        <p className="text-gray-600 mt-2">Your service request has been successfully placed.</p>
                        <p className="text-lg font-semibold text-yellow-600 mt-2">Order ID: #{orderDetails.request_id}</p>
                    </div>

                    {/* Service Details */}
                    <div className="border-t border-b border-gray-200 py-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Service Details</h2>
                        <div className="space-y-4">
                            {orderDetails.services.map((service, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{service.title}</p>
                                        <p className="text-sm text-gray-600">Quantity: {service.quantity}</p>
                                    </div>
                                    <p className="font-medium">₹{service.price * service.quantity}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">Total Amount</p>
                                <p className="font-semibold text-lg">₹{orderDetails.total}</p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Details */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">Schedule Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">Date</p>
                                <p className="font-medium">{formatDate(orderDetails.scheduled_date)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Time Slot</p>
                                <p className="font-medium">{orderDetails.time_slot}</p>
                            </div>
                        </div>
                    </div>

                    {/* Service Address */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">Service Address</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium">{orderDetails.address}</p>
                            {orderDetails.landmark && (
                                <p className="text-gray-600 mt-1">Landmark: {orderDetails.landmark}</p>
                            )}
                            <p className="text-gray-600 mt-1">
                                {orderDetails.city}, {orderDetails.pincode}
                            </p>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium">Payment Method: {orderDetails.payment_method}</p>
                            <p className="text-gray-600 mt-1">
                                {orderDetails.payment_method === 'cash' 
                                    ? 'Pay at the time of service' 
                                    : 'Payment completed'}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            onClick={() => {
                                // Ensure we have the latest token before navigating
                                const token = localStorage.getItem('token');
                                if (!token) {
                                    alert('Please login to view your orders');
                                    navigate('/login');
                                } else {
                                    navigate('/orders');
                                }
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
