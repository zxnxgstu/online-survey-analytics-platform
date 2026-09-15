const { db } = require('../config/dbConfig');

const pquery = (sql, params = []) => db.promise().query(sql, params).then(([rows]) => rows);

const Vote = {
    addVote: async (pollId, optionId, userId) => {
        const [result] = await db.promise().query(
            'INSERT INTO votes (poll_id, option_id, user_id, voted_at) VALUES (?, ?, ?, NOW())',
            [pollId, optionId, userId]
        );
        return result;
    },

    addVotes: async (pollId, optionIds, userId) => {
        const connection = await db.promise().getConnection();
        try {
            await connection.beginTransaction();
            for (const optionId of optionIds) {
                await connection.query(
                    'INSERT INTO votes (poll_id, option_id, user_id, voted_at) VALUES (?, ?, ?, NOW())',
                    [pollId, optionId, userId]
                );
            }
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },

    addTextResponse: async (pollId, userId, responseText) => {
        const [result] = await db.promise().query(
            'INSERT INTO text_responses (poll_id, user_id, response_text, created_at) VALUES (?, ?, ?, NOW())',
            [pollId, userId, responseText]
        );
        return result;
    },

    addRatingResponse: async (pollId, userId, rating) => {
        const [result] = await db.promise().query(
            'INSERT INTO rating_responses (poll_id, user_id, rating, created_at) VALUES (?, ?, ?, NOW())',
            [pollId, userId, rating]
        );
        return result;
    },

    getPollVotes: (pollId) => pquery(`
        SELECT v.option_id, v.user_id, v.voted_at, u.username
        FROM votes v
        INNER JOIN users u ON u.id = v.user_id
        WHERE v.poll_id = ?
        ORDER BY v.voted_at ASC
    `, [pollId]),

    getPollTextResponses: (pollId) => pquery(`
        SELECT r.response_text, r.user_id, r.created_at, u.username
        FROM text_responses r
        INNER JOIN users u ON u.id = r.user_id
        WHERE r.poll_id = ?
        ORDER BY r.created_at ASC
    `, [pollId]),

    getPollRatingResponses: (pollId) => pquery(`
        SELECT r.rating, r.user_id, r.created_at, u.username
        FROM rating_responses r
        INNER JOIN users u ON u.id = r.user_id
        WHERE r.poll_id = ?
        ORDER BY r.created_at ASC
    `, [pollId]),

    hasUserResponded: async (pollId, userId, type) => {
        let table = 'votes';
        if (type === 'text_response') table = 'text_responses';
        if (type === 'rating_scale') table = 'rating_responses';
        const rows = await pquery(`SELECT 1 AS found FROM ?? WHERE poll_id = ? AND user_id = ? LIMIT 1`, [table, pollId, userId]);
        return rows.length > 0;
    },

    deleteVotesByPoll: async (pollId) => {
        const [result] = await db.promise().query('DELETE FROM votes WHERE poll_id = ?', [pollId]);
        return result;
    },
    deleteTextResponses: async (pollId) => {
        const [result] = await db.promise().query('DELETE FROM text_responses WHERE poll_id = ?', [pollId]);
        return result;
    },
    deleteRatingResponses: async (pollId) => {
        const [result] = await db.promise().query('DELETE FROM rating_responses WHERE poll_id = ?', [pollId]);
        return result;
    },

    getAllVotes: () => pquery('SELECT * FROM votes ORDER BY voted_at DESC'),
    getAllRatingResponses: () => pquery('SELECT * FROM rating_responses ORDER BY created_at DESC'),
    getAllTextResponses: () => pquery('SELECT * FROM text_responses ORDER BY created_at DESC'),
};

module.exports = Vote;
