import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';

// Define service title mappings and their routes
const SERVICE_ROUTES = {
    'AC Service': {
        route: '/services/ac',
        title: 'AC Services',
        category: 'Appliance Repair'
    },
    'Plumbing Repair': {
        route: '/services/plumbing',
        title: 'Plumbing Services',
        category: 'Plumbing'
    },
    'Plumbing Services': {
        route: '/services/plumbing',
        title: 'Plumbing Services',
        category: 'Plumbing'
    },
    'Electrical Repair': {
        route: '/services/electrical',
        title: 'Electrical Services',
        category: 'Electrical'
    },
    'Electrical Services': {
        route: '/services/electrical',
        title: 'Electrical Services',
        category: 'Electrical'
    },
    'Fan Installation': {
        route: '/services/fan',
        title: 'Fan Installation Services',
        category: 'Electrical'
    },
    'Telephone Repair': {
        route: '/services/telephone',
        title: 'Telephone Repair',
        category: 'Appliance Repair'
    },
    'Home Cleaning Service': {
        route: '/services/cleaning',
        title: 'Cleaning Services',
        category: 'Cleaning'
    },
    'House Cleaning': {
        route: '/services/cleaning',
        title: 'Cleaning Services',
        category: 'Cleaning'
    },
    'House Cleaning Services': {
        route: '/services/cleaning',
        title: 'Cleaning Services',
        category: 'Cleaning'
    },
    'Cleaning Services': {
        route: '/services/cleaning',
        title: 'Cleaning Services',
        category: 'Cleaning'
    },
    'Painting Service': {
        route: '/services/painting',
        title: 'Painting Services',
        category: 'Painting'
    },
    'Painting Services': {
        route: '/services/painting',
        title: 'Painting Services',
        category: 'Painting'
    },
    'Computer Repair Service': {
        route: '/services/computer',
        title: 'Computer Repair Services',
        category: 'Appliance Repair'
    },
    'Phone Repair Service': {
        route: '/services/telephone',
        title: 'Phone Repair Services',
        category: 'Appliance Repair'
    },
    'Landscaping Service': {
        route: '/services/landscaping',
        title: 'Landscaping Services',
        category: 'Cleaning'
    },
    'Pest Control Service': {
        route: '/services/pestcontrol',
        title: 'Pest Control Services',
        category: 'Cleaning'
    },
    'Pest Control': {
        route: '/services/pestcontrol',
        title: 'Pest Control Services',
        category: 'Cleaning'
    },
    'Carpentry Work': {
        route: '/services/carpentry',
        title: 'Carpentry Services',
        category: 'Carpentry'
    },
    'Carpentry Services': {
        route: '/services/carpentry',
        title: 'Carpentry Services',
        category: 'Carpentry'
    }
};

function Services({ searchQuery = '', categoryFilter = '' }) {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredServices, setFilteredServices] = useState([]);

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

    // Apply category filter
    useEffect(() => {
        if (!categoryFilter || categoryFilter === 'All') {
            setFilteredServices(services);
        } else {
            const filtered = services.filter(service => {
                const title = service.title?.trim();
                // Check if service title exists in our mapping and matches the category
                if (SERVICE_ROUTES[title]) {
                    return SERVICE_ROUTES[title].category === categoryFilter;
                }
                
                // If not found directly, try to find a similar title
                const matchingTitle = Object.keys(SERVICE_ROUTES).find(key => 
                    title.toLowerCase().includes(key.toLowerCase()) || 
                    key.toLowerCase().includes(title.toLowerCase())
                );
                
                if (matchingTitle) {
                    return SERVICE_ROUTES[matchingTitle].category === categoryFilter;
                }
                
                // If no match found, include in results if service.category matches
                return service.category === categoryFilter;
            });
            
            setFilteredServices(filtered);
        }
    }, [services, categoryFilter]);

    const handleServiceClick = (service) => {
        const title = service.title?.trim();
        if (SERVICE_ROUTES[title]) {
            navigate(SERVICE_ROUTES[title].route);
        } else {
            const matchingTitle = Object.keys(SERVICE_ROUTES).find(key => 
                title.toLowerCase().includes(key.toLowerCase()) || 
                key.toLowerCase().includes(title.toLowerCase())
            );
            if (matchingTitle) {
                navigate(SERVICE_ROUTES[matchingTitle].route);
            }
        }
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

    if (!filteredServices || filteredServices.length === 0) {
        return (
            <div className="text-gray-500 text-center p-4 bg-white rounded-lg shadow-md py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No services found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    {categoryFilter && categoryFilter !== 'All' 
                        ? `No services available in the "${categoryFilter}" category.`
                        : searchQuery 
                            ? `No services match your search for "${searchQuery}".`
                            : 'No services available at the moment.'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {filteredServices.map((service) => (
                <div
                    key={service.service_id}
                    className="border rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-white flex flex-col max-w-sm mx-auto cursor-pointer transform hover:scale-105"
                    style={{ maxHeight: '500px' }}
                    onClick={() => handleServiceClick(service)}
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
                            src={`${API_URL}${service.image_url}`}
                            alt={service.title}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = FALLBACK_IMAGE;
                            }}
                            className="w-full h-full object-cover transition-transform duration-300"
                        />
                        {service.category && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                                {service.category}
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex-grow">
                        <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{service.category}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Services;
