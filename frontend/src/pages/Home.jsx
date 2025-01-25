import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from "../components/Layout";
import Searchbar from "../components/Searchbar";
import Services from "../components/Services";
import Navbar from "../components/Navbar";
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";

function Home() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                <div className="ml-16 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className='border border-gray-500/30 rounded-xl shadow-sm p-6 mb-6 mt-4'>
                            <h1 className='text-2xl font-semibold mb-4'>
                                Welcome to Done-It
                            </h1>
                            <p className='text-gray-600 mb-6'>
                                Your one-stop solution for household services
                            </p>
                            
                            {!user && (
                                <div className='flex gap-4'>
                                    <Link
                                        to="/login"
                                        className='px-6 py-2 bg-yellow-400 rounded-xl font-semibold hover:bg-yellow-500 transition-colors'
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className='px-6 py-2 bg-yellow-400 rounded-xl font-semibold hover:bg-yellow-500 transition-colors'
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <Searchbar onSearch={handleSearch} placeholder="Search for services..." />
                        </div>

                        <Services searchQuery={searchQuery} />
                    </div>

                    <Navbar posticon={post} homeicon={homefull} profileicon={profile} />
                </div>
            </div>
        </Layout>
    );
}

export default Home;
