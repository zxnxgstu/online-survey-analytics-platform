import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import useAuth from '../hooks/useAuth';

const CreatePoll = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('single_choice');
    const [options, setOptions] = useState(['', '']);
    const [categoryId, setCategoryId] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/polls/categories');
                setCategories(response.data);
            } catch (err) {
                setError('Не вдалося завантажити категорії.');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, navigate]);

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            const newOptions = [...options];
            newOptions.splice(index, 1);
            setOptions(newOptions);
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Назва опитування обов’язкова.');
            return;
        }
        if (!categoryId) {
            setError('Виберіть категорію.');
            return;
        }
        if (type === 'single_choice' || type === 'multiple_choice') {
            if (options.length < 2) {
                setError('Потрібно щонайменше 2 варіанти відповідей.');
                return;
            }
            if (options.some((opt) => !opt.trim())) {
                setError('Усі варіанти відповідей мають бути заповнені.');
                return;
            }
        }

        const token = localStorage.getItem('token');
        try {
            await axios.post(
                '/polls/create',
                {
                    title,
                    description,
                    type,
                    categoryId: parseInt(categoryId),
                    options: type === 'single_choice' || type === 'multiple_choice' ? options : undefined,
                    isPublic,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            navigate('/my-polls', { state: { success: 'Опитування успішно створено!' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка створення опитування.');
        }
    };

    return (
        <div>
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-5">
                                <h2 className="h4 text-primary mb-4">Створити нове опитування</h2>

                                {error && <div className="alert alert-danger">{error}</div>}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">
                                            Назва опитування
                                        </label>
                                        <input
                                            id="title"
                                            className="form-control"
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Введіть назву опитування"
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">
                                            Опис (необов’язково)
                                        </label>
                                        <textarea
                                            id="description"
                                            className="form-control"
                                            rows="4"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Додайте опис для опитування"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="type" className="form-label">
                                            Тип опитування
                                        </label>
                                        <select
                                            id="type"
                                            className="form-select"
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                        >
                                            <option value="single_choice">Одиночний вибір</option>
                                            <option value="multiple_choice">Множинний вибір</option>
                                            <option value="text_response">Текстові відповіді</option>
                                            <option value="rating_scale">Рейтингова шкала</option>
                                        </select>
                                    </div>

                                    {(type === 'single_choice' || type === 'multiple_choice') && (
                                        <div className="mb-3">
                                            <label className="form-label">Варіанти відповідей</label>
                                            {options.map((option, index) => (
                                                <div key={index} className="d-flex mb-2">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => updateOption(index, e.target.value)}
                                                        placeholder={`Варіант ${index + 1}`}
                                                        required
                                                    />
                                                    {options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(index)}
                                                            className="btn btn-outline-danger ms-2"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {options.length < 10 && (
                                                <button
                                                    type="button"
                                                    onClick={addOption}
                                                    className="btn btn-outline-primary btn-sm"
                                                >
                                                    + Додати варіант
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="categoryId" className="form-label">
                                            Категорія
                                        </label>
                                        {loadingCategories ? (
                                            <div className="form-text">Завантаження категорій...</div>
                                        ) : (
                                            <select
                                                id="categoryId"
                                                className="form-select"
                                                value={categoryId}
                                                onChange={(e) => setCategoryId(e.target.value)}
                                                required
                                            >
                                                <option value="">Виберіть категорію</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="isPublic"
                                            checked={isPublic}
                                            onChange={(e) => setIsPublic(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="isPublic">
                                            Публічне опитування
                                        </label>
                                    </div>

                                    <div className="d-flex justify-content-between">
                                        <button type="submit" className="btn btn-primary">
                                            Створити опитування
                                        </button>
                                        <Link to="/my-polls" className="btn btn-outline-secondary">
                                            Скасувати
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePoll;