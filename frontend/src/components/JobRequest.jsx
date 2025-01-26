import React from 'react';
import Layout from './Layout';

function JobRequest({
  serviceName,
  serviceRate,
  userLocation,
  distance,
  onAccept,
  onReject,
}) {
  return (
    <div className="w-auto ml-16 bg-white shadow-lg rounded-2xl p-4 mt-4 hover:shadow-2xl transition duration-300 ease-in-out">
      {/* Service Title */}
      <h2 className="text-xl font-bold text-gray-800">{serviceName}</h2>

      {/* Service Rate */}
      <p className="text-green-500 mt-2">
        <span className="font-semibold text-lg">₹{serviceRate}</span>  
      </p>

      {/* User's Location */}
      <p className="text-gray-600 mt-2">
        <span className="font-semibold">Location</span> {userLocation}
      </p>

      {/* Distance */}
      <p className="text-gray-600 mt-2">
        <span className="font-semibold text-2xl">{distance} km</span> away
      </p>

      {/* Action Buttons */}
      <div className="flex justify-end mt-4 space-x-2">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 ease-in-out"
          onClick={onAccept}
        >
          Accept
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
          onClick={onReject}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default JobRequest;
