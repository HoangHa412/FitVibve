const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const upload = require('../config/upload');

router.post('/register', upload.array('certificates', 5), register);
router.post('/login', login);

module.exports = router;
