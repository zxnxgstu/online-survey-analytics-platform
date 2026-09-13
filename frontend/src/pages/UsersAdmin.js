import React, { useState, useEffect } from "react";
import axios from '../axiosConfig';

const UsersAdmin = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [editUser, setEditUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [errorMessage, setErrorMessage] = useState(''); // Стан для повідомлення про помилку

    const token = localStorage.getItem('token');

    // Завантаження даних користувачів
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Помилка завантаження користувачів', error);
                if (error.response && error.response.status === 400) {
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage('Помилка завантаження користувачів');
                }
            }
        };

        fetchUsers();
    }, [token]);

    // Оновлення даних форми при виборі користувача для редагування
    useEffect(() => {
        if (editUser) {
            setNewName(editUser.username);
            setNewEmail(editUser.email);
            setNewRole(editUser.role);
            setNewPassword('');
            setErrorMessage(''); // Очищаємо помилку при виборі нового користувача
        }
    }, [editUser]);

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;

        return matchesSearch && matchesRole;
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const deleteUser = async (userId) => {
        if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
            try {
                await axios.delete(`http://localhost:5000/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(users.filter(user => user.id !== userId));
                setErrorMessage(''); // Очищаємо помилку після успішного видалення
                alert('Користувач видалений!');
            } catch (error) {
                console.error('Помилка видалення користувача', error);
                if (error.response && error.response.status === 400) {
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage('Помилка при видаленні користувача');
                }
            }
        }
    };

    const handleUpdateUser = async () => {
        try {
            const updateData = {
                username: newName,
                email: newEmail,
                role: newRole,
                userId: editUser.id // Додаємо userId для редагування адміністратором
            };
            if (newPassword) {
                updateData.password = newPassword; // Додаємо пароль лише якщо поле не порожнє
            }

            await axios.put(
                `http://localhost:5000/users/update`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.map(user =>
                user.id === editUser.id
                    ? { ...user, username: newName, email: newEmail, role: newRole }
                    : user
            ));
            setErrorMessage(''); // Очищаємо помилку після успішного оновлення
            alert('Дані користувача оновлені!');
            setEditUser(null);
            setNewPassword('');
        } catch (error) {
            console.error('Помилка оновлення користувача', error);
            if (error.response && error.response.status === 400) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Помилка при оновленні користувача');
            }
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Управління користувачами</h2>

            {/* Фільтри пошуку та фільтрації */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Пошук користувачів"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-4">
                    <select
                        className="form-control"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        <option value="all">Всі ролі</option>
                        <option value="user">Звичайний</option>
                        <option value="advanced">Продвинутий</option>
                        <option value="admin">Адмін</option>
                    </select>
                </div>
            </div>

            {/* Загальна кількість користувачів */}
            <div className="mb-4 text-muted">
                <p>Знайдено користувачів: {filteredUsers.length}</p>
            </div>

            {/* Відображення помилки */}
            {errorMessage && (
                <p className="alert alert-danger">{errorMessage}</p>
            )}

            {/* Форма редагування */}
            {editUser && (
                <div className="mb-4 p-4 bg-light rounded">
                    <h3 className="h5 mb-3">Редагувати користувача</h3>
                    <div className="mb-3">
                        <label className="form-label">Ім'я</label>
                        <input
                            className="form-control"
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            className="form-control"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Новий пароль (залиште порожнім, якщо не змінюєте)</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Введіть новий пароль"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Роль</label>
                        <select
                            className="form-select"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                        >
                            <option value="user">Звичайний</option>
                            <option value="advanced">Продвинутий</option>
                            <option value="admin">Адмін</option>
                        </select>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            onClick={handleUpdateUser}
                            className="btn btn-primary"
                        >
                            Зберегти
                        </button>
                        <button
                            onClick={() => setEditUser(null)}
                            className="btn btn-secondary"
                        >
                            Скасувати
                        </button>
                    </div>
                </div>
            )}

            {/* Таблиця користувачів */}
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="table-dark">
                    <tr>
                        <th>Ім'я користувача</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Дата реєстрації</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentUsers.map(user => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                                <span
                                    className={`badge ${user.role === 'admin' ? 'bg-danger-subtle text-danger' : user.role === 'advanced' ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
                                    {user.role === 'admin' ? "Адмін" : user.role === 'advanced' ? "Продвинутий" : "Звичайний"}
                                </span>
                            </td>
                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-info mx-1 my-2"
                                    onClick={() => setEditUser(user)}
                                >
                                    Редагувати
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => deleteUser(user.id)}
                                >
                                    Видалити
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Пагінація */}
            <nav>
                <ul className="pagination">
                    {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
                        <li key={i} className="page-item">
                            <button onClick={() => paginate(i + 1)} className="page-link">
                                {i + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default UsersAdmin;