const {db} = require('../config/dbConfig');

const Poll = {
    createPoll: (title, description, type, createdBy, categoryId, isPublic) => {
        return new Promise((resolve, reject) => {
            db.query(
                'INSERT INTO polls (title, description, type, created_by, category_id, is_public, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
                [title, description || null, type, createdBy, categoryId, isPublic, 'preparation'],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });
    },

    addPollOptions: (pollId, options) => {
        return new Promise((resolve, reject) => {
            const optionValues = options.map((option) => [pollId, option]);
            db.query('INSERT INTO poll_options (poll_id, option_text) VALUES ?', [optionValues], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    },

    getPollById: (pollId) => {
        return new Promise((resolve, reject) => {
            db.query(
                `
                SELECT p.*, c.name AS category_name, u.username AS creator_username
                FROM polls p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON p.created_by = u.id
                WHERE p.id = ?
                `,
                [pollId],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results[0]);
                }
            );
        });
    },

    getPollsByUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.query(
                `
                SELECT p.*, c.name AS category_name
                FROM polls p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.created_by = ?
                `,
                [userId],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
    },

    getPolls: () => {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT p.*, c.name AS category_name, u.username as creator_username,
                       (SELECT COUNT(*) FROM votes v WHERE v.poll_id = p.id) AS participants
                FROM polls p
                LEFT JOIN categories c ON p.category_id = c.id
                INNER JOIN users u ON u.id = created_by
                WHERE p.is_public = 1 AND p.is_active = 1 AND status = "active"
            `;

            db.query(query, [], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    getPopularPolls: (limit) => {
        return new Promise((resolve, reject) => {
            db.query(
                `
                SELECT p.*, c.name AS category_name, u.username as creator_username, 
                       (SELECT COUNT(*) FROM votes v WHERE v.poll_id = p.id) AS participants
                FROM polls p
                LEFT JOIN categories c ON p.category_id = c.id
                INNER JOIN users u ON u.id = created_by
                WHERE p.is_public = 1 AND p.is_active = 1 AND status = "active"
                ORDER BY participants DESC
                LIMIT ?
                `,
                [limit],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
    },

    updatePoll: (pollId, title, description, type, categoryId, isPublic, isActive) => {
        return new Promise((resolve, reject) => {
            if(isActive) {
                db.query(
                    'UPDATE polls SET title = ?, description = ?, type = ?, category_id = ?, is_public = ?, is_active = ? WHERE id = ?',
                    [title, description || null, type, categoryId, isPublic, isActive, pollId],
                    (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    }
                );
            }else {
                db.query(
                    'UPDATE polls SET title = ?, description = ?, type = ?, category_id = ?, is_public = ? WHERE id = ?',
                    [title, description || null, type, categoryId, isPublic, pollId],
                    (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    }
                );
            }
        });
    },

    closePoll: (pollId) => {
        return new Promise((resolve, reject) => {
            db.query(
                'UPDATE polls SET status = "?" WHERE id = ?',
                ['closed', pollId],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });
    },

    deletePoll: (pollId) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM polls WHERE id = ?', [pollId], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    },

    moderatePoll: (pollId, adminId, action, comment) => {
        return new Promise((resolve, reject) => {
            db.query(
                'INSERT INTO poll_moderation (poll_id, admin_id, action, comment, moderated_at) VALUES (?, ?, ?, ?, NOW())',
                [pollId, adminId, action, comment],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });
    },

    getPollModeration : (pollId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT m.poll_id, m.admin_id, u.id, m.action, m.comment FROM poll_moderation m inner join users u on u.id = m.admin_id WHERE poll_id = ? ORDER BY m.created_at DESC LIMIT 1', [pollId], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        })
    },

    getPollOptions: (pollId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT id, option_text FROM poll_options WHERE poll_id = ?', [pollId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    getCategories: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM categories', (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    deletePollOptions : (pollId) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM poll_options WHERE poll_id = ?', [pollId], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        })
    },

    deletePollModerations : (pollId) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM poll_moderation WHERE poll_id = ?', [pollId], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        })
    },

    getPollOptionsStats : (pollId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT id, option_text, option_order, COALESCE(SUM(v.option_id = po.id), 0) AS vote_count ' +
                'FROM poll_options po ' +
                'LEFT JOIN votes v ON po.id = v.option_id ' +
                'WHERE po.poll_id = ? ' +
                'GROUP BY po.id, po.option_text, po.option_order',
                [pollId], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        })
    },

    recordModeration : (pollId, adminId, action, comment) => {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO poll_moderation (poll_id, admin_id, action, comment, created_at) VALUES (?, ?, ?, ?, NOW())',
                [pollId, adminId, action, comment], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        })
    },

    getAllPollModerations : () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM poll_moderation', [], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        })
    },

    getAllPollOptions : () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM poll_options', [], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        })
    },

    updatePollStatus : (pollId, status) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE polls SET status = ? WHERE id = ?', [status, pollId], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        })
    },

    getAllPolls : () => {
        return new Promise((resolve, reject) => {
            db.query(`
            SELECT p.id, p.title, p.type, p.description, u.username as owner_username, c.name as category_name, c.id as category_id, p.status, p.created_by, p.created_at, COUNT(v.id) as vote_count
            FROM polls p
            LEFT JOIN users u ON p.created_by = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN votes v ON p.id = v.poll_id
            GROUP BY p.id, p.title, u.username, c.name, p.status, p.created_at
        `, [], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        })
    }
};

module.exports = Poll;