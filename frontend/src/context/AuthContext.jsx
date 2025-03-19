import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ProgressBar from '../components/ProgressBar';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        
        if (token) {
            // Set the default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Verify token and get user data
            axios.get(`${API_BASE_URL}/auth/verify`)
                .then(response => {
                    console.log('Auth verification response:', response.data);
                    if (response.data?.user) {
                        setUser({
                            ...response.data.user,
                            token,
                            type: response.data.user.type || userType
                        });
                    } else {
                        // Invalid response format
                        console.error('Invalid auth verification response format:', response.data);
                        localStorage.removeItem('token');
                        localStorage.removeItem('userType');
                        delete axios.defaults.headers.common['Authorization'];
                    }
                })
                .catch(error => {
                    // If token is invalid, remove it
                    console.error('Auth verification error:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userType');
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

            // Determine user type based on email
            const isServiceman = email.includes('@serviceman.doneit.com');
            const isAdmin = email.includes('@admin.doneit.com') || email === 'admin@doneit.com';
            
            // Use the same endpoint for all user types - the backend will handle the differentiation
            const endpoint = '/api/auth/login';

            console.log(`Attempting login with ${isAdmin ? 'admin' : (isServiceman ? 'serviceman' : 'customer')} email: ${email}`);

            const response = await axios.post(`${API_BASE_URL.replace('/api', '')}${endpoint}`, {
                email,
                password
            });

            console.log('Login response:', response.data);

            // Handle different response structures
            let userData, token;
            
            // Extract token and user data from response
            token = response.data.token;
            userData = response.data.user || response.data.serviceman || {};
            
            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('userType', userData.type || (isAdmin ? 'admin' : (isServiceman ? 'serviceman' : 'customer')));
            
            const userWithType = { 
                ...userData, 
                token,
                type: userData.type || (isAdmin ? 'admin' : (isServiceman ? 'serviceman' : 'customer'))
            };
            
            setUser(userWithType);
            console.log('User set in context:', userWithType);

            // Set default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return response.data;
        } catch (err) {
            console.error('Login error:', err);
            let errorMessage = 'Invalid email or password. Please try again.';
            
            if (err.response) {
                // Handle specific error codes
                if (err.response.status === 400) {
                    errorMessage = 'Invalid email or password. Please try again.';
                } else if (err.response.status === 401) {
                    errorMessage = 'Unauthorized access. Please check your credentials.';
                } else if (err.response.status === 404) {
                    errorMessage = 'Account not found. Please check your email or register.';
                } else if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                }
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        // Show confirmation dialog first
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        setLoggingOut(true);
        
        // Simulate a logout process with a delay
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            
            // Navigate after a short delay to allow the animation to be seen
            setTimeout(() => {
                setLoggingOut(false);
                navigate('/login');
            }, 500);
        }, 1000);
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
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
        token: user?.token,
        loggingOut,
        showLogoutConfirm,
        confirmLogout,
        cancelLogout
    };

    return (
        <AuthContext.Provider value={value}>
            <ProgressBar isLoading={loading} loadingText="Loading your account" />
            <ProgressBar isLoading={loggingOut} loadingText="Logging you out" />
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
