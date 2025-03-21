import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AvailableJobs from '../components/AvailableJobs';
import MyJobs from '../components/MyJobs';
import Layout from '../components/Layout';

function ServicemanDashboard() {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');

    // Redirect if not logged in or not a serviceman
    if (!user || !user.email?.includes('@serviceman.doneit.com')) {
        return <Navigate to="/login" />;
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto py-6">
                <div className="px-4 py-6 sm:px-0">
                    {activeView === 'dashboard' && (
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
                                    <button 
                                        className="bg-yellow-400 text-black px-4 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                                        onClick={() => setActiveView('availableJobs')}
                                    >
                                        View Available Jobs
                                    </button>
                                    <button 
                                        className="bg-yellow-400 text-black px-4 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                                        onClick={() => setActiveView('myJobs')}
                                    >
                                        My Jobs
                                    </button>
                                    <button className="bg-yellow-400 text-black px-4 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium">
                                        Update Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'availableJobs' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
                                <button 
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    onClick={() => setActiveView('dashboard')}
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                            <AvailableJobs />
                        </div>
                    )}

                    {activeView === 'myJobs' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
                                <button 
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    onClick={() => setActiveView('dashboard')}
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                            <MyJobs />
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default ServicemanDashboard;
