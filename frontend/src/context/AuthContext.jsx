import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Set the default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Verify token and get user data
            axios.get(`${API_BASE_URL}/auth/verify`)
                .then(response => {
                    if (response.data?.user) {
                        setUser({
                            ...response.data.user,
                            token
                        });
                    } else {
                        // Invalid response format
                        localStorage.removeItem('token');
                        delete axios.defaults.headers.common['Authorization'];
                    }
                })
                .catch(() => {
                    // If token is invalid, remove it
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            // Determine if the user is a serviceman or customer
            const isServiceman = email.includes('@serviceman.doneit.com');
            const endpoint = isServiceman ? '/api/auth/serviceman/login' : '/api/auth/login';

            console.log(`Attempting login with ${isServiceman ? 'serviceman' : 'customer'} endpoint: ${endpoint}`);

            const response = await axios.post(`${API_BASE_URL.replace('/api', '')}${endpoint}`, {
                email,
                password
            });

            console.log('Login response:', response.data);

            // Handle different response structures
            let userData, token;
            
            if (isServiceman) {
                // Handle serviceman response
                token = response.data.token;
                userData = response.data.user;
            } else {
                // Handle customer response
                token = response.data.token;
                userData = response.data.user;
            }
            
            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('userType', userData.type || (isServiceman ? 'serviceman' : 'customer'));
            
            const userWithType = { 
                ...userData, 
                token,
                type: userData.type || (isServiceman ? 'serviceman' : 'customer')
            };
            
            setUser(userWithType);
            console.log('User set in context:', userWithType);

            // Set default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return response.data;
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to login';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/login');
    };

    const register = async (formData) => {
        try {
            console.log('Sending registration data:', formData);
            const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/api/auth/register`, formData);
            return response.data;
        } catch (error) {
            console.error('Registration error details:', error.response?.data);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to register. Please try again.');
        }
    };

    const registerServiceman = async (formData) => {
        try {
            const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/auth/serviceman/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return {
                success: true,
                ...data
            };
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        register,
        registerServiceman,
        token: user?.token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
