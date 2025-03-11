import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";
import '../styles/sidebar.css';

function Layout({ children }) {
    const location = useLocation();
    
    // Pages where footer should not be displayed
    const noFooterRoutes = ['/login', '/register', '/serviceman-register', '/forgot-password'];
    const shouldShowFooter = !noFooterRoutes.includes(location.pathname);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar - Fixed at top */}
            <Navbar posticon={post} homeicon={homefull} profileicon={profile} />
            
            {/* Main container below navbar */}
            <div className="flex flex-1 pt-16"> {/* pt-16 to account for navbar height */}
                {/* Sidebar */}
                <Sidebar />
                
                {/* Main Content */}
                <div className="flex-1 ml-16 transition-all duration-300 p-4 main-content flex flex-col">
                    <div className="max-w-7xl mx-auto w-full flex-1">
                        {children}
                    </div>
                    
                    {/* Footer - Only show on appropriate pages */}
                    {shouldShowFooter && <Footer />}
                </div>
            </div>
        </div>
    );
}

export default Layout;
