import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi } from '../services/api';

const API_URL = 'http://localhost:5000';
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';

// Define service title mappings and their routes
const SERVICE_ROUTES = {
    'AC Service & Repair': {
        route: '/services/ac',
        title: 'AC Services'
    },
    'Plumbing Repair': {
        route: '/services/plumbing',
        title: 'Plumbing Services'
    },
    'Electrical Repair': {
        route: '/services/electrical',
        title: 'Electrical Services'
    },
    
    'Fan Installation': {
        route: '/services/fan',
        title: 'Fan Installation Services'
    },
    'Telephone Repair': {
        route: '/services/telephone',
        title: 'Telephone Repair'
    },
    'Home Cleaning Service': {
        route: '/services/cleaning',
        title: 'Cleaning Services'
    },
    'Painting Service': {
        route: '/services/painting',
        title: 'Painting Services'
    },
    'Computer Repair Service': {
        route: '/services/computer',
        title: 'Computer Repair Services'
    },
    'Phone Repair Service': {
        route: '/services/telephone',
        title: 'Phone Repair Services'
    },
    'Landscaping Service': {
        route: '/services/landscaping',
        title: 'Landscaping Services'
    },
    'Pest Control Service': {
        route: '/services/pestcontrol',
        title: 'Pest Control Services'
    },
    'Carpentry Work': {
        route: '/services/carpentry',
        title: 'Carpentry Services'
    }
};

function Services({ searchQuery = '' }) {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                let data;
                if (searchQuery) {
                    data = await serviceApi.searchServices(searchQuery);
                } else {
                    data = await serviceApi.getAllServices();
                }
                console.log('Fetched services:', data);
                setServices(data);
                setError(null);
            } catch (err) {
                console.error('Error in Services component:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [searchQuery]);

    const handleBookNow = (service) => {
        console.log('Book Now clicked for service:', service);
        const title = service.title?.trim();
        console.log('Service title after trim:', title);
        
        if (!title) {
            console.error('No title found for service:', service);
            return;
        }

        // Find exact match first
        if (SERVICE_ROUTES[title]) {
            const route = SERVICE_ROUTES[title].route;
            console.log('Navigating to:', route);
            navigate(route);
            return;
        }

        // If no exact match, try to find a partial match
        const matchingTitle = Object.keys(SERVICE_ROUTES).find(key => 
            title.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(title.toLowerCase())
        );

        if (matchingTitle) {
            const route = SERVICE_ROUTES[matchingTitle].route;
            console.log('Navigating to:', route);
            navigate(route);
            return;
        }

        console.error('No matching route found for service title:', title);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                Error: {error}
            </div>
        );
    }

    if (!services || services.length === 0) {
        return (
            <div className="text-gray-500 text-center p-4">
                No services available at the moment.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {services.map((service) => (
                <div
                    key={service.service_id}
                    className="border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col max-w-sm mx-auto"
                    style={{ maxHeight: '500px' }}
                >
                    <div 
                        className="relative overflow-hidden" 
                        style={{ 
                            height: '200px',
                            minHeight: '200px',
                            maxHeight: '200px'
                        }}
                    >
                        <img
                            src={service.image_url.startsWith('http') ? service.image_url : `${API_URL}${service.image_url}`}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                console.log('Image load error:', e.target.src);
                                if (e.target.src !== FALLBACK_IMAGE) {
                                    e.target.src = FALLBACK_IMAGE;
                                }
                            }}
                        />
                    </div>
                    <div className="p-4 flex-1 overflow-hidden">
                        <h3 className="text-xl font-semibold mb-2 text-gray-800 truncate">{service.title}</h3>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{service.description}</p>
                        <div className="flex justify-between items-center mt-auto">
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                                {service.category}
                            </span>
                            <button
                                onClick={() => handleBookNow(service)}
                                className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium text-sm"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Services;
