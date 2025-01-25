import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from "../components/Navbar";
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(email, password);
            if (response.user) {
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div className='m-4 border border-gray-500/30 rounded-xl shadow-sm p-6'>
                <h1 className='text-2xl font-semibold mb-4'>Login</h1>
                {error && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                            required
                        />
                    </div>
                    <div className='mb-6'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                            required
                        />
                    </div>
                    <div className='flex items-center justify-between'>
                        <button
                            type="submit"
                            className='px-6 py-2 bg-yellow-400 rounded-xl font-semibold'
                        >
                            Login
                        </button>
                        <Link
                            to="/register"
                            className='text-sm text-blue-500 hover:text-blue-700'
                        >
                            Need an account? Register
                        </Link>
                    </div>
                </form>
            </div>
            <Navbar posticon={post} homeicon={homefull} profileicon={profile} />
        </div>
    );
}

export default Login;
