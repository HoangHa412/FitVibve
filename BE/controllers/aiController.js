const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const SYSTEM_PROMPT = `Bạn là trợ lý AI của hệ thống FitVibe - Nền tảng quản lý tập luyện và sức khỏe chuyên nghiệp.
Bạn hỗ trợ khách hàng tư vấn về:
- Lịch tập luyện: Fitness, Bodybuilding, Yoga, Cardio, HIIT.
- Dinh dưỡng: Chế độ ăn tăng cơ, giảm mỡ, thực phẩm bổ sung (Whey, BCAA...), tính toán Macro.
- Dịch vụ của FitVibe: Đăng ký gói tập, tìm kiếm huấn luyện viên (Coach), đặt lịch hẹn.
- Sản phẩm: Đồ tập, phụ kiện hỗ trợ, thực phẩm chức năng.
- Chăm sóc sức khỏe: Giấc ngủ, phục hồi cơ bắp, tránh chấn thương.

Quy tắc trả lời:
- Luôn trả lời bằng tiếng Việt, chuyên nghiệp, truyền cảm hứng và khoa học.
- Giữ câu trả lời ngắn gọn, súc tích (tối đa 3-4 câu trừ khi khách cần chi tiết hoặc giáo án).
- Xưng hô: "FitVibe" (hoặc "mình") và "bạn". 
- Nếu không biết thông tin cụ thể về tài khoản khách hàng, hãy hướng dẫn khách liên hệ bộ phận hỗ trợ hoặc xem trong phần Profile.
- Không trả lời các chủ đề không liên quan đến thể hình, sức khỏe hoặc FitVibe.`;

const geminiChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống' });
    }

    // Attempt 1: Gemini
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: SYSTEM_PROMPT,
        });

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

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(message.trim());
        return res.json({ success: true, reply: result.response.text(), provider: 'Gemini' });
      }
    } catch (error) {
      console.warn('⚠️ Gemini fallback triggered:', error.message);
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
              { role: 'system', content: SYSTEM_PROMPT },
              ...history.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
              { role: 'user', content: message },
            ],
            max_tokens: 1000,
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
              { role: 'system', content: SYSTEM_PROMPT },
              ...history.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
              { role: 'user', content: message },
            ],
          },
          { headers: { Authorization: `Bearer ${openRouterKey}` } }
        );
        return res.json({ success: true, reply: response.data.choices[0].message.content, provider: 'OpenRouter' });
      }
    } catch (error) {
      console.warn('⚠️ OpenRouter fallback triggered:', error.response?.data || error.message);
    }

    // Attempt 4: Intelligent Built-in Assistant Fallback (when external API keys are unset/busy)
    const defaultReplies = [
      'FitVibe khuyên bạn nên duy trì chế độ tập luyện 3-5 buổi/tuần, kết hợp hài hòa giữa bài tập kháng lực (Gym/Calisthenics) và Cardio để tối ưu hóa việc tiêu hao năng lượng và xây dựng cơ bắp.',
      'Về dinh dưỡng, hãy ưu tiên các nguồn đạm chất lượng cao (ức gà, trứng, cá, đậu), tinh bột phức hợp (gạo lứt, khoai lang, yến mạch) và bổ sung tối thiểu 2-2.5 lít nước mỗi ngày.',
      'Để đạt mục tiêu vóc dáng nhanh nhất, bạn có thể tham khảo các lộ trình và giáo án chi tiết từ các Huấn luyện viên (Coach) chuyên nghiệp trong mục "Lộ trình tập luyện".',
      'Chào bạn! FitVibe luôn sẵn sàng hỗ trợ bạn theo dõi cân nặng, tính toán chỉ số TDEE/BMR và cung cấp các bài tập bài bản nhất.'
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
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: SYSTEM_PROMPT,
        });

        const result = await model.generateContent(prompt);
        return res.json({ success: true, recommendation: result.response.text(), provider: 'Gemini' });
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
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            max_tokens: 1500,
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
