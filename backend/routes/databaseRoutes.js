const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const authConfig = require('../config/authConfig');
const User = require('../models/User');
const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

router.use(authConfig.verifyAdmin);

router.get('/db-stats', databaseController.getDbStats);
router.post('/sql-query', databaseController.executeSqlQuery);

router.get('/users', async (req, res) => {
    try {
        return res.json(await User.getAllUsers());
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання користувачів', error: err.message });
    }
});

router.get('/polls', async (req, res) => {
    try {
        const { status, search } = req.query;
        let polls = await Poll.getAllPolls();

        if (status) polls = polls.filter((poll) => poll.status === status);
        if (search) {
            const q = String(search).toLowerCase();
            polls = polls.filter((poll) => [poll.title, poll.owner_username, poll.category_name]
                .some((value) => String(value || '').toLowerCase().includes(q)));
        }

        for (const poll of polls) {
            if (['single_choice', 'multiple_choice'].includes(poll.type)) {
                poll.options = await Poll.getPollOptions(poll.id);
            }
        }
        return res.json(polls);
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання опитувань', error: err.message });
    }
});

router.get('/votes', async (req, res) => {
    try { return res.json(await Vote.getAllVotes()); }
    catch (err) { return res.status(500).json({ message: 'Помилка отримання голосів', error: err.message }); }
});

router.get('/categories', async (req, res) => {
    try { return res.json(await Poll.getCategories()); }
    catch (err) { return res.status(500).json({ message: 'Помилка отримання категорій', error: err.message }); }
});

router.get('/poll_options', async (req, res) => {
    try { return res.json(await Poll.getAllPollOptions()); }
    catch (err) { return res.status(500).json({ message: 'Помилка отримання варіантів опитувань', error: err.message }); }
});

router.get('/rating_responses', async (req, res) => {
    try { return res.json(await Vote.getAllRatingResponses()); }
    catch (err) { return res.status(500).json({ message: 'Помилка отримання рейтингових відповідей', error: err.message }); }
});

router.get('/text_responses', async (req, res) => {
    try { return res.json(await Vote.getAllTextResponses()); }
    catch (err) { return res.status(500).json({ message: 'Помилка отримання текстових відповідей', error: err.message }); }
});

router.get('/poll_moderation', async (req, res) => {
    try { return res.json(await Poll.getAllPollModerations()); }
    catch (err) { return res.status(500).json({ message: 'Помилка отримання модерації опитувань', error: err.message }); }
});

router.get('/stats', async (req, res) => {
    try {
        const [polls, votes, textResponses, ratingResponses, users] = await Promise.all([
            Poll.getAllPolls(), Vote.getAllVotes(), Vote.getAllTextResponses(), Vote.getAllRatingResponses(), User.getAllUsers()
        ]);
        const locale = String(req.headers['accept-language'] || '').toLowerCase().startsWith('en') ? 'en-US' : 'uk-UA';
        const dayKey = (date) => new Date(date).toISOString().split('T')[0];
        const today = dayKey(new Date());

        const activePolls = polls.filter((poll) => poll.status === 'active');
        const participantIds = new Set([
            ...votes.map((x) => x.user_id), ...textResponses.map((x) => x.user_id), ...ratingResponses.map((x) => x.user_id)
        ]);
        const allResponses = [
            ...votes.map((x) => ({ poll_id: x.poll_id, date: x.voted_at })),
            ...textResponses.map((x) => ({ poll_id: x.poll_id, date: x.created_at })),
            ...ratingResponses.map((x) => ({ poll_id: x.poll_id, date: x.created_at })),
        ];

        const weeklyActivity = [];
        const newUsers = [];
        const newPolls = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - i);
            const key = dayKey(date);
            const label = date.toLocaleDateString(locale, { weekday: 'short' });
            weeklyActivity.push({
                day: label,
                polls: polls.filter((poll) => dayKey(poll.created_at) === key).length,
                votes: allResponses.filter((response) => dayKey(response.date) === key).length,
            });
            newUsers.push({ day: label, users: users.filter((user) => dayKey(user.created_at) === key).length });
            newPolls.push({ day: label, polls: polls.filter((poll) => dayKey(poll.created_at) === key).length });
        }

        let popularPoll = null;
        if (activePolls.length) {
            const counts = activePolls.map((poll) => ({
                poll,
                responseCount: allResponses.filter((response) => Number(response.poll_id) === Number(poll.id)).length,
            })).sort((a, b) => b.responseCount - a.responseCount);
            popularPoll = { ...counts[0].poll };
            if (['single_choice', 'multiple_choice'].includes(popularPoll.type)) {
                popularPoll.options = await Poll.getPollOptions(popularPoll.id);
                popularPoll.options = popularPoll.options.map((option) => ({
                    ...option,
                    votes: votes.filter((vote) => Number(vote.option_id) === Number(option.id)),
                    vote_count: votes.filter((vote) => Number(vote.option_id) === Number(option.id)).length,
                }));
            } else if (popularPoll.type === 'text_response') {
                popularPoll.responses = textResponses.filter((x) => Number(x.poll_id) === Number(popularPoll.id));
            } else if (popularPoll.type === 'rating_scale') {
                popularPoll.responses = ratingResponses.filter((x) => Number(x.poll_id) === Number(popularPoll.id));
            }
        }

        return res.json({
            activePolls: activePolls.length,
            totalParticipants: participantIds.size,
            votesToday: allResponses.filter((response) => dayKey(response.date) === today).length,
            newUsersToday: users.filter((user) => dayKey(user.created_at) === today).length,
            weeklyActivity,
            newUsers,
            newPolls,
            popularPoll,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання статистики', error: err.message });
    }
});

router.post('/polls/:pollId/close', async (req, res) => {
    try {
        const poll = await Poll.getPollById(req.params.pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        await Poll.updatePollStatus(req.params.pollId, 'closed');
        return res.json({ message: 'Опитування закрито' });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка закриття опитування', error: err.message });
    }
});

router.delete('/polls/:pollId', async (req, res) => {
    try {
        const poll = await Poll.getPollById(req.params.pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        await Poll.deletePoll(req.params.pollId);
        return res.json({ message: 'Опитування видалено' });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка видалення опитування', error: err.message });
    }
});

router.post('/polls/:pollId/approve', async (req, res) => {
    try {
        const poll = await Poll.getPollById(req.params.pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        await Poll.updatePollStatus(req.params.pollId, 'active');
        await Poll.recordModeration(req.params.pollId, req.user.id, 'approved', 'Опитування схвалено');
        return res.json({ message: 'Опитування схвалено' });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка схвалення опитування', error: err.message });
    }
});

router.post('/polls/:pollId/reject', async (req, res) => {
    try {
        const poll = await Poll.getPollById(req.params.pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        const comment = String(req.body.comment || '').trim();
        if (!comment) return res.status(400).json({ message: 'Необхідно вказати причину відхилення' });
        await Poll.updatePollStatus(req.params.pollId, 'closed');
        await Poll.recordModeration(req.params.pollId, req.user.id, 'rejected', comment);
        return res.json({ message: 'Опитування відхилено' });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка відхилення опитування', error: err.message });
    }
});

module.exports = router;
