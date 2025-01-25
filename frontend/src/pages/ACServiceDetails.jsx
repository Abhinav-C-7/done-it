import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";

const ACServiceDetails = () => {
    const navigate = useNavigate();

    const services = [
        {
            id: 1,
            type: "AC Regular Service",
            price: "₹499",
            description: "Complete check-up & cleaning of your AC",
            features: [
                "Deep cleaning of indoor & outdoor units",
                "Filter cleaning",
                "Drain pipe cleaning",
                "Performance check",
                "Up to 2 ton split/window AC"
            ],
            time: "90 mins"
        },
        {
            id: 2,
            type: "AC Repair & Gas Refill",
            price: "₹699",
            description: "Professional diagnosis & repair service",
            features: [
                "Complete AC check-up",
                "Gas pressure check",
                "Gas top-up if required",
                "Repair of common issues",
                "90 days service warranty"
            ],
            time: "60-120 mins"
        },
        {
            id: 3,
            type: "AC Installation/Uninstallation",
            price: "₹999",
            description: "Professional AC installation or removal",
            features: [
                "Installation/Uninstallation of split AC",
                "Angle drilling & mounting",
                "Copper pipe & wiring setup",
                "Testing & commissioning",
                "30 days installation warranty"
            ],
            time: "120 mins"
        }
    ];

    const handleServiceSelect = (serviceType) => {
        navigate('/service-request', {
            state: { serviceType: 'AC', subType: serviceType }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto p-4">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold mb-2">AC Services</h1>
                    <p className="text-gray-600 mb-4">Professional AC services at your doorstep</p>
                    
                    {/* Service Cards */}
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
                                            onClick={() => handleServiceSelect(service.type)}
                                            className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                                        >
                                            Book Now
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
            <Navbar posticon={post} homeicon={homefull} profileicon={profile} />
        </div>
    );
};

export default ACServiceDetails;
