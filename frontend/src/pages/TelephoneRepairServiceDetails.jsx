import React from 'react';
import ServiceDetailsTemplate from '../components/ServiceDetailsTemplate';

const TelephoneRepairServiceDetails = () => {
    const services = [
        {
            id: 1,
            type: "Basic Telephone Repair",
            price: "₹299",
            category: "Telephone Repair",
            description: "Basic landline telephone repair and maintenance service",
            features: [
                "Basic diagnostics",
                "Connection testing",
                "Cable inspection",
                "Handset repair",
                "Basic parts replacement"
            ],
            time: "30-60 mins"
        },
        {
            id: 2,
            type: "Advanced Telephone Service",
            price: "₹499",
            category: "Telephone Repair",
            description: "Complete telephone system repair and installation",
            features: [
                "Complete system diagnostics",
                "New line installation",
                "Wiring replacement",
                "Extension setup",
                "EPABX troubleshooting"
            ],
            time: "1-2 hours"
        }
    ];

    return (
        <ServiceDetailsTemplate
            services={services}
            title="Telephone Repair Services"
            description="Professional landline telephone repair and installation services"
        />
    );
};

export default TelephoneRepairServiceDetails;
