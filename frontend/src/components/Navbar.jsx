import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import profileIcon from '../assets/images/profile.png';
import postIcon from '../assets/images/post.png';
import homeIcon from '../assets/images/home.png';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left - Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center">
                            <span className="text-xl font-bold text-yellow-500">Done-It</span>
                        </Link>
                    </div>

                    {/* Right - Navigation Icons */}
                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                <Link to="/post" className="text-gray-600 hover:text-gray-900">
                                    <img src={postIcon} alt="Post" className="h-6 w-6" />
                                </Link>
                                <Link to="/" className="text-gray-600 hover:text-gray-900">
                                    <img src={homeIcon} alt="Home" className="h-6 w-6" />
                                </Link>
                                <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                                    <img src={profileIcon} alt="Profile" className="h-6 w-6" />
                                </Link>
                                <button
                                    onClick={logout}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;