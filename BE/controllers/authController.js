const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const register = async (req, res) => {
    const { email, password, full_name, role } = req.body;
    try {
        // Validate
        if (!email || !password || !full_name) {
            return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin' });
        }

        // Check if user exists
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Role handling - Coaches start as pending for admin approval
        const userRole = (role === 'coach') ? 'coach' : 'user';
        const status = (userRole === 'coach') ? 'pending' : 'active';

        const [result] = await pool.query(
            'INSERT INTO users (email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, full_name, userRole, status]
        );
        const userId = result.insertId;

        // Create profile
        if (userRole === 'user') {
            await pool.query(
                'INSERT INTO profiles (user_id) VALUES (?)',
                [userId]
            );
        } else if (userRole === 'coach') {
            await pool.query(
                'INSERT INTO profiles (user_id) VALUES (?)',
                [userId]
            );

            // Save multiple certificates
            if (req.files && req.files.length > 0) {
                const certQueries = req.files.map(file => {
                    const filePath = `/uploads/certificates/${file.filename}`;
                    return pool.query(
                        'INSERT INTO coach_certificates (coach_id, image_url) VALUES (?, ?)',
                        [userId, filePath]
                    );
                });
                await Promise.all(certQueries);
            }
        }

        res.status(201).json({ message: 'Đăng ký thành công', userId });
    } catch (error) {
        console.error('Auth register error:', error?.code || error)
        if (error && error.code === 'ECONNREFUSED') {
            return res.status(500).json({ message: 'Không thể kết nối tới database. Vui lòng kiểm tra MySQL đang chạy và cấu hình DB trong .env.' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const user = users[0];

        // 1. Check password first (Security best practice)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // 2. Check account status
        if (user.status === 'locked') {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.' });
        }
        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Tài khoản của bạn đang chờ quản trị viên duyệt.' });
        }

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = { register, login };
