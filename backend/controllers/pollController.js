const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

const POLL_TYPES = new Set(['single_choice', 'multiple_choice', 'text_response', 'rating_scale']);
const boolValue = (value, fallback = false) => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const normalizedOptions = (options) => Array.isArray(options)
    ? [...new Set(options.map((x) => String(x || '').trim()).filter(Boolean))]
    : [];

exports.createPoll = async (req, res) => {
    const createdBy = Number(req.user.id);
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const type = req.body.type;
    const categoryId = Number(req.body.categoryId);
    const options = normalizedOptions(req.body.options);
    const isPublic = boolValue(req.body.isPublic, true);

    try {
        if (!['admin', 'advanced'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Недостатньо прав для створення опитування' });
        }
        if (!title || title.length > 255) {
            return res.status(400).json({ message: 'Назва опитування обов’язкова і має містити до 255 символів' });
        }
        if (!POLL_TYPES.has(type)) {
            return res.status(400).json({ message: 'Недійсний тип опитування' });
        }
        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({ message: 'Виберіть категорію' });
        }
        if (['single_choice', 'multiple_choice'].includes(type) && options.length < 2) {
            return res.status(400).json({ message: 'Потрібно щонайменше 2 різні варіанти відповідей' });
        }

        const pollResult = await Poll.createPoll(title, description, type, createdBy, categoryId, isPublic);
        const pollId = pollResult.insertId;
        if (['single_choice', 'multiple_choice'].includes(type)) {
            await Poll.addPollOptions(pollId, options);
        }

        return res.status(201).json(await Poll.getPollById(pollId));
    } catch (err) {
        console.error('Create poll error:', err);
        return res.status(500).json({ message: 'Помилка створення опитування', error: err.message });
    }
};

exports.updatePoll = async (req, res) => {
    const pollId = Number(req.params.pollId);
    const userId = Number(req.user.id);

    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        if (Number(poll.created_by) !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Недостатньо прав' });
        }

        const title = String(req.body.title ?? poll.title).trim();
        const description = String(req.body.description ?? poll.description ?? '').trim();
        const type = req.body.type ?? poll.type;
        const categoryId = Number(req.body.categoryId ?? poll.category_id);
        const isPublic = boolValue(req.body.isPublic, Boolean(poll.is_public));
        const isActive = req.body.isActive === undefined
            ? undefined
            : boolValue(req.body.isActive, Boolean(poll.is_active));

        if (!title || title.length > 255) {
            return res.status(400).json({ message: 'Назва опитування обов’язкова і має містити до 255 символів' });
        }
        if (!POLL_TYPES.has(type)) {
            return res.status(400).json({ message: 'Недійсний тип опитування' });
        }
        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({ message: 'Виберіть категорію' });
        }

        // Poll type cannot be changed after responses exist; the UI already disables it.
        if (type !== poll.type) {
            return res.status(400).json({ message: 'Тип існуючого опитування змінювати не можна' });
        }

        await Poll.updatePoll(pollId, title, description, type, categoryId, isPublic, isActive);
        return res.json(await Poll.getPollById(pollId));
    } catch (err) {
        console.error('Update poll error:', err);
        return res.status(500).json({ message: 'Помилка оновлення опитування', error: err.message });
    }
};

exports.getAllPolls = async (req, res) => {
    try {
        if (req.query.sort === 'popular') {
            return res.json(await Poll.getPopularPolls(req.query.limit));
        }
        return res.json(await Poll.getPolls());
    } catch (err) {
        console.error('Get public polls error:', err);
        return res.status(500).json({ message: 'Помилка отримання опитувань', error: err.message });
    }
};

exports.getUserPolls = async (req, res) => {
    try {
        return res.json(await Poll.getPollsByUser(req.user.id));
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання опитувань', error: err.message });
    }
};

exports.getPollDetails = async (req, res) => {
    const pollId = Number(req.params.pollId);
    const userId = Number(req.user.id);

    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });

        const isOwner = Number(poll.created_by) === userId;
        const isAdmin = req.user.role === 'admin';
        const availableToParticipant = Boolean(poll.is_active) && poll.status === 'active';
        if (!availableToParticipant && !isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Опитування наразі недоступне' });
        }

        let responses = [];
        if (['single_choice', 'multiple_choice'].includes(poll.type)) {
            responses = await Vote.getPollVotes(pollId);
            poll.options = await Poll.getPollOptions(pollId);
        } else if (poll.type === 'text_response') {
            responses = await Vote.getPollTextResponses(pollId);
        } else if (poll.type === 'rating_scale') {
            responses = await Vote.getPollRatingResponses(pollId);
        } else {
            return res.status(400).json({ message: 'Невідомий тип опитування' });
        }

        const mine = responses.filter((response) => Number(response.user_id) === userId);
        poll.user_voted = mine.length > 0;
        if (['single_choice', 'multiple_choice'].includes(poll.type)) {
            poll.user_vote_ids = mine.map((response) => response.option_id);
        } else if (poll.type === 'text_response') {
            poll.user_vote_ids = mine.map((response) => response.response_text);
        } else {
            poll.user_vote_ids = mine.map((response) => response.rating);
        }

        return res.json({ poll });
    } catch (err) {
        console.error('Get poll error:', err);
        return res.status(500).json({ message: 'Помилка отримання опитування', error: err.message });
    }
};

