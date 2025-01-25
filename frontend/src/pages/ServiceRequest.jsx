import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation as useLocationContext } from '../context/LocationContext';
import Navbar from "../components/Navbar";
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";
import axios from 'axios';

function ServiceRequest() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { location: userLocation } = useLocationContext();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const serviceType = searchParams.get('type') || location.state?.serviceType;
    const subType = location.state?.subType;

    const [formData, setFormData] = useState({
        service_type: serviceType || '',
        sub_type: subType || '',
        description: '',
        address: userLocation?.address || '',
        area: '',
        city: '',
        pincode: '',
        special_instructions: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: '/service-request', type: serviceType, subType } });
        }
    }, [user, navigate, serviceType, subType]);

    useEffect(() => {
        if (userLocation) {
            setFormData(prev => ({
                ...prev,
                address: userLocation.address
            }));
        }
    }, [userLocation]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestData = {
                ...formData,
                customer_id: user.id
            };

            await axios.post('http://localhost:5000/api/services', requestData);
            navigate('/customer/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div className='m-4 border border-gray-500/30 rounded-xl shadow-sm p-6'>
                <h1 className='text-2xl font-semibold mb-4'>Request Service</h1>
                {error && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Service Details</h2>
                        <div className='mb-4'>
                            <label className='block text-gray-700 text-sm font-bold mb-2'>
                                Service Type
                            </label>
                            <select
                                name="service_type"
                                value={formData.service_type}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                                required
                                disabled={serviceType === 'AC'}
                            >
                                <option value="">Select a service</option>
                                <option value="AC">AC Service</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Painting">Painting</option>
                                <option value="Appliance Repair">Appliance Repair</option>
                            </select>
                        </div>

                        {formData.service_type === 'AC' && (
                            <div className='mb-4'>
                                <label className='block text-gray-700 text-sm font-bold mb-2'>
                                    AC Service Type
                                </label>
                                <select
                                    name="sub_type"
                                    value={formData.sub_type}
                                    onChange={handleChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                                    required
                                >
                                    <option value="">Select AC service type</option>
                                    <option value="AC Regular Service">Regular Service</option>
                                    <option value="AC Repair & Gas Refill">Repair & Gas Refill</option>
                                    <option value="AC Installation/Uninstallation">Installation/Uninstallation</option>
                                </select>
                            </div>
                        )}

                        <div className='mb-4'>
                            <label className='block text-gray-700 text-sm font-bold mb-2'>
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                                rows="3"
                                placeholder="Please describe what you need help with..."
                                required
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-gray-700 text-sm font-bold mb-2'>
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="House/Flat No., Street"
                                className='w-full px-3 py-2 border border-gray-300 rounded-xl mb-2'
                                required
                            />
                            <input
                                type="text"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                placeholder="Area/Locality"
                                className='w-full px-3 py-2 border border-gray-300 rounded-xl mb-2'
                                required
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                                    required
                                />
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="PIN Code"
                                    className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                                    required
                                />
                            </div>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-gray-700 text-sm font-bold mb-2'>
                                Special Instructions
                            </label>
                            <textarea
                                name="special_instructions"
                                value={formData.special_instructions}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                                rows="2"
                                placeholder="Any special instructions for the service provider..."
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className='w-full px-6 py-2 bg-yellow-400 rounded-xl font-semibold hover:bg-yellow-500 transition-colors'
                    >
                        Submit Request
                    </button>
                </form>
            </div>
            <Navbar posticon={post} homeicon={homefull} profileicon={profile} />
        </div>
    );
}

export default ServiceRequest;
