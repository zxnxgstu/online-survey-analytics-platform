import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Header = ({ onSearch }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold text-primary" to="/">
                    OnlineVoting
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Головна
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/publicPolls">
                                Всі опитування
                            </Link>
                        </li>
                        {user && (user.role === 'advanced' || user.role === 'admin') && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/my-polls">
                                        Мої опитування
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/create-poll">
                                        Створити опитування
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                    <div className="d-flex align-items-center">
                        {isAuthenticated ? (
                            <>
                                <span className="me-3 text-muted">{user.username}</span>
                                <button className="btn btn-outline-danger my-2" onClick={handleLogout}>
                                    Вийти
                                </button>
                            </>
                        ) : (
                            <>
                                <Link className="btn btn-outline-primary me-2" to="/login">
                                    Увійти
                                </Link>
                                <Link className="btn btn-primary" to="/register">
                                    Зареєструватись
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;