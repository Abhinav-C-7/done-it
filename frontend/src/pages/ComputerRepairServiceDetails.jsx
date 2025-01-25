import React from 'react';
import ServiceDetailsTemplate from '../components/ServiceDetailsTemplate';

const ComputerRepairServiceDetails = () => {
    const services = [
        {
            id: 1,
            type: "Basic Computer Repair",
            price: "₹799",
            category: "Computer Repair",
            description: "Basic computer diagnostics and repair service",
            features: [
                "Hardware diagnostics",
                "Software troubleshooting",
                "Virus removal",
                "System optimization",
                "Basic data recovery"
            ],
            time: "2-4 hours"
        },
        {
            id: 2,
            type: "Advanced Computer Repair",
            price: "₹1499",
            category: "Computer Repair",
            description: "Comprehensive computer repair and upgrade service",
            features: [
                "Advanced hardware repair",
                "Operating system reinstallation",
                "Component upgrades",
                "Full system backup",
                "Performance optimization"
            ],
            time: "4-8 hours"
        },
        {
            id: 3,
            type: "Emergency Computer Service",
            price: "₹1999",
            category: "Computer Repair",
            description: "Urgent computer repair with priority service",
            features: [
                "Same-day service",
                "Data recovery",
                "Network troubleshooting",
                "Remote support",
                "Hardware replacement"
            ],
            time: "1-3 hours"
        }
    ];

    return (
        <ServiceDetailsTemplate
            services={services}
            title="Computer Repair Services"
            description="Professional computer repair services for all brands and models"
        />
    );
};

export default ComputerRepairServiceDetails;
