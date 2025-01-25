import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from "../components/Navbar";
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        user_type: 'customer'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div className='m-4 border border-gray-500/30 rounded-xl shadow-sm p-6'>
                <h1 className='text-2xl font-semibold mb-4'>Register</h1>
                {error && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                            required
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                            required
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                            required
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                            required
                        />
                    </div>

                    <div className='mb-6'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>
                            Register as
                        </label>
                        <select
                            name="user_type"
                            value={formData.user_type}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-xl'
                        >
                            <option value="customer">Customer</option>
                            <option value="worker">Worker</option>
                        </select>
                    </div>

                    <div className='flex items-center justify-between'>
                        <button
                            type="submit"
                            className='px-6 py-2 bg-yellow-400 rounded-xl font-semibold'
                        >
                            Register
                        </button>
                        <Link
                            to="/login"
                            className='text-sm text-blue-500 hover:text-blue-700'
                        >
                            Already have an account? Login
                        </Link>
                    </div>
                </form>
            </div>
            <Navbar posticon={post} homeicon={homefull} profileicon={profile} />
        </div>
    );
}

export default Register;
