import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
            axios.get('http://localhost:3000/api/auth/verify')
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

            const response = await axios.post(`http://localhost:3000${endpoint}`, {
                email,
                password
            });

            const { token, user: userData } = response.data;
            
            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('userType', isServiceman ? 'serviceman' : 'customer');
            
            setUser({ 
                ...userData, 
                token,
                type: isServiceman ? 'serviceman' : 'customer'
            });

            // Set default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Redirect based on user type
            if (isServiceman) {
                navigate('/serviceman-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        try {
            console.log('Sending registration data:', formData);
            const response = await axios.post('http://localhost:3000/api/auth/register', formData);
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
            const response = await fetch('http://localhost:3000/api/auth/serviceman/register', {
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

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        register,
        registerServiceman,
        loading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
