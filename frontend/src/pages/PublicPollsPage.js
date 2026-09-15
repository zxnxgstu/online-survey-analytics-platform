import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const PublicPollsPage = () => {
    const navigate = useNavigate();
    const [polls, setPolls] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [titleFilter, setTitleFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [pollsResponse, categoriesResponse] = await Promise.all([
                    axios.get('/polls/public'),
                    axios.get('/polls/categories')
                ]);
                setPolls(Array.isArray(pollsResponse.data) ? pollsResponse.data : []);
                setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
            } catch (err) {
                console.error('Unable to load public surveys:', err);
                setError(err.response?.data?.message || 'Не вдалося завантажити опитування');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const filteredPolls = useMemo(() => polls.filter((poll) => {
        const matchesTitle = !titleFilter ||
            (poll.title || '').toLowerCase().includes(titleFilter.toLowerCase());
        const matchesType = !typeFilter || poll.type === typeFilter;
        const matchesCategory = !categoryFilter || poll.category_name === categoryFilter;
        return matchesTitle && matchesType && matchesCategory;
    }), [polls, titleFilter, typeFilter, categoryFilter]);

    if (loading) return <div className="text-center mt-5">Завантаження...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-primary">Доступні публічні опитування</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-4">
                <div className="row g-2">
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
                                <option key={category.id} value={category.name}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="row">
                {filteredPolls.length === 0 ? (
                    <p>Опитувань поки немає.</p>
                ) : filteredPolls.map((poll) => (
                    <div className="col-md-6 col-lg-4 mb-3" key={poll.id}>
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-dark">{poll.title}</h5>
                                <p className="card-text text-muted p-0 m-0">Тип: {getPollTypeLabel(poll.type)}</p>
                                <p className="card-text text-muted m-0">Категорія: {poll.category_name || '—'}</p>
                                <p className="card-text text-muted mb-2">Автор: <b>{poll.creator_username}</b></p>
                                <button
                                    className="btn btn-outline-primary mt-2"
                                    onClick={() => navigate(`/poll/${poll.id}`)}
                                >
                                    Перейти до опитування
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const getPollTypeLabel = (type) => {
    switch (type) {
        case 'single_choice': return 'Одиночний вибір';
        case 'multiple_choice': return 'Множинний вибір';
        case 'text_response': return 'Текстове питання';
        case 'rating_scale': return 'Рейтинг 1–5';
        default: return 'Невідомо';
    }
};

export default PublicPollsPage;
