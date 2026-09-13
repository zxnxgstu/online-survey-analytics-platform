const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const authConfig = require('../config/authConfig');

const User = require('../models/User');
const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

router.get('/db-stats', authConfig.verifyAdmin, databaseController.getDbStats);

router.post('/sql-query', authConfig.verifyAdmin, databaseController.executeSqlQuery);

router.get('/users', authConfig.verifyAdmin, async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання користувачів', error: err.message });
    }
});

router.get('/polls', authConfig.verifyAdmin, async (req, res) => {
    try {
        const { status, search } = req.query;
        let polls = await Poll.getAllPolls();

        // Фільтрація за статусом
        if (status) {
            polls = polls.filter((poll) => poll.status === status);
        }

        // Фільтрація за пошуковим запитом
        if (search) {
            const lowerSearch = search.toLowerCase();
            polls = polls.filter(
                (poll) =>
                    poll.title.toLowerCase().includes(lowerSearch) ||
                    poll.owner_username.toLowerCase().includes(lowerSearch) ||
                    poll.category_name.toLowerCase().includes(lowerSearch)
            );
        }

        // Додаємо варіанти відповідей для опитувань з типом single_choice або multiple_choice
        for (let poll of polls) {
            if (['single_choice', 'multiple_choice'].includes(poll.type)) {
                poll.options = await Poll.getPollOptions(poll.id);
            }
        }

        res.json(polls);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання опитувань', error: err.message });
    }
});

router.get('/votes', authConfig.verifyAdmin, async (req, res) => {
    try {
        const votes = await Vote.getAllVotes();
        res.json(votes);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання голосів', error: err.message });
    }
});

router.get('/categories', authConfig.verifyAdmin, async (req, res) => {
    try {
        const categories = await Poll.getCategories();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання категорій', error: err.message });
    }
});

router.get('/poll_options', authConfig.verifyAdmin, async (req, res) => {
    try {
        const options = await Poll.getAllPollOptions();
        res.json(options);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання варіантів опитувань', error: err.message });
    }
});

router.get('/rating_responses', authConfig.verifyAdmin, async (req, res) => {
    try {
        const responses = await Vote.getAllRatingResponses();
        res.json(responses);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання рейтингових відповідей', error: err.message });
    }
});

router.get('/text_responses', authConfig.verifyAdmin, async (req, res) => {
    try {
        const responses = await Vote.getAllTextResponses();
        res.json(responses);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання текстових відповідей', error: err.message });
    }
});

router.get('/poll_moderation', authConfig.verifyAdmin, async (req, res) => {
    try {
        const moderations = await Poll.getAllPollModerations();
        res.json(moderations);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання модерації опитувань', error: err.message });
    }
});

