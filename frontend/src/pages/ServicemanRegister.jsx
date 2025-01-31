import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ServicemanRegister() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { registerServiceman } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateEmail = (email) => {
        const regex = /@serviceman\.doneit\.com$/;
        return regex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate email format
        if (!validateEmail(formData.email)) {
            setError('Email must be in format: name@serviceman.doneit.com');
            return;
        }

        try {
            const response = await registerServiceman(formData);
            if (response.success) {
                setSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header Section */}
                        <div className="px-8 py-6 bg-gradient-to-r from-yellow-400 to-yellow-500">
                            <h1 className="text-3xl font-bold text-white text-center">Serviceman Registration</h1>
                            <p className="text-yellow-100 text-center mt-2">Join our team of service providers</p>
                        </div>

                        {/* Form Section */}
                        <div className="p-8">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r">
                                    <p className="text-green-700 text-sm">{success}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                        placeholder="name@serviceman.doneit.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
                                >
                                    Register as Serviceman
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServicemanRegister;
