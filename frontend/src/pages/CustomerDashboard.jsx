import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function CustomerDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0
    });

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                // Get token from localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found');
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:3000/api/orders/my-orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data);
                
                // Calculate stats
                let completed = 0;
                let pending = 0;
                let cancelled = 0;
                
                data.forEach(order => {
                    order.services.forEach(service => {
                        if (service.status === 'completed') {
                            completed++;
                        } else if (service.status === 'cancelled') {
                            cancelled++;
                        } else {
                            pending++;
                        }
                    });
                });
                
                setStats({
                    total: data.length,
                    completed,
                    pending,
                    cancelled
                });
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(err.message || 'Failed to fetch orders');
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl text-gray-600">Loading...</div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Customer Dashboard</h1>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
                        <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                        <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
                        <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
                        <p className="text-3xl font-bold">{stats.completed}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
                        <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
                        <p className="text-3xl font-bold">{stats.pending}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-400">
                        <h3 className="text-gray-500 text-sm font-medium">Cancelled</h3>
                        <p className="text-3xl font-bold">{stats.cancelled}</p>
                    </div>
                </div>
                
                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-semibold">Recent Orders</h2>
                        <Link to="/my-orders" className="text-yellow-600 hover:text-yellow-700 font-medium">
                            View All Orders
                        </Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Services
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.slice(0, 5).map((order) => (
                                    <tr key={order.payment_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.payment_id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.services.map(s => s.service_type).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{order.total_amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${order.services[0].status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                order.services[0].status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                                'bg-yellow-100 text-yellow-800'}`}>
                                                {order.services[0].status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No orders found. Book a service to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2">Book a Service</h3>
                        <p className="text-gray-500 mb-4">Browse and book from our wide range of services</p>
                        <Link to="/services" className="text-yellow-600 hover:text-yellow-700 font-medium">
                            Browse Services
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2">View Orders</h3>
                        <p className="text-gray-500 mb-4">Check the status of your current and past orders</p>
                        <Link to="/my-orders" className="text-blue-600 hover:text-blue-700 font-medium">
                            View All Orders
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2">Update Profile</h3>
                        <p className="text-gray-500 mb-4">Manage your account details and preferences</p>
                        <Link to="/profile" className="text-green-600 hover:text-green-700 font-medium">
                            Edit Profile
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default CustomerDashboard;
