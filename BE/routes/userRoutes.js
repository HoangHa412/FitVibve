const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const verifyRole = require('../middleware/role');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
const uploadCert = require('../config/upload');

const {
    getProfile, updateProfile, updateCoachProfile, deleteCertificate,
    addWeightLog, getWeightLogs,
    getPosts, commentOnPost, toggleBookmark, getBookmarks,
    getRoutes, getRouteStages, submitRouteStage, getRecommendations,
    enrollInCoach, incrementPostViews, getCoaches, getCoachById, cancelEnrollment,
    changePassword, updateAvatar, purchaseContent, topUpBalance
} = require('../controllers/userController');

// ... (Authenticated Routes)
router.use(verifyToken);

// Coach Specific Profile Update
router.put('/coach-profile', verifyRole(['coach']), uploadCert.array('certificates', 5), updateCoachProfile);
router.delete('/certificates/:id', verifyRole(['coach']), deleteCertificate);

// New Purchase & Balance Routes
router.post('/purchase', purchaseContent);
router.post('/top-up', topUpBalance);

// Content Discovery
router.get('/posts', getPosts);
router.get('/routes', getRoutes);
router.get('/routes/:id/stages', getRouteStages);
router.get('/coaches', getCoaches);
router.get('/coaches/:id', getCoachById);

// Profile Management (Accessible by anyone logged in)
router.get('/me', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/avatar', upload.single('avatar'), updateAvatar);

// Stats update
router.post('/posts/:id/view', incrementPostViews);

// --- USER-ONLY ROUTES (Specific to students) ---
router.use(verifyRole(['user']));

router.post('/weight-logs', addWeightLog);
router.get('/weight-logs', getWeightLogs);

router.post('/posts/:id/comments', commentOnPost);
router.post('/posts/:id/bookmarks', toggleBookmark);
router.get('/bookmarks', getBookmarks);

router.post('/routes/stages/:id/submit', submitRouteStage);

// Recommendations
router.get('/recommendations', getRecommendations);

// Enrollments
router.post('/enroll', enrollInCoach);
router.delete('/enroll/:coachId', cancelEnrollment);

module.exports = router;
