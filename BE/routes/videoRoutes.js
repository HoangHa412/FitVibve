const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const verifyRole = require('../middleware/role');
const videoUpload = require('../config/videoUpload');
const { uploadVideo, streamVideo } = require('../controllers/videoController');

// Coach uploads video
router.post('/upload', verifyToken, verifyRole(['coach']), videoUpload.single('video'), uploadVideo);

// Authenticated users can stream video
router.get('/stream/:filename', verifyToken, streamVideo);

module.exports = router;
