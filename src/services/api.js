import axios from 'axios';

// Token persistence logic
let authToken = localStorage.getItem('token');

export const setAuthToken = (token) => {
    authToken = token;
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

// Add token interceptor
API.interceptors.request.use((req) => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        req.headers.Authorization = `Bearer ${storedToken}`;
    } else if (authToken) {
        req.headers.Authorization = `Bearer ${authToken}`;
    }
    return req;
});

// Add 401 handler
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            authToken = null;
            // Optionally redirect to login, but better to let components handle it
        }
        return Promise.reject(error);
    }
);

export const hallsAPI = {
    getAll: (params) => API.get('/halls', { params }),
    getById: (id) => API.get(`/halls/${id}`),
    searchExternal: (query) => API.get('/halls/search-external', { params: { query } }),
    create: (data) => API.post('/halls', data),
    update: (id, data) => API.put(`/halls/${id}`, data),
    delete: (id) => API.delete(`/halls/${id}`),
};

export const bookingsAPI = {
    getAll: (params) => API.get('/bookings', { params }),
    getUserBookings: () => API.get('/bookings/user'),
    create: (data) => API.post('/bookings', data),
    updateStatus: (id, status) => API.patch(`/bookings/${id}/status`, { status }),
    delete: (id) => API.delete(`/bookings/${id}`),
};

export const usersAPI = {
    getAll: () => API.get('/users'),
    getMe: () => API.get('/users/me'),
    getProfile: () => API.get('/users/me'),
    updateProfile: (data) => API.put('/users/me', data),
    uploadPhoto: (data) => API.post('/users/me/photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    changePassword: (data) => API.put('/users/change-password', data),
    delete: (id) => API.delete(`/users/${id}`),
};

export const authAPI = {
    login: (data) => API.post('/auth/login', data),
    signup: (data) => API.post('/auth/register', data),
    sendOTP: (data) => API.post('/auth/phone/send-otp', data),
    verifyOTP: (data) => API.post('/auth/phone/verify-otp', data),
    googleLogin: (token) => API.post('/auth/google', { token }),
};

export const activityLogsAPI = {
    getAll: (limit) => API.get('/activity-logs', { params: { limit } }),
};

export const favoritesAPI = {
    getAll: () => API.get('/favorites'),
    add: (hallId) => API.post('/favorites', { hall_id: hallId }),
    remove: (hallId) => API.delete(`/favorites/${hallId}`),
};

export const paymentMethodsAPI = {
    getAll: () => API.get('/payment-methods'),
    create: (data) => API.post('/payment-methods', data),
    delete: (id) => API.delete(`/payment-methods/${id}`),
};

export const reviewsAPI = {
    getAll: (hallId) => API.get(`/reviews/${hallId}`),
    create: (data) => API.post('/reviews', data),
    delete: (id) => API.delete(`/reviews/${id}`),
};

export const membershipAPI = {
    create: (data) => API.post('/memberships', data),
    getAll: () => API.get('/memberships'),
    updateStatus: (id, status) => API.put(`/memberships/${id}/status`, { status }),
};

export const contactAPI = {
    submit: (data) => API.post('/contact', data),
};

export default API;
