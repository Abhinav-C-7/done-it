import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../config';

const JobDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [price, setPrice] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState(null);
  const [showPriceConfirmation, setShowPriceConfirmation] = useState(false);
  const [priceToUpdate, setPriceToUpdate] = useState(null);

  // Fetch job details
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Fetch job details
      console.log('Fetching job details...');
      console.log('API URL:', `${API_BASE_URL}/serviceman/job/${requestId}`);
      
      const response = await axios.get(`${API_BASE_URL}/serviceman/job/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Job details response:', response.data);
      
      setJob(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching job details:', err);
      let errorMessage = 'Failed to fetch job details. Please try again later.';
      
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

  // Update job status
  const updateJobStatus = async (status) => {
    try {
      setUpdatingStatus(true);
      setError(null);
      setSuccessMessage('');
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setUpdatingStatus(false);
        return;
      }
      
      // Update job status
      console.log('Updating job status...');
      console.log('API URL:', `${API_BASE_URL}/serviceman/job/${requestId}/status`);
      
      const response = await axios.put(
        `${API_BASE_URL}/serviceman/job/${requestId}/status`, 
        { jobStatus: status },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Update status response:', response.data);
      
      // Update job in state
      setJob(prevJob => ({
        ...prevJob,
        job_status: status
      }));
      
      setSuccessMessage('Job status updated successfully!');
      setUpdatingStatus(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating job status:', err);
      let errorMessage = 'Failed to update job status. Please try again later.';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
      setUpdatingStatus(false);
    }
  };

  // Show confirmation dialog for status update
  const handleStatusUpdate = (status) => {
    setStatusToUpdate(status);
    setShowConfirmation(true);
  };

  // Confirm and update status
  const confirmStatusUpdate = () => {
    if (statusToUpdate) {
      updateJobStatus(statusToUpdate);
      setShowConfirmation(false);
      setStatusToUpdate(null);
    }
  };

  // Cancel status update
  const cancelStatusUpdate = () => {
    setShowConfirmation(false);
    setStatusToUpdate(null);
  };

  // Update job price
  const updateJobPrice = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setUpdatingPrice(true);
      setError(null);
      setSuccessMessage('');
      
      // Validate price
      if (!priceToUpdate || isNaN(priceToUpdate) || parseFloat(priceToUpdate) <= 0) {
        setError('Please enter a valid price.');
        setUpdatingPrice(false);
        return;
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setUpdatingPrice(false);
        return;
      }
      
      // Update job price
      console.log('Updating job price...');
      console.log('API URL:', `${API_BASE_URL}/serviceman/job/${requestId}/price`);
      
      const response = await axios.put(
        `${API_BASE_URL}/serviceman/job/${requestId}/price`, 
        { price: parseFloat(priceToUpdate) },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Update price response:', response.data);
      
      // Update job in state
      setJob(prevJob => ({
        ...prevJob,
        price: parseFloat(priceToUpdate),
        price_finalized: true
      }));
      
      setSuccessMessage('Job price finalized successfully!');
      setUpdatingPrice(false);
      setPrice('');
      setShowPriceConfirmation(false);
      setPriceToUpdate(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating job price:', err);
      let errorMessage = 'Failed to update job price. Please try again later.';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
      setUpdatingPrice(false);
      setShowPriceConfirmation(false);
    }
  };

  // Show confirmation dialog for price update
  const handlePriceUpdate = (e) => {
    e.preventDefault();
    
    // Validate price
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      setError('Please enter a valid price.');
      return;
    }
    
    setPriceToUpdate(price);
    setShowPriceConfirmation(true);
    setError(null);
  };

  // Cancel price update
  const cancelPriceUpdate = () => {
    setShowPriceConfirmation(false);
    setPriceToUpdate(null);
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

  // Fetch job details on component mount
  useEffect(() => {
    fetchJobDetails();
  }, [requestId]);

  // Redirect if not logged in or not a serviceman
  if (!user || !user.email?.includes('@serviceman.doneit.com')) {
    return navigate('/login');
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-6">
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-6">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button 
            onClick={() => navigate('/serviceman-dashboard')} 
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Not Found</h2>
            <p className="text-gray-600 mb-4">The requested job could not be found or you don't have permission to view it.</p>
            <button 
              onClick={() => navigate('/serviceman-dashboard')} 
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header with back button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
            <button 
              onClick={() => navigate('/serviceman-dashboard')} 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Job details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h2>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">Service Type</span>
                <span className="block text-base font-semibold text-gray-900">{job.service_type}</span>
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">Description</span>
                <span className="block text-base text-gray-900">{job.description}</span>
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">Status</span>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(job.job_status)}`}>
                  {formatJobStatus(job.job_status)}
                </span>
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">Date Requested</span>
                <span className="block text-base text-gray-900">
                  {format(new Date(job.created_at), 'PPP')}
                </span>
              </div>
              
              {job.price && (
                <div className="mb-4">
                  <span className="block text-sm font-medium text-gray-500">Price</span>
                  <span className="block text-base font-semibold text-green-700">₹{job.price}</span>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">Name</span>
                <span className="block text-base font-semibold text-gray-900">{job.customer_name}</span>
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">Phone</span>
                <span className="block text-base text-gray-900">{job.customer_phone}</span>
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">Email</span>
                <span className="block text-base text-gray-900">{job.customer_email}</span>
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-500">Address</span>
                <span className="block text-base text-gray-900">{job.location_address}</span>
              </div>
            </div>
          </div>

          {/* Update Status Section */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Job Status</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleStatusUpdate('on_the_way')}
                disabled={updatingStatus || job.job_status === 'on_the_way' || job.job_status === 'arrived' || job.job_status === 'in_progress' || job.job_status === 'completed'}
                className={`px-4 py-2 rounded-lg font-medium transition-colors
                  ${job.job_status === 'on_the_way' 
                    ? 'bg-blue-500 text-white cursor-not-allowed' 
                    : job.job_status === 'arrived' || job.job_status === 'in_progress' || job.job_status === 'completed'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
              >
                On the Way
              </button>
              
              <button
                onClick={() => handleStatusUpdate('arrived')}
                disabled={updatingStatus || job.job_status === 'arrived' || job.job_status === 'in_progress' || job.job_status === 'completed' || job.job_status === 'pending'}
                className={`px-4 py-2 rounded-lg font-medium transition-colors
                  ${job.job_status === 'arrived' 
                    ? 'bg-yellow-500 text-white cursor-not-allowed' 
                    : job.job_status === 'in_progress' || job.job_status === 'completed' || job.job_status === 'pending'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
              >
                Arrived
              </button>
              
              <button
                onClick={() => handleStatusUpdate('in_progress')}
                disabled={updatingStatus || job.job_status === 'in_progress' || job.job_status === 'completed' || job.job_status === 'pending' || job.job_status === 'on_the_way'}
                className={`px-4 py-2 rounded-lg font-medium transition-colors
                  ${job.job_status === 'in_progress' 
                    ? 'bg-purple-500 text-white cursor-not-allowed' 
                    : job.job_status === 'completed' || job.job_status === 'pending' || job.job_status === 'on_the_way'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
              >
                In Progress
              </button>
              
              <button
                onClick={() => handleStatusUpdate('completed')}
                disabled={updatingStatus || job.job_status === 'completed' || job.job_status === 'pending' || job.job_status === 'on_the_way'}
                className={`px-4 py-2 rounded-lg font-medium transition-colors
                  ${job.job_status === 'completed' 
                    ? 'bg-green-500 text-white cursor-not-allowed' 
                    : job.job_status === 'pending' || job.job_status === 'on_the_way'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
              >
                Completed
              </button>
            </div>
            
            {updatingStatus && (
              <div className="mt-3 text-sm text-gray-600">
                Updating status...
              </div>
            )}
          </div>

          {/* Confirmation Dialog */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                        Update Job Status
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to update the job status to {formatJobStatus(statusToUpdate)}?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={confirmStatusUpdate}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-400 text-base font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:w-32 sm:text-sm text-center"
                  >
                    Update Status
                  </button>
                  <button
                    type="button"
                    onClick={cancelStatusUpdate}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-32 sm:text-sm text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Update Price Section - Only show if job is completed and price is not finalized */}
          {job.job_status === 'completed' && !job.price_finalized && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Set Final Job Price</h2>
              
              <form onSubmit={handlePriceUpdate} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow">
                  <label htmlFor="price" className="sr-only">Price</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      className="focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">INR</span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updatingPrice}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  {updatingPrice ? 'Finalizing...' : 'Finalize Price'}
                </button>
              </form>
              <p className="mt-2 text-sm text-gray-500">
                Note: Once you finalize the price, it cannot be changed.
              </p>
            </div>
          )}

          {/* Display finalized price if it exists */}
          {job.price_finalized && job.price && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Final Job Price</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-lg font-medium">
                  ₹{job.price} <span className="text-sm text-gray-500 ml-2">(Finalized)</span>
                </p>
              </div>
            </div>
          )}

          {/* Price Confirmation Dialog */}
          {showPriceConfirmation && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                        Update Job Price
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to update the job price to ₹{priceToUpdate}?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={updateJobPrice}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-400 text-base font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:w-32 sm:text-sm text-center"
                  >
                    Update Price
                  </button>
                  <button
                    type="button"
                    onClick={cancelPriceUpdate}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-32 sm:text-sm text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobDetails;
