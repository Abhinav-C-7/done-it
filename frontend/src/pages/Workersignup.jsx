import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function WorkerSignup() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        domain: '',
        certification: null,
        idProof: null,
        username: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData({ ...formData, [name]: files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Password match validation
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // You can now handle form submission, e.g., API call to register the worker.
        console.log(formData);
    };

    return (
        <div className="max-w-4xl mx-auto p-8 mt-5 border rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-6">Worker Registration</h2>
            <form onSubmit={handleSubmit}>
                <table className="min-w-full table-auto">
                    <tbody>
                        {/* Personal Details */}
                        <tr>
                            <td className="p-2">Full Name</td>
                            <td className="p-2">
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="border px-3 py-2 w-full rounded-2xl border-gray-300"
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="p-2">Email</td>
                            <td className="p-2">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="border px-3 py-2 w-full rounded-2xl border-gray-300"
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="p-2">Phone Number</td>
                            <td className="p-2">
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="border px-3 py-2 w-full rounded-2xl border-gray-300"
                                    required
                                />
                            </td>
                        </tr>

                        {/* Domain of Work */}
                        <tr>
                            <td className="p-2">Domain of Work</td>
                            <td className="p-2">
                                <select
                                    name="domain"
                                    value={formData.domain}
                                    onChange={handleChange}
                                    className="border px-3 py-2 w-full rounded-2xl border-gray-300"
                                    required
                                >
                                    <option value="">Select a domain</option>
                                    <option value="plumber">Plumber</option>
                                    <option value="electrician">Electrician</option>
                                    <option value="carpenter">Carpenter</option>
                                    <option value="painter">Painter</option>
                                    <option value="mason">Mason</option>
                                    <option value="cleaner">Cleaner</option>
                                    <option value="gardener">Gardener</option>
                                    <option value="others">Others</option>
                                </select>
                            </td>
                        </tr>

                        {/* Upload Certification */}
                        <tr>
                            <td className="p-2">Certification (for selected domain)</td>
                            <td className="p-2">
                                <input
                                    type="file"
                                    name="certification"
                                    onChange={handleFileChange}
                                    className="border px-3 py-2 w-full rounded-2xl border-gray-300"
                                    required
                                />
                            </td>
                        </tr>

                        {/* Upload ID Proof */}
                        <tr>
                            <td className="p-2">ID Proof</td>
                            <td className="p-2">
                                <input
                                    type="file"
                                    name="idProof"
                                    onChange={handleFileChange}
                                    className="border px-3 py-2 w-full rounded-2xl border-gray-300"
                                    required
                                />
                            </td>
                        </tr>

                        {/* Login Details */}
                        <tr>
                            <td className="p-2">Username</td>
                            <td className="p-2">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="border px-3 py-2 w-full rounded-2xl border-gray-300"
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="p-2">Password</td>
                            <td className="p-2">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="border px-3 py-2 w-full rounded-2xl border-gray-300"
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="p-2">Confirm Password</td>
                            <td className="p-2">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="border px-3 py-2 w-full rounded-2xl border-gray-300"
                                    required
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-3xl mt-6 hover:bg-blue-800">
                    Register
                </button>
            </form>

            {/* Sign In Link */}
            <p className="mt-4 text-center">
                Already have an account?{' '}
                <Link to="/WorkerLogin" className="text-blue-600 hover:underline">
                    Sign in here
                </Link>
            </p>
        </div>
    );
}

export default WorkerSignup;
