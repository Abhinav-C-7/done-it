import React from 'react';
import ServiceDetailsTemplate from '../components/ServiceDetailsTemplate';

const CarpentryServiceDetails = () => {
    const services = [
        {
            id: 1,
            type: "Basic Carpentry Work",
            price: "₹599",
            category: "Carpentry",
            description: "Essential carpentry services for basic repairs and fixes",
            features: [
                "Door repair & adjustment",
                "Lock installation",
                "Drawer repair",
                "Basic furniture assembly",
                "Small woodwork fixes"
            ],
            time: "2-3 hours"
        },
        {
            id: 2,
            type: "Custom Furniture Work",
            price: "₹1499",
            category: "Carpentry",
            description: "Custom furniture repairs and modifications",
            features: [
                "Furniture modification",
                "Cabinet repair & installation",
                "Shelving installation",
                "Custom wood cutting",
                "Wood finishing & polishing"
            ],
            time: "4-6 hours"
        },
        {
            id: 3,
            type: "Premium Carpentry Service",
            price: "₹2999",
            category: "Carpentry",
            description: "High-end carpentry work and custom installations",
            features: [
                "Custom furniture design",
                "Complete kitchen cabinets",
                "Built-in wardrobes",
                "Premium wood finishing",
                "Detailed woodwork"
            ],
            time: "1-2 days"
        }
    ];

    return (
        <ServiceDetailsTemplate
            services={services}
            title="Carpentry Services"
            description="Professional carpentry services for all your woodworking needs"
        />
    );
};

export default CarpentryServiceDetails;
