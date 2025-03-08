import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (!token) {
                    throw new Error('Not authenticated');
                }

                const response = await fetch('http://localhost:3000/api/services/my-orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Please login to view your orders');
                    }
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                if (err.message === 'Not authenticated') {
                    navigate('/login');
                }
            }
        };

        fetchOrders();
    }, [token, navigate]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-red-600">{error}</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold text-gray-900 mb-8">My Orders</h1>
                
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">You haven't placed any orders yet.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                        >
                            Browse Services
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.payment_id} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                Order #{order.payment_id.slice(-8)}
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                Placed on {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-gray-900">
                                                ₹{order.total_amount.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {order.payment_method.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Services</h3>
                                        <div className="space-y-4">
                                            {order.services.map((service) => (
                                                <div key={service.request_id} className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {service.service_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {service.service_description}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                                                            {service.status}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            ₹{parseFloat(service.amount).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 mt-4 pt-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Delivery Details</h3>
                                        <div className="text-sm text-gray-500">
                                            <p>{order.address}</p>
                                            {order.landmark && <p>{order.landmark}</p>}
                                            <p>{order.city} - {order.pincode}</p>
                                            <p className="mt-1">
                                                {formatDate(order.scheduled_date)} | {order.time_slot}
                                            </p>
                                        </div>
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
