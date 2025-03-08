import React from 'react';
import ServiceDetailsTemplate from '../components/ServiceDetailsTemplate';

const ACServiceDetails = () => {
    const services = [
        {
            id: 1,
            type: "AC Cleaning",
            price: "₹799",
            category: "Appliance",
            description: "Deep cleaning service for your AC unit",
            features: [
                "Complete indoor & outdoor unit cleaning",
                "Filter cleaning and sanitization",
                "Drain pipe cleaning",
                "Performance optimization",
                "Up to 2 ton split/window AC"
            ],
            time: "90 mins"
        },
        {
            id: 2,
            type: "AC Gas Refill",
            price: "₹1,499",
            category: "Appliance",
            description: "Professional AC gas refilling service",
            features: [
                "Gas pressure check",
                "Gas refill/top-up",
                "Performance testing",
                "Leak detection",
                "90 days service warranty"
            ],
            time: "60-120 mins"
        },
        {
            id: 3,
            type: "AC Diagnosis and Repair",
            price: "Price after inspection",
            category: "Appliance",
            description: "Expert diagnosis and repair service",
            features: [
                "Complete AC inspection",
                "Problem diagnosis",
                "Repair estimate provided",
                "All types of repairs",
                "30 days repair warranty"
            ],
            time: "60-120 mins"
        }
    ];

    return (
        <ServiceDetailsTemplate
            services={services}
            title="AC Services"
            description="Professional AC services at your doorstep"
        />
    );
};

export default ACServiceDetails;
