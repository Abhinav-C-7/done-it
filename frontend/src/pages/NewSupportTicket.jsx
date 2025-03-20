import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function NewSupportTicket() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [selectedRequestId, setSelectedRequestId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Fetch customer's service requests
    useEffect(() => {
        if (!user) return;

        const fetchServiceRequests = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/orders`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setServiceRequests(response.data);
            } catch (err) {
                console.error('Error fetching service requests:', err);
                setError('Failed to load your service requests. You can still create a ticket without selecting a specific service.');
            } finally {
                setLoading(false);
            }
        };

        fetchServiceRequests();
    }, [user]);

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            
            if (!file.type.match('image.*')) {
                setError('Please select an image file');
                return;
            }
            
            setSelectedImage(file);
            
            // Create image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            setError(null);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!subject.trim()) {
            setError('Please enter a subject');
            return;
        }
        
        if (!description.trim()) {
            setError('Please enter a description');
            return;
        }
        
        setSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append('subject', subject);
            formData.append('description', description);
            
            if (selectedRequestId) {
                formData.append('requestId', selectedRequestId);
            }
            
            if (selectedImage) {
                formData.append('image', selectedImage);
            }
            
            const response = await axios.post(`${API_BASE_URL}/api/support`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Redirect to the support ticket detail page
            navigate(`/support/${response.data.ticket_id}`);
        } catch (err) {
            console.error('Error creating support ticket:', err);
            setError('Failed to create support ticket. Please try again later.');
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Support Ticket</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Please provide details about your issue and we'll get back to you as soon as possible.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm rounded-lg p-6">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                            Subject *
                        </label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                            placeholder="Brief description of your issue"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="service-request" className="block text-sm font-medium text-gray-700">
                            Related Service Request (Optional)
                        </label>
                        <select
                            id="service-request"
                            value={selectedRequestId}
                            onChange={(e) => setSelectedRequestId(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                        >
                            <option value="">Select a service request</option>
                            {serviceRequests.map((request) => (
                                <option key={request.request_id} value={request.request_id}>
                                    {request.service_type} - {new Date(request.created_at).toLocaleDateString()} - {request.address.substring(0, 30)}...
                                </option>
                            ))}
                        </select>
                        {loading && (
                            <p className="mt-1 text-sm text-gray-500">Loading your service requests...</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                            placeholder="Please provide details about your issue"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Attach Image (Optional)
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <div>
                                        <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedImage(null);
                                                setImagePreview(null);
                                            }}
                                            className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                                                <span>Upload a file</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/support')}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}

export default NewSupportTicket;
