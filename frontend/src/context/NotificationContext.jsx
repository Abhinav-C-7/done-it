import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from './AuthContext';
import Toast from '../components/Toast';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeToast, setActiveToast] = useState(null);
  const { user } = useAuth();

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Set up socket connection for real-time notifications
      setupSocketConnection();
    } else {
      // Reset notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Set up socket connection for real-time notifications
  const setupSocketConnection = () => {
    if (!user) return;

    // Check if socket.io is available in the window object
    if (window.io) {
      const socket = window.io(API_BASE_URL);
      
      // Join the user's room
      socket.emit('join', { userId: user.id, userType: user.type });
      
      // Listen for price update notifications
      socket.on('priceUpdate', (data) => {
        const { requestId, price, servicemanName, paymentId, serviceType } = data;
        
        // Create a new notification object
        const newNotification = {
          id: Date.now(),
          title: 'Price Finalized',
          message: `${servicemanName} has finalized the price for your service request: ₹${price}. Please proceed with payment.`,
          type: 'price_update',
          reference_id: requestId,
          amount: price,
          payment_id: paymentId,
          service_type: serviceType,
          read: false,
          created_at: new Date().toISOString()
        };
        
        // Add the notification to the state
        addNotification(newNotification);
        
        // Show toast notification
        setActiveToast(newNotification);
      });
      
      return () => {
        socket.disconnect();
      };
    }
  };

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // The API returns an array of notifications directly
      const notificationsData = Array.isArray(response.data) ? response.data : [];
      setNotifications(notificationsData);
      
      // Calculate unread count
      const unread = notificationsData.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      // Reset notifications on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Add a new notification to the state
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!user) return;
    
    try {
      await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId || notification.notification_id === notificationId
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await axios.put(`${API_BASE_URL}/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // Add a mock notification (for testing purposes)
  const addMockNotification = (message, type = 'status', referenceId = null) => {
    const newNotification = {
      id: Date.now(),
      title: 'New Notification',
      message: message || 'New notification',
      type: type,
      reference_id: referenceId,
      read: false,
      created_at: new Date().toISOString()
    };
    
    // Add to notifications list
    addNotification(newNotification);
    
    // Show toast for the mock notification
    setActiveToast(newNotification);
  };

  // Add a mock price update notification (for testing)
  const addMockPriceUpdateNotification = (price = 1500, servicemanName = 'John Doe', requestId = '123') => {
    const newNotification = {
      id: Date.now(),
      title: 'Price Finalized',
      message: `${servicemanName} has finalized the price for your service request: ₹${price}. Please proceed with payment.`,
      type: 'price_update',
      reference_id: requestId,
      amount: price,
      payment_id: `payment_${Date.now()}`,
      service_type: 'Home Cleaning',
      read: false,
      created_at: new Date().toISOString()
    };
    
    // Add to notifications list
    addNotification(newNotification);
    
    // Show toast for the mock notification
    setActiveToast(newNotification);
  };

  // Close the active toast
  const closeToast = () => {
    setActiveToast(null);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addMockNotification,
    addMockPriceUpdateNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {activeToast && (
        <Toast 
          notification={activeToast} 
          onClose={closeToast} 
          autoClose={true} 
          duration={5000} 
        />
      )}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
