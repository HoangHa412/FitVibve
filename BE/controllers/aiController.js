const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { calculateBMI, calculateBMR, calculateTDEE, calculateTargetCalories } = require('../utils/healthCalculator');

const BASE_SYSTEM_PROMPT = `Bạn là FitVibe Coach AI - Chuyên gia Huấn luyện Thể hình & Cố vấn Dinh dưỡng của nền tảng thể thao trực tuyến FitVibe.

🎯 MỤC TIÊU VÀ NHIỆM VỤ:
- Tư vấn phương pháp và kỹ thuật tập luyện an toàn, bài bản (Gym, Thể hình, Cardio, HIIT, Calisthenics, Yoga, Giãn cơ).
- Cố vấn dinh dưỡng khoa học (Eat Clean, phân bổ Macro Protein/Carb/Fat, tính toán calo nạp và tiêu thụ theo mục tiêu).
- Hướng dẫn học viên khai thác tối đa các phân hệ trên nền tảng FitVibe.

🗺️ KIẾN THỨC VỀ HỆ THỐNG FITVIBE (HÃY CHỦ ĐỘNG HƯỚNG DẪN KHI PHÙ HỢP):
- "Lộ trình tập luyện": Tổ chức theo từng Giai đoạn (Stage) tuần tự. Học viên xem bài tập, quay video thực hành nộp lên hệ thống để Huấn luyện viên (Coach) chấm điểm và duyệt "Đạt" mới được mở khóa Giai đoạn tiếp theo.
- "Theo dõi sức khỏe": Xem BMI, BMR, TDEE và ghi nhật ký cân nặng tại Dashboard để theo dõi tiến độ vóc dáng.
- "Ví cá nhân & Nạp tiền": Học viên có thể nạp tiền ví qua Cổng thanh toán trực tuyến VNPay để đăng ký các lộ trình nâng cao.
- "Đội ngũ Huấn luyện viên (Coach)": Các HLV sở hữu chứng chỉ quốc tế (NASM, ACE, ACSM, ISSA) trực tiếp sửa form động tác và đồng hành.

⛔ NGUYÊN TẮC BẮT BUỘC (GUARDRAILS):
1. PHẠM VI TRẢ LỜI: CHỈ TRẢ LỜI các chủ đề liên quan đến thể hình, rèn luyện thể chất, chế độ ăn uống lành mạnh, phục hồi chấn thương và các tính năng của FitVibe.
2. TỪ CHỐI CÂU HỎI NGOÀI PHẠM VI: Nếu người dùng hỏi các chủ đề không liên quan (chính trị, tin tức, viết code, giải toán, giải trí...), hãy từ chối lịch sự và hướng về sức khỏe:
   "FitVibe Coach chỉ có thể hỗ trợ bạn về luyện tập thể hình, dinh dưỡng và hệ thống FitVibe. Bạn có câu hỏi nào về mục tiêu vóc dáng hôm nay không?"
3. ĐỘ DÀI & ĐỊNH DẠNG:
   - Trả lời ngắn gọn, súc tích, đi thẳng vào trọng tâm (3 - 5 câu, tối đa 200 từ).
   - Sử dụng định dạng Markdown rõ ràng, in đậm các con số quan trọng, tên bài tập hoặc thực phẩm.
   - Xưng hô thân thiện, truyền cảm hứng: "FitVibe Coach" (hoặc "mình") và "bạn".`;