router.get('/stats', authConfig.verifyAdmin, async (req, res) => {
    try {
        const polls = await Poll.getAllPolls();
        const votes = await Vote.getAllVotes();
        const textResponses = await Vote.getAllTextResponses();
        const ratingResponses = await Vote.getAllRatingResponses();
        const users = await User.getAllUsers();

        // Активні опитування
        const activePollsCount = polls.filter((poll) => poll.status === 'active').length;

        // Активні учасники (унікальні user_id з усіх таблиць відповідей)
        const participantIds = new Set([
            ...votes.map((vote) => vote.user_id),
            ...textResponses.map((response) => response.user_id),
            ...ratingResponses.map((response) => response.user_id)
        ]);
        const totalParticipants = participantIds.size;

        // Відповіді сьогодні
        const today = new Date().toISOString().split('T')[0]; // Формат: YYYY-MM-DD
        let totalResponsesToday = 0;
        for (const poll of polls) {
            if (['single_choice', 'multiple_choice'].includes(poll.type)) {
                totalResponsesToday += votes.filter((vote) => {
                    const voteDate = new Date(vote.voted_at).toISOString().split('T')[0];
                    return vote.poll_id === poll.id && voteDate === today;
                }).length;
            } else if (poll.type === 'text_response') {
                totalResponsesToday += textResponses.filter((response) => {
                    const responseDate = new Date(response.created_at).toISOString().split('T')[0];
                    return response.poll_id === poll.id && responseDate === today;
                }).length;
            } else if (poll.type === 'rating_scale') {
                totalResponsesToday += ratingResponses.filter((response) => {
                    const responseDate = new Date(response.created_at).toISOString().split('T')[0];
                    return response.poll_id === poll.id && responseDate === today;
                }).length;
            }
        }

        // Нові користувачі сьогодні
        const newUsersToday = users.filter((user) => {
            const userDate = new Date(user.created_at).toISOString().split('T')[0];
            return userDate === today;
        }).length;

        // Тижнева активність
        const weeklyActivity = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const day = date.toISOString().split('T')[0];
            const dayPolls = polls.filter((poll) => {
                const pollDate = new Date(poll.created_at).toISOString().split('T')[0];
                return pollDate === day;
            }).length;
            let dayTotalResponses = 0;
            for (const poll of polls) {
                if (['single_choice', 'multiple_choice'].includes(poll.type)) {
                    dayTotalResponses += votes.filter((vote) => {
                        const voteDate = new Date(vote.voted_at).toISOString().split('T')[0];
                        return vote.poll_id === poll.id && voteDate === day;
                    }).length;
                } else if (poll.type === 'text_response') {
                    dayTotalResponses += textResponses.filter((response) => {
                        const responseDate = new Date(response.created_at).toISOString().split('T')[0];
                        return response.poll_id === poll.id && responseDate === day;
                    }).length;
                } else if (poll.type === 'rating_scale') {
                    dayTotalResponses += ratingResponses.filter((response) => {
                        const responseDate = new Date(response.created_at).toISOString().split('T')[0];
                        return response.poll_id === poll.id && responseDate === day;
                    }).length;
                }
            }
            weeklyActivity.push({
                day: date.toLocaleDateString('uk-UA', { weekday: 'short' }),
                polls: dayPolls,
                votes: dayTotalResponses
            });
        }

        // Нові користувачі за тиждень
        const newUsers = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const day = date.toISOString().split('T')[0];
            const dayUsers = users.filter((user) => {
                const userDate = new Date(user.created_at).toISOString().split('T')[0];
                return userDate === day;
            }).length;
            newUsers.push({
                day: date.toLocaleDateString('uk-UA', { weekday: 'short' }),
                users: dayUsers
            });
        }

        // Нові опитування за тиждень
        const newPolls = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const day = date.toISOString().split('T')[0];
            const dayPolls = polls.filter((poll) => {
                const pollDate = new Date(poll.created_at).toISOString().split('T')[0];
                return pollDate === day;
            }).length;
            newPolls.push({
                day: date.toLocaleDateString('uk-UA', { weekday: 'short' }),
                polls: dayPolls
            });
        }

        // Популярне опитування
        let popularPoll = null;
        const activePolls = polls.filter((poll) => poll.status === 'active');
        if (activePolls.length > 0) {
            // Для кожного опитування підраховуємо кількість відповідей залежно від типу
            const pollResponseCounts = await Promise.all(
                activePolls.map(async (poll) => {
                    let responseCount = 0;
                    if (['single_choice', 'multiple_choice'].includes(poll.type)) {
                        responseCount = votes.filter((vote) => vote.poll_id === poll.id).length;
                    } else if (poll.type === 'text_response') {
                        responseCount = textResponses.filter(
                            (response) => response.poll_id === poll.id
                        ).length;
                    } else if (poll.type === 'rating_scale') {
                        responseCount = ratingResponses.filter(
                            (response) => response.poll_id === poll.id
                        ).length;
                    }
                    return { poll, responseCount };
                })
            );

            // Сортуємо за кількістю відповідей
            const sortedPolls = pollResponseCounts.sort((a, b) => b.responseCount - a.responseCount);
            popularPoll = sortedPolls[0]?.poll || null;

            // Додаємо дані для відображення (залежно від типу опитування)
            if (popularPoll) {
                if (['single_choice', 'multiple_choice'].includes(popularPoll.type)) {
                    popularPoll.options = await Poll.getPollOptions(popularPoll.id);
                    // Додаємо масив votes до кожного option
                    for (let option of popularPoll.options) {
                        const optionVotes = votes
                            .filter((vote) => vote.option_id === option.id)
                            .map((vote) => ({
                                user_id: vote.user_id,
                                voted_at: vote.voted_at
                            }));
                        option.votes = optionVotes;
                        option.vote_count = optionVotes.length; // Обчислюємо кількість голосів
                    }
                } else if (popularPoll.type === 'text_response') {
                    popularPoll.responses = textResponses
                        .filter((response) => response.poll_id === popularPoll.id)
                        .map((response) => ({ response_text: response.response_text }));
                } else if (popularPoll.type === 'rating_scale') {
                    popularPoll.responses = ratingResponses
                        .filter((response) => response.poll_id === popularPoll.id)
                        .map((response) => ({ rating: response.rating }));
                }
            }
        }

        res.json({
            activePolls: activePollsCount,
            totalParticipants,
            votesToday: totalResponsesToday,
            newUsersToday,
            weeklyActivity,
            newUsers,
            newPolls,
            popularPoll
        });
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання статистики', error: err.message });
    }
});

router.post('/polls/:pollId/close', authConfig.verifyAdmin, async (req, res) => {
    try {
        const { pollId } = req.params;
        await Poll.updatePollStatus(pollId, 'closed');
        res.json({ message: 'Опитування закрито' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка закриття опитування', error: err.message });
    }
});

router.delete('/polls/:pollId', authConfig.verifyAdmin, async (req, res) => {
    try {
        const { pollId } = req.params;
        await Poll.deletePoll(pollId);
        res.json({ message: 'Опитування видалено' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка видалення опитування', error: err.message });
    }
});

router.post('/polls/:pollId/approve', authConfig.verifyAdmin, async (req, res) => {
    try {
        const { pollId } = req.params;
        await Poll.updatePollStatus(pollId, 'active');
        await Poll.recordModeration(pollId, req.user.id, 'approved', 'Опитування схвалено');
        res.json({ message: 'Опитування схвалено' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка схвалення опитування', error: err.message });
    }
});

router.post('/polls/:pollId/reject', authConfig.verifyAdmin, async (req, res) => {
    try {
        const { pollId } = req.params;
        const { comment } = req.body;
        if (!comment) {
            return res.status(400).json({ message: 'Необхідно вказати причину відхилення' });
        }
        await Poll.updatePollStatus(pollId, 'closed');
        await Poll.recordModeration(pollId, req.user.id, 'rejected', comment);
        res.json({ message: 'Опитування відхилено' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка відхилення опитування', error: err.message });
    }
});

module.exports = router;