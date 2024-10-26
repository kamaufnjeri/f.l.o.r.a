import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const baseURL = import.meta.env.VITE_APP_BACKEND_URL;

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken) {
            const decoded = jwtDecode(accessToken);
            const isTokenExpired = decoded.exp < Date.now() / 1000;
            console.log('isExpired', isTokenExpired)

            if (isTokenExpired) {
                if (refreshToken) {
                    try {
                        const response = await axios.post(`${baseURL}/auth/token/refresh/`, { refresh: refreshToken });
                        localStorage.setItem('accessToken', response.data.access);
                        localStorage.setItem('refreshToken', response.data.refresh)
                        config.headers['Authorization'] = `Bearer ${response.data.access}`;
                    } catch (err) {
                        toast.error("Session expired. Please log in again.");
                        localStorage.clear();
                        window.location.href = '/login';
                    }
                } else {
                    toast.error("Session expired. Please log in again.");
                    localStorage.clear();
                    window.location.href = '/login';
                }
            } else {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
