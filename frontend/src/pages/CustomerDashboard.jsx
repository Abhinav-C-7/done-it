import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function CustomerDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchRequests = async () => {
            try {
                // Get token from localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`http://localhost:5000/api/services/customer/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setRequests(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching requests:', err);
                setError(err.response?.data?.message || 'Failed to fetch requests');
                setLoading(false);
            }
        };

        fetchRequests();
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
            <div className='m-4 border border-gray-500/30 rounded-xl shadow-sm p-6'>
                <div className='flex justify-between items-center mb-6'>
                    <h1 className='text-2xl font-semibold'>My Requests</h1>
                    <button className='px-4 py-2 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors'>
                        New Request
                    </button>
                </div>

                <div className='space-y-4'>
                    {requests.map(request => (
                        <div key={request.id} className='border rounded-lg p-4'>
                            <div className='flex justify-between items-start'>
                                <div>
                                    <h3 className='font-semibold'>{request.service_type}</h3>
                                    <p className='text-gray-600'>{request.description}</p>
                                    <p className='text-sm text-gray-500'>Status: {request.status}</p>
                                </div>
                                <div className='text-right'>
                                    <p className='font-semibold'>₹{request.price}</p>
                                    <p className='text-sm text-gray-500'>{new Date(request.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {requests.length === 0 && (
                        <div className='text-center text-gray-500 py-8'>
                            No requests found. Create a new request to get started!
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default CustomerDashboard;
