import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicPollsPage = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [polls, setPolls] = useState([]);
    const [filteredPolls, setFilteredPolls] = useState([]);
    const [error, setError] = useState(null);

    // Стейти для фільтрів
    const [titleFilter, setTitleFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, navigate]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/polls/categories');
                setCategories(response.data);
            } catch (err) {
                console.error('Помилка завантаження категорій:', err);
                setError('Не вдалося завантажити категорії');
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/polls/public', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPolls(response.data);
                setFilteredPolls(response.data);  // Спочатку відображаємо всі опитування
            } catch (err) {
                console.error('Помилка завантаження опитувань:', err);
                setError('Не вдалося завантажити опитування');
            }
        };

        if (isAuthenticated) {
            fetchPolls();
        }
    }, [isAuthenticated]);

    // Функція для фільтрації опитувань
    const filterPolls = () => {
        let filtered = polls;

        if (titleFilter) {
            filtered = filtered.filter(poll =>
                poll.title.toLowerCase().includes(titleFilter.toLowerCase())
            );
        }

        if (typeFilter) {
            filtered = filtered.filter(poll => poll.type === typeFilter);
        }

        if (categoryFilter) {
            filtered = filtered.filter(poll => poll.category_name === categoryFilter);
        }

        setFilteredPolls(filtered);
    };

    // Викликаємо фільтрацію, коли фільтри змінюються
    useEffect(() => {
        filterPolls();
    }, [titleFilter, typeFilter, categoryFilter]);

    if (isLoading) return <div className="text-center mt-5">Завантаження...</div>;
    if (error) return <div className="alert alert-danger mt-5 text-center">{error}</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-primary">Доступні публічні опитування</h2>

            {/* Форма фільтрації */}
            <div className="mb-4">
                <div className="row">
                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Фільтрувати за назвою"
                            value={titleFilter}
                            onChange={(e) => setTitleFilter(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">Фільтрувати за типом</option>
                            <option value="single_choice">Одиночний вибір</option>
                            <option value="multiple_choice">Множинний вибір</option>
                            <option value="text_response">Текстове питання</option>
                            <option value="rating_scale">Рейтинг 1–5</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">Фільтрувати за категорією</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="row">
                {filteredPolls.length === 0 ? (
                    <p>Опитувань поки немає.</p>
                ) : (
                    filteredPolls.map((poll) => (
                        <div className="col-md-6 col-lg-4 mb-3" key={poll.id}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title text-dark">{poll.title}</h5>
                                    <p className="card-text text-muted p-0 m-0">Тип: {getPollTypeLabel(poll.type)}</p>
                                    <p className="card-text text-muted m-0">Категорія: {poll.category_name}</p>
                                    <p className="card-text text-muted mb-2">Автор: <b>{poll.creator_username}</b></p>
                                    <button className="btn btn-outline-primary mt-2"
                                            onClick={() => navigate(`/poll/${poll.id}`)}>
                                        Перейти до опитування
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const getPollTypeLabel = (type) => {
    switch (type) {
        case 'single_choice': return 'Одиничний вибір';
        case 'multiple_choice': return 'Множинний вибір';
        case 'text_response': return 'Текстове питання';
        case 'rating_scale': return 'Рейтинг 1–5';
        default: return 'Невідомо';
    }
};

export default PublicPollsPage;
