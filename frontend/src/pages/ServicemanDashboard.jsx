import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function ServicemanDashboard() {
    const { user } = useAuth();

    // Redirect if not logged in or not a serviceman
    if (!user || !user.email?.includes('@serviceman.doneit.com')) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Welcome, {user.full_name}!
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Stats Cards */}
                            <div className="bg-blue-50 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-blue-800">Total Jobs</h3>
                                <p className="text-3xl font-bold text-blue-600">{user.total_jobs || 0}</p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-green-800">Completed Jobs</h3>
                                <p className="text-3xl font-bold text-green-600">{user.completed_jobs || 0}</p>
                            </div>
                            <div className="bg-yellow-50 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-yellow-800">Rating</h3>
                                <p className="text-3xl font-bold text-yellow-600">{user.rating || '0.0'} ⭐</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button className="bg-yellow-400 text-black px-4 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium">
                                    View Available Jobs
                                </button>
                                <button className="bg-yellow-400 text-black px-4 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium">
                                    Update Profile
                                </button>
                                <button className="bg-yellow-400 text-black px-4 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium">
                                    View Earnings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServicemanDashboard;
