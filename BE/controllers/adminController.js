const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Reset user password to their email
const resetUserPassword = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Get user email
        const [users] = await pool.query('SELECT email FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const email = users[0].email;
        // 2. Hash email as password
        const hashedPassword = await bcrypt.hash(email, 10);

        // 3. Update password
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

        res.json({ message: `Mật khẩu đã được reset về mặc định (trùng với email: ${email})` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Approve/Reject posts
const updatePostStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    try {
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        await pool.query('UPDATE posts SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Post has been ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Lock/Unlock/Approve Users (Coach to active, User to locked etc)
const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'locked', 'pending'
    try {
        if (!['active', 'locked', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `User status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Manage categories
const createCategory = async (req, res) => {
    const { name, type } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO categories (name, type) VALUES (?, ?)', [name, type]);
        res.status(201).json({ message: 'Category created', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, type } = req.body;
    try {
        await pool.query('UPDATE categories SET name = ?, type = ? WHERE id = ?', [name, type, id]);
        res.json({ message: 'Category updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Stats
const getStats = async (req, res) => {
    try {
        const [usersResult] = await pool.query('SELECT COUNT(*) as total_users FROM users');

        // This month's new posts
        const [postsResult] = await pool.query(`
            SELECT COUNT(*) as new_posts_month 
            FROM posts 
            WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())
        `);

        res.json({
            total_users: usersResult[0].total_users,
            new_posts_month: postsResult[0].new_posts_month
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getPendingPosts = async (req, res) => {
    try {
        const query = `
           SELECT p.*, u.full_name as author
           FROM posts p
           JOIN users u ON p.coach_id = u.id
           WHERE p.status = "pending"
       `;
        const [posts] = await pool.query(query);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getPendingCoaches = async (req, res) => {
    try {
        const query = `
            SELECT u.*, GROUP_CONCAT(cc.image_url) as certificates
            FROM users u 
            LEFT JOIN coach_certificates cc ON u.id = cc.coach_id 
            WHERE u.role = "coach" AND u.status = "pending"
            GROUP BY u.id
        `;
        const [coaches] = await pool.query(query);
        res.json(coaches);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.email, u.full_name, u.role, u.status, u.created_at, 
                   GROUP_CONCAT(cc.image_url) as certificates
            FROM users u 
            LEFT JOIN coach_certificates cc ON u.id = cc.coach_id 
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `;
        const [users] = await pool.query(query);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getReportsData = async (req, res) => {
    try {
        // 1. User stats
        const [usersCountResult] = await pool.query('SELECT COUNT(*) as total FROM users');
        const [coachesCountResult] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = "coach"');

        // 2. Posts and categories
        const [postsCountResult] = await pool.query('SELECT COUNT(*) as total FROM posts WHERE status = "approved"');
        const [categoriesCountResult] = await pool.query('SELECT COUNT(*) as total FROM categories');

        // 3. Goals distribution
        const [goalsResult] = await pool.query('SELECT goal, COUNT(*) as count FROM profiles GROUP BY goal');

        // 4. Top coaches (Most posts approved)
        const [topCoaches] = await pool.query(`
            SELECT u.full_name as name, COUNT(p.id) as post_count
            FROM users u
            JOIN posts p ON u.id = p.coach_id
            WHERE u.role = 'coach' AND p.status = 'approved'
            GROUP BY u.id
            ORDER BY post_count DESC
            LIMIT 3
        `);

        // 5. Recent Posts
        const [recentPosts] = await pool.query(`
            SELECT title, created_at 
            FROM posts 
            WHERE status = 'approved' 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        // 6. User growth (Last 7 days)
        const [userGrowth] = await pool.query(`
            SELECT DATE_FORMAT(MIN(created_at), '%d/%m') as date, COUNT(*) as count
            FROM users
            WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        `);

        // 7. Plan Completion Distribution
        const [planCompletion] = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM user_route_progress
            GROUP BY status
        `);

        // 8. Financials
        const [revenueResult] = await pool.query('SELECT SUM(price_paid) as total FROM purchases');
        const [withdrawalsResult] = await pool.query('SELECT SUM(amount) as total FROM withdrawals WHERE status = "approved"');

        // 9. Withdrawal History
        const [withdrawalHistory] = await pool.query(`
            SELECT w.amount, w.status, w.created_at, u.full_name as coach_name 
            FROM withdrawals w 
            JOIN users u ON w.coach_id = u.id 
            ORDER BY w.created_at DESC
        `);

        res.json({
            users: usersCountResult[0].total,
            coaches: coachesCountResult[0].total,
            posts: postsCountResult[0].total,
            categories: categoriesCountResult[0].total,
            goals: goalsResult,
            topCoaches,
            recentPosts,
            userGrowth,
            planCompletion,
            totalRevenue: revenueResult[0].total || 0,
            totalWithdrawn: withdrawalsResult[0].total || 0,
            withdrawalHistory
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Withdrawals Management
const getWithdrawalRequests = async (req, res) => {
    try {
        const query = `
            SELECT w.*, u.full_name as coach_name, u.email as coach_email
            FROM withdrawals w
            JOIN users u ON w.coach_id = u.id
            ORDER BY w.created_at DESC
        `;
        const [requests] = await pool.query(query);
        res.json(requests);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách rút tiền:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

const updateWithdrawalStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Lock row
        const [withdrawals] = await connection.query('SELECT * FROM withdrawals WHERE id = ? FOR UPDATE', [id]);
        if (withdrawals.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu rút tiền' });
        }

        const withdrawal = withdrawals[0];
        if (withdrawal.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({ message: `Yêu cầu này đã được ${withdrawal.status}, không thể thay đổi.` });
        }

        // Update status
        await connection.query('UPDATE withdrawals SET status = ? WHERE id = ?', [status, id]);

        // If rejected, refund balance
        if (status === 'rejected') {
            await connection.query('UPDATE users SET balance = balance + ? WHERE id = ?', [withdrawal.amount, withdrawal.coach_id]);
        }

        await connection.commit();
        res.json({ message: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu rút tiền thành công.` });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi khi cập nhật trạng thái rút tiền:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    } finally {
        connection.release();
    }
};

module.exports = {
    updatePostStatus,
    updateUserStatus,
    deleteUser,
    createCategory,
    updateCategory,
    deleteCategory,
    getStats,
    getPendingPosts,
    getPendingCoaches,
    getAllUsers,
    getReportsData,
    resetUserPassword,
    getWithdrawalRequests,
    updateWithdrawalStatus
};
