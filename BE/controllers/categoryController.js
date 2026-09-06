const pool = require('../config/db');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public or Authenticated
const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY type, name');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getCategories
};
