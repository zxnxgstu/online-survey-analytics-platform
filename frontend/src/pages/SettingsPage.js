import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const { user, login, logout, isLoading, isAuthenticated } = useAuth();
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [createdAt, setCreatedAt] = useState('');
    const navigate = useNavigate();

    // Стан для заявки на підвищення прав
    const [upgradeComment, setUpgradeComment] = useState('');
    const [requestStatus, setRequestStatus] = useState(null);

    // Перевіряємо автентифікацію
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Завантажуємо дані профілю
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/users/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserName(response.data.username);
                setEmail(response.data.email);
                setCreatedAt(response.data.created_at);
                setRole(response.data.role)
            } catch (error) {
                console.error('Помилка завантаження профілю', error);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const fetchRequestStatus = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('/users/role-upgrade-request', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRequestStatus(response.data);
                console.log(response.data);
            } catch (err) {
                console.error('Помилка:', err);
                setError('Не вдалося отримати статус заявки');
            }
        };
        fetchRequestStatus();
    }, []);

    // Обробка збереження налаштувань профілю
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updatedData = { username, email };
            if (password) updatedData.password = password;

            const response = await axios.put('/users/update', updatedData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            if (response.data && response.data.user) {
                login(response.data.token);
                toast.success('Налаштування збережено!');
            } else {
                throw new Error('Не вдалося оновити налаштування.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Помилка збереження налаштувань.');
            toast.error('Помилка збереження налаштувань.');
        } finally {
            setLoading(false);
        }
    };

    // Обробка подання заявки на підвищення прав
    const handleUpgradeRequestSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post(
                '/users/role-upgrade-request',
                { comment: upgradeComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Заявка на підвищення прав подана!');
            setUpgradeComment('');
            // Оновлюємо статус заявки (припускаємо, що бекенд повертає статус)
            const response = await axios.get('/users/role-upgrade-request', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequestStatus(response.data);
        } catch (err) {
            setError('Помилка подання заявки');
            toast.error('Помилка подання заявки');
        }
    };

    // Обробка видалення акаунту
    const handleDeleteAccount = async () => {
        const confirmation = window.confirm('Ви точно хочете видалити свій акаунт? Цю дію не можна скасувати.');
        if (confirmation) {
            try {
                const token = localStorage.getItem('token');
                const userId = JSON.parse(atob(token.split('.')[1])).id;
                const response = await axios.delete(`/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 200) {
                    logout();
                    navigate('/');
                    toast.success('Акаунт успішно видалено!');
                } else {
                    toast.error('Помилка видалення акаунту.');
                }
            } catch (err) {
                toast.error('Сталася помилка при видаленні акаунту.');
            }
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h2 className="card-title h4 mb-4">Налаштування профілю</h2>

                    <div className="row">
                        <div className="col-lg-8">
                            {/* Форма для налаштувань профілю */}
                            <form onSubmit={handleSubmit}>
                                <h3 className="h5 mb-3">Особисті дані</h3>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Ім'я користувача</label>
                                    <input
                                        id="name"
                                        className="form-control"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUserName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        id="email"
                                        className="form-control"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">Новий пароль</label>
                                    <input
                                        id="password"
                                        className="form-control"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Залиште порожнім, якщо не хочете змінювати"
                                    />
                                </div>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <div className="d-flex justify-content-between">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Зберігається...' : 'Зберегти налаштування'}
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>
                                        Видалити акаунт
                                    </button>
                                </div>
                            </form>

                            {/* Форма для заявки на підвищення прав */}
                            <div className="mt-5">
                                <h3 className="h5 mb-3">Заявка на підвищення прав</h3>
                                {requestStatus ? (
                                    <div>
                                        {requestStatus.status === 'pending' &&
                                            <p className="alert alert-info">Ваша заявка на розгляді</p>}
                                        {requestStatus.status === 'approved' &&
                                            <p className="alert alert-success">Ваша заявка схвалена</p>}
                                        {requestStatus.status === 'rejected' && (
                                            <div>
                                                <p className="alert alert-danger">Ваша заявка
                                                    відхилена: {requestStatus.admin_comment}</p>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => setRequestStatus(null)}
                                                >
                                                    Створити нову заявку
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleUpgradeRequestSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="upgradeComment" className="form-label">
                                                Коментар до заявки
                                            </label>
                                            <textarea
                                                id="upgradeComment"
                                                className="form-control"
                                                value={upgradeComment}
                                                onChange={(e) => setUpgradeComment(e.target.value)}
                                                placeholder="Вкажіть причину підвищення прав"
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            Подати заявку
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-4 mt-4 mt-lg-0">
                            <div className="card bg-light h-100">
                                <div className="card-body">
                                    <h3 className="h5 mb-3">Інформація про аккаунт</h3>
                                    <div className="mb-3">
                                        <div className="text-muted small">Тип аккаунту:</div>
                                        <div className="fw-bold">

                                            {role ? (role === 'admin'
                                                ? 'Адміністратор'
                                                : user?.role === 'advanced'
                                                    ? 'Продвинутий користувач'
                                                    : 'Стандартний користувач') : "Невідомо"}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="text-muted small">Дата реєстрації:</div>
                                        <div className="fw-bold">
                                            {createdAt ? new Date(createdAt).toLocaleDateString('uk-UA') : 'Невідомо'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;