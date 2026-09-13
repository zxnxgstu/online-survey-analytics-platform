const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

exports.createPoll = async (req, res) => {
    const { title, description, type, categoryId, options, isPublic } = req.body;
    const createdBy = req.user.id;
    const userRole = req.user.role;

    try {
        if (userRole !== 'admin' && userRole !== 'advanced') {
            return res.status(403).json({ message: 'Недостатньо прав для створення опитування' });
        }
        if (!title || !type || !categoryId) {
            return res.status(400).json({ message: 'Назва, тип і категорія обов’язкові' });
        }
        if (!['single_choice', 'multiple_choice', 'text_response', 'rating_scale'].includes(type)) {
            return res.status(400).json({ message: 'Недійсний тип опитування' });
        }
        if (['single_choice', 'multiple_choice'].includes(type) && (!options || options.length < 2)) {
            return res.status(400).json({ message: 'Потрібно щонайменше 2 варіанти відповідей' });
        }

        const pollResult = await Poll.createPoll(title, description, type, createdBy, categoryId, isPublic);
        const pollId = pollResult.insertId;

        if (type === 'single_choice' || type === 'multiple_choice') {
            await Poll.addPollOptions(pollId, options);
        }

        const poll = await Poll.getPollById(pollId);
        res.status(201).json(poll);
    } catch (err) {
        res.status(500).json({ message: 'Помилка створення опитування', error: err.message });
    }
};

exports.updatePoll = async (req, res) => {
    const { pollId } = req.params;
    const { title, description, type, categoryId, isPublic, isActive } = req.body;
    const userId = req.user.id;

    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        if (poll.created_by !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Недостатньо прав' });
        }

        if (!title || !categoryId) {
            return res.status(400).json({ message: 'Назва і категорія обов’язкові' });
        }
        if (!['single_choice', 'multiple_choice', 'text_response', 'rating_scale'].includes(type)) {
            return res.status(400).json({ message: 'Недійсний тип опитування' });
        }

        await Poll.updatePoll(pollId, title, description, type, categoryId, isPublic, isActive);
        const updatedPoll = await Poll.getPollById(pollId);
        res.json(updatedPoll);
    } catch (err) {
        res.status(500).json({ message: 'Помилка оновлення опитування', error: err.message });
    }
};

exports.getAllPolls = async (req, res) => {
    const { sort, limit } = req.query;

    try {
        if (sort === 'popular') {
            const polls = await Poll.getPopularPolls(parseInt(limit) || 4);
            return res.json(polls);
        }
        const polls = await Poll.getPolls();
        res.json(polls);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання опитувань', error: err.message });
    }
};

exports.getUserPolls = async (req, res) => {
    const userId = req.user ? req.user.id : null;

    try {
        const polls = await Poll.getPollsByUser(userId);
        res.json(polls);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання опитувань', error: err.message });
    }
};

exports.getPollDetails = async (req, res) => {
    const { pollId } = req.params;
    const userId = req.user ? req.user.id : null;

    try {
        // Отримуємо опитування
        const poll = await Poll.getPollById(pollId);
        if (!poll) {
            return res.status(404).json({ message: 'Опитування не знайдено' });
        }

        // Ініціалізуємо змінні для голосів і перевірки голосування користувачем
        let votes = null;
        let userVoted = false;
        let userVoteIds = [];  // Змінна для збереження ID варіантів, за які проголосував користувач

        // Обробка голосів залежно від типу опитування
        switch (poll.type) {
            case 'single_choice':
            case 'multiple_choice':
                votes = await Vote.getPollVotes(pollId);
                break;
            case 'text_response':
                votes = await Vote.getPollTextResponses(pollId);
                break;
            case 'rating_scale':
                votes = await Vote.getPollRatingResponses(pollId);
                break;
            default:
                return res.status(400).json({ message: 'Невідомий тип опитування' });
        }

        // Перевіряємо, чи голосував користувач
        if (votes) {
            userVoted = votes.some(vote => vote.user_id === userId);

            // Якщо користувач проголосував, додаємо ID варіантів
            if (userVoted) {
                switch (poll.type) {
                    case 'single_choice':
                    case 'multiple_choice':
                        userVoteIds = votes
                            .filter(vote => vote.user_id === userId)
                            .map(vote => vote.option_id);
                        break;
                    case 'text_response':
                        userVoteIds = votes
                            .filter(vote => vote.user_id === userId)
                            .map(vote => vote.response_text); // Для текстових відповідей зберігаємо текст
                        break;
                    case 'rating_scale':
                        userVoteIds = votes
                            .filter(vote => vote.user_id === userId)
                            .map(vote => vote.rating); // Для рейтингів зберігаємо значення рейтингу
                        break;
                    default:
                        break;
                }
            }
        }

        // Отримуємо варіанти опитування для відповідних типів
        if (['single_choice', 'multiple_choice'].includes(poll.type)) {
            poll.options = await Poll.getPollOptions(pollId);
        }

        // Додаємо інформацію про те, чи голосував користувач та ID варіантів, за які він проголосував
        poll.user_voted = userVoted;
        poll.user_vote_ids = userVoteIds;

        res.json({ poll });

    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання опитування', error: err.message });
    }
};



