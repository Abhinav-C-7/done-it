import React from 'react'
import { useNavigate } from 'react-router-dom';

function StarIcon({ filled }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
}

function Showservice({ image, title, price, rating = 0, totalJobs = 0, category }) {
  const navigate = useNavigate();
  console.log('Showservice props:', { image, title, price, rating, totalJobs, category });

  const handleBookNow = () => {
    console.log('Book Now clicked for category:', category);
    
    const serviceRoutes = {
      'AC': '/services/ac',
      'Plumbing': '/services/plumbing',
      'Electrical': '/services/electrical',
      'Cleaning': '/services/cleaning',
      'Painting': '/services/painting'
    };

    console.log('Available routes:', serviceRoutes);
    const route = serviceRoutes[category];
    console.log('Selected route:', route);

    if (route) {
      console.log('Navigating to:', route);
      navigate(route);
    } else {
      console.error('No route found for category:', category);
    }
  };

  return (
    <div className='m-4 border border-gray-500/30 rounded-xl shadow-sm'>
        <div className='flex p-4'>
            <img src={image} alt={title} className='w-28 h-28 object-cover rounded-lg'/>
            <div className='ml-4 flex-1'>
                <h1 className='text-xl font-semibold'>{title}</h1>
                <p className='text-gray-600 mt-1'>{price}</p>
                <div className='mt-2'>
                    <div className='flex items-center'>
                        <div className="flex">
                            {[...Array(5)].map((_, index) => (
                                <StarIcon 
                                    key={index}
                                    filled={index < Math.round(rating)}
                                />
                            ))}
                        </div>
                        <span className='ml-2 text-sm text-gray-600'>
                            ({rating ? rating.toFixed(1) : '0.0'})
                        </span>
                    </div>
                    <p className='text-sm text-gray-500 mt-1'>
                        {totalJobs} completed jobs
                    </p>
                    <button
                        onClick={handleBookNow}
                        className="mt-3 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium text-sm"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Showservice