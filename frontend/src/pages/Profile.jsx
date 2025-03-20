import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import defaultProfilePic from '../assets/images/profile.png';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [savedLocations, setSavedLocations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(defaultProfilePic);
  const [tempProfilePicture, setTempProfilePicture] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        // Fetch user profile data
        const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Profile data received:', profileResponse.data);

        // Extract user data from the response
        const userData = profileResponse.data.user;
        
        if (userData) {
          setProfileData({
            fullName: userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone_number || '',
            address: userData.address || ''
          });
          
          // Set profile picture if available from the backend
          if (userData.profile_picture) {
            setProfilePicture(userData.profile_picture);
          }
        }

        // Fetch saved locations (if API exists)
        try {
          const locationsResponse = await axios.get(`${API_BASE_URL}/customer/saved-locations`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (locationsResponse.data) {
            setSavedLocations(locationsResponse.data);
          }
        } catch (locErr) {
          console.log('No saved locations found or API not available');
          // Use sample data for now
          setSavedLocations([
            { id: 1, name: 'Home', address: '123 Main St, Bangalore', isDefault: true },
            { id: 2, name: 'Work', address: 'Tech Park, Whitefield, Bangalore', isDefault: false }
          ]);
        }

        // Fetch reviews given by the user (if API exists)
        try {
          const reviewsResponse = await axios.get(`${API_BASE_URL}/customer/reviews`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (reviewsResponse.data) {
            setReviews(reviewsResponse.data);
          }
        } catch (revErr) {
          console.log('No reviews found or API not available');
          // Use sample data for now
          setReviews([
            { 
              id: 1, 
              servicemanName: 'John Doe', 
              serviceType: 'Plumbing', 
              rating: 4.5, 
              comment: 'Great service, fixed the issue quickly!',
              date: '2025-02-15'
            },
            { 
              id: 2, 
              servicemanName: 'Jane Smith', 
              serviceType: 'Electrical', 
              rating: 5, 
              comment: 'Excellent work, very professional',
              date: '2025-03-01'
            }
          ]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const saveProfileChanges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      await axios.put(`${API_BASE_URL}/auth/update-profile`, {
        full_name: profileData.fullName,
        phone_number: profileData.phone,
        address: profileData.address,
        profile_picture: profilePicture !== defaultProfilePic ? profilePicture : null
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setIsEditing(false);
      setLoading(false);
      setSuccessMessage('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        // Store the image temporarily and show confirmation dialog
        setTempProfilePicture(base64Image);
        setShowConfirmation(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const confirmProfilePictureChange = () => {
    // Apply the temporary profile picture
    setProfilePicture(tempProfilePicture);
    
    // Save the profile picture to local storage to persist it temporarily
    localStorage.setItem('profilePicture', tempProfilePicture);
    
    // Update the profile picture on the server
    updateProfilePicture(tempProfilePicture);
    
    // Close the confirmation dialog
    setShowConfirmation(false);
    setTempProfilePicture(null);
  };
  
  const cancelProfilePictureChange = () => {
    // Clear the temporary profile picture and close the confirmation dialog
    setTempProfilePicture(null);
    setShowConfirmation(false);
  };
  
  // Function to update profile picture on the server
  const updateProfilePicture = async (pictureData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }
      
      await axios.put(`${API_BASE_URL}/auth/update-profile`, {
        profile_picture: pictureData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success message
      setSuccessMessage('Profile picture updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      console.log('Profile picture updated successfully');
    } catch (err) {
      console.error('Error updating profile picture:', err);
    }
  };

  // Load profile picture from local storage on component mount
  useEffect(() => {
    const savedProfilePicture = localStorage.getItem('profilePicture');
    if (savedProfilePicture) {
      setProfilePicture(savedProfilePicture);
    }
  }, []);

  // Function to render stars for ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-gradient">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#half-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="spinner-border text-yellow-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Personal & Service-Related Info</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          {/* Profile Picture Confirmation Dialog */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Update Profile Picture</h2>
                <div className="flex justify-center mb-4">
                  <img 
                    src={tempProfilePicture} 
                    alt="New Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500"
                  />
                </div>
                <p className="text-gray-700 mb-4">Are you sure you want to update your profile picture?</p>
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={cancelProfilePictureChange}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmProfilePictureChange}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Profile Picture Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultProfilePic;
                  }}
                />
                <label 
                  htmlFor="profile-picture" 
                  className="absolute bottom-0 right-0 bg-yellow-500 p-2 rounded-full cursor-pointer"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input 
                  type="file" 
                  id="profile-picture" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleProfilePictureChange}
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-semibold">{profileData.fullName || 'Your Name'}</h2>
                <p className="text-gray-600">{profileData.email || 'your.email@example.com'}</p>
                <p className="text-gray-600 mt-1">{profileData.phone || 'Phone number not set'}</p>
              </div>
              <div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Personal Information Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              {isEditing && (
                <button
                  onClick={saveProfileChanges}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-yellow-500' : 'bg-gray-100'}`}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-yellow-500' : 'bg-gray-100'}`}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-yellow-500' : 'bg-gray-100'}`}
                  rows="3"
                  disabled={!isEditing}
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Saved Locations Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Saved Locations</h2>
            {savedLocations.length > 0 ? (
              <div className="space-y-4">
                {savedLocations.map(location => (
                  <div key={location.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">{location.name}</h3>
                        {location.isDefault && (
                          <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Default</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{location.address}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No saved locations yet</p>
                <button className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg">
                  Add Location
                </button>
              </div>
            )}
          </div>
          
          {/* Reviews & Ratings Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Reviews & Ratings</h2>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{review.serviceType}</h3>
                        <p className="text-sm text-gray-500">Serviceman: {review.servicemanName}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
                    </div>
                    <p className="mt-2 text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No reviews yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
