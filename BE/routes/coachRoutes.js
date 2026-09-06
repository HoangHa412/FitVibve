const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const verifyRole = require('../middleware/role');
const {
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
} = require('../controllers/coachController');

router.use(verifyToken, verifyRole(['coach']));

router.post('/posts', createPost);
router.get('/posts', getMyPosts);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

router.post('/routes', createRoute);
router.get('/routes', getMyRoutes);
router.put('/routes/:id', updateRoute);
router.delete('/routes/:id', deleteRoute);
router.post('/routes/:id/stages', addRouteStage);
router.get('/routes/:id/stages', getMyRouteStages);
router.put('/stages/:id', updateRouteStage);
router.delete('/stages/:id', deleteRouteStage);

router.get('/submissions', getSubmissions);
router.put('/submissions/:id', evaluateSubmission);

router.get('/stats', getCoachStats);
router.get('/clients', getCoachClients);

// Withdrawals
router.post('/withdraw', requestWithdrawal);
router.get('/withdrawals', getWithdrawalHistory);

module.exports = router;
