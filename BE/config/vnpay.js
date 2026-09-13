require('dotenv').config();

module.exports = {
  vnp_TmnCode: process.env.VNP_TMNCODE ? process.env.VNP_TMNCODE.trim() : '',
  vnp_HashSecret: process.env.VNP_HASHSECRET ? process.env.VNP_HASHSECRET.trim() : '',
  vnp_Url: process.env.VNP_URL ? process.env.VNP_URL.trim() : 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNP_RETURNURL ? process.env.VNP_RETURNURL.trim() : ''
};
