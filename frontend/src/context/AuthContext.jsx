import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Set the default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Verify token and get user data
            axios.get('http://localhost:5000/api/auth/verify')
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
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });

            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser({ ...userData, token });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    };

    const register = async (formData) => {
        try {
            console.log('Sending registration data:', formData);
            const response = await axios.post('http://localhost:5000/api/auth/register', formData);
            return response.data;
        } catch (error) {
            console.error('Registration error details:', error.response?.data);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to register. Please try again.');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        register,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
