import React from 'react';
import ServiceDetailsTemplate from '../components/ServiceDetailsTemplate';

const PaintingServiceDetails = () => {
    const services = [
        {
            id: 1,
            type: "Basic Painting Service",
            price: "₹599",
            category: "Painting",
            description: "Essential painting service for your home",
            features: [
                "Wall preparation",
                "Basic color painting",
                "Two coats of paint",
                "Minor crack filling",
                "Basic finishing"
            ],
            time: "1-2 days"
        },
        {
            id: 2,
            type: "Premium Painting Service",
            price: "₹899",
            category: "Painting",
            description: "High-quality painting with premium materials",
            features: [
                "Premium paint brands",
                "Texture painting options",
                "Three coats of paint",
                "Wall putty application",
                "Advanced crack repairs"
            ],
            time: "2-3 days"
        },
        {
            id: 3,
            type: "Custom Design Painting",
            price: "₹1299",
            category: "Painting",
            description: "Custom designs and artistic painting",
            features: [
                "Custom wall designs",
                "Stencil work",
                "Accent wall creation",
                "Special effects painting",
                "Designer consultation"
            ],
            time: "3-4 days"
        }
    ];

    return (
        <ServiceDetailsTemplate
            title="Painting Services"
            description="Transform your space with our professional painting services"
            services={services}
        />
    );
};

export default PaintingServiceDetails;
