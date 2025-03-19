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
        { id: 5, title: 'Pipe Repair', price: 499, description: 'Fix leaking pipes and plumbing issues' },
        { id: 6, title: 'Tap Installation', price: 299, description: 'Install or replace taps and faucets' },
        { id: 7, title: 'Toilet Repair', price: 599, description: 'Toilet repair and installation services' },
        { id: 8, title: 'Water Tank', price: 899, description: 'Water tank cleaning and maintenance' }
    ],
    'electrical': [
        { id: 9, title: 'Wiring Work', price: 699, description: 'Electrical wiring and rewiring services' },
        { id: 10, title: 'Switch Board', price: 399, description: 'Switch board repair and installation' },
        { id: 11, title: 'Light Fitting', price: 299, description: 'Light installation and replacement' },
        { id: 12, title: 'Fan Repair', price: 399, description: 'Fan repair and maintenance services' }
    ],
    'cleaning': [
        { id: 13, title: 'Deep Cleaning', price: 1999, description: 'Complete house deep cleaning service' },
        { id: 14, title: 'Kitchen Cleaning', price: 899, description: 'Professional kitchen cleaning service' },
        { id: 15, title: 'Bathroom Cleaning', price: 699, description: 'Thorough bathroom cleaning service' },
        { id: 16, title: 'Sofa Cleaning', price: 599, description: 'Sofa and upholstery cleaning service' }
    ],
    'painting': [
        { id: 17, title: 'Interior Painting', price: 15999, description: 'Interior house painting service' },
        { id: 18, title: 'Exterior Painting', price: 19999, description: 'Exterior house painting service' },
        { id: 19, title: 'Wall Texturing', price: 2499, description: 'Decorative wall texturing service' },
        { id: 20, title: 'Wood Painting', price: 1299, description: 'Wood furniture painting service' }
    ],
    'pestcontrol': [
        { id: 21, title: 'General Pest Control', price: 1299, description: 'Complete pest control treatment' },
        { id: 22, title: 'Cockroach Control', price: 899, description: 'Cockroach control treatment' },
        { id: 23, title: 'Termite Control', price: 2499, description: 'Termite inspection and control' },
        { id: 24, title: 'Bed Bug Control', price: 1499, description: 'Bed bug elimination service' }
    ],
    'carpentry': [
        { id: 25, title: 'Furniture Repair', price: 599, description: 'Furniture repair and restoration' },
        { id: 26, title: 'Door Work', price: 799, description: 'Door repair and installation' },
        { id: 27, title: 'Cabinet Work', price: 1499, description: 'Custom cabinet making and repair' },
        { id: 28, title: 'Wood Polish', price: 899, description: 'Wood polishing and varnishing' }
    ]
};

const SERVICE_TITLES = {
    'ac': 'AC Services',
    'plumbing': 'Plumbing Services',
    'electrical': 'Electrical Services',
    'cleaning': 'Cleaning Services',
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
                variablePrice: service.variablePrice || false
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
                    variablePrice: service.variablePrice || false
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
                                                ? `Starting from ₹${service.price}` 
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
                                    <div className="text-right">
                                        <p className="text-lg font-semibold">
                                            Total: ₹{selectedServices.reduce((sum, service) => sum + service.price, 0)}
                                        </p>
                                    </div>
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
