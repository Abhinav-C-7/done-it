import React from 'react'
import { Link } from 'react-router-dom'

function Topbar2({Posts,Booked}) {
  return (
    <div className='flex justify-center'> 
        <Link className={`px-10 py-5 w-full border-yellow-500 font-semibold ${Posts}`} to='/Profile'>Posts</Link>
        <Link className={`px-10 py-5 w-full border-yellow-500 font-semibold ${Booked}`} to='/Booked'>Booked</Link>
    </div>
  )
}

export default Topbar2