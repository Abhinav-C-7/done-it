import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";
import Cart from './Cart';

const ServiceDetailsTemplate = ({ title, description, services }) => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [message, setMessage] = useState('');

    const addToCart = (service) => {
        if (cartItems.some(item => item.id === service.id)) {
            setMessage('This service is already in your cart');
            setTimeout(() => setMessage(''), 2000);
            return;
        }
        setCartItems([...cartItems, service]);
        setMessage('Service added to cart');
        setTimeout(() => setMessage(''), 2000);
    };

    const removeFromCart = (index) => {
        setCartItems(cartItems.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + parseFloat(item.price.replace('₹', '')), 0);
    };

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <Navbar posticon={post} homeicon={homefull} profileicon={profile} />
            <Sidebar />
            <div className="flex justify-center max-w-6xl mx-auto pt-16">
                {/* Main Content */}
                <div className="flex-1 max-w-3xl">
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h1 className="text-2xl font-bold mb-2">{title}</h1>
                        <p className="text-gray-600 mb-4">{description}</p>
                        
                        {message && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                                message.includes('already') 
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                            }`}>
                                {message}
                            </div>
                        )}
                        
                        <div className="space-y-6">
                            {services.map((service) => (
                                <div key={service.id} className="border border-gray-200 rounded-xl p-6 hover:border-yellow-400 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-2">{service.type}</h2>
                                            <p className="text-gray-600 mb-2">{service.description}</p>
                                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {service.time}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-yellow-500 mb-2">
                                                {service.price}
                                            </div>
                                            <button
                                                onClick={() => addToCart(service)}
                                                className={`${
                                                    cartItems.some(item => item.id === service.id)
                                                        ? 'bg-gray-300 cursor-not-allowed'
                                                        : 'bg-yellow-400 hover:bg-yellow-500'
                                                } text-black px-6 py-2 rounded-lg transition-colors font-medium`}
                                                disabled={cartItems.some(item => item.id === service.id)}
                                            >
                                                {cartItems.some(item => item.id === service.id) 
                                                    ? 'Added to Cart'
                                                    : 'Add to Cart'
                                                }
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">What's Included:</h3>
                                        <ul className="space-y-2">
                                            {service.features.map((feature, index) => (
                                                <li key={index} className="flex items-start">
                                                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart Section */}
                <div className="w-72 p-4 sticky top-20 h-screen">
                    <Cart 
                        items={cartItems}
                        removeFromCart={removeFromCart}
                        total={calculateTotal()}
                    />
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailsTemplate;
