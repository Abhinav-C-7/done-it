import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found');
                    setLoading(false);
                    return;
                }

                // Fetch real notifications from the backend
                const response = await axios.get(`${API_BASE_URL}/notifications`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data && Array.isArray(response.data)) {
                    setNotifications(response.data);
                } else {
                    // Fallback to sample notifications if API doesn't return expected format
                    console.warn('API returned unexpected format, using sample data');
                    setNotifications(getSampleNotifications());
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching notifications:', err);
                setError(err.message || 'Failed to fetch notifications');
                
                // Fallback to sample notifications on error
                setNotifications(getSampleNotifications());
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [navigate, user]);

    // Fallback sample notifications
    const getSampleNotifications = () => {
        return [
            {
                notification_id: 1,
                title: 'Service Request Accepted',
                message: 'Your cleaning service request has been accepted by John Doe. Contact: +91 9876543210',
                created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                read: false,
                type: 'accepted'
            },
            {
                notification_id: 2,
                title: 'Service Completed',
                message: 'Your plumbing service has been completed. Please rate your experience',
                created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                read: true,
                type: 'completed'
            },
            {
                notification_id: 3,
                title: 'Service Provider Arrived',
                message: 'Your electrician has arrived at the location',
                created_at: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                read: true,
                type: 'status'
            }
        ];
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const notificationDate = new Date(timestamp);
        const diff = now - notificationDate;
        
        // Less than a minute
        if (diff < 60 * 1000) {
            return 'Just now';
        }
        
        // Less than an hour
        if (diff < 60 * 60 * 1000) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
        
        // Less than a day
        if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        
        // Less than a week
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = Math.floor(diff / (24 * 60 * 60 * 1000));
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
        
        // Otherwise, return the date
        return notificationDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'accepted':
                return (
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'completed':
                return (
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'status':
                return (
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 text-yellow-600">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 text-gray-600">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Authentication token not found');
                return;
            }

            // Call API to mark notification as read
            await axios.put(`${API_BASE_URL}/notifications/${id}/read`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update local state
            setNotifications(notifications.map(notification => 
                notification.notification_id === id ? { ...notification, read: true } : notification
            ));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            // Still update UI even if API call fails
            setNotifications(notifications.map(notification => 
                notification.notification_id === id ? { ...notification, read: true } : notification
            ));
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Authentication token not found');
                return;
            }

            // Call API to mark all notifications as read
            await axios.put(`${API_BASE_URL}/notifications/read-all`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update local state
            setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            // Still update UI even if API call fails
            setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    {notifications.some(n => !n.read) && (
                        <button 
                            onClick={markAllAsRead}
                            className="text-sm font-medium text-yellow-600 hover:text-yellow-800"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                
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
                ) : notifications.length === 0 ? (
                    <div className="bg-white shadow overflow-hidden rounded-lg p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <p className="mt-4 text-gray-500 mb-4">You don't have any notifications yet.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div 
                                key={notification.notification_id} 
                                className={`bg-white shadow overflow-hidden sm:rounded-lg hover:shadow-md transition-shadow duration-200 ${!notification.read ? 'border-l-4 border-yellow-500' : ''}`}
                                onClick={() => markAsRead(notification.notification_id)}
                            >
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex items-start">
                                        {getNotificationIcon(notification.type)}
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                                <h3 className={`text-lg leading-6 font-medium ${!notification.read ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {formatTime(notification.created_at)}
                                                </p>
                                            </div>
                                            <p className={`mt-1 max-w-2xl text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default Notifications;
