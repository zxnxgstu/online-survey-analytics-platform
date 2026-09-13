const {db} = require('../config/dbConfig');

const Vote = {
    addVote: (pollId, optionId, userId) => {
        return new Promise((resolve, reject) => {
            db.query(
                'INSERT INTO votes (poll_id, option_id, user_id, voted_at) VALUES (?, ?, ?, NOW())',
                [pollId, optionId, userId],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });
    },

    addTextResponse: (pollId, userId, responseText) => {
        return new Promise((resolve, reject) => {
            db.query(
                'INSERT INTO text_responses (poll_id, user_id, response_text, created_at) VALUES (?, ?, ?, NOW())',
                [pollId, userId, responseText],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });
    },

    addRatingResponse: (pollId, userId, rating) => {
        return new Promise((resolve, reject) => {
            db.query(
                'INSERT INTO rating_responses (poll_id, user_id, rating, created_at) VALUES (?, ?, ?, NOW())',
                [pollId, userId, rating],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });
    },

    getPollVotes: (pollId) => {
        return new Promise((resolve, reject) => {
            let query = 'SELECT v.option_id, v.user_id, u.username FROM votes v inner join users u on u.id = v.user_id WHERE poll_id = ?';

            db.query(query, [pollId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },


    getPollTextResponses: (pollId) => {
        return new Promise((resolve, reject) => {
            let query = 'SELECT r.response_text, r.user_id, u.username FROM text_responses r inner join users u on u.id = r.user_id WHERE poll_id = ?';

            db.query(query, [pollId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },


    getPollRatingResponses: (pollId) => {
        return new Promise((resolve, reject) => {
            let query = 'SELECT r.rating, r.user_id, u.username FROM rating_responses r inner join users u on u.id = r.user_id WHERE poll_id = ?';

            db.query(query, [pollId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    deleteVotesByPoll: (pollId) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM votes WHERE poll_id = ?', [pollId], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    },

    deleteTextResponses : (pollId) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM text_responses WHERE poll_id = ?', [pollId], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    },

    deleteRatingResponses : (pollId) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM rating_responses WHERE poll_id = ?', [pollId], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    },

    getAllVotes : () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM votes', [], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    getAllRatingResponses : () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM rating_responses', [], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    getAllTextResponses : () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM text_responses', [], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },
};

module.exports = Vote;