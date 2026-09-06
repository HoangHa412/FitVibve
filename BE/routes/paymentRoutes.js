const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { createVNPayPayment, vnpayReturn, vnpayIPN } = require('../controllers/vnpayController');

router.post('/vnpay/create-payment', verifyToken, createVNPayPayment);
router.get('/vnpay/vnpay-return', vnpayReturn);
router.get('/vnpay/ipn', vnpayIPN);

module.exports = router;
