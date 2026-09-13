import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Налаштування базового URL
axios.defaults.baseURL = 'http://localhost:5000';

// Налаштування перехоплювача
export const setAxiosAuth = (setUserFromToken) => {
    axios.interceptors.response.use(
        (response) => {
            const newToken = response.headers['x-new-token'];
            if (newToken) {
                localStorage.setItem('token', newToken);
                try {
                    const decoded = jwtDecode(newToken);
                    setUserFromToken(decoded);
                } catch (error) {
                    console.error('Помилка декодування нового токена:', error);
                }
            }
            return response;
        },
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

// Експортуємо налаштований axios
export default axios;