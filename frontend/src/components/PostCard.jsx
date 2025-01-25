import React from 'react';
import edit from '../assets/images/edit.png';

function PostCard({ Image, Problem, Time }) {
  return (
    <div className="m-3 rounded-xl border border-gray-600/30 shadow-md">
      <a href="#" className="flex">
        <img src={Image} alt="tv" className="border-r-4 border-yellow-400" />
        <div className="p-4 flex-1 flex justify-between items-center">
          <div>
            <h1 className="font-semibold">{Problem}</h1>
            <hr className="border-1 border-gray-300" /> 
            <p className="text-green-600 pt-1">{Time}</p>
          </div>
          <img src={edit} alt="Edit" className="bg-yellow-400 p-2 rounded-2xl w-14 ml-3" />
        </div>
      </a>
    </div>
  );
}

export default PostCard;
