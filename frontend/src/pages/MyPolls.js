import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Link } from 'react-router-dom';

const MyPolls = () => {
    const [activeTab, setActiveTab] = useState('public');
    const [polls, setPolls] = useState([]);
    const [categories, setCategories] = useState([]); // Для категорій
    const [editPoll, setEditPoll] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('single_choice');
    const [categoryId, setCategoryId] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    // Завантажуємо категорії при завантаженні сторінки
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/polls/categories');
                setCategories(response.data); // Зберігаємо категорії
            } catch (error) {
                console.error('Помилка завантаження категорій', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/polls', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPolls(response.data);
            } catch (error) {
                console.error('Помилка завантаження опитувань', error);
            }
        };
        fetchPolls();
    }, []);

    const handleEdit = (poll) => {
        // Перевірка, чи вже відкрито опитування для редагування
        if (editPoll && editPoll.id === poll.id) {
            setEditPoll(null);  // Якщо вже відкрите, закрити його
        } else {
            setEditPoll(poll);
            setTitle(poll.title);
            setDescription(poll.description || '');
            setType(poll.type);
            setCategoryId(poll.category_id || ''); // Встановлюємо категорію для редагування
            setIsPublic(poll.is_public);
        }
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/polls/${editPoll.id}`,
                { title, description, type, categoryId, isPublic },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPolls(
                polls.map((poll) =>
                    poll.id === editPoll.id
                        ? { ...poll, title, description, type, categoryId, isPublic }
                        : poll
                )
            );
            setEditPoll(null);
            alert('Опитування оновлено!');
        } catch (error) {
            console.error('Помилка оновлення опитування', error);
            alert('Помилка при оновленні опитування');
        }
    };

    const handleToggleActive = async (pollId) => {
        const poll = polls.find(p => p.id === pollId);  // Знаходимо опитування по ID

        if (!poll) {
            console.error('Опитування не знайдено');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const newIsActive = !poll.is_active; // Протилежний поточному статусу

            // Надсилаємо запит на сервер для оновлення статусу опитування
            await axios.put(
                `http://localhost:5000/polls/${poll.id}`,
                { ...poll, isActive: newIsActive, isPublic, categoryId: poll.category_id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Оновлюємо список опитувань з новим статусом
            setPolls(
                polls.map((p) =>
                    p.id === poll.id
                        ? { ...p, is_active: newIsActive }
                        : p
                )
            );

            alert(newIsActive ? 'Опитування активовано!' : 'Опитування деактивовано!');
        } catch (error) {
            console.error('Помилка зміни статусу', error);
            alert('Помилка при зміні статусу опитування');
        }
    };


    const handleDelete = async (pollId) => {
        // Запит на підтвердження перед видаленням
        const isConfirmed = window.confirm("Ви впевнені, що хочете видалити це опитування?");

        if (!isConfirmed) {
            return; // Якщо користувач відмовився, не продовжуємо
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/polls/${pollId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPolls(polls.filter((poll) => poll.id !== pollId));
            alert('Опитування видалено!');
        } catch (error) {
            console.error('Помилка видалення опитування', error);
            alert('Помилка при видаленні опитування');
        }
    };


    // Фільтрація опитувань за вкладкою (публічні чи непублічні)
    const filteredPolls = polls.filter((poll) => {
        if (activeTab === 'public') return poll.is_public;
        if (activeTab === 'private') return !poll.is_public;
        return true;
    });

    return (
        <div>
            <div className="container bg-white p-4 rounded shadow">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                    <h2 className="h4">Мої опитування</h2>
                    <Link to="/create-poll" className="btn btn-primary mt-3 mt-md-0">
                        + Нове опитування
                    </Link>
                </div>

                {/* Вкладки для фільтрації публічних та приватних опитувань */}
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'public' ? 'active' : ''}`}
                            onClick={() => setActiveTab('public')}
                        >
                            Публічні
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'private' ? 'active' : ''}`}
                            onClick={() => setActiveTab('private')}
                        >
                            Приватні
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            Усі
                        </button>
                    </li>
                </ul>
                {editPoll && (
                    <div className="mt-4 p-4 bg-light rounded">
                        <h3 className="h5 mb-3">Редагувати опитування</h3>
                        <div className="mb-3">
                            <label className="form-label">Назва</label>
                            <input
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Опис</label>
                            <textarea
                                className="form-control"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Тип</label>
                            <select
                                className="form-select"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                disabled
                            >
                                <option value="single_choice">Одиночний вибір</option>
                                <option value="multiple_choice">Множинний вибір</option>
                                <option value="text_response">Текстові відповіді</option>
                                <option value="rating_scale">Рейтингова шкала</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Категорія</label>
                            <select
                                className="form-select"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="form-check-input"
                            />
                            <label className="form-check-label">Публічне опитування</label>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                onClick={handleUpdate}
                                className="btn btn-primary"
                            >
                                Зберегти
                            </button>
                            <button
                                onClick={() => setEditPoll(null)}
                                className="btn btn-secondary"
                            >
                                Скасувати
                            </button>
                        </div>
                    </div>
                )}
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                        <tr>
                            <th>Назва</th>
                            <th>Статус</th>
                            <th>Категорія</th>
                            <th>Створено</th>
                            <th>Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredPolls.map((poll) => (
                            <tr key={poll.id}>
                                <td>
                                    <Link to={`/poll/${poll.id}`} className="text-primary">
                                        {poll.title}
                                    </Link>
                                </td>
                                <td>
                                        <span
                                            className={`badge ${
                                                poll.status === 'active'
                                                    ? poll.is_active
                                                        ? 'bg-success'
                                                        : 'bg-warning'
                                                    : poll.status === 'preparation'
                                                        ? 'bg-info'
                                                        : 'bg-danger'
                                            }`}
                                        >
                                            {poll.status === 'active'
                                                ? poll.is_active
                                                    ? 'Активне'
                                                    : 'Деактивовано'
                                                : poll.status === 'preparation'
                                                    ? 'На розгляді'
                                                    : 'Відхилене адміністратором'}
                                        </span>
                                </td>
                                <td>{poll.category_name}</td>
                                <td>{new Date(poll.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() => handleEdit(poll)}
                                        className="btn btn-sm btn-success me-2 my-1"
                                    >
                                        {editPoll && editPoll.id === poll.id ? 'Закрити' : 'Редагувати'}
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(poll.id)}  // Викликаємо з передачею ID
                                        className={`btn btn-sm ${poll.is_active ? 'btn-danger' : 'btn-success'} my-1`}
                                        data-id={poll.id}  // додаємо атрибут для збереження ID
                                    >
                                        {poll.is_active ? 'Деактивувати' : 'Активувати'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(poll.id)}
                                        className="btn btn-sm btn-danger mx-2 my-1"
                                    >
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyPolls;
