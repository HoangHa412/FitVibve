const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const verifyRole = require('../middleware/role');
const {
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
} = require('../controllers/adminController');

// All admin routes need token and 'admin' role
router.use(verifyToken, verifyRole(['admin']));

// Stats & General info
router.get('/stats', getStats);
router.get('/reports', getReportsData);
router.get('/pending-posts', getPendingPosts);
router.get('/pending-coaches', getPendingCoaches);
router.get('/users', getAllUsers);

// Posts & Users management
router.put('/posts/:id/status', updatePostStatus);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id', deleteUser);

router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Withdrawals
router.get('/withdrawals', getWithdrawalRequests);
router.put('/withdrawals/:id/status', updateWithdrawalStatus);

module.exports = router;
