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
            
            if (token && userData) {
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser({
                    ...userData,
                    token
                });
                return { success: true, user: userData };
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error.response?.data || { message: 'Failed to login' };
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
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
