import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { serviceApi } from '../services/api';
import Layout from '../components/Layout';
import LoginPrompt from '../components/LoginPrompt';

const SUB_SERVICES = {
    'ac': [
        { id: 1, title: 'AC Installation', price: 1499, description: 'Professional AC installation service' },
        { id: 2, title: 'AC Repair', price: 799, description: 'Expert AC repair and troubleshooting', variablePrice: true },
        { id: 3, title: 'AC Maintenance', price: 599, description: 'Regular AC maintenance and cleaning' },
        { id: 4, title: 'Gas Refill', price: 1299, description: 'AC gas refill and leak detection', variablePrice: true }
    ],
    'plumbing': [
        { id: 5, title: 'General Plumbing', price: 100, description: 'General plumbing repairs and installation', variablePrice: true }
    ],
    'electrical': [
        { id: 9, title: 'Wiring Works', price: 200, description: 'Electrical wiring and rewiring services', variablePrice: true },
        { id: 10, title: 'Switch Board Fitting', price: 100, description: 'Switch board repair and installation per switch board', variablePrice: true },
        { id: 11, title: 'Light Fitting', price: 100, description: 'Light installation and replacement per light installed', variablePrice: true },
        { id: 12, title: 'General Repair', price: 100, description: 'General electrical repairs (minimum charge)', variablePrice: true }
    ],
    'cleaning': [
        { id: 13, title: '1 BHK Cleaning', price: 2500, description: 'Complete house cleaning for 1 BHK', variablePrice: true, priceRange: '₹2,500 - ₹4,500' },
        { id: 14, title: '2 BHK Cleaning', price: 3500, description: 'Complete house cleaning for 2 BHK', variablePrice: true, priceRange: '₹3,500 - ₹6,500' },
        { id: 15, title: '3 BHK Cleaning', price: 5000, description: 'Complete house cleaning for 3 BHK', variablePrice: true, priceRange: '₹5,000 - ₹9,000' },
        { id: 16, title: '4 BHK Cleaning', price: 7000, description: 'Complete house cleaning for 4 BHK', variablePrice: true, priceRange: '₹7,000 - ₹12,000' }
    ],
    'painting': [
        { id: 17, title: 'Interior Painting', price: 10, description: 'Interior house painting service per sq. ft.', variablePrice: true, priceRange: '₹10 - ₹30 per sq. ft.' },
        { id: 18, title: 'Exterior Painting', price: 12, description: 'Exterior house painting service per sq. ft.', variablePrice: true, priceRange: '₹12 - ₹40 per sq. ft.' },
        { id: 19, title: 'Textured/Designer Painting', price: 50, description: 'Decorative wall texturing service per sq. ft.', variablePrice: true, priceRange: '₹50 - ₹200 per sq. ft.' },
        { id: 20, title: 'Wood Painting', price: 30, description: 'Wood furniture painting service per sq. ft.', variablePrice: true }
    ],
    'pestcontrol': [
        { id: 21, title: 'General Pest Control', price: 10, description: 'Complete pest control treatment per sq. ft.', variablePrice: true, priceRange: '₹10 - ₹30 per sq. ft.' },
        { id: 22, title: 'Cockroach Control', price: 15, description: 'Cockroach control treatment per sq. ft.', variablePrice: true },
        { id: 23, title: 'Termite Control', price: 20, description: 'Termite inspection and control per sq. ft.', variablePrice: true },
        { id: 24, title: 'Bed Bug Control', price: 25, description: 'Bed bug elimination service per sq. ft.', variablePrice: true }
    ],
    'carpentry': [
        { id: 25, title: 'Furniture Repair', price: 499, description: 'Furniture repair and restoration', variablePrice: true },
        { id: 26, title: 'Door Work', price: 500, description: 'Door repair and installation', variablePrice: true, priceRange: 'Starting at ₹500' },
        { id: 27, title: 'Window Work', price: 300, description: 'Window repair and installation', variablePrice: true, priceRange: 'Starting at ₹300' },
        { id: 28, title: 'Wood Polish', price: 30, description: 'Wood polishing and varnishing per sq. ft.', variablePrice: true, priceRange: '₹30 - ₹400 per sq. ft.' }
    ]
};

