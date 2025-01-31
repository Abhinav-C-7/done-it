import React from 'react';
import { useAuth } from '../context/AuthContext';

function WorkerWelcome() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                    Welcome, {user?.fullName}!
                </h1>
                <p className="text-center text-gray-600">
                    You are logged in as a service provider.
                </p>
            </div>
        </div>
    );
}

export default WorkerWelcome;
