import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Current auth state:', { user, token: token ? 'Token exists' : 'No token' });
                
                if (!token) {
                    console.log('No token found, redirecting to login');
                    throw new Error('Not authenticated');
                }

                // Updated endpoint to use the new orders route
                const response = await fetch('http://localhost:3000/api/orders/my-orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Orders API response status:', response.status);

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Please login to view your orders');
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch orders');
                }

                const data = await response.json();
                console.log('Orders data received:', data);
                setOrders(data);
                setLoading(false);
            } catch (err) {
                console.error('Error in fetchOrders:', err);
                setError(err.message);
                setLoading(false);
                if (err.message === 'Not authenticated' || err.message === 'Please login to view your orders') {
                    navigate('/login');
                }
            }
        };

        fetchOrders();
    }, [navigate, user]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-white shadow overflow-hidden rounded-lg p-6">
                        <div className="text-center">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                            >
                                Return Home
                            </button>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white shadow overflow-hidden rounded-lg p-6">
                        <div className="text-center">
                            <p className="text-gray-500 mb-4">You don't have any orders yet.</p>
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                            >
                                Browse Services
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.payment_id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Order #{order.payment_id.substring(order.payment_id.length - 6)}
                                        </h3>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                            Placed on {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-lg font-semibold">
                                            ₹{order.total_amount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                                    <div className="mb-6">
                                        <h4 className="text-md font-medium text-gray-900 mb-2">Delivery Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Address</p>
                                                <p className="text-sm font-medium">
                                                    {order.address}
                                                    {order.landmark && `, ${order.landmark}`}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    {order.city}, {order.pincode}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Scheduled Date & Time</p>
                                                <p className="text-sm font-medium">
                                                    {formatDate(order.scheduled_date)}
                                                </p>
                                                <p className="text-sm font-medium">{order.time_slot}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-md font-medium text-gray-900 mb-2">Services</h4>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="space-y-4">
                                            {order.services.map((service) => (
                                                <div key={service.request_id} className="flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <h3 className="text-lg font-semibold">
                                                            {service.service_type}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm mt-1">
                                                            {service.service_description}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-gray-900 font-medium">
                                                            ₹{parseFloat(service.amount).toFixed(2)}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded-full mt-1 ${getStatusColor(service.status)}`}>
                                                            {service.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Payment Method</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {order.payment_method === 'demo' ? 'Online Payment' : order.payment_method}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-sm text-gray-500">Payment ID</span>
                                        <span className="text-sm font-medium text-gray-900">{order.payment_id}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
