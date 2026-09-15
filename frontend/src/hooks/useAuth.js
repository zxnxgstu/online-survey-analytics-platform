import { useState, useEffect, createContext, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { setAxiosAuth } from '../axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
    };

    const setUserFromToken = (decoded) => {
        setUser({ id: decoded.id, username: decoded.username, role: decoded.role });
        setIsAuthenticated(true);
        setIsLoading(false);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.exp && decoded.exp < Date.now() / 1000) {
                logout();
            } else {
                setUserFromToken(decoded);
            }
        } catch (error) {
            console.error('Unable to decode token:', error);
            logout();
        }
    }, []);

    useEffect(() => setAxiosAuth(setUserFromToken), []);

    const login = (token) => {
        localStorage.setItem('token', token);
        try {
            setUserFromToken(jwtDecode(token));
        } catch (error) {
            console.error('Unable to decode token:', error);
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, setUserFromToken, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);
export default useAuth;
