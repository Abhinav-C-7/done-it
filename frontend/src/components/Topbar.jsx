import React from 'react'
import { Link } from 'react-router-dom';

function Topbar({ servicesBg, workersBg }) {
  return (
    <div className='flex justify-center items-center m-4 border border-gray-500/30 rounded-xl shadow-sm'>
        <Link className={`px-10 w-full py-3 rounded-l-xl font-semibold ${servicesBg}`} to='/'>
          Services
        </Link>
        <Link className={`px-10 w-full py-3 font-semibold rounded-r-xl ${workersBg}`} to='/Workers'>
          Workers
        </Link>
    </div>
  )
}

export default Topbar;
