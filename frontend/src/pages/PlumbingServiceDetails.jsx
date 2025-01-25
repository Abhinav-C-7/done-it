import React from 'react';
import ServiceDetailsTemplate from '../components/ServiceDetailsTemplate';

const PlumbingServiceDetails = () => {
    const services = [
        {
            id: 1,
            type: "Basic Plumbing Service",
            price: "₹299",
            category: "Plumbing",
            description: "Quick fixes for common plumbing issues",
            features: [
                "Leak detection and repair",
                "Tap and faucet repair",
                "Basic pipe repairs",
                "Drain cleaning",
                "Minor fixture repairs"
            ],
            time: "60 mins"
        },
        {
            id: 2,
            type: "Advanced Plumbing Service",
            price: "₹499",
            category: "Plumbing",
            description: "Comprehensive plumbing solutions",
            features: [
                "Major pipe repairs",
                "Fixture replacement",
                "Water heater service",
                "Bathroom fitting installation",
                "90 days service warranty"
            ],
            time: "120 mins"
        },
        {
            id: 3,
            type: "Emergency Plumbing Service",
            price: "₹699",
            category: "Plumbing",
            description: "24/7 emergency plumbing support",
            features: [
                "Immediate response",
                "Burst pipe repair",
                "Emergency leak control",
                "Water damage prevention",
                "Priority service"
            ],
            time: "30-60 mins"
        }
    ];

    return (
        <ServiceDetailsTemplate
            title="Plumbing Services"
            description="Professional plumbing services at your doorstep"
            services={services}
        />
    );
};

export default PlumbingServiceDetails;
