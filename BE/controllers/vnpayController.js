const crypto = require('crypto');
const moment = require('moment');
const querystring = require('qs');
const pool = require('../config/db');
const vnpayConfig = require('../config/vnpay');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[decodeURIComponent(str[key])]).replace(/%20/g, "+");
    }
    return sorted;
}

const createVNPayPayment = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
        }

        const userId = req.user.id;
        let date = moment().utcOffset('+07:00');
        let createDate = date.format('YYYYMMDDHHmmss');
        let orderId = date.format('DDHHmmss');
        let txnRef = `${userId}T${orderId}`; // Format: userIdTtimestamp

        // Insert pending transaction
        await pool.query(
            'INSERT INTO transactions (user_id, amount, txn_ref, status) VALUES (?, ?, ?, "pending")',
            [userId, amount, txnRef]
        );

        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.ip || '127.0.0.1';
            
        if (ipAddr.includes(',')) ipAddr = ipAddr.split(',')[0].trim();
        if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1' || ipAddr.includes(':')) ipAddr = '127.0.0.1';

        let tmnCode = vnpayConfig.vnp_TmnCode;
        let secretKey = vnpayConfig.vnp_HashSecret;
        let vnpUrl = vnpayConfig.vnp_Url;
        let returnUrl = vnpayConfig.vnp_ReturnUrl;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = txnRef;
        vnp_Params['vnp_OrderInfo'] = 'Nap tien vao vi FitVibe ma GD ' + txnRef;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = Math.round(amount) * 100; // VNPay requires multiplying by 100
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        vnp_Params = sortObject(vnp_Params);
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        return res.status(200).json({
            success: true,
            data: { paymentUrl: vnpUrl }
        });
    } catch (error) {
        console.error('Error creating VNPay payment:', error);
        return res.status(500).json({ success: false, message: 'Lỗi khởi tạo thanh toán' });
    }
};

const vnpayReturn = async (req, res) => {
    let connection;
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        let secretKey = vnpayConfig.vnp_HashSecret;
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const responseCode = req.query['vnp_ResponseCode'];
        const amount = parseInt(req.query['vnp_Amount']) / 100;
        const vnp_TxnRef = req.query['vnp_TxnRef'];
        
        if (secureHash === signed) {
            if (responseCode === '00') {
                // Cộng tiền trực tiếp tại đây (vì IPN không gọi được localhost)
                connection = await pool.getConnection();
                await connection.beginTransaction();

                const [transactions] = await connection.query(
                    'SELECT * FROM transactions WHERE txn_ref = ? FOR UPDATE',
                    [vnp_TxnRef]
                );

                if (transactions.length > 0 && transactions[0].status === 'pending') {
                    const transaction = transactions[0];
                    await connection.query('UPDATE transactions SET status = "success" WHERE id = ?', [transaction.id]);
                    await connection.query('UPDATE users SET balance = balance + ? WHERE id = ?', [transaction.amount, transaction.user_id]);
                    console.log(`✅ Nạp ${transaction.amount}đ cho user ${transaction.user_id} thành công!`);
                }

                await connection.commit();
                connection.release();

                return res.redirect(`${frontendUrl}/payment/result?success=true&amount=${amount}`);
            } else {
                return res.redirect(`${frontendUrl}/payment/result?success=false&message=Giao+dịch+bị+hủy+hoặc+thất+bại&code=${responseCode}`);
            }
        } else {
            return res.redirect(`${frontendUrl}/payment/result?success=false&message=Chữ+ký+không+hợp+lệ`);
        }
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Error processing VNPay return:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/payment/result?success=false&message=Lỗi+hệ+thống`);
    }
};

const vnpayIPN = async (req, res) => {
    let connection;
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        let secretKey = vnpayConfig.vnp_HashSecret;
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash !== signed) {
            return res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
        }

        const vnp_TxnRef = req.query['vnp_TxnRef'];
        const responseCode = req.query['vnp_ResponseCode'];
        const vnp_Amount = parseInt(req.query['vnp_Amount']) / 100;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [transactions] = await connection.query(
            'SELECT * FROM transactions WHERE txn_ref = ? FOR UPDATE',
            [vnp_TxnRef]
        );

        if (transactions.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        const transaction = transactions[0];

        if (transaction.amount !== vnp_Amount) {
            await connection.rollback();
            connection.release();
            return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
        }

        if (transaction.status !== 'pending') {
            await connection.rollback();
            connection.release();
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        if (responseCode === '00') {
            // Success payment
            await connection.query('UPDATE transactions SET status = "success" WHERE id = ?', [transaction.id]);
            await connection.query('UPDATE users SET balance = balance + ? WHERE id = ?', [transaction.amount, transaction.user_id]);
        } else {
            // Failed payment
            await connection.query('UPDATE transactions SET status = "failed" WHERE id = ?', [transaction.id]);
        }

        await connection.commit();
        connection.release();
        return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('IPN Error:', error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

module.exports = {
    createVNPayPayment,
    vnpayReturn,
    vnpayIPN
};