exports.getPollResults = async (req, res) => {
    const { pollId } = req.params;
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : null;

    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });

        const is_creator = poll.created_by === userId;
        const is_admin = userRole === 'admin';
        if(!is_creator && !is_admin) return res.status(403).json({ message: 'У вас немає прав на перегляд результатів' });

        let votes = null;
        if (poll.type === 'single_choice' || poll.type === 'multiple_choice') {
            votes = await Vote.getPollVotes(pollId, userId, is_creator);
        } else if (poll.type === 'text_response') {
            votes = await Vote.getPollTextResponses(pollId, userId, is_creator)
        } else if (poll.type === 'rating_scale') {
            votes = await Vote.getPollRatingResponses(pollId, userId, is_creator)
        }

        res.json({results: votes });

    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання опитування', error: err.message });
    }
};

exports.getPollStatus = async (req, res) => {
    const { pollId } = req.params;
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : null;

    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });

        const is_creator = poll.created_by === userId;
        const is_admin = userRole === 'admin';
        if(!is_creator && !is_admin) return res.status(403).json({ message: 'У вас немає прав на перегляд статусу опитування' });

       const moderation = await Poll.getPollModeration(pollId);

        res.json({status: moderation });

    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання опитування', error: err.message });
    }
};

exports.deletePoll = async (req, res) => {
    const { pollId } = req.params;

    try {
        console.log(pollId);
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });

        await Vote.deleteVotesByPoll(pollId);
        await Poll.deletePollOptions(pollId);
        await Vote.deleteTextResponses(pollId);
        await Vote.deleteRatingResponses(pollId);
        await Poll.deletePollModerations(pollId);

        await Poll.deletePoll(pollId);
        res.json({ message: 'Опитування видалено успішно' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка видалення опитування', error: err.message });
    }
};

exports.moderatePoll = async (req, res) => {
    const { pollId } = req.params;
    const { action, comment } = req.body;
    const adminId = req.user.id;

    try {
        if (!['approved', 'rejected', 'edited'].includes(action)) {
            return res.status(400).json({ message: 'Недійсна дія модерації' });
        }
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });

        await Poll.moderatePoll(pollId, adminId, action, comment);
        if (action === 'rejected') {
            await Poll.closePoll(pollId);
        }
        res.json({ message: `Опитування успішно ${action}` });
    } catch (err) {
        res.status(500).json({ message: 'Помилка модерації опитування', error: err.message });
    }
};

exports.submitVote = async (req, res) => {
    const { pollId } = req.params;
    const { optionId, text_response, rating } = req.body;
    const userId = req.user.id;

    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        console.log("Poll_type = " + (poll.type))
        let results = {};
        if (poll.type === 'single_choice') {
            if (!optionId) return res.status(400).json({ message: 'Необхідно вказати варіант відповіді' });
            await Vote.addVote(pollId, optionId, userId);
            results.votes = await Vote.getPollVotes(pollId);
        } else if (poll.type === 'multiple_choice') {
            if (!optionId || !Array.isArray(optionId)) return res.status(400).json({ message: 'Необхідно вказати варіанти відповідей' });
            if(optionId.length === 0) return res.status(400).json({ message: 'Необхідно вказати хоча б один варіант відповіді' });
            for (let opt of optionId) {
                await Vote.addVote(pollId, opt, userId);
            }
            results.votes = await Vote.getPollVotes(pollId);
        } else if (poll.type === 'text_response') {
            if (!text_response) return res.status(400).json({ message: 'Необхідно вказати текстову відповідь' });
            await Vote.addTextResponse(pollId, userId, text_response);
            results.responses = await Vote.getPollTextResponses(pollId);
        } else if (poll.type === 'rating_scale') {
            console.log("Rating")
            if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Недійсний рейтинг' });
            await Vote.addRatingResponse(pollId, userId, rating);
            results.ratings = await Vote.getPollRatingResponses(pollId);
        }

        res.json({ message: 'Голос успішно зареєстровано' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка голосування', error: err.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Poll.getCategories();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання категорій', error: err.message });
    }
};


exports.closePoll = async (req, res) => {
    const { pollId } = req.params;
    const userId = req.user.id;
    try {
        const poll = await Poll.getPollById(pollId);
        if (!poll) return res.status(404).json({ message: 'Опитування не знайдено' });
        if (poll.created_by !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Недостатньо прав' });
        }
        if (poll.status === 'closed') {
            return res.status(400).json({ message: 'Опитування вже закрите' });
        }

        await Poll.closePoll(pollId);
        res.json({ message: 'Опитування успішно закрите' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка закриття опитування', error: err.message });
    }
};