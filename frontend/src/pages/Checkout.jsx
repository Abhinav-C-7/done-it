import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useAuth } from '../context/AuthContext';

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
    console.log('Address parts:', addressParts); // Debug log

    // Common Kerala districts
    const keralaDistricts = [
        'Kannur', 'Kasaragod', 'Kozhikode', 'Wayanad', 'Malappuram',
        'Palakkad', 'Thrissur', 'Ernakulam', 'Idukki', 'Kottayam',
        'Alappuzha', 'Pathanamthitta', 'Kollam', 'Thiruvananthapuram'
    ];

    // First try to get the city from known fields
    let city = '';
    
    // Check if we're in Kerala and use district as city if appropriate
    if (addressParts.state === 'Kerala') {
        // First check if the district is directly available
        if (addressParts.district && keralaDistricts.includes(addressParts.district)) {
            city = addressParts.district;
        }
        // If not, look for district name in other fields
        else {
            for (const district of keralaDistricts) {
                if (osmAddress.display_name.includes(district)) {
                    city = district;
                    break;
                }
            }
        }
    }

    // If city is still not found, try the standard city fields
    if (!city) {
        if (addressParts.city) {
            city = addressParts.city;
        } else if (addressParts.town && addressParts.town.length > 3) {
            city = addressParts.town;
        } else if (addressParts.municipality && addressParts.municipality.length > 3) {
            city = addressParts.municipality;
        }
    }

    // Try different possible fields for postal code
    let pincode = addressParts.postcode || 
                  addressParts.postal_code ||
                  '';

    // Clean up the pincode to ensure it's 6 digits
    pincode = pincode ? pincode.replace(/\D/g, '') : '';
    if (pincode.length !== 6) {
        pincode = ''; // Reset if not 6 digits
    }

    // If we still don't have a city, try to extract it from the display name
    if (!city && osmAddress.display_name) {
        const parts = osmAddress.display_name.split(',').map(part => part.trim());
        
        // Look for parts that might be city names
        for (const part of parts) {
            // Skip if part is too short, contains numbers, or is a known non-city term
            if (part.length <= 3 || 
                part.match(/\d/) || 
                part.match(/road|street|lane|state|india|kerala|district|village|town|taluk|post|office/i)) {
                continue;
            }
            
            city = part;
            break;
        }
    }

    // Clean up city name
    if (city) {
        // Remove any trailing "District" or similar terms
        city = city.replace(/\s+(district|city|municipality|corporation|town|village)$/i, '');
        // Proper case the city name
        city = city.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    return {
        city: city,
        pincode: pincode,
        fullAddress: osmAddress.display_name || ''
    };
};

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Get cart state with default values
    const cartState = location.state || {};
    const cartItems = cartState.cartItems || [];
    const total = parseFloat(cartState.total || 0);
    const bookingFee = parseFloat(cartState.bookingFee || 49);
    const serviceFee = parseFloat(cartState.serviceFee || 0);

    // If no items in cart, redirect to services
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/services');
        }
    }, [cartItems, navigate]);

    const totalAmount = parseFloat((total + bookingFee + serviceFee).toFixed(2));

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
        latitude: '',
        longitude: ''
    });
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
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
    const createServiceRequests = async (paymentId) => {
        try {
            // Create a service request for each item in the cart
            console.log('User data:', user);
            
            const orderPromises = cartItems.map(async (item) => {
                // Parse and clean amount, add booking fee divided by number of items
                const bookingFeePerItem = bookingFee / cartItems.length;
                const serviceFeePerItem = serviceFee / cartItems.length;
                const itemPrice = parseFloat(item.price);
                const cleanAmount = itemPrice + bookingFeePerItem + serviceFeePerItem;
                
                const requestData = {
                    customer_id: user.id, // Changed from user.user_id to user.id
                    service_type: item.type,
                    description: `Service requested for ${item.type}. Includes booking fee: ₹${bookingFeePerItem.toFixed(2)}, service fee: ₹${serviceFeePerItem.toFixed(2)}`,
                    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                    address: formData.address.trim(),
                    landmark: (formData.landmark || '').trim(),
                    city: formData.city.trim(),
                    pincode: formData.pincode.toString().trim(),
                    scheduled_date: new Date(formData.date).toISOString().split('T')[0],
                    time_slot: formData.timeSlot.trim(),
                    payment_method: 'demo',
                    payment_id: paymentId,
                    amount: cleanAmount
                };

                console.log('Creating service request with data:', requestData);
                const response = await fetch('http://localhost:3000/api/services/request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to create service request');
                }

                const responseData = await response.json();
                console.log('Service request created:', responseData);
                return responseData;
            });

            return await Promise.all(orderPromises);
        } catch (error) {
            console.error('Error creating service requests:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.address || !formData.city || !formData.pincode || !formData.timeSlot || !formData.date) {
            alert('Please fill in all required fields');
            return;
        }

        if (!isAddressConfirmed) {
            alert('Please confirm your address before proceeding');
            return;
        }

        try {
            if (!user) {
                alert('Please login to place an order');
                navigate('/login');
                return;
            }

            // Calculate total amount in rupees
            console.log('Sending payment request with amount:', totalAmount);

            // Create Razorpay order
            const response = await fetch('http://localhost:3000/api/services/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ amount: totalAmount })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create payment order');
            }

            const order = await response.json();
            console.log('Payment order created:', order);

            // Create dummy Razorpay handler for demo
            const demoRazorpayHandler = {
                open: async function() {
                    try {
                        // Simulate payment success
                        const demoResponse = {
                            razorpay_order_id: order.id,
                            razorpay_payment_id: 'pay_demo_' + Date.now(),
                        };

                        console.log('Demo payment successful:', demoResponse);
                        
                        // Verify payment
                        const verification = await fetch('http://localhost:3000/api/services/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify(demoResponse)
                        });

                        if (!verification.ok) {
                            const errorData = await verification.json();
                            throw new Error(errorData.message || 'Payment verification failed');
                        }

                        console.log('Demo payment verified, creating service requests...');
                        // Create service requests after successful payment
                        const orderResponses = await createServiceRequests(demoResponse.razorpay_payment_id);
                        console.log('Service requests created:', orderResponses);

                        // Navigate to confirmation page
                        const orderDetails = {
                            request_id: orderResponses[0].request_id,
                            services: cartItems,
                            total: totalAmount,
                            scheduled_date: new Date(formData.date).toISOString().split('T')[0],
                            time_slot: formData.timeSlot,
                            address: formData.address,
                            landmark: formData.landmark || '',
                            city: formData.city,
                            pincode: formData.pincode,
                            payment_method: 'demo',
                            payment_id: demoResponse.razorpay_payment_id
                        };

                        navigate('/order-confirmation', { state: { orderDetails } });
                    } catch (error) {
                        console.error('Error in demo payment:', error);
                        alert(error.message || 'Error processing your demo payment');
                    }
                }
            };

            // Use demo payment handler
            demoRazorpayHandler.open();
        } catch (error) {
            console.error('Error placing order:', error);
            alert(error.message || 'Failed to place order. Please try again.');
        }
    };
    const updateAddressDetails = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?` +
                `format=json` +
                `&lat=${lat}` +
                `&lon=${lng}` +
                `&addressdetails=1`
            );
            const data = await response.json();
            console.log('OSM Response:', data);
            
            // Verify the location is in Kerala
            if (data.address && data.address.state === 'Kerala') {
                const { city, pincode, fullAddress } = extractAddressComponents(data);
                
                setAddress(fullAddress);
                setFormData(prev => ({
                    ...prev,
                    address: fullAddress,
                    city: city || prev.city,
                    pincode: pincode || prev.pincode,
                    latitude: lat.toString(),
                    longitude: lng.toString()
                }));
            } else {
                console.warn('Selected location is not in Kerala');
                alert('Please select a location within Kerala');
            }
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
            // Add Kerala to the search query if not already present
            const searchQuery = query.toLowerCase().includes('kerala') 
                ? query 
                : `${query}, Kerala, India`;

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` + 
                `format=json` +
                `&q=${encodeURIComponent(searchQuery)}` +
                `&countrycodes=in` +
                `&limit=8` +
                `&addressdetails=1`
            );
            const data = await response.json();
            console.log('Search results:', data); // Debug log

            // Filter results to ensure they are within Kerala
            const keralaResults = data.filter(result => {
                const address = result.address || {};
                return address.state === 'Kerala' ||
                       (result.display_name && 
                        result.display_name.toLowerCase().includes('kerala'));
            });

            console.log('Kerala results:', keralaResults); // Debug log
            setSuggestions(keralaResults);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleSuggestionSelect = (suggestion) => {
        console.log('Selected suggestion:', suggestion); // For debugging
        const { city, pincode, fullAddress } = extractAddressComponents(suggestion);
        const lat = parseFloat(suggestion.lat);
        const lng = parseFloat(suggestion.lon);
        
        setSelectedLocation({
            lat: lat,
            lng: lng,
            address: fullAddress
        });
        setSuggestions([]);
        setSearchQuery(fullAddress);
        setShowMap(true);
        
        setFormData(prev => ({
            ...prev,
            address: fullAddress,
            city: city || prev.city,
            pincode: pincode || prev.pincode,
            latitude: lat.toString(),
            longitude: lng.toString()
        }));
    };

    const getCurrentLocation = () => {
        setIsLoadingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    try {
                        // First check if the location is in Kerala
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?` +
                            `format=json` +
                            `&lat=${latitude}` +
                            `&lon=${longitude}` +
                            `&addressdetails=1`
                        );
                        const data = await response.json();
                        
                        if (data.address && data.address.state === 'Kerala') {
                            setSelectedLocation({
                                lat: latitude,
                                lng: longitude,
                                address: data.display_name
                            });
                            setSearchQuery(data.display_name);
                            setShowMap(true);
                            setSuggestions([]);
                            
                            const { city, pincode, fullAddress } = extractAddressComponents(data);
                            setFormData(prev => ({
                                ...prev,
                                address: fullAddress,
                                city: city || prev.city,
                                pincode: pincode || prev.pincode,
                                latitude: latitude.toString(),
                                longitude: longitude.toString()
                            }));
                        } else {
                            alert('Your current location appears to be outside Kerala. Please select a location within Kerala.');
                        }
                    } catch (error) {
                        console.error('Error fetching address details:', error);
                        alert('Error getting location details. Please try again.');
                    }
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setIsLoadingLocation(false);
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            alert('Please allow location access to use this feature.');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            alert('Location information is unavailable.');
                            break;
                        case error.TIMEOUT:
                            alert('Location request timed out.');
                            break;
                        default:
                            alert('Error getting location. Please try again.');
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
            setIsLoadingLocation(false);
        }
    };

    const handleConfirmAddress = () => {
        if (!formData.address || !formData.city || !formData.pincode) {
            alert('Please fill in all address fields');
            return;
        }
        setIsAddressConfirmed(true);
        setIsEditingAddress(false);
    };

    const handleEditAddress = () => {
        setIsEditingAddress(true);
        setIsAddressConfirmed(false);
    };

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (showMap && selectedLocation && !map) {
            setTimeout(() => {
                const mapInstance = L.map('map').setView([selectedLocation.lat, selectedLocation.lng], 16);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: ' OpenStreetMap contributors',
                    maxZoom: 19
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

    // Add modal and map container styles
    const modalStyles = showModal ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    } : { display: 'none' };

    const mapContainerStyles = {
        width: '100%',
        maxWidth: '800px',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden'
    };

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
                            <div className={`bg-white rounded-lg shadow-md p-6 mb-6 transition-colors duration-300 ${isAddressConfirmed && !isEditingAddress ? 'bg-green-50 border-2 border-green-500' : ''}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-semibold">Service Address</h2>
                                    </div>
                                    {isAddressConfirmed && !isEditingAddress && (
                                        <div className="flex items-center gap-4">
                                            <span className="text-green-600 flex items-center">
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Confirmed
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleEditAddress}
                                                className="text-yellow-600 hover:text-yellow-700 flex items-center"
                                            >
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-6a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={isAddressConfirmed && !isEditingAddress ? 'opacity-50' : ''}>
                                    <div className="space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(true)}
                                            disabled={isAddressConfirmed && !isEditingAddress}
                                            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Select Address
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

                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Landmark
                                            </label>
                                            <input
                                                type="text"
                                                name="landmark"
                                                value={formData.landmark}
                                                onChange={handleInputChange}
                                                disabled={isAddressConfirmed && !isEditingAddress}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                                                    disabled={isAddressConfirmed && !isEditingAddress}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                                                    pattern="\d{6}"
                                                    title="Please enter a valid 6-digit pincode"
                                                    disabled={isAddressConfirmed && !isEditingAddress}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                                />
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                disabled={isAddressConfirmed && !isEditingAddress}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            />
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                        </div>

                                        {(!isAddressConfirmed || isEditingAddress) && (
                                            <div className="mt-4">
                                                <button
                                                    type="button"
                                                    onClick={handleConfirmAddress}
                                                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {isEditingAddress ? 'Update Address' : 'Confirm Address'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Time Slot Section */}
                            <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${!isAddressConfirmed ? 'opacity-50 pointer-events-none' : ''}`}>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2" />
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
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                                        >
                                            <option value="">Select a time slot</option>
                                            {timeSlots.map((slot, index) => (
                                                <option key={index} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-yellow-400 text-black py-4 px-6 rounded-lg font-medium hover:bg-yellow-500 transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                            >
                                <span>Place Order</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
                                        <span className="font-medium text-gray-800">₹{serviceFee}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Booking Fee</span>
                                        <span className="font-medium text-gray-800">₹{bookingFee}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 font-medium">
                                        <span>Total</span>
                                        <span>₹{totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Selection Modal */}
            {showModal && (
                <div style={modalStyles} onClick={handleModalClose}>
                    <div style={mapContainerStyles} onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Select Location</h3>
                                <button 
                                    onClick={handleModalClose}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchInput}
                                    placeholder="Search for a location..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {suggestions.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                            onClick={() => handleSuggestionSelect(suggestion)}
                                        >
                                            {suggestion.display_name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={getCurrentLocation}
                                disabled={isLoadingLocation}
                                className="w-full mb-4 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingLocation ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Getting Location...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Use Current Location</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div id="map" style={{ height: '400px', width: '100%' }} className="relative">
                            {!selectedLocation && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <p className="text-gray-500">Search for a location to view the map</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t">
                            <button
                                onClick={handleConfirmLocation}
                                className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                                disabled={!selectedLocation}
                            >
                                Confirm Location
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
