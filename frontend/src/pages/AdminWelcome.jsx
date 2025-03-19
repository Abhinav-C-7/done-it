import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function AdminWelcome() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [customers, setCustomers] = useState([]);
    const [servicemen, setServicemen] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('pending');

    useEffect(() => {
        if (!user || user.type !== 'admin') {
            navigate('/login');
            return;
        }

        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDashboardData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again later.');
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            setLoadingUsers(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/admin/customers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCustomers(response.data);
            setLoadingUsers(false);
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError('Failed to load customers. Please try again later.');
            setLoadingUsers(false);
        }
    };

    const fetchServicemen = async () => {
        try {
            setLoadingUsers(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/admin/servicemen`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setServicemen(response.data);
            setLoadingUsers(false);
        } catch (err) {
            console.error('Error fetching servicemen:', err);
            setError('Failed to load servicemen. Please try again later.');
            setLoadingUsers(false);
        }
    };

    const fetchReviews = async () => {
        try {
            setLoadingUsers(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/admin/reviews`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setReviews(response.data);
            setLoadingUsers(false);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to load reviews. Please try again later.');
            setLoadingUsers(false);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoadingUsers(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/admin/applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setApplications(response.data);
            setLoadingUsers(false);
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load applications. Please try again later.');
            setLoadingUsers(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'customers' && customers.length === 0) {
            fetchCustomers();
        } else if (tab === 'servicemen' && servicemen.length === 0) {
            fetchServicemen();
        } else if (tab === 'reviews' && reviews.length === 0) {
            fetchReviews();
        } else if (tab === 'applications' && applications.length === 0) {
            fetchApplications();
        }
    };

    const handleApproveApplication = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/admin/applications/${id}/approve`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Refresh applications list
            fetchApplications();
            // Refresh servicemen list if it's already loaded
            if (servicemen.length > 0) {
                fetchServicemen();
            }
            
            alert('Application approved successfully');
        } catch (err) {
            console.error('Error approving application:', err);
            alert('Failed to approve application. Please try again.');
        }
    };

    const handleRejectClick = (application) => {
        setSelectedApplication(application);
        setRejectionReason('');
        setShowRejectionModal(true);
    };

    const handleRejectApplication = async () => {
        try {
            if (!rejectionReason.trim()) {
                alert('Please provide a reason for rejection');
                return;
            }
            
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/admin/applications/${selectedApplication.registration_id}/reject`, 
                { rejection_reason: rejectionReason },
                { headers: { 'Authorization': `Bearer ${token}` }}
            );
            
            // Close modal and refresh applications
            setShowRejectionModal(false);
            fetchApplications();
            
            alert('Application rejected successfully');
        } catch (err) {
            console.error('Error rejecting application:', err);
            alert('Failed to reject application. Please try again.');
        }
    };

    const filteredApplications = applications.filter(app => {
        if (statusFilter === 'all') return true;
        return app.status === statusFilter;
    });

    const renderDashboard = () => {
        if (loading) {
            return <div className="text-center py-5">Loading dashboard data...</div>;
        }

        if (error) {
            return <div className="text-center py-5 text-red-500">{error}</div>;
        }

        if (!dashboardData) {
            return <div className="text-center py-5">No dashboard data available.</div>;
        }

        // Extract stats from the dashboardData
        const stats = dashboardData.stats || {};

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Total Customers</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.customerCount || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Total Servicemen</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.servicemanCount || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Service Requests</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats.requestCount || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Pending Requests</h3>
                    <p className="text-3xl font-bold text-orange-600">{stats.pendingRequestCount || 0}</p>
                </div>
            </div>
        );
    };

    const renderCustomers = () => {
        if (loadingUsers) {
            return <div className="text-center py-5">Loading customers...</div>;
        }

        if (error && activeTab === 'customers') {
            return <div className="text-center py-5 text-red-500">{error}</div>;
        }

        if (customers.length === 0) {
            return <div className="text-center py-5">No customers found.</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-600">ID</th>
                            <th className="px-4 py-2 text-left text-gray-600">Name</th>
                            <th className="px-4 py-2 text-left text-gray-600">Email</th>
                            <th className="px-4 py-2 text-left text-gray-600">Phone</th>
                            <th className="px-4 py-2 text-left text-gray-600">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.user_id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-2">{customer.user_id}</td>
                                <td className="px-4 py-2">{customer.full_name}</td>
                                <td className="px-4 py-2">{customer.email}</td>
                                <td className="px-4 py-2">{customer.phone_number || 'N/A'}</td>
                                <td className="px-4 py-2">{new Date(customer.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderServicemen = () => {
        if (loadingUsers) {
            return <div className="text-center py-5">Loading servicemen...</div>;
        }

        if (error && activeTab === 'servicemen') {
            return <div className="text-center py-5 text-red-500">{error}</div>;
        }

        if (servicemen.length === 0) {
            return <div className="text-center py-5">No servicemen found.</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-600">ID</th>
                            <th className="px-4 py-2 text-left text-gray-600">Name</th>
                            <th className="px-4 py-2 text-left text-gray-600">Email</th>
                            <th className="px-4 py-2 text-left text-gray-600">Skills</th>
                            <th className="px-4 py-2 text-left text-gray-600">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicemen.map(serviceman => (
                            <tr key={serviceman.serviceman_id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-2">{serviceman.serviceman_id}</td>
                                <td className="px-4 py-2">{serviceman.full_name}</td>
                                <td className="px-4 py-2">{serviceman.email}</td>
                                <td className="px-4 py-2">{serviceman.skills || 'N/A'}</td>
                                <td className="px-4 py-2">{new Date(serviceman.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderReviews = () => {
        if (loadingUsers) {
            return <div className="text-center py-5">Loading reviews...</div>;
        }

        if (error && activeTab === 'reviews') {
            return <div className="text-center py-5 text-red-500">{error}</div>;
        }

        if (reviews.length === 0) {
            return <div className="text-center py-5">No reviews found.</div>;
        }

        return (
            <div className="space-y-4">
                {reviews.map(review => (
                    <div key={review.review_id} className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg">{review.service_type}</h3>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Customer:</span> {review.customer_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Serviceman:</span> {review.serviceman_name || 'Not assigned'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Location:</span> {review.address}
                                </p>
                            </div>
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <svg 
                                        key={i} 
                                        className={`w-5 h-5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                                <span className="ml-2 font-semibold">{review.rating}/5</span>
                            </div>
                        </div>
                        {review.comment && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        )}
                        <div className="mt-2 text-right text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderApplications = () => {
        if (loadingUsers) {
            return <div className="text-center py-5">Loading applications...</div>;
        }

        if (error && activeTab === 'applications') {
            return <div className="text-center py-5 text-red-500">{error}</div>;
        }

        return (
            <div>
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <label htmlFor="statusFilter" className="mr-2 font-medium">Filter by status:</label>
                        <select 
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border rounded-md px-3 py-1"
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                    <div className="text-sm text-gray-600">
                        Showing {filteredApplications.length} application(s)
                    </div>
                </div>

                {filteredApplications.length === 0 ? (
                    <div className="text-center py-5">No applications found.</div>
                ) : (
                    <div className="space-y-4">
                        {filteredApplications.map(application => (
                            <div key={application.registration_id} className="bg-white p-4 rounded-lg shadow-md">
                                <div className="flex justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg">{application.full_name}</h3>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Email:</span> {application.email}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Phone:</span> {application.phone_number}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Location:</span> {application.address}, {application.city}, {application.pincode}
                                        </p>
                                        <div className="mt-2">
                                            <p className="font-medium text-sm">Skills:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {application.skills.map((skill, index) => (
                                                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <a 
                                                href={`${API_BASE_URL}/admin/applications/${application.registration_id}/id-proof`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                View ID Proof
                                            </a>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-block px-2 py-1 rounded text-sm font-medium mb-2 
                                            ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                              application.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                              'bg-red-100 text-red-800'}`}>
                                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Applied on {new Date(application.created_at).toLocaleDateString()}
                                        </p>
                                        {application.status === 'rejected' && application.rejection_reason && (
                                            <div className="mt-2 text-sm text-red-600">
                                                <p className="font-medium">Reason for rejection:</p>
                                                <p>{application.rejection_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {application.status === 'pending' && (
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button 
                                            onClick={() => handleApproveApplication(application.registration_id)}
                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleRejectClick(application)}
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Rejection Modal */}
                {showRejectionModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Reject Application</h3>
                            <p className="mb-2">Please provide a reason for rejecting {selectedApplication?.full_name}'s application:</p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full border rounded-md p-2 mb-4"
                                rows="3"
                                placeholder="Enter rejection reason..."
                            ></textarea>
                            <div className="flex justify-end space-x-2">
                                <button 
                                    onClick={() => setShowRejectionModal(false)}
                                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleRejectApplication}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold">Admin Dashboard</h2>
                    <p className="text-sm text-gray-400">Welcome, {user?.fullName}</p>
                </div>
                <nav className="mt-4">
                    <ul>
                        <li>
                            <button 
                                onClick={() => handleTabChange('dashboard')}
                                className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                </svg>
                                Dashboard
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => handleTabChange('customers')}
                                className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'customers' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                                Customers
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => handleTabChange('servicemen')}
                                className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'servicemen' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                Servicemen
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => handleTabChange('reviews')}
                                className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'reviews' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                </svg>
                                Reviews
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => handleTabChange('applications')}
                                className={`w-full text-left px-4 py-2 flex items-center ${activeTab === 'applications' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Applications
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {activeTab === 'dashboard' && 'Dashboard Overview'}
                        {activeTab === 'customers' && 'Customer Management'}
                        {activeTab === 'servicemen' && 'Serviceman Management'}
                        {activeTab === 'reviews' && 'Reviews'}
                        {activeTab === 'applications' && 'Serviceman Applications'}
                    </h1>
                </div>

                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'customers' && renderCustomers()}
                {activeTab === 'servicemen' && renderServicemen()}
                {activeTab === 'reviews' && renderReviews()}
                {activeTab === 'applications' && renderApplications()}
            </div>
        </div>
    );
}
