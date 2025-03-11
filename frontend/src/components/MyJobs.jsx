import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const MyJobs = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch my jobs
  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Fetch all my jobs
      console.log('Fetching my jobs...');
      console.log('API URL:', `${API_BASE_URL}/serviceman/my-jobs`);
      
      const response = await axios.get(`${API_BASE_URL}/serviceman/my-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('My jobs response:', response.data);
      
      setJobs(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching my jobs:', err);
      let errorMessage = 'Failed to fetch my jobs. Please try again later.';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Format job status for display
  const formatJobStatus = (status) => {
    if (!status) return 'Pending';
    
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'on_the_way':
        return 'On the Way';
      case 'arrived':
        return 'Arrived at Location';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    if (!status) return 'bg-gray-200 text-gray-800';
    
    switch (status) {
      case 'pending':
        return 'bg-gray-200 text-gray-800';
      case 'on_the_way':
        return 'bg-blue-200 text-blue-800';
      case 'arrived':
        return 'bg-yellow-200 text-yellow-800';
      case 'in_progress':
        return 'bg-purple-200 text-purple-800';
      case 'completed':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Fetch my jobs on component mount
  useEffect(() => {
    if (token) {
      fetchMyJobs();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">No Jobs Found</h2>
        <p className="text-gray-600 mb-4">You haven't accepted any jobs yet.</p>
        <button 
          onClick={() => window.history.back()} 
          className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Jobs</h2>
      
      <div className="grid gap-6">
        {jobs.map((job) => (
          <div key={job.request_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{job.service_type}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(job.job_status)}`}>
                {formatJobStatus(job.job_status)}
              </span>
            </div>
            
            <p className="text-gray-600 mb-2">{job.description}</p>
            
            <div className="mb-2">
              <span className="text-sm text-gray-500">Customer: </span>
              <span className="text-sm font-medium text-gray-700">{job.customer_name}</span>
            </div>
            
            <div className="mb-2">
              <span className="text-sm text-gray-500">Location: </span>
              <span className="text-sm font-medium text-gray-700">{job.location_address}</span>
            </div>
            
            <div className="mb-4">
              <span className="text-sm text-gray-500">Date: </span>
              <span className="text-sm font-medium text-gray-700">
                {format(new Date(job.created_at), 'PPP')}
              </span>
            </div>
            
            {job.price && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">Price: </span>
                <span className="text-sm font-medium text-green-700">₹{job.price}</span>
              </div>
            )}
            
            <Link 
              to={`/job/${job.request_id}`} 
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium inline-block"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyJobs;
