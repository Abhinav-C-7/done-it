import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from "../components/Navbar";
import ProgressBar from "../components/ProgressBar";
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            console.log('Attempting to login with:', { email });
            const response = await login(email, password);
            console.log('Login response received:', response);
            
            // Determine user type and redirect accordingly
            const isServiceman = email.includes('@serviceman.doneit.com');
            const isAdmin = email.includes('@admin.doneit.com') || email === 'admin@doneit.com';
            
            if (isAdmin) {
                console.log('Redirecting admin to welcome page');
                navigate('/admin-welcome');
            } else if (isServiceman) {
                console.log('Redirecting serviceman to dashboard');
                navigate('/serviceman-dashboard');
            } else {
                console.log('Redirecting customer to home');
                navigate('/', { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            <ProgressBar isLoading={loading} loadingText="Signing you in" />
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header Section */}
                        <div className="px-8 py-6 bg-gradient-to-r from-yellow-400 to-yellow-500">
                            <h1 className="text-3xl font-bold text-white text-center">Welcome Back!</h1>
                            <p className="text-yellow-100 text-center mt-2">Sign in to continue your journey</p>
                        </div>

                        {/* Form Section */}
                        <div className="p-8">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Email Address
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-colors duration-200"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 transition-colors duration-200"
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transform transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                                    >
                                        Sign In
                                    </button>
                                    
                                    <div className="text-center">
                                        <Link
                                            to="/register"
                                            className="text-yellow-600 hover:text-yellow-700 font-medium"
                                        >
                                            Don't have an account? Register here
                                        </Link>
                                        <div className="mt-2">
                                            <Link
                                                to="/serviceman-register"
                                                className="text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Register as a Serviceman
                                            </Link>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">
                                            Admin login: Use your admin email (@admin.doneit.com)
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Navbar posticon={post} homeicon={homefull} profileicon={profile} hideAuthButtons={true} />
        </div>
    );
}

export default Login;
