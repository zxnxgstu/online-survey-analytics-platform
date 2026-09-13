import { useState, useEffect, createContext, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { setAxiosAuth } from '../axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const setUserFromToken = (decoded) => {
        setUser({
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
        });
        setIsAuthenticated(true);
        setIsLoading(false);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp && decoded.exp < currentTime) {
                    logout();
                } else {
                    setUserFromToken(decoded);
                }
            } catch (error) {
                console.error('Помилка декодування токена:', error);
                logout();
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setAxiosAuth(setUserFromToken);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        try {
            const decoded = jwtDecode(token);
            setUserFromToken(decoded);
        } catch (error) {
            console.error('Помилка декодування токена:', error);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, setUserFromToken, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export default useAuth;