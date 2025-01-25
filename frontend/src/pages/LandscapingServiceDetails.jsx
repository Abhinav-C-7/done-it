import React from 'react';
import ServiceDetailsTemplate from '../components/ServiceDetailsTemplate';

const LandscapingServiceDetails = () => {
    const services = [
        {
            id: 1,
            type: "Basic Landscaping",
            price: "₹1999",
            category: "Landscaping",
            description: "Essential landscaping maintenance service",
            features: [
                "Lawn mowing",
                "Edge trimming",
                "Weed removal",
                "Basic pruning",
                "Debris cleanup"
            ],
            time: "3-4 hours"
        },
        {
            id: 2,
            type: "Garden Design & Maintenance",
            price: "₹3999",
            category: "Landscaping",
            description: "Comprehensive garden design and maintenance service",
            features: [
                "Custom garden design",
                "Plant selection & installation",
                "Irrigation system setup",
                "Mulching & fertilizing",
                "Seasonal maintenance"
            ],
            time: "1-2 days"
        },
        {
            id: 3,
            type: "Premium Landscaping",
            price: "₹7999",
            category: "Landscaping",
            description: "Complete landscape transformation service",
            features: [
                "Hardscape installation",
                "Water feature setup",
                "Lighting design",
                "Custom stonework",
                "Complete yard renovation"
            ],
            time: "3-5 days"
        }
    ];

    return (
        <ServiceDetailsTemplate
            services={services}
            title="Landscaping Services"
            description="Professional landscaping services to transform your outdoor space"
        />
    );
};

export default LandscapingServiceDetails;
