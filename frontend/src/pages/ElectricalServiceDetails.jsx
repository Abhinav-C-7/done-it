import React from 'react';
import ServiceDetailsTemplate from '../components/ServiceDetailsTemplate';

const ElectricalServiceDetails = () => {
    const services = [
        {
            id: 1,
            type: "Basic Electrical Service",
            price: "₹299",
            category: "Electrical",
            description: "Essential electrical repairs and installations",
            features: [
                "Switch and socket repair",
                "Fan installation/repair",
                "Light fixture installation",
                "Circuit testing",
                "Basic wiring fixes"
            ],
            time: "60 mins"
        },
        {
            id: 2,
            type: "Advanced Electrical Work",
            price: "₹599",
            category: "Electrical",
            description: "Complex electrical solutions",
            features: [
                "Complete house wiring",
                "Circuit breaker installation",
                "Electrical panel upgrades",
                "Appliance installation",
                "90 days warranty"
            ],
            time: "180 mins"
        },
        {
            id: 3,
            type: "Emergency Electrical Service",
            price: "₹799",
            category: "Electrical",
            description: "24/7 emergency electrical support",
            features: [
                "Immediate response",
                "Power failure resolution",
                "Short circuit repair",
                "Safety inspection",
                "Emergency lighting"
            ],
            time: "30-60 mins"
        }
    ];

    return (
        <ServiceDetailsTemplate
            title="Electrical Services"
            description="Professional electrical services for your home and office"
            services={services}
        />
    );
};

export default ElectricalServiceDetails;
