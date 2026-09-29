const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { calculateBMI, calculateBMR, calculateTDEE, calculateTargetCalories } = require('../utils/healthCalculator');

// =====================================================================
// FAST IN-MEMORY LRU & TTL CACHE
// =====================================================================
class AICache {
  constructor(maxSize = 200, ttlMs = 60 * 60 * 1000) { // 1 hour TTL
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const entry = this.cache.get(key);
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttlMs,
    });
  }
}

const queryCache = new AICache(200, 60 * 60 * 1000);
const recommendationCache = new AICache(100, 2 * 60 * 60 * 1000);

// Helper for timeout wrapping
const callWithTimeout = (promise, ms, operationName = 'AI Request') => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timeout: ${operationName} took longer than ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
};

const BASE_SYSTEM_PROMPT = `Bạn là FitVibe Coach AI - Chuyên gia Huấn luyện Thể hình & Cố vấn Dinh dưỡng của nền tảng FitVibe.

🎯 MỤC TIÊU VÀ NHIỆM VỤ:
- Tư vấn phương pháp và kỹ thuật tập luyện an toàn, bài bản (Gym, Thể hình, Cardio, HIIT, Calisthenics, Yoga, Giãn cơ).
- Cố vấn dinh dưỡng khoa học (Eat Clean, phân bổ Macro Protein/Carb/Fat, tính toán calo nạp và tiêu thụ theo mục tiêu).
- Hướng dẫn học viên khai thác tối đa các phân hệ trên nền tảng FitVibe.

🗺️ KIẾN THỨC VỀ HỆ THỐNG FITVIBE:
- "Lộ trình tập luyện": Tổ chức theo từng Giai đoạn (Stage) tuần tự. Học viên xem bài tập, quay video nộp lên hệ thống để Huấn luyện viên (Coach) chấm điểm và duyệt "Đạt" mới được mở khóa Giai đoạn tiếp theo.
- "Theo dõi sức khỏe": Xem BMI, BMR, TDEE và ghi nhật ký cân nặng tại Dashboard để theo dõi tiến độ vóc dáng.
- "Ví cá nhân & Nạp tiền": Nạp tiền ví qua Cổng VNPay để đăng ký các lộ trình nâng cao.
- "Đội ngũ Huấn luyện viên (Coach)": Các HLV sở hữu chứng chỉ quốc tế (NASM, ACE, ACSM, ISSA) trực tiếp sửa form và đồng hành.

⛔ NGUYÊN TẮC BẮT BUỘC:
1. PHẠM VI TRẢ LỜI: CHỈ TRẢ LỜI các chủ đề thể hình, rèn luyện thể chất, chế độ ăn uống lành mạnh, phục hồi và tính năng của FitVibe. Từ chối lịch sự các chủ đề ngoài lề.
2. ĐỘ DÀI & ĐỊNH DẠNG:
   - Trả lời cực kỳ ngắn gọn, súc tích, đi thẳng vào trọng tâm (3 - 5 câu hoặc gạch đầu dòng rõ ràng, tối đa 150-200 từ).
   - In đậm con số quan trọng, tên bài tập hoặc thực phẩm.
   - Xưng hô: "FitVibe Coach" (hoặc "mình") và "bạn".`;

const buildUserContextPrompt = (userInfo) => {
  if (!userInfo) return '';

  let context = `\n\n👤 THÔNG TIN HỌC VIÊN:
- Tên: ${userInfo.full_name || userInfo.name || 'Bạn'}
- Giới tính: ${userInfo.gender === 'male' ? 'Nam' : userInfo.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}
- Tuổi: ${userInfo.age || 'Chưa cập nhật'}
- Chiều cao: ${userInfo.height ? userInfo.height + ' cm' : 'Chưa cập nhật'}
- Cân nặng: ${userInfo.weight ? userInfo.weight + ' kg' : 'Chưa cập nhật'}`;

  if (userInfo.height && userInfo.weight) {
    const bmiData = calculateBMI(Number(userInfo.weight), Number(userInfo.height));
    context += `\n- Chỉ số BMI: ${bmiData.bmi} (${bmiData.category})`;

    if (userInfo.age && userInfo.gender) {
      const bmr = calculateBMR(Number(userInfo.weight), Number(userInfo.height), Number(userInfo.age), userInfo.gender);
      const tdee = calculateTDEE(bmr, 1.375);
      context += `\n- BMR: ~${bmr} kcal/ngày, TDEE: ~${tdee} kcal/ngày`;
      
      if (userInfo.fitness_goal) {
        const targetCal = calculateTargetCalories(tdee, userInfo.fitness_goal);
        context += `\n- Mục tiêu: ${userInfo.fitness_goal === 'weight_loss' ? 'Giảm mỡ/giảm cân' : userInfo.fitness_goal === 'muscle_gain' ? 'Tăng cơ' : 'Duy trì vóc dáng'} (Khuyến nghị: ~${targetCal} kcal/ngày)`;
      }
    }
  }

  context += `\n👉 Hãy gọi tên học viên thân thiện và áp dụng trực tiếp các chỉ số trên vào câu trả lời.`;
  return context;
};

