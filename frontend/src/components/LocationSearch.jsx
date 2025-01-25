import React, { useState } from "react";

function LocationSearch({ onLocationSelect }) {
    const [address, setAddress] = useState("");
    const [suggestions] = useState([
        "Mumbai, Maharashtra",
        "Delhi, New Delhi",
        "Bangalore, Karnataka",
        "Hyderabad, Telangana",
        "Chennai, Tamil Nadu",
        "Kolkata, West Bengal",
        "Pune, Maharashtra",
        "Ahmedabad, Gujarat"
    ]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setAddress(value);
        setShowSuggestions(value.length > 0);
    };

    const handleSelectLocation = (location) => {
        setAddress(location);
        setShowSuggestions(false);
        onLocationSelect(location);
    };

    return (
        <div className="relative w-48">
            <div className="relative">
                <input
                    type="text"
                    value={address}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </div>

            {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {suggestions
                        .filter(suggestion => 
                            suggestion.toLowerCase().includes(address.toLowerCase())
                        )
                        .map((suggestion, index) => (
                            <div
                                key={index}
                                className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSelectLocation(suggestion)}
                            >
                                <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    {suggestion}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

export default LocationSearch;