const buildUserContextPrompt = (userInfo) => {
  if (!userInfo) return '';

  let context = `\n\n👤 THÔNG TIN HỌC VIÊN ĐANG TRÒ CHUYỆN:
- Tên học viên: ${userInfo.full_name || userInfo.name || 'Bạn'}
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
      context += `\n- Chỉ số BMR: ~${bmr} kcal/ngày`;
      context += `\n- Năng lượng tiêu hao mỗi ngày (TDEE): ~${tdee} kcal/ngày`;
      
      if (userInfo.fitness_goal) {
        const targetCal = calculateTargetCalories(tdee, userInfo.fitness_goal);
        context += `\n- Mục tiêu: ${userInfo.fitness_goal === 'weight_loss' ? 'Giảm cân/giảm mỡ' : userInfo.fitness_goal === 'muscle_gain' ? 'Tăng cơ' : 'Duy trì vóc dáng'} (Mức calo khuyến nghị: ~${targetCal} kcal/ngày)`;
      }
    }
  }

  context += `\n👉 HÃY ÁP DỤNG TRỰC TIẾP các chỉ số thể trạng trên để đưa ra lời khuyên cá nhân hóa chính xác cho học viên này. Hãy gọi tên học viên một cách thân thiện.`;
  return context;
};

const geminiChat = async (req, res) => {
  try {
    const { message, history = [], userContext: clientContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống' });
    }

    // Attempt to extract logged-in user information for Context Injection
    let userInfo = clientContext || null;
    const authHeader = req.header('Authorization');
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fitvibe_jwt_super_secret_key_2026');
        if (decoded && decoded.id) {
          const [rows] = await pool.query(
            'SELECT full_name, gender, height, weight, age, activity_level, fitness_goal FROM users WHERE id = ?',
            [decoded.id]
          );
          if (rows && rows.length > 0) {
            userInfo = { ...rows[0], ...(clientContext || {}) };
          }
        }
      } catch (err) {
        // Token invalid or expired, continue with guest/clientContext
      }
    }

    const contextualSystemInstruction = BASE_SYSTEM_PROMPT + buildUserContextPrompt(userInfo);

    // Attempt 1: Gemini (Preferred: Gemini 3.5 with fallback to 2.5)
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
        const genAI = new GoogleGenerativeAI(apiKey);
        const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

        let chatHistory = history.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

        // Gemini requires history to start with a 'user' message if not empty
        const firstUserIndex = chatHistory.findIndex((msg) => msg.role === 'user');
        if (firstUserIndex !== -1) {
          chatHistory = chatHistory.slice(firstUserIndex);
        } else {
          chatHistory = [];
        }

        try {
          const model = genAI.getGenerativeModel({
            model: primaryModel,
            systemInstruction: contextualSystemInstruction,
            generationConfig: {
              temperature: 0.35, // Focus, low hallucination, concise
              maxOutputTokens: 1000,
              topP: 0.85,
            }
          });
          const chat = model.startChat({ history: chatHistory });
          const result = await chat.sendMessage(message.trim());
          return res.json({ success: true, reply: result.response.text(), provider: `Gemini (${primaryModel})` });
        } catch (modelErr) {
          console.warn(`⚠️ ${primaryModel} failed or busy, auto-falling back to gemini-2.5-flash:`, modelErr.message);
          const fallbackModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: contextualSystemInstruction,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 1000,
              topP: 0.85,
            }
          });
          const chat = fallbackModel.startChat({ history: chatHistory });
          const result = await chat.sendMessage(message.trim());
          return res.json({ success: true, reply: result.response.text(), provider: 'Gemini (gemini-2.5-flash)' });
        }
      }
    } catch (error) {
      console.warn('⚠️ Gemini error:', error.message);
    }

    // Attempt 2: Groq
    try {
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: contextualSystemInstruction },
              ...history.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
              { role: 'user', content: message },
            ],
            max_tokens: 650,
            temperature: 0.35,
          },
          { headers: { Authorization: `Bearer ${groqKey}` } }
        );
        return res.json({ success: true, reply: response.data.choices[0].message.content, provider: 'Groq' });
      }
    } catch (error) {
      console.warn('⚠️ Groq fallback triggered:', error.response?.data || error.message);
    }

    // Attempt 3: OpenRouter
    try {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (openRouterKey) {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
              { role: 'system', content: contextualSystemInstruction },
              ...history.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
              { role: 'user', content: message },
            ],
            temperature: 0.35,
          },
          { headers: { Authorization: `Bearer ${openRouterKey}` } }
        );
        return res.json({ success: true, reply: response.data.choices[0].message.content, provider: 'OpenRouter' });
      }
    } catch (error) {
      console.warn('⚠️ OpenRouter fallback triggered:', error.response?.data || error.message);
    }

    // Attempt 4: Contextual Built-in Assistant Fallback (when API keys are unset)
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
      provider: 'FitVibe AI Assistant'
    });
  } catch (error) {
    console.error('❌ AI Hub error:', error.message);
    return res.json({
      success: true,
      reply: 'FitVibe AI Assistant: Chúc bạn có một buổi tập luyện hiệu quả và năng lượng! Hãy uống đủ nước và khởi động kỹ trước khi tập nhé.',
      provider: 'FitVibe AI Assistant'
    });
  }
};

const generateRecommendation = async (req, res) => {
  try {
    const { age, gender, height, weight, body_fat, goal, medical_history } = req.body;
    
    let historyStr = 'Không có';
    if (medical_history && Array.isArray(medical_history) && medical_history.length > 0) {
      historyStr = medical_history.join(', ');
    }

    const goalMap = {
      'weight_loss': 'Giảm mỡ, giảm cân',
      'muscle_gain': 'Tăng cơ, tăng cân',
      'maintain': 'Duy trì vóc dáng, cải thiện sức khỏe',
      'maintenance': 'Duy trì vóc dáng, cải thiện sức khỏe',
      'general_fitness': 'Cải thiện thể lực toàn diện'
    };
    
    const translatedGoal = goalMap[goal] || goal || 'Duy trì vóc dáng';

    const prompt = `Dựa trên thông tin người dùng sau đây, hãy tạo một lộ trình tập luyện và thực đơn ăn uống cá nhân hóa:
- Tuổi: ${age || 'Không rõ'}
- Giới tính: ${gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
- Chiều cao: ${height} cm
- Cân nặng: ${weight} kg
- Tỷ lệ mỡ (Body Fat): ${body_fat ? body_fat + '%' : 'Không rõ'}
- Mục tiêu: ${translatedGoal}
- Tiền sử bệnh lý: ${historyStr}

Yêu cầu định dạng đầu ra (Markdown):
1. Đánh giá sơ bộ về thể trạng.
2. Gợi ý lộ trình tập luyện (chia lịch tập trong tuần, lưu ý các bài tập cần tránh nếu có bệnh lý).
3. Gợi ý thực đơn ăn uống (chia macro cơ bản, ví dụ các bữa ăn).
4. Lời khuyên thêm.
Hãy viết một cách truyền cảm hứng, chuyên nghiệp và rõ ràng. Khuyên người dùng chỉ tham khảo và cần tư vấn bác sĩ nếu có bệnh lý nặng.`;

    // Try Gemini
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
        const genAI = new GoogleGenerativeAI(apiKey);
        const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
        try {
          const model = genAI.getGenerativeModel({
            model: primaryModel,
            systemInstruction: BASE_SYSTEM_PROMPT,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 1200,
            }
          });
          const result = await model.generateContent(prompt);
          return res.json({ success: true, recommendation: result.response.text(), provider: `Gemini (${primaryModel})` });
        } catch (mErr) {
          console.warn(`⚠️ ${primaryModel} failed in recommendation, falling back to gemini-2.5-flash:`, mErr.message);
          const fallbackModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: BASE_SYSTEM_PROMPT,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 1200,
            }
          });
          const result = await fallbackModel.generateContent(prompt);
          return res.json({ success: true, recommendation: result.response.text(), provider: 'Gemini (gemini-2.5-flash)' });
        }
      }
    } catch (error) {
      console.warn('⚠️ Gemini fallback triggered in recommendation:', error.message);
    }

    // Try Groq
    try {
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: BASE_SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            max_tokens: 1500,
            temperature: 0.35,
          },
          { headers: { Authorization: `Bearer ${groqKey}` } }
        );
        return res.json({ success: true, recommendation: response.data.choices[0].message.content, provider: 'Groq' });
      }
    } catch (error) {
      console.warn('⚠️ Groq fallback triggered in recommendation:', error.message);
    }

    // Smart Built-in Personalized Recommendation Generator
    const heightM = (height || 170) / 100;
    const calcWeight = weight || 65;
    const bmiVal = (calcWeight / (heightM * heightM)).toFixed(1);
    
    const fallbackRecommendation = `### 📋 Đánh giá thể trạng sơ bộ
- **Chỉ số BMI:** **${bmiVal}** (${bmiVal < 18.5 ? 'Thiếu cân' : bmiVal <= 24.9 ? 'Thể trạng cân đối' : 'Thừa cân nhẹ'}).
- **Mục tiêu chính:** **${translatedGoal}**.
- **Tiền sử sức khỏe:** ${historyStr}.

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

    return res.json({
      success: true,
      recommendation: fallbackRecommendation,
      provider: 'FitVibe Smart Planner'
    });

  } catch (error) {
    console.error('Error generating recommendation:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo lộ trình.' });
  }
};

module.exports = { geminiChat, generateRecommendation };
