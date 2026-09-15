const { db } = require('../config/dbConfig');

const pquery = (sql, params = []) => db.promise().query(sql, params).then(([rows]) => rows);

const Poll = {
    createPoll: async (title, description, type, createdBy, categoryId, isPublic) => {
        const [result] = await db.promise().query(
            `INSERT INTO polls
             (title, description, type, created_by, category_id, is_public, is_active, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 1, 'preparation', NOW())`,
            [title, description || null, type, createdBy, categoryId || null, isPublic ? 1 : 0]
        );
        return result;
    },

    addPollOptions: async (pollId, options) => {
        const values = options.map((option, index) => [pollId, option, index]);
        const [result] = await db.promise().query(
            'INSERT INTO poll_options (poll_id, option_text, option_order) VALUES ?',
            [values]
        );
        return result;
    },

    getPollById: async (pollId) => {
        const rows = await pquery(`
            SELECT p.*, c.name AS category_name, u.username AS creator_username
            FROM polls p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.id = ?
            LIMIT 1
        `, [pollId]);
        return rows[0];
    },

    getPollsByUser: (userId) => pquery(`
        SELECT p.*, c.name AS category_name,
               CASE
                 WHEN p.type IN ('single_choice','multiple_choice') THEN (SELECT COUNT(DISTINCT v.user_id) FROM votes v WHERE v.poll_id = p.id)
                 WHEN p.type = 'text_response' THEN (SELECT COUNT(*) FROM text_responses tr WHERE tr.poll_id = p.id)
                 WHEN p.type = 'rating_scale' THEN (SELECT COUNT(*) FROM rating_responses rr WHERE rr.poll_id = p.id)
                 ELSE 0
               END AS participants
        FROM polls p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.created_by = ?
        ORDER BY p.created_at DESC
    `, [userId]),

    getPolls: () => pquery(`
        SELECT p.*, c.name AS category_name, u.username AS creator_username,
               CASE
                 WHEN p.type IN ('single_choice','multiple_choice') THEN (SELECT COUNT(DISTINCT v.user_id) FROM votes v WHERE v.poll_id = p.id)
                 WHEN p.type = 'text_response' THEN (SELECT COUNT(*) FROM text_responses tr WHERE tr.poll_id = p.id)
                 WHEN p.type = 'rating_scale' THEN (SELECT COUNT(*) FROM rating_responses rr WHERE rr.poll_id = p.id)
                 ELSE 0
               END AS participants
        FROM polls p
        LEFT JOIN categories c ON p.category_id = c.id
        INNER JOIN users u ON u.id = p.created_by
        WHERE p.is_public = 1 AND p.is_active = 1 AND p.status = 'active'
        ORDER BY p.created_at DESC
    `),

    getPopularPolls: async (limit) => {
        const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 4, 1), 50);
        return pquery(`
            SELECT p.*, c.name AS category_name, u.username AS creator_username,
                   CASE
                     WHEN p.type IN ('single_choice','multiple_choice') THEN (SELECT COUNT(DISTINCT v.user_id) FROM votes v WHERE v.poll_id = p.id)
                     WHEN p.type = 'text_response' THEN (SELECT COUNT(*) FROM text_responses tr WHERE tr.poll_id = p.id)
                     WHEN p.type = 'rating_scale' THEN (SELECT COUNT(*) FROM rating_responses rr WHERE rr.poll_id = p.id)
                     ELSE 0
                   END AS participants
            FROM polls p
            LEFT JOIN categories c ON p.category_id = c.id
            INNER JOIN users u ON u.id = p.created_by
            WHERE p.is_public = 1 AND p.is_active = 1 AND p.status = 'active'
            ORDER BY participants DESC, p.created_at DESC
            LIMIT ?
        `, [safeLimit]);
    },

    updatePoll: async (pollId, title, description, type, categoryId, isPublic, isActive) => {
        const sets = [
            'title = ?',
            'description = ?',
            'type = ?',
            'category_id = ?',
            'is_public = ?',
        ];
        const params = [title, description || null, type, categoryId || null, isPublic ? 1 : 0];

        if (isActive !== undefined && isActive !== null) {
            sets.push('is_active = ?');
            params.push(isActive ? 1 : 0);
        }

        params.push(pollId);
        const [result] = await db.promise().query(
            `UPDATE polls SET ${sets.join(', ')} WHERE id = ?`,
            params
        );
        return result;
    },

    closePoll: async (pollId) => {
        const [result] = await db.promise().query(
            "UPDATE polls SET status = 'closed' WHERE id = ?",
            [pollId]
        );
        return result;
    },

    deletePoll: async (pollId) => {
        const [result] = await db.promise().query('DELETE FROM polls WHERE id = ?', [pollId]);
        return result;
    },

    moderatePoll: async (pollId, adminId, action, comment) => Poll.recordModeration(pollId, adminId, action, comment),

    getPollModeration: (pollId) => pquery(`
        SELECT m.poll_id, m.admin_id, u.username AS admin_username, m.action, m.comment, m.created_at
        FROM poll_moderation m
        INNER JOIN users u ON u.id = m.admin_id
        WHERE m.poll_id = ?
        ORDER BY m.created_at DESC
        LIMIT 1
    `, [pollId]),

    getPollOptions: (pollId) => pquery(
        'SELECT id, option_text, option_order FROM poll_options WHERE poll_id = ? ORDER BY option_order, id',
        [pollId]
    ),

    getCategories: () => pquery('SELECT * FROM categories ORDER BY name'),

    ensureDefaultCategories: async () => {
        const rows = await pquery('SELECT COUNT(*) AS count FROM categories');
        if (Number(rows[0]?.count || 0) > 0) return;

        const defaults = ['Освіта', 'Технології', 'Розваги', 'Суспільство', 'Інше'];
        await db.promise().query(
            'INSERT IGNORE INTO categories (name) VALUES ?',
            [defaults.map((name) => [name])]
        );
    },

    deletePollOptions: async (pollId) => {
        const [result] = await db.promise().query('DELETE FROM poll_options WHERE poll_id = ?', [pollId]);
        return result;
    },

    deletePollModerations: async (pollId) => {
        const [result] = await db.promise().query('DELETE FROM poll_moderation WHERE poll_id = ?', [pollId]);
        return result;
    },

    getPollOptionsStats: (pollId) => pquery(`
        SELECT po.id, po.option_text, po.option_order, COUNT(v.id) AS vote_count
        FROM poll_options po
        LEFT JOIN votes v ON po.id = v.option_id
        WHERE po.poll_id = ?
        GROUP BY po.id, po.option_text, po.option_order
        ORDER BY po.option_order, po.id
    `, [pollId]),

    recordModeration: async (pollId, adminId, action, comment) => {
        const [result] = await db.promise().query(
            'INSERT INTO poll_moderation (poll_id, admin_id, action, comment, created_at) VALUES (?, ?, ?, ?, NOW())',
            [pollId, adminId, action, comment || null]
        );
        return result;
    },

    getAllPollModerations: () => pquery('SELECT * FROM poll_moderation ORDER BY created_at DESC'),
    getAllPollOptions: () => pquery('SELECT * FROM poll_options ORDER BY poll_id, option_order, id'),

    updatePollStatus: async (pollId, status) => {
        const [result] = await db.promise().query('UPDATE polls SET status = ? WHERE id = ?', [status, pollId]);
        return result;
    },

    getAllPolls: () => pquery(`
        SELECT p.id, p.title, p.type, p.description,
               u.username AS owner_username,
               c.name AS category_name,
               c.id AS category_id,
               p.status, p.is_active, p.is_public, p.created_by, p.created_at,
               CASE
                 WHEN p.type IN ('single_choice','multiple_choice') THEN (SELECT COUNT(*) FROM votes v WHERE v.poll_id = p.id)
                 WHEN p.type = 'text_response' THEN (SELECT COUNT(*) FROM text_responses tr WHERE tr.poll_id = p.id)
                 WHEN p.type = 'rating_scale' THEN (SELECT COUNT(*) FROM rating_responses rr WHERE rr.poll_id = p.id)
                 ELSE 0
               END AS vote_count
        FROM polls p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
    `),
};

module.exports = Poll;
