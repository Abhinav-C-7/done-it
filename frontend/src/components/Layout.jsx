import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";

function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar - Fixed at top */}
            <Navbar posticon={post} homeicon={homefull} profileicon={profile} />
            
            {/* Main container below navbar */}
            <div className="flex pt-16"> {/* pt-16 to account for navbar height */}
                {/* Sidebar */}
                <Sidebar />
                
                {/* Main Content */}
                <div className="flex-1 ml-16 transition-all duration-300 p-4">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Layout;
