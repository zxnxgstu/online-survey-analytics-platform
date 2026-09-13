import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import useAuth from '../hooks/useAuth';
import Header from '../components/Header';
import { CheckCircle, PieChart, Users } from 'lucide-react';
import Footer from "../components/Footer";

const HomePage = () => {
    const { user, isAuthenticated } = useAuth();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPopularPolls = async () => {
            try {
                const response = await axios.get('http://localhost:5000/polls/public', {
                    params: {
                        sort: 'popular', limit: 4
                    },
                });
                setPolls(response.data);
            } catch (err) {
                setError('Не вдалося завантажити опитування. Спробуйте пізніше.');
            } finally {
                setLoading(false);
            }
        };
        fetchPopularPolls();
    }, []);

    return (
        <div>
            <Header />
            <div className="container py-5">
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-bold text-primary mb-3">
                        {isAuthenticated ? `Вітаємо, ${user.username}!` : 'Сервіс онлайн-голосувань та опитувань'}
                    </h1>
                    <p className="lead text-muted mb-4">
                        Створюйте опитування, аналізуйте результати та діліться з іншими за лічені хвилини.
                    </p>
                    <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
                        {isAuthenticated ? (
                            <Link to="/create-poll" className="btn btn-primary btn-lg">
                                Створити нове опитування
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-primary btn-lg">
                                    Увійти
                                </Link>
                                <Link to="/register" className="btn btn-outline-secondary btn-lg">
                                    Зареєструватись
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="row g-4 mb-5">
                    <div className="col-md-4">
                        <div className="card h-100 text-center border-0 shadow-sm">
                            <div className="card-body">
                                <CheckCircle size={48} className="text-primary mb-3" />
                                <h3 className="card-title h5">Створюйте опитування</h3>
                                <p className="card-text text-muted">
                                    Легко створюйте онлайн-опитування для будь-якої аудиторії.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 text-center border-0 shadow-sm">
                            <div className="card-body">
                                <PieChart size={48} className="text-primary mb-3" />
                                <h3 className="card-title h5">Аналізуйте результати</h3>
                                <p className="card-text text-muted">
                                    Отримуйте наочну візуалізацію та статистику відповідей.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 text-center border-0 shadow-sm">
                            <div className="card-body">
                                <Users size={48} className="text-primary mb-3" />
                                <h3 className="card-title h5">Ділитись просто</h3>
                                <p className="card-text text-muted">
                                    Поширюйте опитування через посилання чи соцмережі.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-light p-5 rounded-3 shadow-sm">
                    <h2 className="h4 text-center mb-4">Популярні опитування</h2>
                    {loading ? (
                        <div className="text-center">Завантаження...</div>
                    ) : error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : polls.length === 0 ? (
                        <div className="text-center text-muted">Немає доступних опитувань.</div>
                    ) : (
                        <div className="row g-4">
                            {polls.map((poll) => {
                                const totalParticipants = poll.participants || 0;

                                return (
                                    <div key={poll.id} className="col-md-6">
                                        <div className="card h-100 border-0 shadow-sm">
                                            <div className="card-body">
                                                <h3 className="card-title h6">{poll.title}</h3>
                                                <p className="text-muted small mb-3">
                                                    Учасників: {totalParticipants.toLocaleString()}
                                                </p>
                                                <Link
                                                    to={`/poll/${poll.id}`}
                                                    className="text-primary text-decoration-none"
                                                >
                                                    Долучитись до голосування
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default HomePage;