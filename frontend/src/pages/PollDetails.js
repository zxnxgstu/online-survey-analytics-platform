import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import useAuth from '../hooks/useAuth';
import axios from '../axiosConfig';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const PollDetails = () => {
    const { pollId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth();
    const [poll, setPoll] = useState(null);
    const [results, setResults] = useState(null);
    const [alreadyVoted, setAlreadyVoted] = useState(false);
    const [canViewResults, setCanViewResults] = useState(false);
    const [pollStatusMessage, setPollStatusMessage] = useState(null);
    const [userVote, setUserVote] = useState(null); // Для зберігання відповіді користувача
    const [rejectionReason, setRejectionReason] = useState(''); // Причина відмови

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Завантажити опитування та результати
    useEffect(() => {
        const fetchPoll = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await axios.get(`/polls/${pollId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = response.data;
                setPoll(data.poll);

                // Перевірка статусу опитування
                if (data.poll.status === 'preparation') {
                    setPollStatusMessage("Опитування на модерації");
                    return;
                }

                if (data.poll.status === 'closed') {
                    setPollStatusMessage("Опитування закрито адміністратором");
                    // Запит на отримання причини відмови
                    const reasonResponse = await axios.get(`/polls/${pollId}/status`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (reasonResponse.status === 200 && reasonResponse.data.status) {
                        setRejectionReason(reasonResponse.data.status[0]?.comment || '');
                    }
                    return;
                }

                if (data.poll.is_active === 0 && !(Number(user?.id) === Number(data.poll.created_by) || user?.role === 'admin')) {
                    setPollStatusMessage("Опитування деактивовано користувачем");
                    return;
                }

                if (data.poll && data.poll.type) {
                    setAlreadyVoted(data.poll.user_voted === true);

                    // Якщо користувач проголосував, зберігаємо його відповідь
                    if (data.poll.user_voted) {
                        setUserVote(data.poll.user_vote_ids);
                    }
                }
            } catch (err) {
                console.error('Fetch poll error:', err);
            }
        };
        fetchPoll();
    }, [pollId, user?.id, user?.role]);


    // Завантажити результати
    useEffect(() => {
        if (pollStatusMessage) return;
        const fetchResults = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await axios.get(`/polls/${pollId}/results`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setResults(response.data.results);
                setCanViewResults(true);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    setCanViewResults(false);
                } else {
                    console.error('Error fetching results:', err);
                }
            }
        };

        if (poll) {
            fetchResults();
        }
    }, [pollId, poll, pollStatusMessage]);

    // Відправка голосу
    const handleSubmit = async e => {
        e.preventDefault();
        let body;

        if (poll.type === 'rating_scale') {
            body = { rating: +e.target.rating.value };
        } else if (poll.type === 'text_response') {
            body = { text_response: e.target.text_response.value.trim() };
        } else {
            const options = Array.from(e.target.elements['options'])
                .filter(i => i.checked)
                .map(i => +i.value);
            if(poll.type === 'multiple_choice'){
                body = {
                    optionId: options
                };
            }else {
                body = {
                    optionId: options.length === 1 ? options[0] : options
                };
            }
        }
        const token = localStorage.getItem("token");
        try {
            const res = await axios.post(
                `/polls/${pollId}/vote`,
                body,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.results !== undefined) setResults(res.data.results);
            setAlreadyVoted(true);
            setUserVote(body.optionId || body.rating || body.text_response); // Зберігаємо відповідь користувача
        } catch (err) {
            console.error('Vote error:', err);
        }
    };

    // Форма голосування
    const renderForm = () => {
        if (alreadyVoted) {
            // Відображаємо відповідь користувача
            return (
                <div>
                    <p className="alert alert-success">Дякуємо за вашу відповідь!</p>
                    {poll.type === 'rating_scale' && <p>Ваша оцінка: {userVote}</p>}
                    {poll.type === 'text_response' && <p>Ваш коментар: {userVote}</p>}
                    {['single_choice', 'multiple_choice'].includes(poll.type) && (
                        <div>
                            <p>Ваша відповідь: </p>
                            {poll.options.map(option => {
                                // Для одиничного вибору, userVote має бути просто значенням (ID варіанту)
                                if (Array.isArray(userVote)) {
                                    // Для множинного вибору, перевіряємо, чи містить масив userVote цей варіант
                                    if (userVote.includes(option.id)) {
                                        return (
                                            <span key={option.id} className="badge bg-primary me-2">
                    {option.option_text}
                </span>
                                        );
                                    }
                                } else if (userVote === option.id) {
                                    // Для одиничного вибору, перевіряємо чи userVote дорівнює id поточного варіанту
                                    return (
                                        <span key={option.id} className="badge bg-primary me-2">
                {option.option_text}
            </span>
                                    );
                                }
                                return null;
                            })}

                        </div>
                    )}
                </div>
            );
        }

        if (poll.type === 'rating_scale') {
            return (
                <form onSubmit={handleSubmit}>
                    <label className="form-label">Оцініть (1–5):</label>
                    {[1,2,3,4,5].map(n => (
                        <div key={n} className="form-check form-check-inline">
                            <input type="radio" className="form-check-input" name="rating" value={n} required />
                            <label className="form-check-label">{n}</label>
                        </div>
                    ))}
                    <button className="btn btn-primary mt-3" type="submit">Відправити</button>
                </form>
            );
        }

        if (poll.type === 'text_response') {
            return (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <textarea name="text_response" className="form-control" rows="4" required placeholder="Ваш коментар" />
                    </div>
                    <button className="btn btn-primary mt-3" type="submit">Відправити</button>
                </form>
            );
        }

        return (
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    {poll.options.map(opt => (
                        <div key={opt.id} className="form-check">
                            <input
                                type={poll.type === "multiple_choice" ? 'checkbox' : 'radio'}
                                className="form-check-input"
                                name="options"
                                value={opt.id}
                                required={poll.type !== "multiple_choice"}
                            />
                            <label className="form-check-label">{opt.option_text}</label>
                        </div>
                    ))}
                </div>
                <button className="btn btn-primary mt-3" type="submit">Голосувати</button>
            </form>
        );
    };

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF8042", "#FF6F61", "#6A5ACD", "#32CD32", "#FFD700", "#FF4500"];
    // Відображення результатів
    const renderResults = () => {
        if (!results || Object.keys(results).length === 0) {
            return <p className="alert alert-warning">Результати ще не надані.</p>;
        }

        if (poll.type === 'rating_scale') {
            const freq = [1, 2, 3, 4, 5].map(r => ({
                name: String(r),
                count: results.filter(x => x.rating === r).length
            }));

            // Розрахунок середнього балу
            const totalVotes = results.length;
            const totalScore = results.reduce((acc, vote) => acc + vote.rating, 0);
            const averageRating = totalVotes > 0 ? (totalScore / totalVotes).toFixed(2) : 0;

            return (
                <div>
                    <div className="d-flex justify-content-center">
                        <BarChart width={500} height={300} data={freq}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#007bff" />
                        </BarChart>
                    </div>
                    <p><strong>Середній бал: </strong>{averageRating}</p>

                    <h5>Оцінки користувачів:</h5>
                    <ul className="list-group">
                        {results.map((r, i) => (
                            <li key={i} className="list-group-item">
                                <strong>{r.username}:</strong> {r.rating}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        if (poll.type === 'text_response') {
            if (!Array.isArray(results)) {
                return <p className="alert alert-info">Немає текстових відповідей.</p>;
            }
            return (
                <div>
                    <h5>Текстові відповіді користувачів:</h5>
                    <ul className="list-group">
                        {results.map((r, i) => (
                            <li key={i} className="list-group-item">
                                <strong>{r.username}:</strong> {r.response_text}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        if (['single_choice', 'multiple_choice'].includes(poll.type)) {
            // Групуємо голоси по користувачах
            const userVotes = results.reduce((acc, r) => {
                if (!acc[r.user_id]) {
                    acc[r.user_id] = {
                        username: r.username,
                        votes: []
                    };
                }
                acc[r.user_id].votes.push(r.option_id);
                return acc;
            }, {});

            const counts = poll.options.map(opt => ({
                name: opt.option_text,
                value: results.filter(r => r.option_id === opt.id).length
            }));

            return (
                <div>
                    <h5>Вибір користувачів:</h5>
                    <ul className="list-group">
                        {Object.entries(userVotes).map(([userId, userData]) => (
                            <li key={userId} className="list-group-item">
                                <strong>{userData.username}:</strong>
                                {userData.votes.map(optionId => {
                                    const selectedOption = poll.options.find(option => option.id === optionId);
                                    if (selectedOption) {
                                        const optionIndex = poll.options.findIndex(option => option.id === optionId);
                                        const color = COLORS[optionIndex % COLORS.length];
                                        return (
                                            <span
                                                key={optionId}
                                                style={{
                                                    backgroundColor: color,
                                                    padding: '3px 8px',
                                                    borderRadius: '5px',
                                                    color: '#fff',
                                                    marginRight: '5px'
                                                }}
                                            >
                            {selectedOption.option_text}
                        </span>
                                        );
                                    }
                                    return 'Невідомий варіант';
                                })}
                            </li>
                        ))}
                    </ul>

                    {/* Діаграма для кількості вибраних варіантів */}
                    <div className="mt-3 d-flex justify-content-center">
                        <h5>Розподіл варіантів:</h5>
                    </div>
                    <div className="d-flex justify-content-center">
                        <PieChart width={400} height={300}>
                            <Pie data={counts} dataKey="value" nameKey="name" outerRadius={100}>
                                {counts.map((_, idx) => (
                                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </div>
                </div>
            );
        }

        return null;
    };




    if (!poll) return <p className="alert alert-info">Завантаження…</p>;

    return (
        <div className="container py-4">
            {pollStatusMessage && (
                <div className={`alert ${pollStatusMessage === "Опитування закрито адміністратором" ? 'alert-danger' : 'alert-info'}`}>
                    <strong>{pollStatusMessage}</strong>
                </div>
            )}
            {pollStatusMessage ? (
                rejectionReason && <p className="alert alert-warning">Причина: {rejectionReason}</p> // Якщо є причина, виводимо її
            ) : (
                <>
                    <h2>{poll.title}</h2>
                    <p className="text-black m-0">👤Автор: {poll.creator_username}</p>
                    <p>{poll.description}</p>
                    {renderForm()}
                    <hr/>
                    <h3>Результати</h3>
                    {canViewResults ? renderResults() :
                        <p className="alert alert-danger">У вас немає доступу до результатів цього опитування.</p>}
                </>
            )}
        </div>
    );

};

export default PollDetails;
