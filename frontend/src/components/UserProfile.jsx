import React from 'react'
import user from '../assets/images/user.jpg'

function UserProfile() {
  return (
    <div className='bg-slate-800 h-44 backdrop-blur-md'>
        <ul className='flex flex-col items-center pt-10'>
            <li><img className='w-20 rounded-full shadow-md border-white border-2' src={user} alt="user-profile-picture" /></li>
            <li><h1 className='font-semibold text-white'>Abhay MP</h1></li>
            <li><p className='text-white font-light text-sm'>abhaymp@gmail.com</p></li>
        </ul>
    </div>
  )
}

export default UserProfile