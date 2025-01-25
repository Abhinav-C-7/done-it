import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import io from "socket.io-client";

function WorkerDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('available');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io("http://localhost:5000");
        setSocket(newSocket);

        // Fetch initial jobs
        fetchJobs();

        return () => newSocket.close();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/jobs");
            setJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const acceptJob = async (jobId) => {
        try {
            await axios.post(`http://localhost:5000/api/jobs/${jobId}/accept`, {
                workerId: user.id
            });
            fetchJobs();
        } catch (error) {
            console.error("Error accepting job:", error);
        }
    };

    const completeJob = async (jobId) => {
        try {
            await axios.post(`http://localhost:5000/api/jobs/${jobId}/complete`);
            fetchJobs();
        } catch (error) {
            console.error("Error completing job:", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (activeTab === 'available') return job.status === 'pending';
        if (activeTab === 'active') return job.status === 'in_progress' && job.workerId === user.id;
        if (activeTab === 'completed') return job.status === 'completed' && job.workerId === user.id;
        return true;
    });

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard</h1>
                    <p className="mt-2 text-gray-600">Welcome back, {user?.name}</p>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {['available', 'active', 'completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${
                                    activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                            >
                                {tab} Jobs
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Jobs Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredJobs.map((job) => (
                        <div
                            key={job._id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{job.service}</h3>
                                    <p className="text-sm text-gray-500">{job.customer.name}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                                    {job.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Location:</span> {job.location}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Schedule:</span> {new Date(job.scheduledTime).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Price:</span> ₹{job.price}
                                </p>
                            </div>

                            {job.status === 'pending' && (
                                <button
                                    onClick={() => acceptJob(job._id)}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Accept Job
                                </button>
                            )}

                            {job.status === 'in_progress' && job.workerId === user.id && (
                                <button
                                    onClick={() => completeJob(job._id)}
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Mark as Complete
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {filteredJobs.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No {activeTab} jobs found</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default WorkerDashboard;
