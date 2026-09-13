import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import useAuth from '../hooks/useAuth';
import Header from "../components/Header";

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Валідація
        if (!username || !email || !password || !confirmPassword) {
            setError('Будь ласка, заповніть усі поля.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Паролі не співпадають.');
            return;
        }
        if (password.length < 6) {
            setError('Пароль має містити щонайменше 6 символів.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Некоректний email.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/auth/register', {
                username,
                email,
                password
            });
            const { token } = response.data;
            await login(token); // Зберігаємо токен через useAuth
            navigate('/publicPolls'); // Перенаправлення на дашборд
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка реєстрації. Спробуйте ще раз.');
        }
    };

    return (
        <div>
            <Header/>
            <div className="container d-flex align-items-center justify-content-center min-vh-100">
                <div className="bg-white p-4 rounded shadow w-100" style={{maxWidth: '400px'}}>
                    <h2 className="h4 text-center text-primary mb-4">Реєстрація</h2>

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
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                className="form-control"
                                type="email"
                                placeholder="Введіть email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">
                                Підтвердження паролю
                            </label>
                            <input
                                id="confirmPassword"
                                className="form-control"
                                type="password"
                                placeholder="Підтвердіть пароль"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100">
                            Зареєструватись
                        </button>
                    </form>

                    <div className="mt-3 text-center">
                        <Link to="/login" className="text-primary">
                            Вже маєте акаунт? Увійти
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;