import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg w-16 hover:w-64 transition-all duration-300 group z-40">
            {/* Navigation */}
            <nav className="p-4">
                <ul className="space-y-4">
                    <li>
                        <Link to="/" className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Home
                            </span>
                        </Link>
                    </li>
                    {user && (
                        <li>
                            <Link 
                                to={user.user_type === 'customer' ? '/customer/dashboard' : '/worker/dashboard'} 
                                className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50"
                            >
                                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Dashboard
                                </span>
                            </Link>
                        </li>
                    )}
                    <li>
                        <Link to="/profile" className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Profile
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/services" className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Services
                            </span>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* User Section */}
            {user && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                    <div className="flex items-center mb-4">
                        <svg className="w-6 h-6 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="ml-3 font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {user.email}
                        </span>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center w-full text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50"
                    >
                        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Logout
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default Sidebar;
