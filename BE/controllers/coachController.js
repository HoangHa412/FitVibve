const pool = require('../config/db');

// --- POSTS ---
const createPost = async (req, res) => {
    const coach_id = req.user.id;
    const { category_id, title, content, video_url, calories_info, price = 0 } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO posts (coach_id, category_id, title, content, video_url, calories_info, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [coach_id, category_id, title, content, video_url, calories_info, price]
        );
        res.status(201).json({ message: 'Post created successfully and pending admin approval', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getMyPosts = async (req, res) => {
    const coach_id = req.user.id;
    try {
        const [posts] = await pool.query('SELECT * FROM posts WHERE coach_id = ? ORDER BY created_at DESC', [coach_id]);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updatePost = async (req, res) => {
    const { id } = req.params;
    const coach_id = req.user.id;
    const { category_id, title, content, video_url, calories_info, price } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE posts SET category_id = ?, title = ?, content = ?, video_url = ?, calories_info = ?, price = ?, status = "pending" WHERE id = ? AND coach_id = ?',
            [category_id, title, content, video_url, calories_info, price, id, coach_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }
        res.json({ message: 'Post updated and waiting for re-approval' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deletePost = async (req, res) => {
    const { id } = req.params;
    const coach_id = req.user.id;
    try {
        const [result] = await pool.query('DELETE FROM posts WHERE id = ? AND coach_id = ?', [id, coach_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// --- ROUTES ---
const createRoute = async (req, res) => {
    const coach_id = req.user.id;
    const { title, description, price = 0, target_goal = 'general_fitness', standard = 'Chưa xác định' } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO routes (coach_id, title, description, price, target_goal, standard) VALUES (?, ?, ?, ?, ?, ?)',
            [coach_id, title, description, price, target_goal, standard]
        );
        res.status(201).json({ message: 'Route created', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const addRouteStage = async (req, res) => {
    const { id: route_id } = req.params;
    const { stage_order, title, video_url, description, nutrition_plan, calories_target } = req.body;
    try {
        // Ensure route belongs to coach
        const [route] = await pool.query('SELECT * FROM routes WHERE id = ? AND coach_id = ?', [route_id, req.user.id]);
        if (route.length === 0) return res.status(403).json({ message: 'Unauthorized or Route not found' });

        const [result] = await pool.query(
            'INSERT INTO route_stages (route_id, stage_order, title, video_url, description, nutrition_plan, calories_target) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [route_id, stage_order, title, video_url, description, nutrition_plan, calories_target || 0]
        );
        res.status(201).json({ message: 'Stage added to route', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getMyRoutes = async (req, res) => {
    const coach_id = req.user.id;
    try {
        const [routes] = await pool.query('SELECT * FROM routes WHERE coach_id = ? ORDER BY created_at DESC', [coach_id]);
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getMyRouteStages = async (req, res) => {
    const { id: route_id } = req.params;
    try {
        const [stages] = await pool.query('SELECT * FROM route_stages WHERE route_id = ? ORDER BY stage_order ASC', [route_id]);
        res.json(stages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateRoute = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, target_goal, standard } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE routes SET title = ?, description = ?, price = ?, target_goal = ?, standard = ? WHERE id = ? AND coach_id = ?',
            [title, description, price, target_goal, standard, id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Route not found or unauthorized' });
        res.json({ message: 'Route updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteRoute = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM routes WHERE id = ? AND coach_id = ?', [id, req.user.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Route not found or unauthorized' });
        res.json({ message: 'Route deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateRouteStage = async (req, res) => {
    const { id } = req.params;
    const { stage_order, title, video_url, description, nutrition_plan, calories_target } = req.body;
    try {
        // Verify stage belongs to a route owned by this coach
        const [stage] = await pool.query(`
            SELECT rs.id FROM route_stages rs 
            JOIN routes r ON rs.route_id = r.id 
            WHERE rs.id = ? AND r.coach_id = ?
        `, [id, req.user.id]);

        if (stage.length === 0) return res.status(404).json({ message: 'Stage not found or unauthorized' });

        await pool.query(
            'UPDATE route_stages SET stage_order = ?, title = ?, video_url = ?, description = ?, nutrition_plan = ?, calories_target = ? WHERE id = ?',
            [stage_order, title, video_url, description, nutrition_plan, calories_target || 0, id]
        );
        res.json({ message: 'Stage updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteRouteStage = async (req, res) => {
    const { id } = req.params;
    try {
        // Verify stage belongs to a route owned by this coach
        const [stage] = await pool.query(`
            SELECT rs.id FROM route_stages rs 
            JOIN routes r ON rs.route_id = r.id 
            WHERE rs.id = ? AND r.coach_id = ?
        `, [id, req.user.id]);

        if (stage.length === 0) return res.status(404).json({ message: 'Stage not found or unauthorized' });

        await pool.query('DELETE FROM route_stages WHERE id = ?', [id]);
        res.json({ message: 'Stage deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// --- SUBMISSIONS ---
const getSubmissions = async (req, res) => {
    const coach_id = req.user.id;
    try {
        const query = `
            SELECT s.*, u.full_name as user_name, rs.title as stage_title, r.title as route_title,
                   p.age, p.gender, p.height, p.weight, p.goal
            FROM route_submissions s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN profiles p ON u.id = p.user_id
            JOIN route_stages rs ON s.route_stage_id = rs.id
            JOIN routes r ON rs.route_id = r.id
            WHERE r.coach_id = ?
            ORDER BY s.submitted_at DESC
        `;
        const [submissions] = await pool.query(query, [coach_id]);
        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const evaluateSubmission = async (req, res) => {
    const { id: submission_id } = req.params;
    const { status, coach_feedback } = req.body;

    try {
        if (!['passed', 'failed'].includes(status)) {
            return res.status(400).json({ message: 'Status must be "passed" or "failed"' });
        }

        // Verify coach ownership
        const query = `
            SELECT s.id FROM route_submissions s
            JOIN route_stages rs ON s.route_stage_id = rs.id
            JOIN routes r ON rs.route_id = r.id
            WHERE s.id = ? AND r.coach_id = ?
        `;
        const [owns] = await pool.query(query, [submission_id, req.user.id]);
        if (owns.length === 0) return res.status(403).json({ message: 'Unauthorized' });

        await pool.query(
            'UPDATE route_submissions SET status = ?, coach_feedback = ?, evaluated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, coach_feedback, submission_id]
        );
        res.json({ message: `Submission marked as ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const getCoachStats = async (req, res) => {
    const coach_id = req.user.id;
    try {
        const [postsCount] = await pool.query('SELECT COUNT(*) as total FROM posts WHERE coach_id = ?', [coach_id]);
        const [publishedCount] = await pool.query('SELECT COUNT(*) as total FROM posts WHERE coach_id = ? AND status = "approved"', [coach_id]);
        const [pendingCount] = await pool.query('SELECT COUNT(*) as total FROM posts WHERE coach_id = ? AND status = "pending"', [coach_id]);

        const [pendingSubmissionsCount] = await pool.query(`
            SELECT COUNT(*) as total
            FROM route_submissions s
            JOIN route_stages rs ON s.route_stage_id = rs.id
            JOIN routes r ON rs.route_id = r.id
            WHERE r.coach_id = ? AND s.status = 'submitted'
        `, [coach_id]);

        // Count unique users enrolled in this coach's routes OR explicitly enrolled
        const clientQuery = `
            SELECT COUNT(DISTINCT user_id) as total
            FROM (
                SELECT user_id FROM user_route_progress urp
                JOIN route_stages rs ON urp.route_stage_id = rs.id
                JOIN routes r ON rs.route_id = r.id
                WHERE r.coach_id = ?
                UNION
                SELECT user_id FROM enrollments WHERE coach_id = ? AND status = 'active'
                UNION
                SELECT pur.user_id FROM purchases pur JOIN routes r ON pur.content_id = r.id WHERE pur.content_type = 'route' AND r.coach_id = ?
                UNION
                SELECT pur.user_id FROM purchases pur JOIN posts p ON pur.content_id = p.id WHERE pur.content_type = 'post' AND p.coach_id = ?
                UNION
                SELECT s.user_id FROM route_submissions s JOIN route_stages rs ON s.route_stage_id = rs.id JOIN routes r ON rs.route_id = r.id WHERE r.coach_id = ?
            ) combined_clients
        `;
        const [clientsCount] = await pool.query(clientQuery, [coach_id, coach_id, coach_id, coach_id, coach_id]);

        // Get coach balance
        const [coachInfo] = await pool.query('SELECT balance FROM users WHERE id = ?', [coach_id]);

        res.json({
            total_posts: postsCount[0].total,
            published_posts: publishedCount[0].total,
            pending_posts: pendingCount[0].total,
            pending_submissions: pendingSubmissionsCount[0].total,
            total_clients: clientsCount[0].total,
            balance: coachInfo[0]?.balance || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getCoachClients = async (req, res) => {
    const coach_id = req.user.id;
    try {
        const query = `
            SELECT DISTINCT u.id, u.full_name, u.email, u.created_at as join_date, p.height, p.weight, p.goal
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id IN (
                -- 1. Students with progress in coach's routes
                SELECT user_id FROM user_route_progress urp
                JOIN route_stages rs ON urp.route_stage_id = rs.id
                JOIN routes r ON rs.route_id = r.id
                WHERE r.coach_id = ?
                UNION
                -- 2. Students who explicitly enrolled with the coach
                SELECT user_id FROM enrollments WHERE coach_id = ? AND status = 'active'
                UNION
                -- 3. Students who purchased coach's routes
                SELECT pur.user_id FROM purchases pur
                JOIN routes r ON pur.content_id = r.id
                WHERE pur.content_type = 'route' AND r.coach_id = ?
                UNION
                -- 4. Students who purchased coach's paid posts
                SELECT pur.user_id FROM purchases pur
                JOIN posts p ON pur.content_id = p.id
                WHERE pur.content_type = 'post' AND p.coach_id = ?
                UNION
                -- 5. Students who have submitted assignments
                SELECT s.user_id FROM route_submissions s 
                JOIN route_stages rs ON s.route_stage_id = rs.id 
                JOIN routes r ON rs.route_id = r.id 
                WHERE r.coach_id = ?
            )
        `;
        const [clients] = await pool.query(query, [coach_id, coach_id, coach_id, coach_id, coach_id]);
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

    // --- WITHDRAWALS ---
    const requestWithdrawal = async (req, res) => {
        const coach_id = req.user.id;
        const { amount, bank_name, account_number, account_name } = req.body;
        
        if (!amount || amount <= 0 || !bank_name || !account_number || !account_name) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin rút tiền hợp lệ.' });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Lấy thông tin balance với FOR UPDATE để tránh race condition
            const [users] = await connection.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [coach_id]);
            if (users.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            const currentBalance = parseFloat(users[0].balance);
            const withdrawalAmount = parseFloat(amount);

            if (withdrawalAmount > currentBalance) {
                await connection.rollback();
                return res.status(400).json({ message: 'Số dư không đủ để thực hiện yêu cầu rút tiền.' });
            }

            // Trừ balance
            await connection.query('UPDATE users SET balance = balance - ? WHERE id = ?', [withdrawalAmount, coach_id]);

            // Thêm vào bảng withdrawals
            const [result] = await connection.query(
                'INSERT INTO withdrawals (coach_id, amount, bank_name, account_number, account_name, status) VALUES (?, ?, ?, ?, ?, ?)',
                [coach_id, withdrawalAmount, bank_name, account_number, account_name, 'pending']
            );

            await connection.commit();
            res.status(201).json({ message: 'Yêu cầu rút tiền đã được gửi và đang chờ duyệt.', id: result.insertId });
        } catch (error) {
            await connection.rollback();
            console.error('Lỗi khi yêu cầu rút tiền:', error);
            res.status(500).json({ message: 'Lỗi server', error });
        } finally {
            connection.release();
        }
    };

    const getWithdrawalHistory = async (req, res) => {
        const coach_id = req.user.id;
        try {
            const [withdrawals] = await pool.query('SELECT * FROM withdrawals WHERE coach_id = ? ORDER BY created_at DESC', [coach_id]);
            res.json(withdrawals);
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử rút tiền:', error);
            res.status(500).json({ message: 'Lỗi server', error });
        }
    };

    module.exports = {
        createPost,
        getMyPosts,
        createRoute,
        addRouteStage,
        getMyRoutes,
        getMyRouteStages,
        getSubmissions,
        evaluateSubmission,
        getCoachStats,
        getCoachClients,
        updatePost,
        deletePost,
        updateRoute,
        deleteRoute,
        updateRouteStage,
        deleteRouteStage,
        requestWithdrawal,
        getWithdrawalHistory
    };
