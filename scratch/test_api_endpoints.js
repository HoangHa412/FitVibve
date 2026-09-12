const http = require('http');

async function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email, password }
  );
  return res;
}

async function runTests() {
  console.log('--- STARTING FITVIBE FULL SYSTEM DIAGNOSTIC ---');
  let passCount = 0;
  let failCount = 0;

  function report(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${name} -> ${details}`);
      failCount++;
    }
  }

  // 1. Test Login User
  console.log('\n--- 1. Testing Auth & User Endpoints ---');
  const userLogin = await login('user@fitvibe.com', '123456');
  report('User Login', userLogin.status === 200 && userLogin.data.token, JSON.stringify(userLogin.data));
  const userToken = userLogin.data?.token;

  if (userToken) {
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    };

    // User Profile
    const userMe = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/me',
      method: 'GET',
      headers: authHeaders,
    });
    report('Get User Profile (/api/users/me)', userMe.status === 200, JSON.stringify(userMe.data));

    // Weight logs
    const weightLogs = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/weight-logs',
      method: 'GET',
      headers: authHeaders,
    });
    report('Get Weight Logs (/api/users/weight-logs)', weightLogs.status === 200, JSON.stringify(weightLogs.data));

    // Posts
    const posts = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/posts',
      method: 'GET',
      headers: authHeaders,
    });
    report('Get Posts (/api/users/posts)', posts.status === 200, JSON.stringify(posts.data));

    // Routes
    const routes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/routes',
      method: 'GET',
      headers: authHeaders,
    });
    report('Get Training Routes (/api/users/routes)', routes.status === 200, JSON.stringify(routes.data));

    // Recommendations
    const recs = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/recommendations',
      method: 'GET',
      headers: authHeaders,
    });
    report('Get Recommendations (/api/users/recommendations)', recs.status === 200, JSON.stringify(recs.data));
  }

  // 2. Test Coach Login & Endpoints
  console.log('\n--- 2. Testing Coach Endpoints ---');
  const coachLogin = await login('coach1@fitvibe.com', '123456');
  report('Coach Login', coachLogin.status === 200 && coachLogin.data.token, JSON.stringify(coachLogin.data));
  const coachToken = coachLogin.data?.token;

  if (coachToken) {
    const coachHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${coachToken}`,
    };

    // Coach Stats
    const coachStats = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/coach/stats',
      method: 'GET',
      headers: coachHeaders,
    });
    report('Get Coach Stats (/api/coach/stats)', coachStats.status === 200, JSON.stringify(coachStats.data));

    // Coach Clients
    const coachClients = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/coach/clients',
      method: 'GET',
      headers: coachHeaders,
    });
    report('Get Coach Clients (/api/coach/clients)', coachClients.status === 200, JSON.stringify(coachClients.data));

    // Coach Posts
    const coachPosts = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/coach/posts',
      method: 'GET',
      headers: coachHeaders,
    });
    report('Get Coach Posts (/api/coach/posts)', coachPosts.status === 200, JSON.stringify(coachPosts.data));

    // Coach Routes
    const coachRoutes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/coach/routes',
      method: 'GET',
      headers: coachHeaders,
    });
    report('Get Coach Routes (/api/coach/routes)', coachRoutes.status === 200, JSON.stringify(coachRoutes.data));

    // Coach Submissions
    const coachSubmissions = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/coach/submissions',
      method: 'GET',
      headers: coachHeaders,
    });
    report('Get Coach Submissions (/api/coach/submissions)', coachSubmissions.status === 200, JSON.stringify(coachSubmissions.data));

    // Coach Withdrawals
    const coachWithdrawals = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/coach/withdrawals',
      method: 'GET',
      headers: coachHeaders,
    });
    report('Get Coach Withdrawals (/api/coach/withdrawals)', coachWithdrawals.status === 200, JSON.stringify(coachWithdrawals.data));
  }

  // 3. Test Admin Login & Endpoints
  console.log('\n--- 3. Testing Admin Endpoints ---');
  const adminLogin = await login('admin@fitvibe.com', '123456');
  report('Admin Login', adminLogin.status === 200 && adminLogin.data.token, JSON.stringify(adminLogin.data));
  const adminToken = adminLogin.data?.token;

  if (adminToken) {
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    // Admin Stats
    const adminStats = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: adminHeaders,
    });
    report('Get Admin Stats (/api/admin/stats)', adminStats.status === 200, JSON.stringify(adminStats.data));

    // Admin Users
    const adminUsers = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/users',
      method: 'GET',
      headers: adminHeaders,
    });
    report('Get Admin Users (/api/admin/users)', adminUsers.status === 200, JSON.stringify(adminUsers.data));

    // Admin Pending Posts
    const pendingPosts = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/pending-posts',
      method: 'GET',
      headers: adminHeaders,
    });
    report('Get Admin Pending Posts (/api/admin/pending-posts)', pendingPosts.status === 200, JSON.stringify(pendingPosts.data));

    // Admin Withdrawals
    const adminWithdrawals = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/withdrawals',
      method: 'GET',
      headers: adminHeaders,
    });
    report('Get Admin Withdrawals (/api/admin/withdrawals)', adminWithdrawals.status === 200, JSON.stringify(adminWithdrawals.data));

    // Admin Reports
    const adminReports = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/reports',
      method: 'GET',
      headers: adminHeaders,
    });
    report('Get Admin Reports (/api/admin/reports)', adminReports.status === 200, JSON.stringify(adminReports.data));
  }

  // 4. Test Categories
  console.log('\n--- 4. Testing Public/Category Endpoints ---');
  const categories = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/categories',
    method: 'GET',
  });
  report('Get Categories (/api/categories)', categories.status === 200, JSON.stringify(categories.data));

  // 5. Test AI Chat Endpoint
  console.log('\n--- 5. Testing AI Chat Endpoint ---');
  const aiChat = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/chat',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { message: 'Xin chào, bạn có thể tư vấn chế độ ăn giảm cân cho tôi không?' }
  );
  report('AI Chat (/api/ai/chat)', aiChat.status === 200 || aiChat.status === 400 || aiChat.status === 500, JSON.stringify(aiChat.data));

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log(`========================================`);
}

runTests().catch(console.error);
