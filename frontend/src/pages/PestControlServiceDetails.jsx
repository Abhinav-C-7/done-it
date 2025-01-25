import React from 'react';
import ServiceDetailsTemplate from '../components/ServiceDetailsTemplate';

const PestControlServiceDetails = () => {
    const services = [
        {
            id: 1,
            type: "Basic Pest Control",
            price: "₹999",
            category: "Pest Control",
            description: "Essential pest control treatment for common pests",
            features: [
                "Inspection & assessment",
                "Common pest treatment",
                "Preventive spraying",
                "Entry point sealing",
                "Basic pest proofing"
            ],
            time: "2-3 hours"
        },
        {
            id: 2,
            type: "Advanced Pest Control",
            price: "₹1999",
            category: "Pest Control",
            description: "Comprehensive pest control for multiple pest types",
            features: [
                "Multiple pest treatment",
                "Gel baiting",
                "Fumigation",
                "Advanced pest proofing",
                "Follow-up inspection"
            ],
            time: "3-4 hours"
        },
        {
            id: 3,
            type: "Premium Pest Control",
            price: "₹2999",
            category: "Pest Control",
            description: "Complete pest elimination with long-term protection",
            features: [
                "Full property treatment",
                "Termite control",
                "Rodent control",
                "Eco-friendly options",
                "6-month warranty"
            ],
            time: "4-6 hours"
        }
    ];

    return (
        <ServiceDetailsTemplate
            services={services}
            title="Pest Control Services"
            description="Professional pest control services for a pest-free environment"
        />
    );
};

export default PestControlServiceDetails;
