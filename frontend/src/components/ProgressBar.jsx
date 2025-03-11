import React, { useState, useEffect } from 'react';

const ProgressBar = ({ isLoading, loadingText = "Loading..." }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let timer;
    if (isLoading) {
      // Reset progress when loading starts
      setProgress(0);
      
      // Simulate progress in stages to make it feel more natural
      timer = setTimeout(() => {
        // Quick initial progress to 30%
        setProgress(30);
        
        // Slower progress to 60%
        setTimeout(() => {
          setProgress(60);
          
          // Very slow progress to 85% (simulating backend work)
          setTimeout(() => {
            setProgress(85);
            
            // Final progress happens when the actual loading completes
            // We don't set to 100% here as that should happen when isLoading becomes false
          }, 800);
        }, 600);
      }, 400);
    } else if (progress > 0 && progress < 100) {
      // When loading completes, quickly finish the progress bar
      timer = setTimeout(() => {
        setProgress(100);
        
        // Reset progress after animation completes
        setTimeout(() => {
          setProgress(0);
        }, 500);
      }, 200);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, progress]);
  
  if (progress === 0 && !isLoading) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Loading overlay with brand styling */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center">
          <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {loadingText}
            </h2>
            <p className="text-gray-600">
              {progress < 30 ? "Connecting..." : 
               progress < 60 ? "Verifying your account..." : 
               progress < 85 ? "Almost there..." : 
               "Preparing your experience..."}
            </p>
          </div>
          
          {/* Urban Company style brand logo/animation */}
          <div className="mt-8 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
