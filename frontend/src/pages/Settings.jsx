import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Settings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [userProfile, setUserProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Fetch user profile data
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data) {
                    setUserProfile({
                        fullName: response.data.full_name || '',
                        email: response.data.email || '',
                        phone: response.data.phone_number || '',
                        address: response.data.address || ''
                    });
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load user profile');
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [user, navigate]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setUserProfile({
            ...userProfile,
            [name]: value
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found');
                setLoading(false);
                return;
            }

            await axios.put(`${API_BASE_URL}/auth/update-profile`, {
                full_name: userProfile.fullName,
                phone_number: userProfile.phone,
                address: userProfile.address
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSuccess('Profile updated successfully');
            setIsEditing(false);
            setLoading(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
            setLoading(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            // Validate passwords
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                setError('New passwords do not match');
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found');
                setLoading(false);
                return;
            }

            await axios.put(`${API_BASE_URL}/auth/change-password`, {
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSuccess('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setLoading(false);
        } catch (err) {
            console.error('Error changing password:', err);
            setError(err.response?.data?.message || 'Failed to change password');
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>

                {/* Tabs */}
                <div className="flex border-b mb-6">
                    <button 
                        className={`py-2 px-4 font-medium ${activeTab === 'account' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('account')}
                    >
                        Account Details
                    </button>
                    <button 
                        className={`py-2 px-4 font-medium ${activeTab === 'security' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                    <button 
                        className={`py-2 px-4 font-medium ${activeTab === 'notifications' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        Notification Preferences
                    </button>
                </div>

                {/* Error and Success Messages */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                {/* Account Details Tab */}
                {activeTab === 'account' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Account Information</h2>
                            <button
                                type="button"
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-yellow-600 hover:text-yellow-700 font-medium"
                            >
                                {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                        <form onSubmit={updateProfile}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={userProfile.fullName}
                                        onChange={handleProfileChange}
                                        className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-yellow-500' : 'bg-gray-100'}`}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={userProfile.email}
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
                                        value={userProfile.phone}
                                        onChange={handleProfileChange}
                                        className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-yellow-500' : 'bg-gray-100'}`}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Address</label>
                                    <textarea
                                        name="address"
                                        value={userProfile.address}
                                        onChange={handleProfileChange}
                                        className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-yellow-500' : 'bg-gray-100'}`}
                                        rows="3"
                                        disabled={!isEditing}
                                    ></textarea>
                                </div>
                            </div>
                            {isEditing && (
                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                        <form onSubmit={changePassword}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                        minLength="8"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Password must be at least 8 characters</p>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Notification Preferences Tab */}
                {activeTab === 'notifications' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Email Notifications</h3>
                                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">SMS Notifications</h3>
                                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Service Updates</h3>
                                    <p className="text-sm text-gray-500">Receive updates about your service requests</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Marketing Communications</h3>
                                    <p className="text-sm text-gray-500">Receive promotional offers and updates</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default Settings;
