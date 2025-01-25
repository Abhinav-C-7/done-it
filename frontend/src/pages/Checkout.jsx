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
                <h1 className="text-2xl font-bold mb-8">Checkout</h1>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Section - Form */}
                    <div className="flex-1">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Address Section */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Service Address</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Complete Address
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(true)}
                                                className="w-full px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                                            >
                                                Select an Address
                                            </button>
                                            {address && (
                                                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                    {address}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Landmark
                                        </label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                                            />
                                        </div>
                                        <div>
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Time Slot Section */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Select Date & Time</h2>
                                <div className="space-y-4">
                                    <div>
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Preferred Time Slot
                                        </label>
                                        <select
                                            name="timeSlot"
                                            value={formData.timeSlot}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                                        >
                                            <option value="">Select a time slot</option>
                                            {timeSlots.map(slot => (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Section */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cash"
                                            checked={formData.paymentMethod === 'cash'}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-yellow-400 focus:ring-yellow-400"
                                        />
                                        <span>Cash on Service</span>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="upi"
                                            checked={formData.paymentMethod === 'upi'}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-yellow-400 focus:ring-yellow-400"
                                        />
                                        <span>UPI</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                            >
                                Place Order
                            </button>
                        </form>
                    </div>

                    {/* Right Section - Order Summary */}
                    <div className="md:w-80">
                        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-start py-3 border-b">
                                        <div>
                                            <h3 className="font-medium">{item.type}</h3>
                                            <p className="text-sm text-gray-500">{item.time}</p>
                                        </div>
                                        <span className="font-medium">{item.price}</span>
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">₹{total}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Service Fee</span>
                                        <span className="font-medium">₹49</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t font-medium">
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