// =====================================================================
// INSTANT INTENT MATCHER (SUB-5MS INSTANT RESPONSES FOR COMMON FITVIBE QUERIES)
// =====================================================================
const tryInstantMatch = (message, userInfo) => {
  const norm = message.toLowerCase().trim();

  // 1. Instant Calorie / BMI / TDEE Calculation
  if (norm.includes('tính lượng calo') || (norm.includes('calo') && norm.includes('thể trạng')) || (norm.includes('tính') && norm.includes('tdee'))) {
    const name = userInfo?.full_name || userInfo?.name || 'bạn';
    if (userInfo?.height && userInfo?.weight) {
      const height = Number(userInfo.height);
      const weight = Number(userInfo.weight);
      const age = Number(userInfo.age || 25);
      const gender = userInfo.gender || 'male';
      const goal = userInfo.fitness_goal || 'maintain';

      const bmi = calculateBMI(weight, height);
      const bmr = calculateBMR(weight, height, age, gender);
      const tdee = calculateTDEE(bmr, 1.375);
      const targetCal = calculateTargetCalories(tdee, goal);

      const goalName = goal === 'weight_loss' 
        ? 'Giảm mỡ & giảm cân săn chắc' 
        : goal === 'muscle_gain' 
        ? 'Tăng cơ nạc & phát triển thể lực' 
        : 'Duy trì vóc dáng & sức khỏe';

      return `Chào **${name}**! Dưới đây là phân tích calo và chỉ số thể trạng chi tiết của bạn:\n\n` +
        `* 📊 **Chỉ số BMI:** **${bmi.bmi}** (${bmi.category})\n` +
        `* 🔥 **Năng lượng chuyển hóa cơ bản (BMR):** **${bmr.toLocaleString()} kcal/ngày** (mức calo tối thiểu khi nghỉ ngơi)\n` +
        `* ⚡ **Tổng năng lượng tiêu hao (TDEE):** **${tdee.toLocaleString()} kcal/ngày** (vận động nhẹ 1-3 buổi/tuần)\n` +
        `* 🎯 **Mục tiêu hiện tại:** **${goalName}**\n\n` +
        `👉 **Mức calo khuyến nghị nạp mỗi ngày:** **~${targetCal.toLocaleString()} kcal/ngày**\n\n` +
        `💡 *Mẹo từ FitVibe:* Hãy phân bổ lượng calo này theo tỷ lệ vàng **40% Carb - 30% Protein - 30% Fat** để đạt hiệu quả tối ưu nhất nhé!`;
    } else {
      return `Chào **${name}**! Để mình tính toán chính xác lượng calo cần nạp, bạn hãy cập nhật **Chiều cao** và **Cân nặng** tại trang **Dashboard** hoặc phần thông tin cá nhân của FitVibe nhé!`;
    }
  }

  // 2. Unlocking next stage guide
  if (norm.includes('mở khóa bài tập') || (norm.includes('mở khóa') && norm.includes('giai đoạn')) || norm.includes('làm sao để hlv mở khóa')) {
    return `Chào bạn! Để Huấn luyện viên mở khóa **Giai đoạn (Stage)** tiếp theo trên FitVibe:\n\n` +
      `1. Vào mục **Lộ trình tập luyện** và chọn bài tập thuộc Giai đoạn hiện tại.\n` +
      `2. Tập luyện và quay lại video ngắn chứng minh đúng kỹ thuật form động tác.\n` +
      `3. Nhấn nút **Nộp bài tập** để gửi video cho Huấn luyện viên phụ trách.\n` +
      `4. HLV sẽ chấm điểm kỹ thuật và bấm **Duyệt Đạt**. Ngay sau khi được duyệt, Giai đoạn tiếp theo sẽ tự động mở khóa!`;
  }

  // 3. Recommended roadmap starting point
  if (norm.includes('bắt đầu từ lộ trình nào') || norm.includes('tôi nên bắt đầu từ lộ trình') || norm.includes('gợi ý lộ trình') || norm.includes('lộ trình phù hợp')) {
    const goal = userInfo?.fitness_goal || 'maintain';
    let rec = {
      title: 'Lộ trình 30 Ngày Siết Cơ Bụng & Giảm Mỡ Cấp Tốc',
      coach: 'HLV Nguyễn Văn An',
      price: '490,000đ',
      id: 1,
      target: 'Giảm mỡ & siết cơ bụng',
      desc: 'Giáo án 4 giai đoạn kết hợp kháng lực cốt lõi, cardio và thực đơn thâm hụt calo chuẩn khoa học.'
    };
    if (goal === 'muscle_gain') {
      rec = {
        title: 'Chinh Phục Khối Cơ Nạc Toàn Thân 60 Ngày (Hypertrophy)',
        coach: 'HLV Lê Quang Cường (Hypertrophy)',
        price: '890,000đ',
        id: 2,
        target: 'Tăng cơ nạc toàn thân',
        desc: 'Tối ưu kích thích phì đại cơ bắp (Hypertrophy), gia tăng sức mạnh vượt trội cùng HLV ACSM.'
      };
    } else if (goal === 'maintain') {
      rec = {
        title: 'Yoga & Khởi Động Phục Hồi Vóc Dáng Nữ Giới 21 Ngày',
        coach: 'HLV Trần Bích Ngọc (Yoga/Pilates)',
        price: '350,000đ',
        id: 3,
        target: 'Duy trì vóc dáng & phục hồi',
        desc: 'Nhẹ nhàng, thư giãn phục hồi cột sống, thon gọn eo và cải thiện giấc ngủ sâu.'
      };
    }

    return `Chào bạn! Dựa trên mục tiêu **${rec.target}** của bạn, hệ thống FitVibe gợi ý lộ trình đào tạo phù hợp nhất đang có trên nền tảng:\n\n` +
      `🔥 **Lộ trình đề xuất:** **${rec.title}**\n` +
      `👨‍🏫 **Huấn luyện viên:** **${rec.coach}**\n` +
      `💰 **Học phí ưu đãi:** **${rec.price}**\n` +
      `📝 **Mô tả:** ${rec.desc}\n\n` +
      `👉 Bạn có thể truy cập mục **Lộ trình tập luyện** trên thanh menu hoặc vào trang chi tiết lộ trình để đăng ký và được HLV trực tiếp sửa form nhé!`;
  }

  return null;
};