const SERVICE_TITLES = {
    'ac': 'AC Services',
    'plumbing': 'Plumbing Services',
    'electrical': 'Electrical Services',
    'cleaning': 'House Cleaning Services',
    'painting': 'Painting Services',
    'pestcontrol': 'Pest Control Services',
    'carpentry': 'Carpentry Services'
};

function ServiceDetails() {
    const { serviceType } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [selectedServices, setSelectedServices] = useState([]);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const subServices = SUB_SERVICES[serviceType] || [];
    const serviceTitle = SERVICE_TITLES[serviceType] || 'Service Details';

    const handleServiceSelect = (service) => {
        const isSelected = selectedServices.find(s => s.id === service.id);
        if (isSelected) {
            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    // Check if any selected service has a price range
    const hasServiceWithRange = selectedServices.some(service => 
        service.priceRange || (service.variablePrice && service.price > 0)
    );

    const handleProceedToCheckout = () => {
        if (selectedServices.length === 0) {
            alert('Please select at least one service');
            return;
        }

        // Check if user is logged in
        if (!user) {
            // Show login prompt instead of redirecting
            setShowLoginPrompt(true);
            return;
        }

        // Add selected services to cart
        selectedServices.forEach(service => {
            addToCart({
                id: service.id,
                type: service.title,
                price: parseFloat(service.price),
                description: service.description,
                variablePrice: service.variablePrice || false,
                priceRange: service.priceRange || null
            });
        });

        // Calculate total and fees
        const total = selectedServices.reduce((sum, service) => sum + parseFloat(service.price), 0);
        const bookingFee = 49; // Fixed booking fee
        const serviceFee = Math.round(total * 0.05); // 5% service fee

        // Navigate to checkout with state
        navigate('/checkout', {
            state: {
                cartItems: selectedServices.map(service => ({
                    id: service.id,
                    type: service.title,
                    price: parseFloat(service.price),
                    description: service.description,
                    variablePrice: service.variablePrice || false,
                    priceRange: service.priceRange || null
                })),
                total: total,
                bookingFee: bookingFee,
                serviceFee: serviceFee
            }
        });
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h1 className="text-2xl font-semibold mb-4">{serviceTitle}</h1>
                        <p className="text-gray-600 mb-6">
                            Select the services you need. You can choose multiple services.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {subServices.map((service) => (
                                <div
                                    key={service.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                        selectedServices.find(s => s.id === service.id)
                                            ? 'border-yellow-500 bg-yellow-50'
                                            : 'hover:border-gray-400'
                                    }`}
                                    onClick={() => handleServiceSelect(service)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-medium">{service.title}</h3>
                                        <span className="text-yellow-600 font-semibold">
                                            {service.variablePrice 
                                                ? service.priceRange || `Starting from ₹${service.price}` 
                                                : `₹${service.price}`}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm">{service.description}</p>
                                </div>
                            ))}
                        </div>

                        {selectedServices.length > 0 && (
                            <div className="mt-8 border-t pt-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold">Selected Services</h3>
                                        <p className="text-gray-600 text-sm">
                                            {selectedServices.length} service(s) selected
                                        </p>
                                    </div>
                                    {!hasServiceWithRange && (
                                        <div className="text-right">
                                            <p className="text-lg font-semibold">
                                                Total: ₹{selectedServices.reduce((sum, service) => sum + service.price, 0)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleProceedToCheckout}
                                    className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <LoginPrompt 
                    message="Please log in or create an account to continue with your service request"
                    redirectPath={`/services/${serviceType}`}
                    onClose={() => setShowLoginPrompt(false)}
                />
            )}
        </Layout>
    );
}

export default ServiceDetails;
