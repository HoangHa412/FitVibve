const express = require('express');
const router = express.Router();
const { geminiChat, geminiChatStream, generateRecommendation } = require('../controllers/aiController');
const verifyToken = require('../middleware/auth');

// Flexible chat endpoint: supports ?stream=true or body.stream: true
router.post('/chat', (req, res, next) => {
  if (req.query.stream === 'true' || req.body?.stream === true) {
    return geminiChatStream(req, res, next);
  }
  return geminiChat(req, res, next);
});

// Dedicated SSE streaming endpoint
router.post('/chat/stream', geminiChatStream);

// Fast personalized recommendation
router.post('/recommendation', verifyToken, generateRecommendation);

module.exports = router;
