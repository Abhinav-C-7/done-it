import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ServicemanRegister() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone_number: '',
        address: '',
        city: '',
        pincode: '',
        skills: [],
        id_proof_path: ''
    });
    const [services, setServices] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { registerServiceman } = useAuth();

    useEffect(() => {
        // Fetch available services
        console.log('Fetching services...');
        fetch('http://localhost:3000/api/services')
            .then(res => {
                console.log('Response status:', res.status);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('Fetched services:', data);
                if (!Array.isArray(data)) {
                    throw new Error('Expected array of services');
                }
                setServices(data);
            })
            .catch(err => {
                console.error('Error fetching services:', err);
                setError('Failed to load available services: ' + err.message);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // For now, just store the file name. In a real app, you'd upload this to a server
            setFormData(prev => ({
                ...prev,
                id_proof_path: file.name
            }));
        }
    };

    const validateEmail = (email) => {
        const regex = /@serviceman\.doneit\.com$/;
        return regex.test(email);
    };

    const validatePincode = (pincode) => {
        const regex = /^\d{6}$/;
        return regex.test(pincode);
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

        // Validate pincode
        if (!validatePincode(formData.pincode)) {
            setError('Pincode must be exactly 6 digits');
            return;
        }

        // Validate skills selection
        if (formData.skills.length === 0) {
            setError('Please select at least one skill');
            return;
        }

        try {
            const response = await registerServiceman(formData);
            if (response.success) {
                setSuccess('Registration submitted successfully! Pending admin approval.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
                <div className="w-full max-w-2xl">
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
                                {/* Personal Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Email Address *
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
                                            Password *
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

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                            placeholder="Enter your phone number"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                            placeholder="Enter your complete address"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                            placeholder="Enter your city"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Pincode *
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                            placeholder="Enter 6-digit pincode"
                                            pattern="[0-9]{6}"
                                            title="Pincode must be exactly 6 digits"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Skills Selection */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Select Your Skills *
                                    </label>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto mb-4 p-2">
                                            {services.map(service => (
                                                <div 
                                                    key={service.service_id}
                                                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${
                                                        formData.skills.includes(service.title)
                                                            ? 'bg-yellow-50'
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={`skill-${service.service_id}`}
                                                        value={service.title}
                                                        checked={formData.skills.includes(service.title)}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                skills: e.target.checked 
                                                                    ? [...prev.skills, value]
                                                                    : prev.skills.filter(skill => skill !== value)
                                                            }));
                                                        }}
                                                        className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
                                                    />
                                                    <label 
                                                        htmlFor={`skill-${service.service_id}`}
                                                        className="flex-grow text-gray-700 cursor-pointer select-none hover:text-yellow-600"
                                                    >
                                                        {service.title}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Selected Skills Preview */}
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Selected Skills ({formData.skills.length})
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.skills.map(skill => (
                                                    <span
                                                        key={skill}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 transition-all duration-200 hover:bg-yellow-200"
                                                    >
                                                        {skill}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    skills: prev.skills.filter(s => s !== skill)
                                                                }));
                                                            }}
                                                            className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-200 text-yellow-800 hover:bg-yellow-300 hover:text-yellow-900 transition-colors duration-200"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                                {formData.skills.length === 0 && (
                                                    <span className="text-sm text-gray-500 italic">
                                                        No skills selected
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, skills: [] }))}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                    {formData.skills.length === 0 && (
                                        <p className="text-sm text-red-500 mt-1 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Please select at least one skill
                                        </p>
                                    )}
                                </div>

                                {/* ID Proof Upload */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Upload ID Proof *
                                    </label>
                                    <input
                                        type="file"
                                        name="id_proof"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Upload Aadhar/PAN/Driving License (PDF/JPG/PNG)</p>
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
