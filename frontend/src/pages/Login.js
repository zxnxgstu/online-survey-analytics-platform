import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import useAuth from '../hooks/useAuth';
import Header from "../components/Header";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Валідація
        if (!username || !password) {
            setError('Будь ласка, заповніть усі поля.');
            return;
        }
        if (password.length < 6) {
            setError('Пароль має містити щонайменше 6 символів.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/auth/login', {
                username,
                password,
            });
            const { token } = response.data;
            await login(token); // Зберігаємо токен через useAuth
            navigate('/publicPolls');
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка входу. Спробуйте ще раз.');
        }
    };

    return (
        <div>
        <Header />
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="bg-white p-4 rounded shadow w-100" style={{ maxWidth: '400px' }}>
                <h2 className="h4 text-center text-primary mb-4">Вхід до системи</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                            Ім'я користувача
                        </label>
                        <input
                            id="username"
                            className="form-control"
                            type="text"
                            placeholder="Введіть ім'я користувача"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Пароль
                        </label>
                        <input
                            id="password"
                            className="form-control"
                            type="password"
                            placeholder="Введіть пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Увійти
                    </button>
                </form>

                <div className="mt-3 text-center">
                    <Link to="/register" className="text-primary">
                        Немає акаунта? Зареєструватись
                    </Link>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Login;