import React from 'react';
import ServiceDetailsTemplate from '../components/ServiceDetailsTemplate';

const CleaningServiceDetails = () => {
    const services = [
        {
            id: 1,
            type: "Basic Home Cleaning",
            price: "₹299",
            category: "Cleaning",
            description: "Essential home cleaning service",
            features: [
                "Dusting and sweeping",
                "Floor mopping",
                "Bathroom cleaning",
                "Kitchen cleaning",
                "Waste disposal"
            ],
            time: "120 mins"
        },
        {
            id: 2,
            type: "Deep Cleaning Service",
            price: "₹799",
            category: "Cleaning",
            description: "Thorough deep cleaning for your home",
            features: [
                "All basic cleaning services",
                "Window and glass cleaning",
                "Furniture deep cleaning",
                "Carpet/sofa shampooing",
                "Cabinet and shelf organization"
            ],
            time: "240 mins"
        },
        {
            id: 3,
            type: "Move In/Out Cleaning",
            price: "₹999",
            category: "Cleaning",
            description: "Complete cleaning service for moving",
            features: [
                "All deep cleaning services",
                "Wall spot cleaning",
                "Behind appliance cleaning",
                "Balcony/patio cleaning",
                "Sanitization service"
            ],
            time: "300 mins"
        }
    ];

    return (
        <ServiceDetailsTemplate
            title="Cleaning Services"
            description="Professional cleaning services for a spotless home"
            services={services}
        />
    );
};

export default CleaningServiceDetails;
