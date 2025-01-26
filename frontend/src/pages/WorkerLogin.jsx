import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function WorkerLogin() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Here you would typically handle the authentication request (e.g., API call).
        // For now, we'll assume the login is successful and navigate to the worker dashboard.

        // Sample login validation (this should be replaced by actual logic)
        if (formData.username === 'worker123' && formData.password === 'password123') {
            // Redirect to worker dashboard on successful login
            navigate('/worker/dashboard');
        } else {
            alert('Invalid username or password');
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 mt-5 border rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-6">Worker Login</h2>
            <form onSubmit={handleSubmit}>
                <table className="min-w-full table-auto">
                    <tbody>
                        {/* Username Field */}
                        <tr>
                            <td className="p-2">Username</td>
                            <td className="p-2">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="border border-gray-300 px-3 py-2 w-full rounded-2xl"
                                    required
                                />
                            </td>
                        </tr>

                        {/* Password Field */}
                        <tr>
                            <td className="p-2">Password</td>
                            <td className="p-2">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="border border-gray-300 px-3 py-2 w-full rounded-2xl"
                                    required
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-3xl mt-6 hover:bg-blue-800">
                    Login
                </button>
            </form>

            {/* Registration Link */}
            <p className="mt-4 text-center">
                Don't have an account?{' '}
                <Link to="/workersignup" className="text-blue-600 hover:underline">
                    Register here
                </Link>
            </p>
        </div>
    );
}

export default WorkerLogin;
