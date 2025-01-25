import React from 'react';
import ServiceDetailsTemplate from '../components/ServiceDetailsTemplate';

const FanInstallationServiceDetails = () => {
    const services = [
        {
            id: 1,
            type: "Basic Fan Installation",
            price: "₹499",
            category: "Fan Installation",
            description: "Standard ceiling fan installation service",
            features: [
                "Basic fan assembly",
                "Standard mounting",
                "Wiring connection",
                "Basic testing",
                "Safety check"
            ],
            time: "1-2 hours"
        },
        {
            id: 2,
            type: "Premium Fan Installation",
            price: "₹799",
            category: "Fan Installation",
            description: "Premium installation with additional features",
            features: [
                "Premium fan assembly",
                "Heavy-duty mounting",
                "Advanced wiring setup",
                "Remote control setup",
                "Extended testing"
            ],
            time: "2-3 hours"
        },
        {
            id: 3,
            type: "Custom Fan Installation",
            price: "₹999",
            category: "Fan Installation",
            description: "Custom installation for special requirements",
            features: [
                "Custom mounting solutions",
                "Smart fan setup",
                "Advanced remote programming",
                "Special height adjustments",
                "1-year installation warranty"
            ],
            time: "2-4 hours"
        }
    ];

    return (
        <ServiceDetailsTemplate
            services={services}
            title="Fan Installation Services"
            description="Professional ceiling fan installation services for all types and models"
        />
    );
};

export default FanInstallationServiceDetails;
