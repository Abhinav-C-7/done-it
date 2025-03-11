import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from "../components/Layout";
import Searchbar from "../components/Searchbar";
import Services from "../components/Services";
import Navbar from "../components/Navbar";
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Home() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [popularServices, setPopularServices] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [userLocation, setUserLocation] = useState("");

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category === selectedCategory ? "" : category);
    };

    // Fetch popular services, recent bookings, and testimonials
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                // Mock data for now - would be replaced with actual API calls
                setPopularServices([
                    { service_id: 1, title: 'AC Service', bookings: 156, image_url: '/images/services/ac.jpg' },
                    { service_id: 2, title: 'Plumbing Repair', bookings: 142, image_url: '/images/services/plumbing.jpg' },
                    { service_id: 3, title: 'Electrical Repair', bookings: 128, image_url: '/images/services/electrical.jpg' }
                ]);

                if (user) {
                    // Fetch recent bookings for logged-in users
                    try {
                        const token = localStorage.getItem('token');
                        const response = await axios.get(`${API_BASE_URL}/orders/recent`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setRecentBookings(response.data.slice(0, 3));
                    } catch (err) {
                        console.log('Using mock booking data');
                        setRecentBookings([
                            { id: 1, service: 'AC Service', date: '2025-03-08', status: 'completed' },
                            { id: 2, service: 'Plumbing Repair', date: '2025-03-01', status: 'completed' }
                        ]);
                    }
                }

                // Mock testimonials
                setTestimonials([
                    { id: 1, name: 'John D.', rating: 5, comment: 'Great service! Fixed my AC in no time.', service: 'AC Service' },
                    { id: 2, name: 'Sarah M.', rating: 4, comment: 'Very professional and punctual.', service: 'Plumbing Repair' },
                    { id: 3, name: 'Robert K.', rating: 5, comment: 'Excellent work on my electrical issues.', service: 'Electrical Repair' }
                ]);

                // Get user location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            // This would normally use a reverse geocoding API
                            setUserLocation("Kannur");
                        },
                        (error) => {
                            console.error("Error getting location:", error);
                            setUserLocation("Kannur"); // Default location
                        }
                    );
                } else {
                    setUserLocation("Kannur"); // Default location
                }
            } catch (error) {
                console.error("Error fetching home data:", error);
            }
        };

        fetchHomeData();
    }, [user]);

    // Service categories
    const categories = [
        "Plumbing", "Electrical", "Cleaning", "Carpentry", "Painting", "Appliance Repair"
    ];

    // Render stars for ratings
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                <div className="ml-16 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        {/* Hero Section */}
                        <div className='bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl shadow-lg p-8 mb-8 text-white'>
                            <div className="flex flex-col items-center justify-center text-center">
                                <div>
                                    <h1 className='text-3xl md:text-4xl font-bold mb-4'>
                                        Professional Services at Your Doorstep
                                    </h1>
                                    <p className='text-white text-opacity-90 mb-6 text-lg'>
                                        Book trusted professionals for all your household needs
                                    </p>
                                    
                                    {!user && (
                                        <div className='flex gap-4 justify-center'>
                                            <Link
                                                to="/login"
                                                className='px-6 py-3 bg-white text-yellow-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors'
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                to="/register"
                                                className='px-6 py-3 bg-yellow-800 text-white rounded-xl font-semibold hover:bg-yellow-900 transition-colors'
                                            >
                                                Register
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Promotion Banner */}
                        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        <span className="font-bold">Special Offer:</span> Get 20% off on your first booking! Use code WELCOME20
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filter Section */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <h2 className="text-2xl font-semibold mb-4 md:mb-0">Find Services</h2>
                                <Searchbar onSearch={handleSearch} placeholder="Search for services..." />
                            </div>
                            
                            {userLocation && (
                                <div className="text-sm text-gray-600 mb-2">
                                    <span className="inline-flex items-center">
                                        <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Services available in {userLocation}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Services Section */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-semibold mb-6">Available Services</h2>
                            <Services searchQuery={searchQuery} categoryFilter={selectedCategory} />
                        </div>

                        {/* Popular Services Section */}
                        {popularServices.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-semibold mb-6">Most Booked Services</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {popularServices.map((service) => (
                                        <div
                                            key={service.service_id}
                                            className="border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:scale-105 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 bg-yellow-500 text-white px-2 py-1 text-xs font-bold">
                                                {service.bookings}+ bookings
                                            </div>
                                            <div className="h-40 overflow-hidden">
                                                <img
                                                    src={`${API_BASE_URL}${service.image_url}`}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3EService%3C/text%3E%3C/svg%3E";
                                                    }}
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold">{service.title}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Bookings Section (for logged-in users) */}
                        {user && recentBookings.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-semibold mb-6">Your Recent Bookings</h2>
                                <div className="bg-white rounded-lg shadow-md p-4">
                                    <div className="divide-y divide-gray-200">
                                        {recentBookings.map((booking) => (
                                            <div key={booking.id} className="py-4 flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-medium">{booking.service}</h3>
                                                    <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <Link to="/bookings" className="text-yellow-600 hover:text-yellow-700 font-medium">
                                            View All Bookings
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Testimonials Section */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-semibold mb-6">What Our Customers Say</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {testimonials.map((testimonial) => (
                                    <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md">
                                        <div className="flex items-center mb-4">
                                            {renderStars(testimonial.rating)}
                                        </div>
                                        <p className="text-gray-700 mb-4">"{testimonial.comment}"</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{testimonial.name}</p>
                                            <p className="text-sm text-gray-500">{testimonial.service}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Navbar posticon={post} homeicon={homefull} profileicon={profile} />
                </div>
                
                {/* Floating Chat/Support Button */}
                <div className="fixed bottom-6 right-6 z-50">
                    <button 
                        onClick={() => setShowChat(!showChat)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center justify-center"
                    >
                        {showChat ? (
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                        )}
                    </button>
                    
                    {showChat && (
                        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden">
                            <div className="bg-yellow-500 p-4 text-white">
                                <h3 className="font-bold">Customer Support</h3>
                                <p className="mb-4">We typically reply within minutes</p>
                                <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                    Get Referral Code
                                </button>
                            </div>
                            <div className="p-4 h-64 bg-gray-50 flex flex-col justify-end">
                                <div className="bg-yellow-100 p-3 rounded-lg rounded-bl-none mb-2 max-w-xs">
                                    <p className="text-sm">Hello! How can we help you today?</p>
                                </div>
                                <div className="mt-2">
                                    <input 
                                        type="text" 
                                        placeholder="Type your message..." 
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default Home;
