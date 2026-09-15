import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import useAuth from '../hooks/useAuth';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [polls, setPolls] = useState([]);
    const [pendingPolls, setPendingPolls] = useState([]);
    const [stats, setStats] = useState({
        activePolls: 0,
        totalParticipants: 0,
        votesToday: 0,
        newUsersToday: 0,
        newUsers: [],
        newPolls: [],
        popularPoll: null,
        weeklyActivity: []
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, type: '', data: null });
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [roleUpgradeRequests, setRoleUpgradeRequests] = useState([]);
    const pollsPerPage = 10;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const pollsResponse = await axios.get('/database/polls', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPolls(pollsResponse.data);

                const pendingPollsResponse = await axios.get('/database/polls', {
                    params: { status: 'preparation' },
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPendingPolls(pendingPollsResponse.data);

                const statsResponse = await axios.get('/database/stats', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats(statsResponse.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Помилка завантаження даних.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchRoleUpgradeRequests = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('/users/role-upgrade-requests', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRoleUpgradeRequests(response.data);
            } catch (err) {
                setError('Помилка отримання заявок на підвищення прав користувачів');
            }
        };
        fetchRoleUpgradeRequests();
    }, []);

    const indexOfLastPoll = currentPage * pollsPerPage;
    const indexOfFirstPoll = indexOfLastPoll - pollsPerPage;
    const currentPolls = polls.slice(indexOfFirstPoll, indexOfLastPoll);
    const totalPages = Math.ceil(polls.length / pollsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleClosePoll = async (pollId) => {
        if (window.confirm('Ви впевнені, що хочете закрити це опитування?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.post(
                    `/database/polls/${pollId}/close`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setPolls((prevPolls) =>
                    prevPolls.map((poll) =>
                        poll.id === pollId ? { ...poll, status: 'closed' } : poll
                    )
                );
                setSuccess('Опитування успішно закрите!');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Помилка закриття опитування.');
            }
        }
    };

    const handleDeletePoll = async (pollId) => {
        if (window.confirm('Ви впевнені, що хочете видалити це опитування?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/database/polls/${pollId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
                setPendingPolls((prev) => prev.filter((poll) => poll.id !== pollId));
                setSuccess('Опитування успішно видалено!');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Помилка видалення опитування.');
            }
        }
    };

    const handleApprovePoll = async (pollId) => {
        if (window.confirm('Ви впевнені, що хочете схвалити це опитування?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.post(
                    `/database/polls/${pollId}/approve`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setPendingPolls((prev) => prev.filter((poll) => poll.id !== pollId));
                setPolls((prevPolls) =>
                    prevPolls.map((poll) =>
                        poll.id === pollId ? { ...poll, status: 'active' } : poll
                    )
                );
                setSuccess('Опитування успішно схвалено!');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Помилка схвалення опитування.');
            }
        }
    };

    const handleRejectPoll = async (pollId, comment) => {
        if (window.confirm('Ви впевнені, що хочете відхилити це опитування?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.post(
                    `/database/polls/${pollId}/reject`,
                    { comment },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setPendingPolls((prev) => prev.filter((poll) => poll.id !== pollId));
                setSuccess('Опитування успішно відхилено!');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Помилка відхилення опитування.');
            }
        }
    };

    const handleViewPollDetails = (poll) => {
        setSelectedPoll(poll);
    };

    const handleClosePollDetails = () => {
        setSelectedPoll(null);
    };

    const handleApproveRequest = async (requestId) => {
        if (window.confirm('Ви впевнені, що хочете схвалити цю заявку?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`/users/role-upgrade-request/${requestId}/approve`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRoleUpgradeRequests((prev) => prev.filter((request) => request.id !== requestId));
                toast.success('Заявка успішно схвалена!');
            } catch (err) {
                setError('Помилка схвалення заявки');
                toast.error('Помилка схвалення заявки');
            }
        }
    };

    const handleRejectRequest = async (requestId, comment) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/users/role-upgrade-request/${requestId}/reject`, { comment }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRoleUpgradeRequests((prev) => prev.filter((request) => request.id !== requestId));
            toast.success('Заявка успішно відхилена!');
        } catch (err) {
            setError('Помилка відхилення заявки');
            toast.error('Помилка відхилення заявки');
        }
    };

    const popularPollData = stats.popularPoll?.options?.map((option, index) => ({
        name: option.option_text || `Варіант ${index + 1}`,
        votes: option.vote_count || 0,
    })) || [];

    const weeklyActivityData = stats.weeklyActivity?.map((day) => ({
        day: day.day,
        polls: day.polls,
        votes: day.votes,
    })) || [];

    const newUsersData = stats.newUsers?.map((day) => ({
        day: day.day,
        users: day.users,
    })) || [];

    const newPollsData = stats.newPolls?.map((day) => ({
        day: day.day,
        polls: day.polls,
    })) || [];

    return (
        <div>
            <div className="container-fluid py-5 bg-light min-vh-100">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <h1 className="h3 mb-4 text-primary">Панель керування</h1>

                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        {loading ? (
                            <div className="text-center">Завантаження...</div>
                        ) : (
                            <>
                                <div className="row g-4 mb-4">
                                    <div className="col-md-3">
                                        <div className="card h-100 border-0 shadow-sm">
                                            <div className="card-body">
                                                <h5 className="card-title">Активні опитування</h5>
                                                <p className="card-text display-6 text-primary">{stats.activePolls}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card h-100 border-0 shadow-sm">
                                            <div className="card-body">
                                                <h5 className="card-title">Активні учасники</h5>
                                                <p className="card-text display-6 text-success">{stats.totalParticipants}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card h-100 border-0 shadow-sm">
                                            <div className="card-body">
                                                <h5 className="card-title">Відповіді сьогодні</h5>
                                                <p className="card-text display-6 text-purple">{stats.votesToday}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card h-100 border-0 shadow-sm">
                                            <div className="card-body">
                                                <h5 className="card-title">Нові користувачі сьогодні</h5>
                                                <p className="card-text display-6 text-info">{stats.newUsersToday || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-4 mb-4">
                                    <div className="col-lg-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <h5 className="card-title mb-4">
                                                    Популярне опитування: {stats.popularPoll?.title || 'Немає даних'}
                                                </h5>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    {popularPollData.length > 0 ? (
                                                        <BarChart data={popularPollData}>
                                                            <CartesianGrid strokeDasharray="3 3"/>
                                                            <XAxis dataKey="name"/>
                                                            <YAxis/>
                                                            <Tooltip/>
                                                            <Legend/>
                                                            <Bar dataKey="votes" fill="#007bff"/>
                                                        </BarChart>
                                                    ) : (
                                                        <p className="text-muted">Немає даних для відображення.</p>
                                                    )}
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <h5 className="card-title mb-4">Тижнева активність</h5>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    {weeklyActivityData.length > 0 ? (
                                                        <LineChart data={weeklyActivityData}>
                                                            <CartesianGrid strokeDasharray="3 3"/>
                                                            <XAxis dataKey="day"/>
                                                            <YAxis/>
                                                            <Tooltip/>
                                                            <Legend/>
                                                            <Line type="monotone" dataKey="votes" stroke="#28a745"/>
                                                            <Line type="monotone" dataKey="polls" stroke="#ffc107"/>
                                                        </LineChart>
                                                    ) : (
                                                        <p className="text-muted">Немає даних для відображення.</p>
                                                    )}
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-4 mb-4">
                                    <div className="col-lg-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <h5 className="card-title mb-4">Нові користувачі за тиждень</h5>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    {newUsersData.length > 0 ? (
                                                        <LineChart data={newUsersData}>
                                                            <CartesianGrid strokeDasharray="3 3"/>
                                                            <XAxis dataKey="day"/>
                                                            <YAxis/>
                                                            <Tooltip/>
                                                            <Legend/>
                                                            <Line type="monotone" dataKey="users" stroke="#17a2b8"/>
                                                        </LineChart>
                                                    ) : (
                                                        <p className="text-muted">Немає даних для відображення.</p>
                                                    )}
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <h5 className="card-title mb-4">Нові опитування за тиждень</h5>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    {newPollsData.length > 0 ? (
                                                        <LineChart data={newPollsData}>
                                                            <CartesianGrid strokeDasharray="3 3"/>
                                                            <XAxis dataKey="day"/>
                                                            <YAxis/>
                                                            <Tooltip/>
                                                            <Legend/>
                                                            <Line type="monotone" dataKey="polls" stroke="#fd7e14"/>
                                                        </LineChart>
                                                    ) : (
                                                        <p className="text-muted">Немає даних для відображення.</p>
                                                    )}
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body">
                                        <h5 className="card-title mb-4">Останні опитування</h5>
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                <tr>
                                                    <th scope="col">Назва</th>
                                                    <th scope="col">Автор</th>
                                                    <th scope="col">Статус</th>
                                                    <th scope="col">Учасники</th>
                                                    <th scope="col">Створено</th>
                                                    <th scope="col">Дії</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {currentPolls.map((poll) => (
                                                    <tr key={poll.id}>
                                                        <td>{poll.title}</td>
                                                        <td>{poll.owner_username}</td>
                                                        <td>
                                                            <span
                                                                className={`badge ${
                                                                    poll.status === 'active'
                                                                        ? 'bg-success'
                                                                        : poll.status === 'closed'
                                                                            ? 'bg-danger'
                                                                            : 'bg-secondary'
                                                                }`}
                                                            >
                                                                {poll.status === 'active'
                                                                    ? 'Активно'
                                                                    : poll.status === 'closed'
                                                                        ? 'Закрите'
                                                                        : 'Підготовка'}
                                                            </span>
                                                        </td>
                                                        <td>{poll.vote_count || 0}</td>
                                                        <td>{new Date(poll.created_at).toLocaleDateString()}</td>
                                                        <td>
                                                            <Link
                                                                to={`/poll/${poll.id}`}
                                                                className="btn btn-outline-primary btn-sm me-2 mt-1"
                                                            >
                                                                Переглянути
                                                            </Link>
                                                            {poll.status !== 'closed' && (
                                                                <button
                                                                    className="btn btn-outline-danger btn-sm me-2 mt-1"
                                                                    onClick={() => handleClosePoll(poll.id)}
                                                                >
                                                                    Закрити
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-outline-danger btn-sm mt-1"
                                                                onClick={() => handleDeletePoll(poll.id)}
                                                            >
                                                                Видалити
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <nav>
                                            <ul className="pagination">
                                                {Array.from({ length: totalPages }, (_, index) => (
                                                    <li
                                                        key={index}
                                                        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(index + 1)}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </nav>
                                    </div>
                                </div>

                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body">
                                        <h5 className="card-title mb-4">Заявки на публікацію опитувань</h5>
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                <tr>
                                                    <th scope="col">Назва</th>
                                                    <th scope="col">Тип</th>
                                                    <th scope="col">Створено</th>
                                                    <th scope="col">Дії</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {pendingPolls.map((poll) => (
                                                    <tr key={poll.id}>
                                                        <td>{poll.title}</td>
                                                        <td>{poll.type}</td>
                                                        <td>{new Date(poll.created_at).toLocaleDateString()}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-outline-info btn-sm me-2 mt-1"
                                                                onClick={() => handleViewPollDetails(poll)}
                                                            >
                                                                Деталі
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-success btn-sm me-2 mt-1"
                                                                onClick={() => handleApprovePoll(poll.id)}
                                                            >
                                                                Схвалити
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm mt-1"
                                                                onClick={() =>
                                                                    setModal({
                                                                        show: true,
                                                                        type: 'reject',
                                                                        data: poll,
                                                                    })
                                                                }
                                                            >
                                                                Відхилити
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {selectedPoll && (
                                    <div className="card border-0 shadow-sm mb-4">
                                        <div className="card-body">
                                            <h5 className="card-title">Деталі опитування: {selectedPoll.title}</h5>
                                            <p><strong>Автор:</strong> {selectedPoll.owner_username}</p>
                                            <p><strong>Категорія:</strong> {selectedPoll.category_name}</p>
                                            <p><strong>Опис:</strong> {selectedPoll.description || 'Немає опису'}</p>
                                            {['single_choice', 'multiple_choice'].includes(selectedPoll.type) && (
                                                <div>
                                                    <h6>Варіанти відповідей: (для опитувань з варіантами відповідей)</h6>
                                                    <ul>
                                                        {selectedPoll.options?.map((option, index) => (
                                                            <li key={index}>{option.option_text}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={handleClosePollDetails}
                                            >
                                                Закрити
                                            </button>
                                            <button
                                                className="btn btn-outline-success mx-2"
                                                onClick={() => {
                                                    handleClosePollDetails();
                                                    handleApprovePoll(selectedPoll.id);
                                                }}
                                            >
                                                Схвалити
                                            </button>
                                            <button
                                                className="btn btn-outline-danger"
                                                onClick={() =>
                                                    setModal({ show: true, type: 'reject', data: selectedPoll })
                                                }
                                            >
                                                Відхилити
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body">
                                        <h5 className="card-title mb-4">Заявки на підвищення прав</h5>
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                <tr>
                                                    <th scope="col">Користувач</th>
                                                    <th scope="col">Текст заявки</th>
                                                    <th scope="col">Створено</th>
                                                    <th scope="col">Дії</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {roleUpgradeRequests.map((request) => (
                                                    <tr key={request.id}>
                                                        <td>{request.user_username}</td>
                                                        <td>{request.user_comment}</td>
                                                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-outline-success btn-sm me-2"
                                                                onClick={() => handleApproveRequest(request.id)}
                                                            >
                                                                Схвалити
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() =>
                                                                    setModal({
                                                                        show: true,
                                                                        type: 'reject_request',
                                                                        data: request,
                                                                    })
                                                                }
                                                            >
                                                                Відхилити
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {modal.show && modal.type === 'reject' && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Відхилити опитування</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setModal({ show: false, type: '', data: null })}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Введіть причину відхилення опитування "{modal.data.title}":</p>
                                <textarea className="form-control" rows="3" id="rejectComment"></textarea>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setModal({ show: false, type: '', data: null })}
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => {
                                        const comment = document.getElementById('rejectComment').value;
                                        if (comment.trim()) {
                                            handleRejectPoll(modal.data.id, comment);
                                            setModal({ show: false, type: '', data: null });
                                            handleClosePollDetails();
                                        } else {
                                            alert('Введіть причину відхилення');
                                        }
                                    }}
                                >
                                    Підтвердити
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modal.show && modal.type === 'reject_request' && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Відхилити заявку</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setModal({ show: false, type: '', data: null })}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Введіть причину відхилення заявки користувача "{modal.data.user_username}":</p>
                                <textarea className="form-control" rows="3" id="rejectComment"></textarea>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setModal({ show: false, type: '', data: null })}
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => {
                                        const comment = document.getElementById('rejectComment').value;
                                        if (comment.trim()) {
                                            handleRejectRequest(modal.data.id, comment);
                                            setModal({ show: false, type: '', data: null });
                                        } else {
                                            alert('Введіть причину відхилення');
                                        }
                                    }}
                                >
                                    Підтвердити
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;