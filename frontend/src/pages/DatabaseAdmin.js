import React, { useState, useEffect } from "react";
import axios from '../axiosConfig';
import "bootstrap/dist/css/bootstrap.min.css";

const DatabaseAdmin = () => {
    const [activeTab, setActiveTab] = useState("polls");
    const [dbStats, setDbStats] = useState({
        tables: 0,
        size: "0 MB",
        records: {
            users: 0,
            polls: 0,
            votes: 0,
            categories: 0,
            poll_options: 0,
            rating_responses: 0,
            text_responses: 0,
            poll_moderation: 0
        },
        lastBackup: "N/A"
    });
    const [tableData, setTableData] = useState({
        polls: [],
        users: [],
        votes: [],
        categories: [],
        poll_options: [],
        rating_responses: [],
        text_responses: [],
        poll_moderation: []
    });
    const [searchTerms, setSearchTerms] = useState({
        polls: "",
        users: "",
        votes: "",
        categories: "",
        poll_options: "",
        rating_responses: "",
        text_responses: "",
        poll_moderation: ""
    });
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sqlQuery, setSqlQuery] = useState("");
    const [sqlResult, setSqlResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const token = localStorage.getItem("token");

    // Завантаження даних
    useEffect(() => {
        const fetchDbStats = async () => {
            try {
                const response = await axios.get("/database/db-stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDbStats(response.data);
            } catch (error) {
                handleError(error, "Помилка завантаження статистики бази даних");
            }
        };

        const fetchTableData = async () => {
            try {
                const tables = ["users", "polls", "votes", "categories", "poll_options", "rating_responses", "text_responses", "poll_moderation"];
                const promises = tables.map(table =>
                    axios.get(`/database/${table}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                );
                const responses = await Promise.all(promises);
                setTableData({
                    users: responses[0].data,
                    polls: responses[1].data,
                    votes: responses[2].data,
                    categories: responses[3].data,
                    poll_options: responses[4].data,
                    rating_responses: responses[5].data,
                    text_responses: responses[6].data,
                    poll_moderation: responses[7].data
                });
            } catch (error) {
                handleError(error, "Помилка завантаження даних таблиць");
            }
        };

        fetchDbStats();
        fetchTableData();
    }, [token]);

    // Обробка помилок
    const handleError = (error, defaultMessage) => {
        console.error(defaultMessage, error);
        if (error.response && error.response.status === 400) {
            setErrorMessage(error.response.data.message);
        } else {
            setErrorMessage(defaultMessage);
        }
    };

    // Пошук
    const handleSearch = (table, value) => {
        setSearchTerms({ ...searchTerms, [table]: value });
        setCurrentPage(1);
    };

    // Сортування
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortData = (data, key, direction) => {
        return [...data].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
            return 0;
        });
    };

    // Фільтрація даних
    const getFilteredData = (table) => {
        let data = tableData[table];
        const term = searchTerms[table].trim();
        const idSearchMatch = term.match(/^\[(\d+)\]$/); // Перевірка на формат [число]

        if (term) {
            data = data.filter(item => {
                if (idSearchMatch) {
                    // Пошук тільки по id
                    const id = idSearchMatch[1];
                    return item.id.toString() === id;
                }

                // Пошук по всіх полях
                const lowerTerm = term.toLowerCase();

                if (table === "polls") {
                    return (
                        item.id.toString().includes(term) ||
                        (item.title && item.title.toLowerCase().includes(lowerTerm)) ||
                        (item.owner_username && item.owner_username.toLowerCase().includes(lowerTerm)) ||
                        (item.category_name && item.category_name.toLowerCase().includes(lowerTerm)) ||
                        (item.status && item.status.toLowerCase().includes(lowerTerm))
                    );
                }
                if (table === "users") {
                    return (
                        item.id.toString().includes(term) ||
                        (item.username && item.username.toLowerCase().includes(lowerTerm)) ||
                        (item.email && item.email.toLowerCase().includes(lowerTerm)) ||
                        (item.role && item.role.toLowerCase().includes(lowerTerm))
                    );
                }
                if (table === "votes") {
                    return (
                        item.id.toString().includes(term) ||
                        item.poll_id.toString().includes(term) ||
                        item.option_id.toString().includes(term) ||
                        item.user_id.toString().includes(term)
                    );
                }
                if (table === "categories") {
                    return (
                        item.id.toString().includes(term) ||
                        (item.name && item.name.toLowerCase().includes(lowerTerm))
                    );
                }
                if (table === "poll_options") {
                    return (
                        item.id.toString().includes(term) ||
                        item.poll_id.toString().includes(term) ||
                        (item.option_text && item.option_text.toLowerCase().includes(lowerTerm)) ||
                        item.option_order.toString().includes(term)
                    );
                }
                if (table === "rating_responses") {
                    return (
                        item.id.toString().includes(term) ||
                        item.poll_id.toString().includes(term) ||
                        item.user_id.toString().includes(term)
                    );
                }
                if (table === "text_responses") {
                    return (
                        item.id.toString().includes(term) ||
                        item.poll_id.toString().includes(term) ||
                        item.user_id.toString().includes(term) ||
                        (item.response_text && item.response_text.toLowerCase().includes(lowerTerm))
                    );
                }
                if (table === "poll_moderation") {
                    return (
                        item.id.toString().includes(term) ||
                        item.poll_id.toString().includes(term) ||
                        item.admin_id.toString().includes(term) ||
                        (item.action && item.action.toLowerCase().includes(lowerTerm)) ||
                        (item.comment && item.comment.toLowerCase().includes(lowerTerm))
                    );
                }
                return false;
            });
        }

        if (sortConfig.key) {
            data = sortData(data, sortConfig.key, sortConfig.direction);
        }

        return data;
    };

    const getPaginatedData = (table) => {
        const filteredData = getFilteredData(table);
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    };

    // Перехід до пов’язаного запису
    const handleForeignKeyClick = (table, id) => {
        setActiveTab(table);
        setSearchTerms({ ...searchTerms, [table]: `[${id}]` }); // Використовуємо формат [id]
        setCurrentPage(1);
    };

    // Виконання SQL-запиту
    const executeSqlQuery = async () => {
        if (!sqlQuery.trim()) {
            setErrorMessage("SQL-запит не може бути порожнім");
            return;
        }
        try {
            const response = await axios.post(
                "/database/sql-query",
                { query: sqlQuery },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSqlResult(response.data);
            setErrorMessage("");
        } catch (error) {
            handleError(error, "Помилка виконання SQL-запиту");
        }
    };

    // Підказка для пошуку
    const getSearchTooltip = (table) => {
        const baseTooltip = (() => {
            switch (table) {
                case "polls":
                    return "Пошук за ID, назвою, власником, категорією, статусом";
                case "users":
                    return "Пошук за ID, ім'ям, email, роллю";
                case "votes":
                    return "Пошук за ID, ID опитування, ID варіанту, ID користувача";
                case "categories":
                    return "Пошук за ID, назвою";
                case "poll_options":
                    return "Пошук за ID, ID опитування, текстом варіанту, порядком";
                case "rating_responses":
                    return "Пошук за ID, ID опитування, ID користувача";
                case "text_responses":
                    return "Пошук за ID, ID опитування, ID користувача, текстом відповіді";
                case "poll_moderation":
                    return "Пошук за ID, ID опитування, ID адміна, дією, коментарем";
                default:
                    return "Введіть пошуковий запит";
            }
        })();
        return `${baseTooltip}. Використовуйте [число] для пошуку тільки за ID.`;
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Керування базою даних</h2>

            {/* Статистика */}
            <div className="row row-cols-1 row-cols-md-4 g-4 mb-4">
                <div className="col">
                    <div className="card bg-light">
                        <div className="card-body">
                            <h5 className="card-title text-muted">Кількість таблиць</h5>
                            <p className="card-text display-6 text-primary">{dbStats.tables}</p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card bg-light">
                        <div className="card-body">
                            <h5 className="card-title text-muted">Розмір бази даних</h5>
                            <p className="card-text display-6 text-success">{dbStats.size}</p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card bg-light">
                        <div className="card-body">
                            <h5 className="card-title text-muted">Всього записів</h5>
                            <p className="card-text display-6 text-purple">
                                {Object.values(dbStats.records).reduce((a, b) => a + b, 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card bg-light">
                        <div className="card-body">
                            <h5 className="card-title text-muted">Остання резервна копія</h5>
                            <p className="card-text text-warning">{dbStats.lastBackup || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Вкладки */}
            <ul className="nav nav-tabs mb-4">
                {["polls", "users", "votes", "categories", "poll_options", "rating_responses", "text_responses", "poll_moderation"].map(tab => (
                    <li key={tab} className="nav-item">
                        <button
                            className={`nav-link ${activeTab === tab ? "active" : ""}`}
                            onClick={() => {
                                setActiveTab(tab);
                                setCurrentPage(1);
                                setSortConfig({ key: "", direction: "" });
                            }}
                        >
                            {tab === "polls" ? "Опитування" :
                                tab === "users" ? "Користувачі" :
                                    tab === "votes" ? "Голоси" :
                                        tab === "categories" ? "Категорії" :
                                            tab === "poll_options" ? "Варіанти опитувань" :
                                                tab === "rating_responses" ? "Рейтингові відповіді" :
                                                    tab === "text_responses" ? "Текстові відповіді" :
                                                        "Модерація опитувань"}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Помилка */}
            {errorMessage && (
                <div className="alert alert-warning" role="alert">
                    {errorMessage}
                </div>
            )}

            {/* Таблиці */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5>
                        {activeTab === "polls" && "Таблиця опитувань (polls)"}
                        {activeTab === "users" && "Таблиця користувачів (users)"}
                        {activeTab === "votes" && "Таблиця голосувань (votes)"}
                        {activeTab === "categories" && "Таблиця категорій (categories)"}
                        {activeTab === "poll_options" && "Таблиця варіантів опитувань (poll_options)"}
                        {activeTab === "rating_responses" && "Таблиця рейтингових відповідей (rating_responses)"}
                        {activeTab === "text_responses" && "Таблиця текстових відповідей (text_responses)"}
                        {activeTab === "poll_moderation" && "Таблиця модерації опитувань (poll_moderation)"}
                    </h5>
                    <div className="input-group w-25">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Пошук..."
                            title={getSearchTooltip(activeTab)}
                            value={searchTerms[activeTab]}
                            onChange={(e) => handleSearch(activeTab, e.target.value)}
                        />
                    </div>
                </div>
                <div className="card-body">
                    {activeTab === "polls" && (
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                {["id", "title", "created_by", "category_id", "status", "created_at", "vote_count"].map(key => (
                                    <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                                        {key === "id" ? "ID" :
                                            key === "title" ? "Назва" :
                                                key === "created_by" ? "Власник" :
                                                    key === "category_id" ? "Категорія" :
                                                        key === "status" ? "Статус" :
                                                            key === "created_at" ? "Створено" : "Голоси"}
                                        {sortConfig.key === key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : ""}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {getPaginatedData("polls").map(poll => (
                                <tr key={poll.id}>
                                    <td>{poll.id}</td>
                                    <td>{poll.title}</td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("users", poll.created_by)}
                                            >
                                                {poll.owner_username}
                                            </span>
                                    </td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("categories", poll.category_id)}
                                            >
                                                {poll.category_name}
                                            </span>
                                    </td>
                                    <td>{poll.status}</td>
                                    <td>{new Date(poll.created_at).toLocaleString()}</td>
                                    <td>{poll.vote_count}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                    {activeTab === "users" && (
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                {["id", "username", "email", "role", "created_at"].map(key => (
                                    <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                                        {key === "id" ? "ID" :
                                            key === "username" ? "Ім'я" :
                                                key === "email" ? "Email" :
                                                    key === "role" ? "Роль" : "Зареєстровано"}
                                        {sortConfig.key === key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : ""}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {getPaginatedData("users").map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role === "admin" ? "Адмін" : user.role === "advanced" ? "Продвинутий" : "Звичайний"}</td>
                                    <td>{new Date(user.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                    {activeTab === "votes" && (
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                {["id", "poll_id", "option_id", "user_id", "voted_at"].map(key => (
                                    <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                                        {key === "id" ? "ID" :
                                            key === "poll_id" ? "Опитування ID" :
                                                key === "option_id" ? "Варіант ID" :
                                                    key === "user_id" ? "Користувач ID" : "Дата голосування"}
                                        {sortConfig.key === key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : ""}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {getPaginatedData("votes").map(vote => (
                                <tr key={vote.id}>
                                    <td>{vote.id}</td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("polls", vote.poll_id)}
                                            >
                                                {vote.poll_id}
                                            </span>
                                    </td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("poll_options", vote.option_id)}
                                            >
                                                {vote.option_id}
                                            </span>
                                    </td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("users", vote.user_id)}
                                            >
                                                {vote.user_id}
                                            </span>
                                    </td>
                                    <td>{new Date(vote.voted_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                    {activeTab === "categories" && (
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                {["id", "name", "created_at"].map(key => (
                                    <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                                        {key === "id" ? "ID" : key === "name" ? "Назва" : "Створено"}
                                        {sortConfig.key === key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : ""}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {getPaginatedData("categories").map(category => (
                                <tr key={category.id}>
                                    <td>{category.id}</td>
                                    <td>{category.name}</td>
                                    <td>{new Date(category.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                    {activeTab === "poll_options" && (
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                {["id", "poll_id", "option_text", "option_order", "created_at"].map(key => (
                                    <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                                        {key === "id" ? "ID" :
                                            key === "poll_id" ? "Опитування ID" :
                                                key === "option_text" ? "Текст варіанту" :
                                                    key === "option_order" ? "Порядок" : "Створено"}
                                        {sortConfig.key === key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : ""}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {getPaginatedData("poll_options").map(option => (
                                <tr key={option.id}>
                                    <td>{option.id}</td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("polls", option.poll_id)}
                                            >
                                                {option.poll_id}
                                            </span>
                                    </td>
                                    <td>{option.option_text}</td>
                                    <td>{option.option_order}</td>
                                    <td>{new Date(option.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                    {activeTab === "rating_responses" && (
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                {["id", "poll_id", "user_id", "rating", "created_at"].map(key => (
                                    <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                                        {key === "id" ? "ID" :
                                            key === "poll_id" ? "Опитування ID" :
                                                key === "user_id" ? "Користувач ID" :
                                                    key === "rating" ? "Рейтинг" : "Створено"}
                                        {sortConfig.key === key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : ""}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {getPaginatedData("rating_responses").map(response => (
                                <tr key={response.id}>
                                    <td>{response.id}</td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("polls", response.poll_id)}
                                            >
                                                {response.poll_id}
                                            </span>
                                    </td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("users", response.user_id)}
                                            >
                                                {response.user_id}
                                            </span>
                                    </td>
                                    <td>{response.rating}</td>
                                    <td>{new Date(response.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                    {activeTab === "text_responses" && (
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                {["id", "poll_id", "user_id", "response_text", "created_at"].map(key => (
                                    <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                                        {key === "id" ? "ID" :
                                            key === "poll_id" ? "Опитування ID" :
                                                key === "user_id" ? "Користувач ID" :
                                                    key === "response_text" ? "Текст відповіді" : "Створено"}
                                        {sortConfig.key === key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : ""}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {getPaginatedData("text_responses").map(response => (
                                <tr key={response.id}>
                                    <td>{response.id}</td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("polls", response.poll_id)}
                                            >
                                                {response.poll_id}
                                            </span>
                                    </td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("users", response.user_id)}
                                            >
                                                {response.user_id}
                                            </span>
                                    </td>
                                    <td>{response.response_text}</td>
                                    <td>{new Date(response.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                    {activeTab === "poll_moderation" && (
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                {["id", "poll_id", "admin_id", "action", "comment", "created_at"].map(key => (
                                    <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                                        {key === "id" ? "ID" :
                                            key === "poll_id" ? "Опитування ID" :
                                                key === "admin_id" ? "Адмін ID" :
                                                    key === "action" ? "Дія" :
                                                        key === "comment" ? "Коментар" : "Створено"}
                                        {sortConfig.key === key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : ""}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {getPaginatedData("poll_moderation").map(moderation => (
                                <tr key={moderation.id}>
                                    <td>{moderation.id}</td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("polls", moderation.poll_id)}
                                            >
                                                {moderation.poll_id}
                                            </span>
                                    </td>
                                    <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => handleForeignKeyClick("users", moderation.admin_id)}
                                            >
                                                {moderation.admin_id}
                                            </span>
                                    </td>
                                    <td>{moderation.action}</td>
                                    <td>{moderation.comment}</td>
                                    <td>{new Date(moderation.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {/* Пагінація */}
                <nav>
                    <ul className="pagination">
                        {Array.from({ length: Math.ceil(getFilteredData(activeTab).length / itemsPerPage) }, (_, i) => (
                            <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* SQL-запити */}
            <div className="card">
                <div className="card-header">
                    <h5>Виконати SQL-запит</h5>
                </div>
                <div className="card-body">
                    <textarea
                        className="form-control mb-3"
                        rows="4"
                        placeholder="Введіть SQL-запит (лише SELECT-запити)..."
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                    />
                    <div className="d-flex justify-content-between">
                        <button className="btn btn-primary" onClick={executeSqlQuery}>
                            Виконати
                        </button>
                        <small className="text-muted">
                            <span className="text-danger fw-bold">Увага!</span> Дозволено лише SELECT-запити.
                        </small>
                    </div>
                    {sqlResult && (
                        <div className="mt-3">
                            <h6>Результати запиту:</h6>
                            <pre className="bg-light p-3 rounded">{JSON.stringify(sqlResult, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DatabaseAdmin;