import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const extractAddressComponents = (osmAddress) => {
    // Parse the OpenStreetMap response to extract city and postal code
    const addressParts = osmAddress.address || {};
    return {
        city: addressParts.city || addressParts.town || addressParts.municipality || '',
        pincode: addressParts.postcode || '',
        fullAddress: osmAddress.display_name || ''
    };
};

const Checkout = () => {
    const location = useLocation();
    const { cartItems, total } = location.state || { cartItems: [], total: 0 };
    const [showModal, setShowModal] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [address, setAddress] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [formData, setFormData] = useState({
        address: '',
        landmark: '',
        city: '',
        pincode: '',
        date: '',
        timeSlot: '',
        paymentMethod: 'cash'
    });
    const timeSlots = [
        "09:00 AM - 11:00 AM",
        "11:00 AM - 01:00 PM",
        "02:00 PM - 04:00 PM",
        "04:00 PM - 06:00 PM"
    ];
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Order details:', { ...formData, cartItems, total });
    };
    const updateAddressDetails = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            const { city, pincode, fullAddress } = extractAddressComponents(data);
            
            setAddress(fullAddress);
            setFormData(prev => ({
                ...prev,
                address: fullAddress,
                city: city,
                pincode: pincode
            }));
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };

    const handleSearchInput = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in&addressdetails=1`
            );
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleSuggestionSelect = (suggestion) => {
        const { city, pincode, fullAddress } = extractAddressComponents(suggestion);
        setSelectedLocation({
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon),
            address: fullAddress
        });
        setSuggestions([]);
        setSearchQuery(fullAddress);
        setShowMap(true);
        
        setFormData(prev => ({
            ...prev,
            address: fullAddress,
            city: city,
            pincode: pincode
        }));
    };

    useEffect(() => {
        if (showMap && selectedLocation && !map) {
            setTimeout(() => {
                const mapInstance = L.map('map').setView([selectedLocation.lat, selectedLocation.lng], 16);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: ' OpenStreetMap contributors'
                }).addTo(mapInstance);

                const markerInstance = L.marker([selectedLocation.lat, selectedLocation.lng], { 
                    draggable: true,
                    icon: new L.Icon.Default()
                }).addTo(mapInstance);
                
                markerInstance.on('dragend', async function(e) {
                    const position = e.target.getLatLng();
                    await updateAddressDetails(position.lat, position.lng);
                });

                mapInstance.on('click', async function(e) {
                    const { lat, lng } = e.latlng;
                    markerInstance.setLatLng([lat, lng]);
                    await updateAddressDetails(lat, lng);
                });

                setMap(mapInstance);
                setMarker(markerInstance);
                setAddress(selectedLocation.address);
            }, 100);
        }

        return () => {
            if (map) {
                map.remove();
                setMap(null);
                setMarker(null);
            }
        };
    }, [showMap, selectedLocation]);

    const handleConfirmLocation = () => {
        setShowModal(false);
        setShowMap(false);
        setSearchQuery('');
        setSuggestions([]);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setShowMap(false);
        setSearchQuery('');
        setSuggestions([]);
        setSelectedLocation(null);
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto pt-20 px-4">
                <div className="flex items-center mb-8 space-x-3">
                    <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
                    <div className="h-1 w-20 bg-yellow-400 rounded-full"></div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Section - Form */}
                    <div className="flex-1">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Address Section */}
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-800">Service Address</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Complete Address
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(true)}
                                                className="w-full px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200"
                                            >
                                                <div className="flex items-center justify-center space-x-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    <span>Select an Address</span>
                                                </div>
                                            </button>
                                            {address && (
                                                <div className="mt-2 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                                    <div className="flex items-start">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        </svg>
                                                        <p className="text-gray-700">{address}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Landmark
                                        </label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                                            />
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                PIN Code
                                            </label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleInputChange}
                                                required
                                                pattern="[0-9]{6}"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                                            />
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Time Slot Section */}
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-800">Select Date & Time</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Preferred Date
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            min={minDate}
                                            required
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Preferred Time Slot
                                        </label>
                                        <select
                                            name="timeSlot"
                                            value={formData.timeSlot}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 appearance-none"
                                        >
                                            <option value="">Select a time slot</option>
                                            {timeSlots.map(slot => (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            ))}
                                        </select>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Section */}
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-800">Payment Method</h2>
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-400 cursor-pointer transition-colors">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cash"
                                            checked={formData.paymentMethod === 'cash'}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-yellow-400 focus:ring-yellow-400"
                                        />
                                        <div className="ml-3">
                                            <span className="font-medium text-gray-700">Cash on Service</span>
                                            <p className="text-sm text-gray-500">Pay after the service is completed</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-400 cursor-pointer transition-colors">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="upi"
                                            checked={formData.paymentMethod === 'upi'}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-yellow-400 focus:ring-yellow-400"
                                        />
                                        <div className="ml-3">
                                            <span className="font-medium text-gray-700">UPI</span>
                                            <p className="text-sm text-gray-500">Pay securely via UPI</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-yellow-400 text-black py-4 px-6 rounded-lg font-medium hover:bg-yellow-500 transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                            >
                                <span>Place Order</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </form>
                    </div>

                    {/* Right Section - Order Summary */}
                    <div className="md:w-80">
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 sticky top-24 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
                            </div>
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-start py-3 border-b border-gray-100">
                                        <div>
                                            <h3 className="font-medium text-gray-800">{item.type}</h3>
                                            <p className="text-sm text-gray-500">{item.time}</p>
                                        </div>
                                        <span className="font-medium text-gray-800">₹{item.price}</span>
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium text-gray-800">₹{total}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Service Fee</span>
                                        <span className="font-medium text-gray-800">₹49</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 font-medium">
                                        <span>Total</span>
                                        <span>₹{total + 49}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Selection Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-4 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Select Your Location</h3>
                        
                        {/* Search Input */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Enter your locality (e.g., Andheri West, Mumbai)"
                                value={searchQuery}
                                onChange={handleSearchInput}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                            />
                            {suggestions.length > 0 && (
                                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionSelect(suggestion)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                        >
                                            {suggestion.display_name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Map */}
                        {showMap && (
                            <div>
                                <div id="map" className="h-64 w-full rounded-lg mb-4"></div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Drag the marker or click on the map to adjust the exact location
                                </p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleModalClose}
                                className="px-4 py-2 text-gray-600"
                            >
                                Cancel
                            </button>
                            {showMap && (
                                <button
                                    onClick={handleConfirmLocation}
                                    className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                                >
                                    Confirm Location
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
