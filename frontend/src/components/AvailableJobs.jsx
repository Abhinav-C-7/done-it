import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config';

const AvailableJobs = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsLocationUpdate, setNeedsLocationUpdate] = useState(false);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [servicemanLocation, setServicemanLocation] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Fetch available jobs
  const fetchAvailableJobs = async () => {
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
      
      // Check if user is authenticated
      try {
        console.log('Checking authentication...');
        const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Auth check response:', meResponse.data);
      } catch (meError) {
        console.error('Auth check error:', meError);
        if (meError.response && meError.response.status === 401) {
          localStorage.removeItem('token');
          setError('Your session has expired. Please log in again.');
          setLoading(false);
          return;
        } else {
          throw meError; // Re-throw other errors
        }
      }
      
      // Fetch all available service requests
      console.log('Fetching available jobs...');
      console.log('API URL:', `${API_BASE_URL}/serviceman/available-jobs`);
      
      const response = await axios.get(`${API_BASE_URL}/serviceman/available-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Available jobs response:', response.data);
      
      setJobs(response.data || []);
      setServicemanLocation({
        latitude: response.data.servicemanLocation?.latitude || 0,
        longitude: response.data.servicemanLocation?.longitude || 0
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching available jobs:', err);
      let errorMessage = 'Failed to fetch available jobs. Please try again later.';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.status === 400 && err.response.data.needsLocationUpdate) {
          errorMessage = err.response.data.message;
          setNeedsLocationUpdate(true);
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Update serviceman location
  const updateLocation = async () => {
    try {
      setLoading(true);
      
      if (!location.latitude || !location.longitude) {
        setError('Please enter both latitude and longitude.');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(`${API_BASE_URL}/serviceman/update-location`, {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Location update response:', response.data);
      
      setUpdateSuccess(true);
      setNeedsLocationUpdate(false);
      
      // Fetch available jobs after updating location
      fetchAvailableJobs();
    } catch (err) {
      console.error('Error updating location:', err);
      setError('Failed to update location. Please try again.');
      setLoading(false);
    }
  };

  // Handle location input change
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Accept a job
  const acceptJob = async (requestId) => {
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/serviceman/accept-job/${requestId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Job accept response:', response.data);
      
      // Remove the accepted job from the list
      setJobs(prevJobs => prevJobs.filter(job => job.request_id !== requestId));
      setLoading(false);
    } catch (err) {
      console.error('Error accepting job:', err);
      setError('Failed to accept job. Please try again.');
      setLoading(false);
    }
  };

  // Reject a job
  const rejectJob = async (requestId) => {
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/serviceman/reject-job/${requestId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Job reject response:', response.data);
      
      // Remove the rejected job from the list
      setJobs(prevJobs => prevJobs.filter(job => job.request_id !== requestId));
      setLoading(false);
    } catch (err) {
      console.error('Error rejecting job:', err);
      setError('Failed to reject job. Please try again.');
      setLoading(false);
    }
  };

  // Fetch available jobs on component mount
  useEffect(() => {
    if (token) {
      fetchAvailableJobs();
    }
  }, [token]);

  // Reset success message after 3 seconds
  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (needsLocationUpdate) {
    return (
      <div className="container mt-4">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Update Your Location</h5>
          </div>
          <div className="card-body">
            <p className="card-text">Please update your current location to view available jobs in your area.</p>
            
            {error && <div className="alert alert-danger">{error}</div>}
            {updateSuccess && <div className="alert alert-success">Location updated successfully!</div>}
            
            <div className="mb-3">
              <label htmlFor="latitude" className="form-label">Latitude</label>
              <input
                type="number"
                step="0.000001"
                className="form-control"
                id="latitude"
                name="latitude"
                value={location.latitude}
                onChange={handleLocationChange}
                placeholder="e.g. 40.7128"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="longitude" className="form-label">Longitude</label>
              <input
                type="number"
                step="0.000001"
                className="form-control"
                id="longitude"
                name="longitude"
                value={location.longitude}
                onChange={handleLocationChange}
                placeholder="e.g. -74.0060"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={updateLocation}
              disabled={!location.latitude || !location.longitude}
            >
              Update Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Available Jobs</h2>
        <div>
          <button className="btn btn-warning me-2 shadow-sm" onClick={fetchAvailableJobs}>
            Refresh
          </button>
          <button className="btn btn-outline-secondary shadow-sm" onClick={() => window.history.back()}>
            Back
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger shadow-sm">
          {error}
        </div>
      )}
      
      {jobs.length === 0 ? (
        <div className="alert alert-info shadow-sm">
          No available jobs at the moment. Check back later!
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">Showing {jobs.length} available job{jobs.length !== 1 ? 's' : ''}</p>
          <div className="row">
            {jobs.map(job => (
              <div className="col-md-6 mb-4" key={job.request_id}>
                <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                  <div className="card-header bg-warning text-dark py-3">
                    <h5 className="mb-0 fw-bold">{job.service_name}</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-4">
                      <span className="badge bg-success fs-6 rounded-pill px-3 py-2 shadow-sm">₹{job.price}</span>
                      <span className="badge bg-secondary fs-6 rounded-pill px-3 py-2 shadow-sm">
                        {format(new Date(job.scheduled_date), 'PP')} • {job.time_slot}
                      </span>
                    </div>
                    
                    <div className="mb-4 p-3 bg-light rounded-3 shadow-sm">
                      <h6 className="mb-2 fw-bold">Customer</h6>
                      <p className="mb-0 fs-5">{job.customer_name}</p>
                    </div>
                    
                    <div className="mb-4 p-3 bg-light rounded-3 shadow-sm">
                      <h6 className="mb-2 fw-bold">Location</h6>
                      <div>
                        <p className="mb-1">{job.address}</p>
                        <p className="mb-1">{job.city}, {job.pincode}</p>
                        {job.landmark && <p className="mb-0 fst-italic">Landmark: {job.landmark}</p>}
                        {job.distance !== null && (
                          <p className="text-muted mt-2 small">
                            {Math.round(job.distance / 1000)} km away
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4 p-3 bg-light rounded-3 shadow-sm">
                      <h6 className="mb-2 fw-bold">Description</h6>
                      <p className="mb-0">{job.description}</p>
                    </div>
                    
                    <div className="text-muted mt-3 d-flex justify-content-end">
                      <small className="bg-light px-2 py-1 rounded-pill">Posted: {format(new Date(job.created_at), 'PPp')}</small>
                    </div>
                  </div>
                  <div className="card-footer bg-white py-3 d-flex justify-content-between">
                    <button
                      className="btn btn-warning btn-lg px-4 shadow-sm"
                      onClick={() => acceptJob(job.request_id)}
                    >
                      Accept Job
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-lg px-4 shadow-sm"
                      onClick={() => rejectJob(job.request_id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableJobs;
