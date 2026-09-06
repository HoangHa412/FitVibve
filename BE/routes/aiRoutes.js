const express = require('express');
const router = express.Router();
const { geminiChat, generateRecommendation } = require('../controllers/aiController');
const verifyToken = require('../middleware/auth');

router.post('/chat', geminiChat);
router.post('/recommendation', verifyToken, generateRecommendation);

module.exports = router;