// =====================================================================
// FAST GENERATION RUNNER WITH AUTOMATIC FAILOVER & STRICT TIMEOUT
// =====================================================================
const FAST_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest',
];

const callFastGeminiChat = async (genAI, chatHistory, message, contextualSystemPrompt, timeoutMs = 6000) => {
  let lastError = null;

  for (const modelName of FAST_MODELS) {
    const t0 = Date.now();
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: contextualSystemPrompt,
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 450, // Short, punchy responses cut latency significantly
          topP: 0.85,
          thinkingConfig: { thinkingBudget: 0 }, // Disable reasoning budget for instant response
        },
      });

      const chat = model.startChat({ history: chatHistory });
      const sendPromise = chat.sendMessage(message.trim());
      const result = await callWithTimeout(sendPromise, timeoutMs, `Gemini (${modelName})`);
      const text = result.response.text();

      if (text && text.trim()) {
        const elapsed = Date.now() - t0;
        return {
          reply: text.trim(),
          provider: `Gemini (${modelName}) - ${elapsed}ms`,
        };
      }
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Model ${modelName} failed or timed out (${Date.now() - t0}ms):`, err.message);
      // Fast failover to next model
    }
  }

  throw lastError || new Error('All fast Gemini models failed');
};

// =====================================================================
// CONTROLLERS
// =====================================================================

const geminiChat = async (req, res) => {
  const requestStartTime = Date.now();
  try {
    const { message, history = [], userContext: clientContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống' });
    }

    const trimmedMsg = message.trim();

    // 1. Extract logged-in user profile
    let userInfo = clientContext || null;
    const authHeader = req.header('Authorization');
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fitvibe_jwt_super_secret_key_2026');
        if (decoded && decoded.id) {
          const [rows] = await pool.query(
            `SELECT u.full_name, p.gender, p.height, 
                    COALESCE((SELECT weight FROM weight_logs WHERE user_id = u.id ORDER BY logged_at DESC, id DESC LIMIT 1), p.weight) as weight,
                    p.age, p.goal AS fitness_goal 
             FROM users u 
             LEFT JOIN profiles p ON u.id = p.user_id 
             WHERE u.id = ?`,
            [decoded.id]
          );
          if (rows && rows.length > 0) {
            userInfo = { ...rows[0], ...(clientContext || {}) };
          }
        }
      } catch (err) {
        // Continue gracefully if token invalid
      }
    }

    // 2. Try Instant Match (<5ms)
    const instantReply = tryInstantMatch(trimmedMsg, userInfo);
    if (instantReply) {
      return res.json({
        success: true,
        reply: instantReply,
        provider: 'FitVibe Instant Engine (<5ms)',
      });
    }

    // 3. Check Cache (<5ms)
    const userKey = userInfo?.id || userInfo?.full_name || 'anon';
    const cacheKey = `${userKey}_${userInfo?.weight || 0}_${userInfo?.height || 0}_${trimmedMsg.toLowerCase()}`;
    const cachedReply = queryCache.get(cacheKey);
    if (cachedReply) {
      return res.json({
        success: true,
        reply: cachedReply,
        provider: 'FitVibe Memory Cache (<2ms)',
      });
    }

    const contextualSystemInstruction = BASE_SYSTEM_PROMPT + buildUserContextPrompt(userInfo);

    // Prepare history
    let chatHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    const firstUserIndex = chatHistory.findIndex((msg) => msg.role === 'user');
    if (firstUserIndex !== -1) {
      chatHistory = chatHistory.slice(firstUserIndex);
    } else {
      chatHistory = [];
    }

    // 4. Attempt Fast Gemini Models
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const result = await callFastGeminiChat(genAI, chatHistory, trimmedMsg, contextualSystemInstruction, 6000);
        
        // Cache successful response
        queryCache.set(cacheKey, result.reply);

        return res.json({
          success: true,
          reply: result.reply,
          provider: result.provider,
        });
      } catch (error) {
        console.warn('⚠️ All primary Gemini calls failed, checking fallbacks:', error.message);
      }
    }

    // 5. Attempt Groq Fallback
    try {
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        const response = await callWithTimeout(
          axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: contextualSystemInstruction },
                ...history.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
                { role: 'user', content: trimmedMsg },
              ],
              max_tokens: 450,
              temperature: 0.35,
            },
            { headers: { Authorization: `Bearer ${groqKey}` } }
          ),
          5000,
          'Groq'
        );
        const reply = response.data.choices[0].message.content;
        queryCache.set(cacheKey, reply);
        return res.json({ success: true, reply, provider: 'Groq (llama-3.3-70b)' });
      }
    } catch (error) {
      console.warn('⚠️ Groq fallback failed:', error.message);
    }

    // 6. Attempt OpenRouter Fallback
    try {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (openRouterKey) {
        const response = await callWithTimeout(
          axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'google/gemini-2.0-flash-exp:free',
              messages: [
                { role: 'system', content: contextualSystemInstruction },
                ...history.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
                { role: 'user', content: trimmedMsg },
              ],
              temperature: 0.35,
            },
            { headers: { Authorization: `Bearer ${openRouterKey}` } }
          ),
          5000,
          'OpenRouter'
        );
        const reply = response.data.choices[0].message.content;
        queryCache.set(cacheKey, reply);
        return res.json({ success: true, reply, provider: 'OpenRouter' });
      }
    } catch (error) {
      console.warn('⚠️ OpenRouter fallback failed:', error.message);
    }

    // 7. Contextual Built-in Assistant Fallback
    const displayName = userInfo?.full_name || userInfo?.name || 'bạn';
    let contextualNote = '';
    if (userInfo?.height && userInfo?.weight) {
      const bmi = (Number(userInfo.weight) / Math.pow(Number(userInfo.height) / 100, 2)).toFixed(1);
      contextualNote = ` (Chỉ số BMI hiện tại của ${displayName}: ${bmi})`;
    }

    const defaultReplies = [
      `Chào ${displayName}!${contextualNote} Với mục tiêu rèn luyện thể chất, FitVibe khuyên bạn nên duy trì 3-5 buổi tập/tuần, kết hợp bài tập kháng lực (Gym/Calisthenics) và Cardio để tối ưu hiệu quả xây dựng cơ bắp và tiêu hao mỡ thừa.`,
      `Chào ${displayName}! Về dinh dưỡng khoa học, hãy ưu tiên các nguồn đạm nạc chất lượng cao (ức gà, cá, trứng), tinh bột hấp thu chậm (gạo lứt, yến mạch) và duy trì tối thiểu 2 - 2.5 lít nước mỗi ngày nhé.`,
      `Để tiến bộ nhanh nhất, ${displayName} có thể truy cập mục "Lộ trình tập luyện" trên FitVibe để theo dõi các bài tập theo từng Giai đoạn và nộp video thực hành để Huấn luyện viên sửa form động tác nhé!`,
      `Chào ${displayName}! Bạn có thể theo dõi biến động cân nặng và các chỉ số BMR/TDEE trực tiếp tại trang Dashboard của FitVibe để liên tục điều chỉnh khẩu phần ăn phù hợp nhất.`
    ];
    const randomReply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];

    return res.json({
      success: true,
      reply: randomReply,
      provider: 'FitVibe Built-in Assistant',
    });
  } catch (error) {
    console.error('❌ AI Hub error:', error.message);
    return res.json({
      success: true,
      reply: 'FitVibe AI Assistant: Chúc bạn có một buổi tập luyện hiệu quả và tràn đầy năng lượng! Hãy uống đủ nước và khởi động kỹ trước khi tập nhé.',
      provider: 'FitVibe AI Assistant',
    });
  }
};

// =====================================================================
// STREAMING CHAT (SSE) - REALTIME TYPING WITH SUB-1S TTFT
// =====================================================================
const geminiChatStream = async (req, res) => {
  try {
    const { message, history = [], userContext: clientContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống' });
    }

    const trimmedMsg = message.trim();

    // SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let userInfo = clientContext || null;
    const authHeader = req.header('Authorization');
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fitvibe_jwt_super_secret_key_2026');
        if (decoded && decoded.id) {
          const [rows] = await pool.query(
            `SELECT u.full_name, p.gender, p.height, 
                    COALESCE((SELECT weight FROM weight_logs WHERE user_id = u.id ORDER BY logged_at DESC, id DESC LIMIT 1), p.weight) as weight,
                    p.age, p.goal AS fitness_goal 
             FROM users u 
             LEFT JOIN profiles p ON u.id = p.user_id 
             WHERE u.id = ?`,
            [decoded.id]
          );
          if (rows && rows.length > 0) {
            userInfo = { ...rows[0], ...(clientContext || {}) };
          }
        }
      } catch (err) {
        // Ignore
      }
    }

    // Check instant match
    const instant = tryInstantMatch(trimmedMsg, userInfo);
    if (instant) {
      res.write(`data: ${JSON.stringify({ chunk: instant })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, provider: 'Instant Engine' })}\n\n`);
      return res.end();
    }

    // Check cache
    const userKey = userInfo?.id || userInfo?.full_name || 'anon';
    const cacheKey = `${userKey}_${userInfo?.weight || 0}_${userInfo?.height || 0}_${trimmedMsg.toLowerCase()}`;
    const cached = queryCache.get(cacheKey);
    if (cached) {
      res.write(`data: ${JSON.stringify({ chunk: cached })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, provider: 'Cache' })}\n\n`);
      return res.end();
    }

    const contextualSystemInstruction = BASE_SYSTEM_PROMPT + buildUserContextPrompt(userInfo);

    let chatHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    const firstUserIndex = chatHistory.findIndex((msg) => msg.role === 'user');
    if (firstUserIndex !== -1) {
      chatHistory = chatHistory.slice(firstUserIndex);
    } else {
      chatHistory = [];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      const genAI = new GoogleGenerativeAI(apiKey);
      for (const modelName of FAST_MODELS) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: contextualSystemInstruction,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 450,
              thinkingConfig: { thinkingBudget: 0 },
            },
          });

          const chat = model.startChat({ history: chatHistory });
          const streamResult = await chat.sendMessageStream(trimmedMsg);

          let fullReply = '';
          for await (const chunk of streamResult.stream) {
            const textChunk = chunk.text();
            if (textChunk) {
              fullReply += textChunk;
              res.write(`data: ${JSON.stringify({ chunk: textChunk })}\n\n`);
            }
          }

          if (fullReply) {
            queryCache.set(cacheKey, fullReply);
            res.write(`data: ${JSON.stringify({ done: true, provider: `Gemini (${modelName})` })}\n\n`);
            return res.end();
          }
        } catch (streamErr) {
          console.warn(`⚠️ Stream error on ${modelName}:`, streamErr.message);
        }
      }
    }

    // Fallback static text
    const fallbackText = `Chào bạn! Để tối ưu kết quả tập luyện, FitVibe khuyên bạn nên duy trì chế độ dinh dưỡng giàu protein và tập luyện đúng form động tác nhé!`;
    res.write(`data: ${JSON.stringify({ chunk: fallbackText })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, provider: 'Fallback' })}\n\n`);
    return res.end();
  } catch (err) {
    console.error('❌ Stream error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.end();
    }
  }
};

// =====================================================================
// FAST RECOMMENDATION GENERATOR WITH FITVIBE SYSTEM ROADMAPS INJECTION
// =====================================================================
const generateRecommendation = async (req, res) => {
  try {
    let { age, gender, height, weight, body_fat, goal, medical_history } = req.body || {};
    
    // Auto-fetch profile from database if not fully passed in req.body
    if (req.user?.id && (!goal || !weight || !height)) {
      try {
        const [profileRows] = await pool.query('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
        if (profileRows && profileRows.length > 0) {
          const p = profileRows[0];
          age = age || p.age;
          gender = gender || p.gender;
          height = height || p.height;
          weight = weight || p.weight;
          body_fat = body_fat || p.body_fat;
          goal = goal || p.goal;
          medical_history = medical_history || p.medical_history;
        }
      } catch (pErr) {
        console.warn('⚠️ Could not auto-fetch user profile for recommendation:', pErr.message);
      }
    }

    let historyStr = 'Không có';
    if (medical_history) {
      if (typeof medical_history === 'string') {
        try {
          const parsed = JSON.parse(medical_history);
          if (Array.isArray(parsed) && parsed.length > 0) historyStr = parsed.join(', ');
        } catch (e) {
          historyStr = medical_history;
        }
      } else if (Array.isArray(medical_history) && medical_history.length > 0) {
        historyStr = medical_history.join(', ');
      }
    }

    const goalMap = {
      'weight_loss': 'Giảm mỡ, giảm cân',
      'muscle_gain': 'Tăng cơ, tăng cân',
      'maintain': 'Duy trì vóc dáng, cải thiện sức khỏe',
      'maintenance': 'Duy trì vóc dáng, cải thiện sức khỏe',
      'general_fitness': 'Cải thiện thể lực toàn diện'
    };
    
    const translatedGoal = goalMap[goal] || goal || 'Duy trì vóc dáng';

    const heightM = (height || 170) / 100;
    const calcWeight = weight || 65;
    const bmiVal = parseFloat((calcWeight / (heightM * heightM)).toFixed(1));

    // 1. Fetch all system routes from database & compute match score
    let matchedRoutes = [];
    let routesContext = '';
    try {
      const [routes] = await pool.query(
        `SELECT r.id, r.title, r.description, r.price, r.target_goal, u.full_name as coach_name 
         FROM routes r 
         JOIN users u ON r.coach_id = u.id`
      );
      if (routes && routes.length > 0) {
        matchedRoutes = routes.map(route => {
          let score = 85;
          const reasons = [];
          if (route.target_goal === goal) {
            score += 10;
            reasons.push(`Đúng chuẩn mục tiêu ${translatedGoal}`);
          }
          if (bmiVal >= 24 && route.target_goal === 'weight_loss') {
            score += 4;
            reasons.push('Tối ưu hóa đốt mỡ thừa');
          }
          if (bmiVal < 19 && route.target_goal === 'muscle_gain') {
            score += 4;
            reasons.push('Gia tăng kích thước cơ bắp và cân nặng');
          }
          if (route.target_goal === 'maintain' && (goal === 'maintain' || goal === 'general_fitness')) {
            score += 5;
            reasons.push('Cải thiện độ dẻo dai và vóc dáng');
          }
          if (score > 99) score = 99;
          return {
            id: route.id,
            title: route.title,
            coach_name: route.coach_name,
            price: Number(route.price),
            target_goal: route.target_goal,
            match_score: score,
            match_reason: reasons.join(' • ') || 'Lộ trình chất lượng cao cùng HLV chuẩn quốc tế'
          };
        }).sort((a, b) => b.match_score - a.match_score);

        routesContext = '\n\n🗺️ CÁC LỘ TRÌNH ĐÀO TẠO HIỆN CÓ TRÊN NỀN TẢNG FITVIBE:\n' +
          matchedRoutes.map((r, i) => 
            `- [ID: ${r.id}] "${r.title}" (HLV: ${r.coach_name} | Mục tiêu: ${r.target_goal === 'weight_loss' ? 'Giảm mỡ' : r.target_goal === 'muscle_gain' ? 'Tăng cơ' : 'Duy trì vóc dáng'} | Học phí: ${r.price.toLocaleString()}đ | Độ khớp: ${r.match_score}%)`
          ).join('\n');
      }
    } catch (dbErr) {
      console.warn('⚠️ Could not fetch routes from DB for recommendation:', dbErr.message);
    }

    // Check Recommendation Cache
    const recCacheKey = `${gender}_${age}_${height}_${weight}_${goal}_${historyStr}`;
    const cachedEntry = recommendationCache.get(recCacheKey);
    if (cachedEntry) {
      return res.json({
        success: true,
        recommendation: cachedEntry.recommendation || cachedEntry,
        matchedRoutes: cachedEntry.matchedRoutes || matchedRoutes,
        provider: 'FitVibe Recommendation Cache (<2ms)',
      });
    }

    const prompt = `Dựa trên thông tin người dùng sau đây, hãy tạo một bản tư vấn lộ trình và thực đơn ăn uống cá nhân hóa ngắn gọn, chuẩn khoa học:
- Tuổi: ${age || 'Không rõ'}
- Giới tính: ${gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
- Chiều cao: ${height} cm
- Cân nặng: ${weight} kg
- Chỉ số BMI: ${bmiVal}
- Tỷ lệ mỡ: ${body_fat ? body_fat + '%' : 'Không rõ'}
- Mục tiêu: ${translatedGoal}
- Tiền sử bệnh lý: ${historyStr}${routesContext}

Yêu cầu định dạng đầu ra (Markdown, ngắn gọn, súc tích):
1. Đánh giá sơ bộ về thể trạng (kèm phân tích BMI).
2. 🎯 ĐỀ XUẤT LỘ TRÌNH FITVIBE PHÙ HỢP NHẤT: Trong các lộ trình đào tạo hiện có của FitVibe ở trên, hãy CHỈ ĐỊNH ĐÍCH DANH lộ trình nào là phù hợp nhất với học viên, nêu rõ tên lộ trình, HLV phụ trách, mức giá và lý do vì sao lộ trình này giúp học viên đạt mục tiêu.
3. Lịch tập luyện gợi ý trong tuần (tập trung các bài tập cốt lõi).
4. Gợi ý thực đơn ăn uống (chia bữa rõ ràng).
5. Lời khuyên quan trọng từ Coach.`;

    // Try Fast Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      const genAI = new GoogleGenerativeAI(apiKey);
      for (const modelName of FAST_MODELS) {
        const t0 = Date.now();
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: BASE_SYSTEM_PROMPT,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 900, // Balanced length for fast delivery
              thinkingConfig: { thinkingBudget: 0 },
            },
          });

          const resultPromise = model.generateContent(prompt);
          const result = await callWithTimeout(resultPromise, 8000, `Recommendation (${modelName})`);
          const text = result.response.text();

          if (text && text.trim()) {
            recommendationCache.set(recCacheKey, { recommendation: text.trim(), matchedRoutes });
            return res.json({
              success: true,
              recommendation: text.trim(),
              matchedRoutes,
              provider: `Gemini (${modelName}) - ${Date.now() - t0}ms`,
            });
          }
        } catch (mErr) {
          console.warn(`⚠️ Recommendation model ${modelName} failed (${Date.now() - t0}ms):`, mErr.message);
        }
      }
    }

    // Try Groq
    try {
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        const response = await callWithTimeout(
          axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: BASE_SYSTEM_PROMPT },
                { role: 'user', content: prompt },
              ],
              max_tokens: 800,
              temperature: 0.35,
            },
            { headers: { Authorization: `Bearer ${groqKey}` } }
          ),
          6000,
          'Groq Recommendation'
        );
        const text = response.data.choices[0].message.content;
        recommendationCache.set(recCacheKey, { recommendation: text, matchedRoutes });
        return res.json({ success: true, recommendation: text, matchedRoutes, provider: 'Groq' });
      }
    } catch (error) {
      console.warn('⚠️ Groq recommendation fallback failed:', error.message);
    }

    // Built-in Smart Plan with Matched Routes
    const topRoute = matchedRoutes && matchedRoutes.length > 0 ? matchedRoutes[0] : null;
    const topRouteText = topRoute 
      ? `\n\n---\n\n### 🎯 Lộ trình FitVibe phù hợp nhất dành cho bạn:\n` +
        `- **Lộ trình đề xuất:** **${topRoute.title}**\n` +
        `- **Huấn luyện viên phụ trách:** **${topRoute.coach_name}**\n` +
        `- **Học phí ưu đãi:** **${topRoute.price.toLocaleString()}đ**\n` +
        `- **Độ phù hợp:** **${topRoute.match_score}%** (${topRoute.match_reason})\n` +
        `👉 *Bạn có thể bấm vào thẻ lộ trình bên dưới hoặc truy cập mục **Lộ trình tập luyện** để đăng ký học nhé!*`
      : '';
    
    const fallbackRecommendation = `### 📋 Đánh giá thể trạng sơ bộ
- **Chỉ số BMI:** **${bmiVal}** (${bmiVal < 18.5 ? 'Thiếu cân' : bmiVal <= 24.9 ? 'Thể trạng cân đối' : 'Thừa cân nhẹ'}).
- **Mục tiêu chính:** **${translatedGoal}**.
- **Tiền sử sức khỏe:** ${historyStr}.${topRouteText}

---

### 🏋️ Lịch tập luyện gợi ý trong tuần
- **Thứ 2 (Thân trên - Upper Body):** Hít đất 4x12, Kéo xà/Dumbbell Row 4x10, Đẩy ngực 3x12.
- **Thứ 3 (Cardio & Core):** Chạy bộ nhẹ 25 phút + Plank 3x60s, Gập bụng 4x15.
- **Thứ 4 (Nghỉ ngơi hoặc Yoga giãn cơ):** 20-30 phút giãn cơ hồi phục.
- **Thứ 5 (Thân dưới - Lower Body):** Squat 4x15, Lunges 3x12 mỗi chân, Nâng bắp chuối 4x20.
- **Thứ 6 (Toàn thân & HIIT):** Burpees 4x10, Jumping Jacks 4x30s, Mountain Climbers 4x20.
- **Thứ 7 & CN:** Hoạt động ngoài trời nhẹ nhàng, đi bộ 5,000 - 8,000 bước.

---

### 🥗 Gợi ý thực đơn dinh dưỡng
- **Bữa sáng:** Yến mạch nấu sữa hạt + 2 quả trứng luộc + 1 quả chuối.
- **Bữa trưa:** 150g ức gà hoặc cá hồi áp chảo + 1 bát cơm gạo lứt + rau củ luộc (bông cải xanh, cà rốt).
- **Bữa phụ chiều:** 1 hũ sữa chua Hy Lạp hoặc 1 muỗng Whey Protein + một ít hạt hạnh nhân.
- **Bữa tối:** 150g thịt bò xào ớt chuông hoặc tôm hấp + salad dầu giấm + khoai lang hấp.

---

### 💡 Lời khuyên từ FitVibe Coach
1. Uống đủ 2 - 2.5 lít nước mỗi ngày để hỗ trợ trao đổi chất.
2. Ngủ đủ 7-8 tiếng mỗi đêm vì cơ bắp phát triển và mỡ thừa được đốt cháy tốt nhất khi bạn ngủ sâu.
3. Luôn khởi động kỹ 5-10 phút trước khi bắt đầu bài tập để tránh chấn thương.`;

    recommendationCache.set(recCacheKey, { recommendation: fallbackRecommendation, matchedRoutes });

    return res.json({
      success: true,
      recommendation: fallbackRecommendation,
      matchedRoutes,
      provider: 'FitVibe Smart Planner',
    });

  } catch (error) {
    console.error('Error generating recommendation:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo lộ trình.' });
  }
};

module.exports = { geminiChat, geminiChatStream, generateRecommendation };
