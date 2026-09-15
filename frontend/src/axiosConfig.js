import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.timeout = 15000;

// Centralized request configuration: authentication and UI language.
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers = config.headers || {};
    config.headers['Accept-Language'] = localStorage.getItem('language') === 'en' ? 'en-US' : 'uk-UA';
    return config;
});

let responseInterceptorId = null;

export const setAxiosAuth = (setUserFromToken) => {
    if (responseInterceptorId !== null) {
        axios.interceptors.response.eject(responseInterceptorId);
    }

    responseInterceptorId = axios.interceptors.response.use(
        (response) => {
            const newToken = response.headers['x-new-token'];
            if (newToken) {
                localStorage.setItem('token', newToken);
                try {
                    setUserFromToken(jwtDecode(newToken));
                } catch (error) {
                    console.error('Unable to decode refreshed token:', error);
                }
            }
            return response;
        },
        (error) => {
            if (error.response?.status === 401 && localStorage.getItem('token')) {
                localStorage.removeItem('token');
                if (window.location.pathname !== '/login') window.location.assign('/login');
            }
            return Promise.reject(error);
        }
    );

    return () => {
        if (responseInterceptorId !== null) {
            axios.interceptors.response.eject(responseInterceptorId);
            responseInterceptorId = null;
        }
    };
};

export default axios;
