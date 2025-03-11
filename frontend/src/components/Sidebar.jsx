import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
    const { user, logout } = useAuth();
    
    // Check if user is a serviceman by email domain
    const isServiceman = user?.email?.includes('@serviceman.doneit.com');

    return (
        <div id="sidebar" className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg w-16 hover:w-64 transition-all duration-300 z-40">
            {/* Navigation */}
            <nav className="p-4">
                <ul className="space-y-4">
                    <li>
                        <Link to="/" className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="ml-3 whitespace-nowrap hidden sidebar-text">
                                Home
                            </span>
                        </Link>
                    </li>
                    {user && (
                        <li>
                            <Link 
                                to={isServiceman ? '/serviceman/dashboard' : user.type === 'worker' ? '/worker/dashboard' : '/customer/dashboard'} 
                                className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50"
                            >
                                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span className="ml-3 whitespace-nowrap hidden sidebar-text">
                                    Dashboard
                                </span>
                            </Link>
                        </li>
                    )}
                    {/* Serviceman specific menu items */}
                    {user && isServiceman && (
                        <>
                            <li>
                                <Link to="/serviceman/available-jobs" className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50">
                                    <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="ml-3 whitespace-nowrap hidden sidebar-text">
                                        Available Jobs
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/serviceman/my-jobs" className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50">
                                    <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <span className="ml-3 whitespace-nowrap hidden sidebar-text">
                                        My Jobs
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/serviceman/earnings" className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50">
                                    <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="ml-3 whitespace-nowrap hidden sidebar-text">
                                        Earnings
                                    </span>
                                </Link>
                            </li>
                        </>
                    )}
                    <li>
                        <Link to="/profile" className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="ml-3 whitespace-nowrap hidden sidebar-text">
                                Profile
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/notifications" className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="ml-3 whitespace-nowrap hidden sidebar-text">
                                Notifications
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" className="flex items-center text-gray-700 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="ml-3 whitespace-nowrap hidden sidebar-text">
                                Settings
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
                        <span className="ml-3 font-medium truncate hidden sidebar-text">
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
                        <span className="ml-3 whitespace-nowrap hidden sidebar-text">
                            Logout
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default Sidebar;
