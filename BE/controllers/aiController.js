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

    return res.status(500).json({
      success: false,
      message: 'Tất cả các dịch vụ AI đang bận. Vui lòng thử lại sau giây lát!',
    });
  } catch (error) {
    console.error('❌ AI Hub error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi kết nối AI. Vui lòng thử lại sau.',
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
      'maintain': 'Duy trì vóc dáng, cải thiện sức khỏe'
    };
    
    const translatedGoal = goalMap[goal] || goal;

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

    return res.status(500).json({
      success: false,
      message: 'Các dịch vụ AI hiện không khả dụng để tạo lộ trình.',
    });

  } catch (error) {
    console.error('Error generating recommendation:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo lộ trình.' });
  }
};

module.exports = { geminiChat, generateRecommendation };
