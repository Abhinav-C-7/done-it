import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000'
});

// Service-related API calls
export const serviceApi = {
    // Get all services
    getAllServices: async () => {
        try {
            const response = await axiosInstance.get('/api/services');
            console.log('Services response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching services:', error);
            throw error.response?.data || { message: 'Error fetching services' };
        }
    },

    // Get service by ID
    getServiceById: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/services/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching service:', error);
            throw error.response?.data || { message: 'Error fetching service' };
        }
    },

    // Get services by category
    getServicesByCategory: async (category) => {
        try {
            const response = await axiosInstance.get(`/api/services/category/${category}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching services by category:', error);
            throw error.response?.data || { message: 'Error fetching services by category' };
        }
    },

    // Search services
    searchServices: async (query) => {
        try {
            const response = await axiosInstance.get(`/api/services/search/${query}`);
            return response.data;
        } catch (error) {
            console.error('Error searching services:', error);
            throw error.response?.data || { message: 'Error searching services' };
        }
    }
};

// Payment-related API calls
export const paymentApi = {
    createPayment: async (amount) => {
        try {
            const response = await axiosInstance.post('/api/services/create-payment', { amount });
            console.log('Payment order created:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error.response?.data || { message: 'Error creating payment' };
        }
    },

    verifyPayment: async (paymentData) => {
        try {
            const response = await axiosInstance.post('/api/services/verify-payment', paymentData);
            console.log('Payment verified:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error.response?.data || { message: 'Error verifying payment' };
        }
    }
};

export default serviceApi;
