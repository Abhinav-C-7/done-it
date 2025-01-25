import React from 'react';
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

function Searchbar({ onSearch, placeholder = "Search for services..." }) {
  const serviceCategories = [
    "Home Cleaning",
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "Gardening",
    "Moving",
    "Appliance Repair",
    "All Services"
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    onSearch(value);
  };

  const handleCategorySelect = (category) => {
    onSearch(category === "All Services" ? "" : category);
  };

  return (
    <div className="w-full px-4 py-2">
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="search"
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          placeholder={placeholder}
          onChange={handleSearch}
          aria-label="Search services"
        />
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4 px-1">
        {serviceCategories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className="px-4 py-2 text-sm font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Searchbar;