import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export function useLocation() {
  return useContext(LocationContext);
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);

  const updateLocation = (newLocation) => {
    setLocation(newLocation);
    // Optionally save to localStorage for persistence
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
  };

  // Initialize location from localStorage if available
  React.useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    }
  }, []);

  const value = {
    location,
    updateLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
