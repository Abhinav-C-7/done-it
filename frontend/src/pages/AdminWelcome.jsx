import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function AdminWelcome() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user && user.type === 'admin') {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setDashboardData(response.data);
                } catch (err) {
                    console.error('Error fetching dashboard data:', err);
                    setError('Failed to load dashboard data. Please try again later.');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    // Redirect if not logged in or not an admin
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    if (user.type !== 'admin') {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="px-8 py-6 bg-gradient-to-r from-blue-500 to-blue-600">
                        <h1 className="text-3xl font-bold text-white text-center">Admin Dashboard</h1>
                        <p className="text-blue-100 text-center mt-2">Welcome to the Done-it Admin Panel</p>
                    </div>
                    
                    <div className="p-8">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                            <p className="text-blue-700 text-lg font-semibold">Hello, {user.fullName || 'Administrator'}</p>
                            <p className="text-blue-700 mt-2">You are logged in as an admin with role: {user.role || 'admin'}</p>
                        </div>
                        
                        {loading ? (
                            <div className="flex justify-center my-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
                                <p className="text-red-700">{error}</p>
                            </div>
                        ) : dashboardData ? (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard Overview</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                        <div className="text-blue-500 text-3xl font-bold">{dashboardData.stats.customerCount}</div>
                                        <div className="text-gray-500 mt-2">Total Customers</div>
                                    </div>
                                    
                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                        <div className="text-green-500 text-3xl font-bold">{dashboardData.stats.servicemanCount}</div>
                                        <div className="text-gray-500 mt-2">Total Servicemen</div>
                                    </div>
                                    
                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                        <div className="text-yellow-500 text-3xl font-bold">{dashboardData.stats.requestCount}</div>
                                        <div className="text-gray-500 mt-2">Total Service Requests</div>
                                    </div>
                                    
                                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                        <div className="text-red-500 text-3xl font-bold">{dashboardData.stats.pendingRequestCount}</div>
                                        <div className="text-gray-500 mt-2">Pending Requests</div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        
                        <div className="mt-8 text-center">
                            <p className="text-gray-600 mb-4">
                                The full admin dashboard is currently under development. More features will be available soon.
                            </p>
                            
                            <div className="flex flex-wrap justify-center gap-4">
                                <button 
                                    onClick={() => window.location.href = '/'}
                                    className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-200"
                                >
                                    Go to Homepage
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
