import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component ensures pages always start at the top when navigating
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Immediately reset scroll position when the route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // Use 'auto' instead of 'smooth' for immediate positioning
    });
    
    // For browsers that don't support scrollTo
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

export default ScrollToTop;