exports.getPollResults = async (req, res) => {
    const pollId = Number(req.params.pollId);
    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });

        const isOwner = Number(poll.created_by) === Number(req.user.id);
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'У вас немає прав на перегляд результатів' });
        }

        let results = [];
        if (['single_choice', 'multiple_choice'].includes(poll.type)) {
            results = await Vote.getPollVotes(pollId);
        } else if (poll.type === 'text_response') {
            results = await Vote.getPollTextResponses(pollId);
        } else if (poll.type === 'rating_scale') {
            results = await Vote.getPollRatingResponses(pollId);
        }
        return res.json({ results });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання результатів', error: err.message });
    }
};

exports.getPollStatus = async (req, res) => {
    const pollId = Number(req.params.pollId);
    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        const isOwner = Number(poll.created_by) === Number(req.user.id);
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'У вас немає прав на перегляд статусу опитування' });
        }
        return res.json({ status: await Poll.getPollModeration(pollId) });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання статусу опитування', error: err.message });
    }
};

exports.deletePoll = async (req, res) => {
    const pollId = Number(req.params.pollId);
    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        if (Number(poll.created_by) !== Number(req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Недостатньо прав' });
        }
        // Foreign keys use ON DELETE CASCADE; deleting the poll is sufficient.
        await Poll.deletePoll(pollId);
        return res.json({ message: 'Опитування видалено успішно' });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка видалення опитування', error: err.message });
    }
};

exports.moderatePoll = async (req, res) => {
    const pollId = Number(req.params.pollId);
    const { action } = req.body;
    const comment = String(req.body.comment || '').trim();

    try {
        if (!['approved', 'rejected'].includes(action)) {
            return res.status(400).json({ message: 'Недійсна дія модерації' });
        }
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        if (action === 'rejected' && !comment) {
            return res.status(400).json({ message: 'Необхідно вказати причину відхилення' });
        }

        await Poll.recordModeration(pollId, req.user.id, action, comment);
        await Poll.updatePollStatus(pollId, action === 'approved' ? 'active' : 'closed');
        return res.json({ message: action === 'approved' ? 'Опитування схвалено' : 'Опитування відхилено' });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка модерації опитування', error: err.message });
    }
};

exports.submitVote = async (req, res) => {
    const pollId = Number(req.params.pollId);
    const userId = Number(req.user.id);

    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        if (poll.status !== 'active' || !Boolean(poll.is_active)) {
            return res.status(400).json({ message: 'Опитування неактивне або закрите' });
        }
        if (await Vote.hasUserResponded(pollId, userId, poll.type)) {
            return res.status(409).json({ message: 'Ви вже відповіли на це опитування' });
        }

        if (poll.type === 'single_choice') {
            const optionId = Number(req.body.optionId);
            const validOptions = await Poll.getPollOptions(pollId);
            if (!validOptions.some((option) => Number(option.id) === optionId)) {
                return res.status(400).json({ message: 'Недійсний варіант відповіді' });
            }
            await Vote.addVote(pollId, optionId, userId);
        } else if (poll.type === 'multiple_choice') {
            const optionIds = Array.isArray(req.body.optionId)
                ? [...new Set(req.body.optionId.map(Number).filter(Number.isInteger))]
                : [];
            if (optionIds.length === 0) {
                return res.status(400).json({ message: 'Необхідно вказати хоча б один варіант відповіді' });
            }
            const validOptions = await Poll.getPollOptions(pollId);
            const allowed = new Set(validOptions.map((option) => Number(option.id)));
            if (optionIds.some((id) => !allowed.has(id))) {
                return res.status(400).json({ message: 'Один або кілька варіантів відповіді недійсні' });
            }
            await Vote.addVotes(pollId, optionIds, userId);
        } else if (poll.type === 'text_response') {
            const text = String(req.body.text_response || '').trim();
            if (!text) return res.status(400).json({ message: 'Необхідно вказати текстову відповідь' });
            await Vote.addTextResponse(pollId, userId, text);
        } else if (poll.type === 'rating_scale') {
            const rating = Number(req.body.rating);
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Недійсний рейтинг' });
            }
            await Vote.addRatingResponse(pollId, userId, rating);
        } else {
            return res.status(400).json({ message: 'Невідомий тип опитування' });
        }

        const canViewResults = Number(poll.created_by) === userId || req.user.role === 'admin';
        if (!canViewResults) {
            return res.json({ message: 'Голос успішно зареєстровано' });
        }

        let results = [];
        if (['single_choice', 'multiple_choice'].includes(poll.type)) {
            results = await Vote.getPollVotes(pollId);
        } else if (poll.type === 'text_response') {
            results = await Vote.getPollTextResponses(pollId);
        } else if (poll.type === 'rating_scale') {
            results = await Vote.getPollRatingResponses(pollId);
        }
        return res.json({ message: 'Голос успішно зареєстровано', results });
    } catch (err) {
        if (err?.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ви вже відповіли на це опитування' });
        }
        console.error('Vote error:', err);
        return res.status(500).json({ message: 'Помилка голосування', error: err.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        await Poll.ensureDefaultCategories();
        return res.json(await Poll.getCategories());
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання категорій', error: err.message });
    }
};

exports.closePoll = async (req, res) => {
    const pollId = Number(req.params.pollId);
    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        if (Number(poll.created_by) !== Number(req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Недостатньо прав' });
        }
        if (poll.status === 'closed') {
            return res.status(400).json({ message: 'Опитування вже закрите' });
        }
        await Poll.closePoll(pollId);
        return res.json({ message: 'Опитування успішно закрите' });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка закриття опитування', error: err.message });
    }
};
