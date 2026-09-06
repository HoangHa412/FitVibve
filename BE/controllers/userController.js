const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { calculateBMI, calculateBMR, calculateTDEE, calculateTargetCalories } = require('../utils/healthCalculator');

// -- PROFILE & HEALTH --
const getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT u.id, u.email, u.full_name, u.role, u.balance, u.status, u.avatar_url, 
                   p.age, p.gender, p.height, p.weight, p.goal, p.bio, p.body_fat, p.medical_history,
                   GROUP_CONCAT(cc.image_url) as certificates
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN coach_certificates cc ON u.id = cc.coach_id
            WHERE u.id = ?
            GROUP BY u.id
        `, [req.user.id]);

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        let healthStats = null;
        if (user.height && user.weight && user.age && user.gender) {
            const bmiInfo = calculateBMI(user.weight, user.height);
            const bmr = calculateBMR(user.weight, user.height, user.age, user.gender);
            const tdee = calculateTDEE(bmr);
            const targetCalories = calculateTargetCalories(tdee, user.goal);
            healthStats = { ...bmiInfo, bmr, tdee, targetCalories };
        }

        res.json({ user, healthStats });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateProfile = async (req, res) => {
    const { full_name, age, gender, height, weight, goal, body_fat, medical_history } = req.body;
    try {
        if (full_name) {
            await pool.query('UPDATE users SET full_name = ? WHERE id = ?', [full_name, req.user.id]);
        }

        // Check if profile exists
        const [profiles] = await pool.query('SELECT user_id FROM profiles WHERE user_id = ?', [req.user.id]);
        
        // Sanitize numbers to handle empty/NaN
        const sAge = age && !isNaN(age) ? parseInt(age) : null;
        const sHeight = height && !isNaN(height) ? parseFloat(height) : null;
        const sWeight = weight && !isNaN(weight) ? parseFloat(weight) : null;
        const sBodyFat = body_fat && !isNaN(body_fat) ? parseFloat(body_fat) : null;
        const sMedicalHistory = medical_history ? JSON.stringify(medical_history) : null;

        if (profiles.length === 0) {
            await pool.query(
                'INSERT INTO profiles (user_id, age, gender, height, weight, goal, body_fat, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [req.user.id, sAge, gender, sHeight, sWeight, goal, sBodyFat, sMedicalHistory]
            );
        } else {
            await pool.query(
                'UPDATE profiles SET age = ?, gender = ?, height = ?, weight = ?, goal = ?, body_fat = ?, medical_history = ? WHERE user_id = ?',
                [sAge, gender, sHeight, sWeight, goal, sBodyFat, sMedicalHistory, req.user.id]
            );
        }
        res.json({ message: 'Profile updated' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateCoachProfile = async (req, res) => {
    const { full_name, bio } = req.body;
    try {
        if (full_name) {
            await pool.query('UPDATE users SET full_name = ? WHERE id = ?', [full_name, req.user.id]);
        }
        
        await pool.query('UPDATE profiles SET bio = ? WHERE user_id = ?', [bio, req.user.id]);

        // Handle new certificates if any
        if (req.files && req.files.length > 0) {
            const certQueries = req.files.map(file => {
                const filePath = `/uploads/certificates/${file.filename}`;
                return pool.query(
                    'INSERT INTO coach_certificates (coach_id, image_url) VALUES (?, ?)',
                    [req.user.id, filePath]
                );
            });
            await Promise.all(certQueries);
        }

        res.json({ message: 'Hồ sơ huấn luyện viên đã được cập nhật' });
    } catch (error) {
        console.error('Update coach profile error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteCertificate = async (req, res) => {
    const { id } = req.params;
    try {
        // Security check: only owner can delete
        const [cert] = await pool.query('SELECT image_url FROM coach_certificates WHERE id = ? AND coach_id = ?', [id, req.user.id]);
        if (cert.length === 0) return res.status(403).json({ message: 'Unauthorized' });

        await pool.query('DELETE FROM coach_certificates WHERE id = ?', [id]);
        res.json({ message: 'Certificate deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const user = users[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const avatar_url = `/uploads/avatars/${req.file.filename}`;
        await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url, req.user.id]);

        res.json({ message: 'Avatar updated successfully', avatar_url });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// -- WEIGHT LOG --
const addWeightLog = async (req, res) => {
    const { weight } = req.body;
    try {
        await pool.query('INSERT INTO weight_logs (user_id, weight) VALUES (?, ?)', [req.user.id, weight]);
        await pool.query('UPDATE profiles SET weight = ? WHERE user_id = ?', [weight, req.user.id]);
        res.json({ message: 'Weight logged successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getWeightLogs = async (req, res) => {
    try {
        const [logs] = await pool.query('SELECT weight, logged_at FROM weight_logs WHERE user_id = ? ORDER BY logged_at ASC', [req.user.id]);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// -- CONTENT (POSTS) --
const getPosts = async (req, res) => {
    const { keyword, category_id, enrolled_only } = req.query;
    try {
        let query = `
            SELECT p.*, c.name as category_name, c.type as category_type, 
                   u.full_name as coach_name, u.avatar_url as coach_avatar,
                   IF(b.user_id IS NOT NULL, 1, 0) as is_bookmarked,
                   IF(p.price = 0 OR pur.id IS NOT NULL, 1, 0) as is_owned
            FROM posts p 
            JOIN categories c ON p.category_id = c.id 
            JOIN users u ON p.coach_id = u.id 
            LEFT JOIN bookmarks b ON p.id = b.post_id AND b.user_id = ?
            LEFT JOIN purchases pur ON p.id = pur.content_id AND pur.content_type = 'post' AND pur.user_id = ?
            WHERE p.status = "approved"
        `;
        const params = [req.user.id, req.user.id];

        if (keyword) {
            query += ' AND p.title LIKE ?';
            params.push(`%${keyword}%`);
        }
        if (category_id) {
            query += ' AND p.category_id = ?';
            params.push(category_id);
        }
        if (enrolled_only === 'true') {
            query += ' AND p.coach_id IN (SELECT coach_id FROM enrollments WHERE user_id = ? AND status = "active")';
            params.push(req.user.id);
        }

        query += ' ORDER BY p.created_at DESC';
        const [posts] = await pool.query(query, params);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const commentOnPost = async (req, res) => {
    const { id: post_id } = req.params;
    const { content } = req.body;
    try {
        await pool.query('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [post_id, req.user.id, content]);
        res.status(201).json({ message: 'Comment added' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const toggleBookmark = async (req, res) => {
    const { id: post_id } = req.params;
    try {
        const [exist] = await pool.query('SELECT * FROM bookmarks WHERE user_id = ? AND post_id = ?', [req.user.id, post_id]);
        if (exist.length > 0) {
            await pool.query('DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?', [req.user.id, post_id]);
            res.json({ message: 'Bookmark removed' });
        } else {
            await pool.query('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)', [req.user.id, post_id]);
            res.json({ message: 'Bookmark added' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getBookmarks = async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name, c.type as category_type, 
                   u.full_name as coach_name, u.avatar_url as coach_avatar
            FROM bookmarks b
            JOIN posts p ON b.post_id = p.id
            JOIN categories c ON p.category_id = c.id
            JOIN users u ON p.coach_id = u.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;
        const [bookmarks] = await pool.query(query, [req.user.id]);
        res.json(bookmarks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// -- ROUTES --
const getRoutes = async (req, res) => {
    try {
        const query = `
            SELECT r.*, u.full_name as coach_name,
                   IF(r.price = 0 OR pur.id IS NOT NULL, 1, 0) as is_owned,
                   (SELECT COUNT(*) FROM route_stages WHERE route_id = r.id) as total_stages,
                   (
                       SELECT COUNT(*) 
                       FROM route_stages rs 
                       JOIN route_submissions s1 ON rs.id = s1.route_stage_id 
                       JOIN (SELECT MAX(id) as max_id FROM route_submissions WHERE user_id = ? GROUP BY route_stage_id) s2 ON s1.id = s2.max_id 
                       WHERE rs.route_id = r.id AND s1.status = 'passed'
                   ) as completed_stages
            FROM routes r 
            JOIN users u ON r.coach_id = u.id 
            LEFT JOIN purchases pur ON r.id = pur.content_id AND pur.content_type = 'route' AND pur.user_id = ?
            ORDER BY created_at DESC
        `;
        const [routes] = await pool.query(query, [req.user.id, req.user.id]);
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getRouteStages = async (req, res) => {
    const { id: route_id } = req.params;
    try {
        // 1. Get Route details and ownership status
        const routeQuery = `
            SELECT r.*, u.full_name as coach_name,
                   IF(r.price = 0 OR pur.id IS NOT NULL, 1, 0) as is_owned
            FROM routes r 
            JOIN users u ON r.coach_id = u.id 
            LEFT JOIN purchases pur ON r.id = pur.content_id AND pur.content_type = 'route' AND pur.user_id = ?
            WHERE r.id = ?
        `;
        const [routes] = await pool.query(routeQuery, [req.user.id, route_id]);
        if (routes.length === 0) {
            return res.status(404).json({ message: 'Lộ trình không tồn tại' });
        }

        const route = routes[0];
        const isOwned = route.is_owned === 1;

        if (!isOwned) {
            // Not owned: return route info but empty stages for security
            return res.json({
                is_owned: false,
                route: {
                    id: route.id,
                    title: route.title,
                    description: route.description,
                    price: route.price,
                    coach_name: route.coach_name
                },
                stages: []
            });
        }

        // 2. Fetch stages if owned
        const query = `
            SELECT rs.*, 
                   sub.status, 
                   sub.coach_feedback, 
                   sub.submission_video_url,
                   sub.submitted_at as last_submitted_at
            FROM route_stages rs
            LEFT JOIN (
                SELECT s1.*
                FROM route_submissions s1
                INNER JOIN (
                    SELECT MAX(id) as max_id 
                    FROM route_submissions 
                    WHERE user_id = ? 
                    GROUP BY route_stage_id
                ) s2 ON s1.id = s2.max_id
            ) sub ON rs.id = sub.route_stage_id
            WHERE rs.route_id = ?
            ORDER BY rs.stage_order ASC
        `;
        const [stages] = await pool.query(query, [req.user.id, route_id]);

        // Sequential Logic
        let canAccessNext = true;
        const processedStages = stages.map((stage, index) => {
            const isFirst = index === 0;
            const isUnlocked = isFirst || canAccessNext;
            
            canAccessNext = stage.status === 'passed';

            if (!isUnlocked) {
                return { ...stage, video_url: null, is_locked: true };
            }
            return { ...stage, is_locked: false };
        });

        res.json({
            is_owned: true,
            route: {
                id: route.id,
                title: route.title,
                description: route.description,
                price: route.price,
                coach_name: route.coach_name
            },
            stages: processedStages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const submitRouteStage = async (req, res) => {
    const { id: stage_id } = req.params;
    const { submission_video_url } = req.body;
    try {
        // Always insert a new submission to keep history
        await pool.query(
            'INSERT INTO route_submissions (user_id, route_stage_id, status, submission_video_url) VALUES (?, ?, "submitted", ?)',
            [req.user.id, stage_id, submission_video_url]
        );
        
        res.json({ message: 'Submission uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const enrollInCoach = async (req, res) => {
    const user_id = req.user.id;
    const { coach_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO enrollments (user_id, coach_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = "active"',
            [user_id, coach_id]
        );
        res.json({ message: 'Enrolled in coach successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const incrementPostViews = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE posts SET views = views + 1 WHERE id = ?', [id]);
        res.json({ message: 'View count updated' });
    } catch (error) {
        // Silently fail or log, but don't break the user experience
        res.status(500).json({ message: 'Server error', error });
    }
};

const getCoaches = async (req, res) => {
    try {
        const userId = req.user.id;
        const [coaches] = await pool.query(`
            SELECT u.id, u.full_name, u.email, u.avatar_url, 
                   GROUP_CONCAT(cc.image_url) as certificates,
                   IF(e.user_id IS NOT NULL AND e.status = 'active', 1, 0) as is_enrolled
            FROM users u
            LEFT JOIN coach_certificates cc ON u.id = cc.coach_id
            LEFT JOIN enrollments e ON u.id = e.coach_id AND e.user_id = ?
            WHERE u.role = 'coach' AND u.status = 'active'
            GROUP BY u.id
        `, [userId]);
        res.json(coaches);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getCoachById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const [coaches] = await pool.query(`
            SELECT u.id, u.full_name, u.email, u.avatar_url, p.bio,
                   GROUP_CONCAT(cc.image_url) as certificates,
                   IF(e.user_id IS NOT NULL AND e.status = 'active', 1, 0) as is_enrolled
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN coach_certificates cc ON u.id = cc.coach_id
            LEFT JOIN enrollments e ON u.id = e.coach_id AND e.user_id = ?
            WHERE u.id = ? AND u.role = 'coach' AND u.status = 'active'
            GROUP BY u.id
        `, [userId, id]);

        if (coaches.length === 0) {
            return res.status(404).json({ message: 'Huấn luyện viên không tồn tại' });
        }
        res.json(coaches[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const cancelEnrollment = async (req, res) => {
    const userId = req.user.id;
    const { coachId } = req.params;
    try {
        await pool.query(
            'UPDATE enrollments SET status = "inactive" WHERE user_id = ? AND coach_id = ?',
            [userId, coachId]
        );
        res.json({ message: 'Enrollment cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const topUpBalance = async (req, res) => {
    const { amount } = req.body;
    try {
        await pool.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, req.user.id]);
        res.json({ message: 'Nạp tiền thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const purchaseContent = async (req, res) => {
    const { content_id, content_type, price_paid } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Check if already purchased
        const [exist] = await connection.query('SELECT id FROM purchases WHERE user_id = ? AND content_id = ? AND content_type = ?', [req.user.id, content_id, content_type]);
        if (exist.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Bạn đã sở hữu nội dung này rồi.' });
        }

        // 2. Check balance
        const [users] = await connection.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [req.user.id]);
        const currentBalance = parseFloat(users[0].balance || 0);
        const requiredAmount = parseFloat(price_paid);

        if (currentBalance < requiredAmount) {
            await connection.rollback();
            return res.status(400).json({ message: 'Số dư không đủ để thanh toán!' });
        }

        // 3. Subtract student balance
        await connection.query('UPDATE users SET balance = balance - ? WHERE id = ?', [price_paid, req.user.id]);

        // 4. Identify Coach and Add balance to Coach
        let coachId = null;
        if (content_type === 'post') {
            const [posts] = await connection.query('SELECT coach_id FROM posts WHERE id = ?', [content_id]);
            coachId = posts[0]?.coach_id;
        } else if (content_type === 'route') {
            const [routes] = await connection.query('SELECT coach_id FROM routes WHERE id = ?', [content_id]);
            coachId = routes[0]?.coach_id;
        }

        if (coachId) {
            await connection.query('UPDATE users SET balance = balance + ? WHERE id = ?', [price_paid, coachId]);
        }

        // 5. Record purchase
        await connection.query(
            'INSERT INTO purchases (user_id, content_id, content_type, price_paid) VALUES (?, ?, ?, ?)',
            [req.user.id, content_id, content_type, price_paid]
        );

        await connection.commit();
        res.json({ message: 'Nội dung đã được mở khóa thành công!' });
    } catch (error) {
        await connection.rollback();
        console.error('Purchase error:', error);
        res.status(500).json({ message: 'Server error', error });
    } finally {
        connection.release();
    }
};const getRecommendations = async (req, res) => {
    try {
        // 1. Get user profile
        const [profileRows] = await pool.query('SELECT weight, height, goal FROM profiles WHERE user_id = ?', [req.user.id]);
        if (profileRows.length === 0) {
            // No profile? Return some popular routes
            const [popular] = await pool.query('SELECT r.*, u.full_name as coach_name FROM routes r JOIN users u ON r.coach_id = u.id LIMIT 4');
            return res.json(popular.map(r => ({ ...r, match_score: 85 })));
        }

        const { weight, height, goal } = profileRows[0];
        const bmi = (weight && height) ? (weight / Math.pow(height / 100, 2)) : 22;

        // 2. Logic to determine primary target goal for recommendation
        let primaryGoal = goal || 'general_fitness';
        if (bmi > 25 && primaryGoal === 'maintenance') primaryGoal = 'weight_loss';
        if (bmi < 18.5 && primaryGoal === 'maintenance') primaryGoal = 'muscle_gain';

        // 3. Fetch routes matching the goal
        const [routes] = await pool.query(`
            SELECT r.*, u.full_name as coach_name 
            FROM routes r 
            JOIN users u ON r.coach_id = u.id 
            WHERE r.target_goal = ? OR r.target_goal = 'general_fitness'
            LIMIT 6
        `, [primaryGoal]);

        // 4. Calculate match score for UI "WOW" factor
        const recommendations = routes.map(route => {
            let score = 90; // Base score
            if (route.target_goal === goal) score += 8;
            if (bmi > 26 && route.target_goal === 'weight_loss') score += 5;
            if (bmi < 19 && route.target_goal === 'muscle_gain') score += 5;
            if (score > 99) score = 99;
            return { ...route, match_score: score };
        });

        // Sort by match score
        recommendations.sort((a, b) => b.match_score - a.match_score);

        res.json(recommendations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getProfile, updateProfile, updateCoachProfile, deleteCertificate,
    addWeightLog, getWeightLogs,
    getPosts, commentOnPost, toggleBookmark, getBookmarks,
    getRoutes, getRouteStages, submitRouteStage, getRecommendations,
    enrollInCoach, incrementPostViews,
    getCoaches, getCoachById, cancelEnrollment,
    changePassword, updateAvatar,
    purchaseContent, topUpBalance
};
