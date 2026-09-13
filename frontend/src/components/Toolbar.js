import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Toolbar = () => {
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand navbar-light bg-white border-bottom px-3">
            <div className="ms-auto d-flex align-items-center">
                {isLoading ? (
                    <span>Завантаження...</span>
                ) : isAuthenticated ? (
                    <>
                        <span className="me-3">👤 {user?.username}</span>
                        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                            Вийти
                        </button>
                    </>
                ) : (
                    <span>Будь ласка, <a href="/login">увійдіть</a></span>
                )}
            </div>
        </nav>
    );
};

export default Toolbar;
