import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { API_BASE_URL } from '../config';

function AllOrders() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket } = useSocket();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'completed', 'pending', 'cancelled'

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            navigate('/login');
            return;
        }

        fetchOrders();
    }, [user, navigate]);

    // Listen for real-time job status updates
    useEffect(() => {
        if (!socket || !user) return;

        // Listen for job status updates
        socket.on('jobStatusUpdate', (data) => {
            const { requestId, jobStatus, message, servicemanName } = data;
            
            // Update the order status in the local state
            setOrders(prevOrders => {
                return prevOrders.map(order => {
                    // Check if this order contains the updated request
                    const updatedServices = order.services.map(service => {
                        if (service.request_id === requestId) {
                            // Create a toast or notification to alert the user
                            if ('Notification' in window && Notification.permission === 'granted') {
                                new Notification('Service Update', { 
                                    body: message,
                                    icon: '/favicon.ico'
                                });
                            }
                            
                            // Return updated service with new status
                            return {
                                ...service,
                                status: jobStatus,
                                serviceman_name: servicemanName || service.serviceman_name
                            };
                        }
                        return service;
                    });
                    
                    // Only update the order if one of its services was updated
                    if (JSON.stringify(updatedServices) !== JSON.stringify(order.services)) {
                        return {
                            ...order,
                            services: updatedServices
                        };
                    }
                    return order;
                });
            });

            // Update the selected order if it's the one being updated
            if (selectedOrder) {
                setSelectedOrder(prevOrder => {
                    const updatedServices = prevOrder.services.map(service => {
                        if (service.request_id === requestId) {
                            return {
                                ...service,
                                status: jobStatus,
                                serviceman_name: servicemanName || service.serviceman_name
                            };
                        }
                        return service;
                    });
                    
                    // Only update if a service was changed
                    if (JSON.stringify(updatedServices) !== JSON.stringify(prevOrder.services)) {
                        return {
                            ...prevOrder,
                            services: updatedServices,
                            job_status: jobStatus // Update the job_status for progress bar
                        };
                    }
                    return prevOrder;
                });
            }
        });

        // Clean up the event listener when the component unmounts
        return () => {
            socket.off('jobStatusUpdate');
        };
    }, [socket, user]);

    // Function to fetch orders
    const fetchOrders = async () => {
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                setError('Please log in to view your orders');
                setLoading(false);
                return;
            }

            console.log('Fetching orders with token:', token ? 'Token exists' : 'No token');
            
            const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Orders API response status:', response.status);
            
            if (!response.ok) {
                let errorMessage = 'Failed to fetch orders';
                
                try {
                    const errorData = await response.json();
                    console.error('Error response:', errorData);
                    errorMessage = errorData.message || `Failed to fetch orders: ${response.status}`;
                    
                    // If token is invalid, redirect to login
                    if (response.status === 401) {
                        console.log('Authentication failed, redirecting to login');
                        localStorage.removeItem('token');
                        localStorage.removeItem('userType');
                        navigate('/login');
                        return;
                    }
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Orders fetched successfully:', data.length);
            
            // Transform the data to match the expected structure
            // Group by payment_id to create the services array
            const groupedOrders = {};
            
            if (Array.isArray(data)) {
                data.forEach(order => {
                    const paymentId = order.payment_id;
                    
                    if (!groupedOrders[paymentId]) {
                        groupedOrders[paymentId] = {
                            payment_id: paymentId,
                            created_at: order.created_at,
                            total_amount: 0,
                            address: order.address,
                            city: order.city,
                            scheduled_date: order.scheduled_date,
                            time_slot: order.time_slot,
                            services: []
                        };
                    }
                    
                    // Add this service to the order
                    groupedOrders[paymentId].services.push({
                        request_id: order.request_id,
                        service_type: order.service_type,
                        status: order.status,
                        job_status: order.job_status || 'pending',
                        serviceman_id: order.serviceman_id,
                        serviceman_name: order.serviceman_name,
                        serviceman_phone: order.serviceman_phone,
                        amount: order.amount
                    });
                    
                    // Add to total amount
                    groupedOrders[paymentId].total_amount += parseFloat(order.amount || 0);
                });
            }
            
            // Convert to array
            const transformedOrders = Object.values(groupedOrders);
            console.log('Transformed orders:', transformedOrders.length);
            
            setOrders(transformedOrders);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.message || 'Failed to fetch orders');
            setLoading(false);
        }
    };

    // Function to handle order click
    const handleOrderClick = (order) => {
        // Create a copy of the order with job_status from the service status if not already present
        const orderWithJobStatus = {
            ...order,
            // Use the status from the first service as job_status
            job_status: order.services[0]?.status || 'pending'
        };
        
        // Add default values for any missing fields
        const completeOrder = {
            ...orderWithJobStatus,
            address: orderWithJobStatus.address || 'Not provided',
            landmark: orderWithJobStatus.landmark || '',
            city: orderWithJobStatus.city || 'Not provided',
            pincode: orderWithJobStatus.pincode || '',
            payment_method: orderWithJobStatus.payment_method || 'Not specified',
            total_amount: orderWithJobStatus.total_amount || 0,
            services: orderWithJobStatus.services.map(service => ({
                ...service,
                service_description: service.service_description || '',
                serviceman_name: service.serviceman_name || 'Not assigned yet',
                amount: service.amount || 0
            }))
        };
        
        setSelectedOrder(completeOrder);
        setShowOrderModal(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setShowOrderModal(false);
        setSelectedOrder(null);
    };

    // Function to render progress status
    const renderProgressStatus = (status) => {
        // Map API status values to our progress steps
        let mappedStatus = status;
        
        // Map 'accepted' to 'assigned' for progress tracking
        if (status === 'accepted') {
            mappedStatus = 'assigned';
        }
        
        // Define the progression of statuses
        const statuses = ['pending', 'assigned', 'on_the_way', 'arrived', 'in_progress', 'completed'];
        const statusLabels = {
            'pending': 'Pending',
            'assigned': 'Assigned',
            'on_the_way': 'On the Way',
            'arrived': 'Arrived',
            'in_progress': 'In Progress',
            'completed': 'Completed'
        };
        
        // Find the index of the current status
        const currentIndex = statuses.indexOf(mappedStatus);
        
        // If status is not found, default to pending (index 0)
        const progressIndex = currentIndex === -1 ? 0 : currentIndex;
        
        // Determine progress bar color based on status
        const progressBarColor = mappedStatus === 'completed' ? 'bg-green-500' : 'bg-yellow-500';
        const dotColor = mappedStatus === 'completed' ? 'bg-green-500' : 'bg-yellow-500';
        
        return (
            <div className="w-full mt-4">
                <div className="flex justify-between mb-2">
                    {statuses.map((s, index) => (
                        <div key={s} className="text-xs text-center" style={{ width: '16.66%' }}>
                            {statusLabels[s]}
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                        className={`h-full ${progressBarColor} rounded-full`}
                        style={{ width: `${(progressIndex + 1) * 16.66}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-1">
                    {statuses.map((s, index) => (
                        <div 
                            key={s} 
                            className={`w-4 h-4 rounded-full ${index <= progressIndex ? dotColor : 'bg-gray-300'}`}
                            style={{ marginLeft: index === 0 ? '0' : 'auto', marginRight: index === statuses.length - 1 ? '0' : 'auto' }}
                        ></div>
                    ))}
                </div>
            </div>
        );
    };

    // Function to handle payment
    const handlePayment = async (orderId, amount) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found');
                return;
            }
            
            // In a real app, this would integrate with a payment gateway
            // For now, we'll just simulate a successful payment
            await fetch(`${API_BASE_URL}/orders/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    order_id: orderId,
                    amount: amount
                })
            });
            
            // Update the order status locally
            const updatedOrders = orders.map(order => {
                if (order.payment_id === orderId) {
                    return {
                        ...order,
                        payment_status: 'paid',
                        services: order.services.map(service => ({
                            ...service,
                            status: 'completed'
                        }))
                    };
                }
                return order;
            });
            
            setOrders(updatedOrders);
            
            // Close the modal
            closeModal();
            
            // Show success message
            alert('Payment successful!');
        } catch (err) {
            console.error('Payment error:', err);
            alert('Payment failed. Please try again.');
        }
    };

    // Function to withdraw a service request
    const handleWithdraw = async (requestId) => {
        if (!confirm('Are you sure you want to withdraw this service request? This action cannot be undone.')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found');
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/orders/withdraw/${requestId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to withdraw service request');
            }
            
            // Update the order status locally
            const updatedOrders = orders.map(order => {
                const updatedServices = order.services.map(service => {
                    if (service.request_id === requestId) {
                        return { ...service, status: 'cancelled' };
                    }
                    return service;
                });
                
                return {
                    ...order,
                    services: updatedServices
                };
            });
            
            setOrders(updatedOrders);
            
            // If the selected order is the one being withdrawn, update it
            if (selectedOrder) {
                const updatedServices = selectedOrder.services.map(service => {
                    if (service.request_id === requestId) {
                        return { ...service, status: 'cancelled' };
                    }
                    return service;
                });
                
                setSelectedOrder({
                    ...selectedOrder,
                    services: updatedServices
                });
            }
            
            // Show success message
            alert('Service request withdrawn successfully');
        } catch (err) {
            console.error('Error withdrawing service request:', err);
            alert(err.message || 'Failed to withdraw service request');
        }
    };

    // Filter orders based on selected filter
    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        
        // Check if any service in the order matches the filter
        return order.services.some(service => {
            if (filter === 'completed' && service.status === 'completed') return true;
            if (filter === 'pending' && ['pending', 'assigned', 'on_the_way', 'arrived', 'in_progress'].includes(service.status)) return true;
            if (filter === 'cancelled' && service.status === 'cancelled') return true;
            return false;
        });
    });

    // Function to render the order details modal
    const renderOrderDetailsModal = () => {
        if (!selectedOrder) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-semibold">Order Details</h2>
                        <button 
                            onClick={closeModal}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {/* Order Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="font-semibold mb-2">Order Information</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="mb-2">
                                        <span className="text-gray-500 text-sm">Order ID:</span>
                                        <p className="font-medium">{selectedOrder.payment_id}</p>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-gray-500 text-sm">Date:</span>
                                        <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm">Status:</span>
                                        <p className="font-medium capitalize">{selectedOrder.services[0]?.status || 'Pending'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-2">Delivery Address</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="font-medium">{selectedOrder.address}</p>
                                    {selectedOrder.landmark && <p className="text-sm text-gray-500">Landmark: {selectedOrder.landmark}</p>}
                                    <p className="text-sm text-gray-500">{selectedOrder.city}, {selectedOrder.pincode}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Progress Tracking */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Progress</h3>
                            {selectedOrder.services && selectedOrder.services.length > 0 && 
                                renderProgressStatus(selectedOrder.services[0].job_status || selectedOrder.services[0].status || 'pending')}
                        </div>
                        
                        {/* Services */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Services</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                {selectedOrder.services && selectedOrder.services.map((service, index) => (
                                    <div key={index} className={index > 0 ? 'mt-4 pt-4 border-t' : ''}>
                                        <div className="flex justify-between">
                                            <p className="font-medium">{service.service_type}</p>
                                            <p className="font-medium">₹{service.amount ? parseFloat(service.amount).toFixed(2) : '0.00'}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">{service.service_description || 'No description provided'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Serviceman Information */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Serviceman</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700">
                                    {selectedOrder.services && selectedOrder.services.length > 0 && 
                                     selectedOrder.services[0].status === 'pending' 
                                        ? 'No serviceman assigned yet.' 
                                        : selectedOrder.services[0].serviceman_name 
                                          ? `Your service professional: ${selectedOrder.services[0].serviceman_name}` 
                                          : 'A service professional has been assigned to your order.'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Payment Section */}
                        <div className="mt-6 border-t pt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold">Total Amount</h3>
                                <p className="text-xl font-bold">
                                    ₹{selectedOrder.total_amount ? parseFloat(selectedOrder.total_amount).toFixed(2) : '0.00'}
                                </p>
                            </div>
                            
                            {/* Show payment button if service is completed but payment is pending */}
                            {selectedOrder.services && 
                             selectedOrder.services.length > 0 && 
                             selectedOrder.services[0].status === 'completed' && 
                             (!selectedOrder.payment_status || selectedOrder.payment_status !== 'paid') && (
                                <button
                                    onClick={() => handlePayment(
                                        selectedOrder.payment_id, 
                                        selectedOrder.total_amount ? parseFloat(selectedOrder.total_amount) : 0
                                    )}
                                    className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-medium"
                                >
                                    Pay Now
                                </button>
                            )}
                            
                            {/* Show withdraw button if service is still pending */}
                            {selectedOrder.services && 
                             selectedOrder.services.length > 0 && 
                             selectedOrder.services[0].status === 'pending' && (
                                <button
                                    onClick={() => handleWithdraw(selectedOrder.services[0].request_id)}
                                    className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium"
                                >
                                    Withdraw Request
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">All Orders</h1>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
                
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'all' 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'completed' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'pending' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('cancelled')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'cancelled' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Cancelled
                    </button>
                </div>
                
                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
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
                                {filteredOrders.map((order, index) => (
                                    <tr 
                                        key={index} 
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleOrderClick(order)}
                                    >
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
                                            ₹{parseFloat(order.total_amount).toFixed(2)}
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
                                
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No orders found with the selected filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Order Details Modal */}
                {showOrderModal && selectedOrder && renderOrderDetailsModal()}
            </div>
        </Layout>
    );
}

export default AllOrders;
