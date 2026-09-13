/**
 * seed_rich_data.js - Populate FitVibe with rich, diverse, production-realistic fitness data.
 * Run inside BE container or directly with node.
 */

const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seedRichData() {
    let connection;
    try {
        console.log('🚀 Starting Rich & Realistic Data Seeding for FitVibe...');
        connection = await pool.getConnection();

        const defaultHash = await bcrypt.hash('123456', 10);
        console.log('🔑 Password hash for 123456 generated');

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Truncate tables for clean realistic data
        const tables = [
            'route_submissions', 'user_route_progress', 'route_stages', 'routes',
            'bookmarks', 'comments', 'posts', 'coach_certificates', 'enrollments',
            'purchases', 'transactions', 'withdrawals', 'weight_logs', 'profiles',
            'users', 'categories'
        ];
        for (const t of tables) {
            await connection.query(`TRUNCATE TABLE \`${t}\``);
        }
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🧹 Cleaned old data');

        // ==========================================
        // 1. CATEGORIES (Đầy đủ chuyên sâu)
        // ==========================================
        await connection.query(`INSERT INTO categories (id, name, type) VALUES
            (1, 'Cơ Bụng & Core', 'workout'),
            (2, 'Cơ Ngực (Chest)', 'workout'),
            (3, 'Cơ Chân & Mông (Legs & Glutes)', 'workout'),
            (4, 'Cơ Lưng & Xô (Back & Lats)', 'workout'),
            (5, 'Cơ Vai & Cổ (Shoulders)', 'workout'),
            (6, 'Cơ Tay (Biceps & Triceps)', 'workout'),
            (7, 'Cardio & HIIT Đốt Mỡ', 'workout'),
            (8, 'Calisthenics & Street Workout', 'workout'),
            (9, 'Yoga & Giãn Cơ Phục Hồi', 'workout'),
            (10, 'Eat Clean Khoa Học', 'diet'),
            (11, 'Keto Cắt Nét', 'diet'),
            (12, 'Chay Thể Thao (Plant-Based)', 'diet'),
            (13, 'Low Carb Bền Vững', 'diet'),
            (14, 'Tăng Cơ Macro Cao (High Protein)', 'diet'),
            (15, 'Nhịn Ăn Gián Đoạn (IF 16/8)', 'diet')
        `);
        console.log('✅ 15 Categories created');

        // ==========================================
        // 2. USERS (Admin, Coaches, Students)
        // ==========================================
        // Password for all: 123456
        const users = [
            // Admin
            [1, 'admin@fitvibe.com', defaultHash, 'Quản Trị Viên FitVibe', 'admin', 0.00, 'active', null, '2026-01-01 08:00:00'],
            
            // Coaches
            [2, 'coach1@fitvibe.com', defaultHash, 'HLV Nguyễn Văn An', 'coach', 8500000.00, 'active', '/uploads/avatars/avatar-1772438428209-310624340.png', '2026-01-05 09:00:00'],
            [3, 'coach2@fitvibe.com', defaultHash, 'HLV Trần Bích Ngọc (Yoga/Pilates)', 'coach', 4200000.00, 'active', null, '2026-01-10 10:00:00'],
            [4, 'coach3@fitvibe.com', defaultHash, 'HLV Lê Quang Cường (Hypertrophy)', 'coach', 12300000.00, 'active', null, '2026-01-12 11:00:00'],
            [5, 'coach4@fitvibe.com', defaultHash, 'HLV Phạm Minh Đức (HIIT & Boxing)', 'coach', 6700000.00, 'active', null, '2026-01-18 14:00:00'],
            [6, 'coach@fitvibe.com', defaultHash, 'HLV Đặng Hoàng Long (Calisthenics)', 'coach', 9100000.00, 'active', null, '2026-01-20 15:00:00'],
            [7, 'coach_pending@fitvibe.com', defaultHash, 'HLV Vũ Hải Yến (Dinh dưỡng viên)', 'coach', 0.00, 'pending', null, '2026-03-01 08:30:00'],

            // Students / Users
            [8, 'user@fitvibe.com', defaultHash, 'Hoàng Ngọc Sơn Hà', 'user', 2450000.00, 'active', '/uploads/avatars/avatar-1778744916509-343364445.jpg', '2026-02-01 08:00:00'],
            [9, 'user1@fitvibe.com', defaultHash, 'Nguyễn Thị Thu Hương', 'user', 950000.00, 'active', null, '2026-02-05 09:30:00'],
            [10, 'user2@fitvibe.com', defaultHash, 'Trần Quốc Bảo', 'user', 1800000.00, 'active', null, '2026-02-10 10:15:00'],
            [11, 'user3@fitvibe.com', defaultHash, 'Lê Thị Mỹ Linh', 'user', 0.00, 'locked', null, '2026-02-12 11:00:00'],
            [12, 'user4@fitvibe.com', defaultHash, 'Đoàn Nhật Minh', 'user', 1200000.00, 'active', null, '2026-02-15 13:00:00'],
            [13, 'user5@fitvibe.com', defaultHash, 'Phạm Quỳnh Chi', 'user', 650000.00, 'active', null, '2026-02-20 14:00:00'],
            [14, 'user6@fitvibe.com', defaultHash, 'Đỗ Mạnh Thắng', 'user', 3200000.00, 'active', null, '2026-02-25 15:30:00'],
            [15, 'user7@fitvibe.com', defaultHash, 'Ngô Thanh Vân', 'user', 400000.00, 'active', null, '2026-03-01 16:00:00'],
            [16, 'user8@fitvibe.com', defaultHash, 'Bùi Đình Trọng', 'user', 150000.00, 'active', null, '2026-03-05 17:00:00']
        ];

        for (const u of users) {
            await connection.query(
                `INSERT INTO users (id, email, password, full_name, role, balance, status, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                u
            );
        }
        console.log(`✅ ${users.length} Users inserted (all password: 123456)`);

        // ==========================================
        // 3. PROFILES & COACH CERTIFICATES
        // ==========================================
        const profiles = [
            [1, 32, 'male', 175, 72, 'maintain', 15.0, '["Không có"]', 'Quản trị viên phụ trách vận hành kỹ thuật và kiểm duyệt nội dung FitVibe.'],
            [2, 29, 'male', 180, 78, 'muscle_gain', 12.0, '["Không"]', 'HLV Thể hình chứng chỉ NASM 6 năm kinh nghiệm. Đã hướng dẫn thành công hơn 200 học viên siết cơ và giảm mỡ.'],
            [3, 27, 'female', 165, 51, 'maintain', 18.0, '["Không"]', 'Chuyên gia Yoga Quốc tế Yoga Alliance RYT 200. Tập trung vào sự dẻo dai, phục hồi cột sống và chánh niệm.'],
            [4, 31, 'male', 178, 83, 'muscle_gain', 13.5, '["Phục hồi dây chằng 2023"]', 'Master Coach chứng chỉ ACSM. Chuyên gia về Hypertrophy và gia tăng sức mạnh (Powerlifting).'],
            [5, 26, 'male', 172, 67, 'weight_loss', 11.5, '["Không"]', 'HLV Cardio & HIIT cường độ cao. Tốt nghiệp ĐH TDTT, chứng chỉ Boxing Fitness quốc tế.'],
            [6, 28, 'male', 176, 74, 'muscle_gain', 12.5, '["Không"]', 'Đam mê Calisthenics & Street Workout. Hướng dẫn làm chủ trọng lượng cơ thể từ hít xà đến Muscle-up.'],
            [7, 25, 'female', 162, 50, 'maintain', 19.0, '["Không"]', 'Chuyên gia tư vấn dinh dưỡng lâm sàng và thể thao. Đang chờ phê duyệt hồ sơ huấn luyện viên.'],
            
            // Student profiles
            [8, 22, 'male', 172, 68, 'muscle_gain', 15.8, '["Không có tiền sử bệnh lý"]', 'Sinh viên đam mê gym, mục tiêu xây dựng thân hình cân đối và lối sống lành mạnh.'],
            [9, 24, 'female', 160, 56, 'weight_loss', 24.5, '["Đau mỏi vai gáy văn phòng"]', 'Nhân viên văn phòng, mục tiêu giảm 5kg mỡ bụng và cải thiện sức bền.'],
            [10, 26, 'male', 176, 84, 'weight_loss', 23.0, '["Không"]', 'Quyết tâm siết mỡ đón Tết, đang theo đuổi lộ trình HIIT và thực đơn Eat Clean.'],
            [11, 23, 'female', 158, 46, 'maintain', 20.0, '["Không"]', 'Tập luyện nhẹ nhàng giữ dáng và rèn luyện thói quen dậy sớm.'],
            [12, 25, 'male', 170, 60, 'muscle_gain', 14.0, '["Hơi đau cổ tay khi hít đất"]', 'Người gầy lâu năm, quyết tâm tăng 6kg cơ nạc cùng FitVibe.'],
            [13, 28, 'female', 163, 53, 'maintain', 21.0, '["Không"]', 'Yêu thích Yoga, mong muốn có cơ thể linh hoạt và dẻo dai hơn.'],
            [14, 30, 'male', 182, 88, 'muscle_gain', 17.5, '["Không"]', 'Dân văn phòng tập gym buổi tối, đang học lộ trình tăng cơ toàn thân.'],
            [15, 27, 'female', 156, 49, 'weight_loss', 22.0, '["Không"]', 'Học viên mới tham gia FitVibe, rất thích tính năng AI Coach tư vấn calo.'],
            [16, 21, 'male', 174, 69, 'muscle_gain', 16.0, '["Không"]', 'Sinh viên năm cuối, tập luyện kết hợp giải tỏa căng thẳng học tập.']
        ];

        for (const p of profiles) {
            await connection.query(
                `INSERT INTO profiles (user_id, age, gender, height, weight, goal, body_fat, medical_history, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                p
            );
        }
        console.log('✅ Profiles inserted');

        // Coach Certificates
        await connection.query(`INSERT INTO coach_certificates (coach_id, image_url, created_at) VALUES
            (2, '/uploads/1778749197759-BangHLV.jpg', '2026-01-06 10:00:00'),
            (2, '/uploads/1778749197754-BangHLV2.jpg', '2026-01-06 10:05:00'),
            (3, '/uploads/1778749197759-BangHLV.jpg', '2026-01-11 11:00:00'),
            (4, '/uploads/1778749197754-BangHLV2.jpg', '2026-01-13 09:30:00'),
            (5, '/uploads/1778749197759-BangHLV.jpg', '2026-01-19 14:00:00'),
            (6, '/uploads/1778749197754-BangHLV2.jpg', '2026-01-21 16:00:00')
        `);
        console.log('✅ Coach certificates inserted');

        // ==========================================
        // 4. POSTS (25+ bài viết chuyên môn chi tiết)
        // ==========================================
        const postsData = [
            [2, 1, '15 Phút tập cơ bụng số 11 săn chắc tại nhà', 'Bài tập gập bụng đảo ngược kết hợp Plank nghiêng giúp siết chặt cơ chéo bụng và cơ thẳng bụng. Thực hiện 4 hiệp, mỗi hiệp 15-20 reps, nghỉ 45 giây giữa các hiệp.', 'https://www.youtube.com/watch?v=1919eTCoESo', 180, 'approved', 1420, 0.00, '2026-02-01 08:30:00'],
            [2, 2, 'Kỹ thuật Bench Press đẩy ngực an toàn không đau vai', 'Khóa chặt xương bả vai (retract scapula), giữ cổ tay thẳng góc với đòn tạ và kiểm soát điểm hạ ở núm vú. Không để cùi chỏ dang ngang 90 độ vì dễ gây chèn ép gân vai.', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 320, 'approved', 2560, 0.00, '2026-02-03 10:00:00'],
            [2, 10, 'Thực đơn Eat Clean 7 ngày chuẩn Macro cho Gymer', 'Tổng hợp 7 ngày ăn sạch cân bằng dinh dưỡng: Sáng yến mạch trứng luộc, Trưa ức gà áp chảo cơm lứt, Chiều sinh tố chuối whey protein, Tối cá hồi hấp rau củ.', '', 1850, 'approved', 3890, 0.00, '2026-02-04 14:15:00'],
            [3, 9, 'Bài tập Yoga 20 phút giải cứu cột sống cho dân công sở', 'Chuỗi động tác Cat-Cow, Downward Dog, Cobra và Child Pose giúp kéo giãn nhẹ nhàng cơ dựng sống, giải tỏa áp lực đĩa đệm sau 8 tiếng ngồi làm việc.', 'https://www.youtube.com/watch?v=inpok4MKVLM', 120, 'approved', 1890, 0.00, '2026-02-06 07:00:00'],
            [3, 12, 'Chế độ ăn Plant-Based giàu đạm thực vật không lo thiếu chất', 'Hướng dẫn kết hợp đậu phụ, đậu gà (chickpeas), hạt diêm mạch (quinoa), hạt chia và đậu lăng để tạo chuỗi axit amin hoàn chỉnh tương đương thịt bò.', '', 1900, 'approved', 1150, 0.00, '2026-02-08 11:30:00'],
            [4, 4, 'Bí quyết tập Lưng Xô V-Taper dày và rộng', 'Kết hợp bài kéo xà rộng tay (Wide Grip Pull-up) để mở rộng biên độ xô và bài Barbell Row để tăng độ dày cho cơ lưng giữa. Tập trung vào co thắt đỉnh 1 giây.', 'https://www.youtube.com/watch?v=G8l_8chR5BE', 380, 'approved', 3120, 0.00, '2026-02-10 15:00:00'],
            [4, 3, 'Squat chuẩn form từ gốc rễ: Tránh chấn thương đầu gối', 'Đặt chân rộng bằng vai, mũi chân mở góc 30 độ. Đẩy hông ra sau đồng thời gập gối, duy trì lưng thẳng tự nhiên. Đầu gối hướng theo chiều mũi chân trong suốt chuyển động.', 'https://www.youtube.com/watch?v=bEv6CCg2BC8', 420, 'approved', 4200, 0.00, '2026-02-12 09:00:00'],
            [4, 14, 'Chiến lược nạp Macro High-Protein cho giai đoạn Bulking', 'Tỷ lệ vàng 40% Carb - 30% Protein - 30% Fat. Cung cấp 2.0g - 2.2g Protein trên mỗi kg trọng lượng cơ thể mỗi ngày để tối ưu tổng hợp protein cơ bắp.', '', 2600, 'approved', 2410, 0.00, '2026-02-14 16:30:00'],
            [5, 7, 'HIIT Tabata 15 phút đốt sạch mỡ thừa không cần dụng cụ', 'Công thức 20 giây dốc hết sức - 10 giây nghỉ: Burpees, High Knees, Mountain Climbers và Jumping Squats. Kích hoạt hiệu ứng đốt mỡ EPOC kéo dài 24h sau tập.', 'https://www.youtube.com/watch?v=ml6cT4AZdqI', 280, 'approved', 5100, 0.00, '2026-02-16 17:00:00'],
            [5, 11, 'Thực đơn Keto 1 tuần: Đốt mỡ thần tốc không thấy đói', 'Nguyên tắc nạp 70% chất béo tốt (bơ, dầu olive, cá béo), 25% protein và dưới 5% carbohydrate. Đưa cơ thể vào trạng thái Ketosis để lấy mỡ thừa làm năng lượng.', '', 2100, 'approved', 2900, 0.00, '2026-02-18 10:20:00'],
            [6, 8, 'Hành trình từ 0 lên 10 cái Hít Xà đơn (Pull-up Mastery)', 'Giáo án từng bước: Dead Hang (treo người) -> Scapular Pulls (kích hoạt xương bả vai) -> Negative Pulls (hạ chậm 5 giây) -> Hít xà có dây kháng lực hỗ trợ.', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', 250, 'approved', 3450, 0.00, '2026-02-20 18:00:00'],
            [6, 6, 'Tay trước cuồn cuộn với bài Bicep Curls & Hammer Curls', 'Phân tích cơ học: Bicep Curl tác động đầu ngắn và đầu dài cơ nhị đầu; Hammer Curl đánh mạnh vào cơ cánh tay quay (brachialis) giúp bắp tay trông dày dặn hơn.', 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', 260, 'approved', 1980, 0.00, '2026-02-22 14:00:00'],
            [2, 5, 'Khắc phục vai xuôi - Xây dựng bờ vai vuông chữ V nam tính', 'Tập trung vào cơ vai bên (Lateral Deltoid) bằng bài Dumbbell Lateral Raise với mức tạ vừa phải, kiểm soát không dùng đà. Bổ sung Face Pull để cân bằng cơ vai sau.', 'https://www.youtube.com/watch?v=qEwKCR5JCog', 290, 'approved', 1670, 0.00, '2026-02-24 08:00:00'],
            [3, 15, 'Intermittent Fasting 16/8: Cách áp dụng an toàn và hiệu quả', 'Khung giờ vàng 12h trưa - 8h tối. Uống nhiều nước lọc và cà phê đen không đường trong khung 16 tiếng nhịn để hỗ trợ thanh lọc cơ thể và điều hòa insulin.', '', 1600, 'approved', 2230, 0.00, '2026-02-26 09:30:00'],
            [5, 13, 'Low Carb bền vững: 5 nguồn tinh bột tốt thay thế cơm trắng', 'Khoai lang vàng, yến mạch cán dẹt, gạo lứt huyết rồng, ngô luộc và hạt diêm mạch. Chỉ số GI thấp giúp ổn định đường huyết và no lâu hơn.', '', 1750, 'approved', 1840, 0.00, '2026-03-01 11:00:00'],
            
            // Pending posts for Admin moderation demo
            [2, 1, 'Top 5 sai lầm khiến bạn tập bụng mãi không hiện múi', 'Tập bụng mỗi ngày nhưng không thâm hụt calo; chỉ gập bụng mà bỏ quên các bài tập đa khớp; uống không đủ nước và thiếu ngủ.', '', 150, 'pending', 45, 0.00, '2026-03-10 14:00:00'],
            [4, 2, 'Incline Dumbbell Press: Bí quyết lấp đầy khe ngực trên', 'Điều chỉnh ghế nghiêng 30 độ. Không nâng ghế quá cao sẽ ăn vào cơ vai trước. Kiểm soát tạ đi xuống trong 3 giây và phát lực dứt khoát khi đẩy lên.', 'https://www.youtube.com/watch?v=8iPEnn-ltC8', 310, 'pending', 60, 0.00, '2026-03-11 09:00:00'],
            [5, 7, 'Cardio leo dốc (Incline Treadmill Walk): Đốt mỡ không mất cơ', 'Độ dốc 12%, tốc độ 4.5 - 5.0 km/h trong 30-45 phút sau buổi tập tạ. Nhịp tim duy trì ở vùng Fat-Burning Zone (60-70% Max Heart Rate).', '', 350, 'pending', 82, 0.00, '2026-03-12 16:20:00']
        ];

        for (const post of postsData) {
            await connection.query(
                `INSERT INTO posts (coach_id, category_id, title, content, video_url, calories_info, status, views, price, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                post
            );
        }
        console.log(`✅ ${postsData.length} Posts created`);

        // ==========================================
        // 5. COMMENTS & BOOKMARKS (Tương tác sôi nổi)
        // ==========================================
        const comments = [
            [1, 8, 'Bài viết quá chi tiết thầy ơi! Em tập xong cơ bụng mỏi nhừ nhưng cảm nhận cơ rất đã.'],
            [1, 2, 'Cảm ơn Sơn Hà! Nhớ duy trì 3 buổi/tuần và kết hợp ăn uống thâm hụt calo nhé em.'],
            [2, 10, 'Cho em hỏi nếu bị đau khớp cổ tay nhẹ thì có nên cuốn băng tay khi đẩy ngực không ạ?'],
            [2, 4, 'Nên dùng băng quấn cổ tay (Wrist Wraps) em nhé, và kiểm tra lại vị trí đặt đòn tạ trên lòng bàn tay.'],
            [3, 9, 'Thực đơn này rất dễ chuẩn bị, em đã áp dụng được 3 ngày thấy người nhẹ nhõm hẳn!'],
            [4, 8, 'Bài tập Yoga này thật sự cứu cánh cho dân IT ngồi cả ngày như em, cảm ơn cô giáo nhiều ạ.'],
            [6, 12, 'Hôm nay em thử làm theo form Squat này thấy đầu gối êm hẳn không bị lạo xạo nữa.'],
            [6, 4, 'Rất tốt Quốc Bảo! Hãy nhớ gồng core bụng trước khi bắt đầu hạ người xuống nhé.'],
            [8, 14, 'Tabata 15 phút mà mồ hôi ướt đẫm áo, tim đập nhanh dã man nhưng tập xong cực kỳ sảng khoái!'],
            [11, 8, 'Hít xà âm (Negative Pull-up) thật sự hiệu quả, sau 2 tuần em đã tự hít được 3 cái trọn vẹn rồi!']
        ];
        for (const c of comments) {
            await connection.query(`INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)`, c);
        }

        const bookmarks = [
            [8, 1], [8, 3], [8, 6], [8, 11],
            [9, 1], [9, 3], [9, 4],
            [10, 2], [10, 6], [10, 7],
            [12, 6], [12, 11], [14, 2], [14, 6]
        ];
        for (const b of bookmarks) {
            await connection.query(`INSERT IGNORE INTO bookmarks (user_id, post_id) VALUES (?, ?)`, b);
        }
        console.log('✅ Comments & Bookmarks inserted');

        // ==========================================
        // 6. ROUTES & ROUTE STAGES (Lộ trình tuần tự chuẩn)
        // ==========================================
        const routesData = [
            [1, 2, 'Lộ trình 30 Ngày Siết Cơ Bụng & Giảm Mỡ Cấp Tốc', 'Giáo án huấn luyện toàn diện 4 giai đoạn kết hợp bài tập kháng lực cốt lõi, cardio nhịp tim và thực đơn dinh dưỡng thâm hụt calo khoa học.', 490000.00, 'weight_loss', 'NASM Certified Specialist', '2026-02-01 09:00:00'],
            [2, 4, 'Chinh Phục Khối Cơ Nạc Toàn Thân 60 Ngày (Hypertrophy)', 'Lộ trình tập tạ bài bản từ căn bản đến nâng cao. Tối ưu kích thích phì đại cơ bắp (Hypertrophy), gia tăng sức mạnh vượt trội.', 890000.00, 'muscle_gain', 'ACSM Master Trainer', '2026-02-05 10:00:00'],
            [3, 3, 'Yoga & Khởi Động Phục Hồi Vóc Dáng Nữ Giới 21 Ngày', 'Lộ trình nhẹ nhàng, thư giãn dành riêng cho phái đẹp và dân văn phòng nhằm phục hồi cột sống, thon gọn eo và cải thiện giấc ngủ.', 350000.00, 'maintain', 'Yoga Alliance RYT 200', '2026-02-10 11:00:00'],
            [4, 5, 'Chiến Binh HIIT Đốt Mỡ Cường Độ Cao 4 Tuần', 'Chương trình luyện tập đốt mỡ liên hoàn, tối ưu hóa quá trình trao đổi chất và rèn luyện thể lực bền bỉ.', 590000.00, 'weight_loss', 'HIIT & Boxing Specialist', '2026-02-15 14:00:00'],
            [5, 6, 'Calisthenics Cơ Bản: Từ Số 0 Lên Đẳng Cấp Thể Thao Đường Phố', 'Làm chủ toàn diện trọng lượng cơ thể: Chống đẩy biến thể, kéo xà, Dips xà kép và các tư thế thăng bằng đỉnh cao.', 650000.00, 'muscle_gain', 'Street Workout Master', '2026-02-20 15:30:00']
        ];

        for (const r of routesData) {
            await connection.query(
                `INSERT INTO routes (id, coach_id, title, description, price, target_goal, standard, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                r
            );
        }

        // Route Stages
        const stagesData = [
            // Route 1 (30 ngày siết bụng)
            [1, 1, 1, 'Giai đoạn 1: Kỹ thuật Hít thở & Kích hoạt cơ lõi (Core Activation)', 'https://www.youtube.com/watch?v=1919eTCoESo', 'Học kỹ thuật gồng bụng (Bracing) và hít thở bằng cơ hoành. Thực hiện chuỗi Plank 3 hiệp x 45s.', 'Nạp 1800 kcal/ngày, hạn chế tinh bột nhanh sau 18h, uống đủ 2.5 lít nước.', 1800],
            [2, 1, 2, 'Giai đoạn 2: Tăng áp lực với Deadbug & Leg Raise', 'https://www.youtube.com/watch?v=inpok4MKVLM', 'Thực hiện Deadbug 3 hiệp x 12 reps mỗi bên. Lưng dưới dán chặt sàn, không để hở khoảng trống.', 'Bổ sung 1 bữa phụ hạt hạnh nhân và sữa chua Hy Lạp, tăng lượng rau xanh.', 1750],
            [3, 1, 3, 'Giai đoạn 3: Bứt phá cùng HIIT Tabata Siết Eo', 'https://www.youtube.com/watch?v=ml6cT4AZdqI', 'Kết hợp Mountain Climbers và Bicycle Crunch trong chuỗi Tabata 4 phút. Tối ưu tiêu hao mỡ bụng.', 'Thực đơn Eat Clean nghiêm ngặt, cắt bỏ hoàn toàn đường tinh luyện.', 1700],
            [4, 1, 4, 'Giai đoạn 4: Đánh giá thành quả & Hoàn thiện cơ bụng số 11', 'https://www.youtube.com/watch?v=1919eTCoESo', 'Bài kiểm tra tổng hợp: 2 phút Plank liên tục + 30 cái gập bụng chạm gót. Quay video nộp nghiệm thu.', 'Ăn đủ 130g Protein/ngày để giữ khối cơ bụng săn chắc.', 1650],

            // Route 2 (Tăng cơ 60 ngày)
            [5, 2, 1, 'Giai đoạn 1: Căn bản Đẩy - Kéo - Chân (Push - Pull - Legs)', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 'Làm quen với các chuyển động cơ bản: Đẩy ngực tạ đơn, Kéo xà trợ lực, Squat không tạ.', 'Chế độ ăn thặng dư năng lượng +300 kcal (TDEE + 300 = 2500 kcal).', 2500],
            [6, 2, 2, 'Giai đoạn 2: Gia tăng mức tạ lũy tiến (Progressive Overload)', 'https://www.youtube.com/watch?v=G8l_8chR5BE', 'Tăng dần 2.5kg - 5kg mỗi bài. Tập trung vào chuyển động hạ tạ có kiểm soát (Eccentric phase 3s).', 'Nạp 2.0g Protein/kg cơ thể, bổ sung Creatine 5g mỗi ngày.', 2650],
            [7, 2, 3, 'Giai đoạn 3: Tách nhóm cơ chuyên sâu (Upper / Lower Split)', 'https://www.youtube.com/watch?v=bEv6CCg2BC8', 'Tập trung vào phát triển ngực trên, xô rộng và bắp chân săn chắc. Kiểm tra form Deadlift.', 'Duy trì 4 bữa ăn giàu dinh dưỡng và ngủ đủ 8 tiếng mỗi đêm.', 2700],

            // Route 3 (Yoga phục hồi)
            [8, 3, 1, 'Giai đoạn 1: Đánh thức cột sống và thở bụng', 'https://www.youtube.com/watch?v=inpok4MKVLM', 'Chuỗi 12 động tác Chào Mặt Trời (Sun Salutation) khởi động tuần hoàn máu và làm ấm khớp.', 'Ăn nhẹ trước tập 1 tiếng: 1 quả chuối hoặc 1 cốc sữa ấm.', 1500],
            [9, 3, 2, 'Giai đoạn 2: Mở khớp háng và thon gọn đùi', 'https://www.youtube.com/watch?v=inpok4MKVLM', 'Tư thế Chiến binh (Warrior I & II) kết hợp Tư thế Bồ câu (Pigeon Pose) giải tỏa căng cứng hông.', 'Bổ sung nước ép cần tây và các loại hạt dinh dưỡng.', 1550],

            // Route 4 (Chiến binh HIIT)
            [10, 4, 1, 'Giai đoạn 1: Xây dựng nền tảng tim mạch (Cardio Base)', 'https://www.youtube.com/watch?v=ml6cT4AZdqI', 'Chạy biến tốc kết hợp Jumping Jacks 20 phút. Kiểm tra nhịp tim mục tiêu.', 'Uống nước điện giải trong lúc tập, nạp tinh bột phức trước tập 2 tiếng.', 2000]
        ];

        for (const s of stagesData) {
            await connection.query(
                `INSERT INTO route_stages (id, route_id, stage_order, title, video_url, description, nutrition_plan, calories_target) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                s
            );
        }
        console.log(`✅ 5 Routes and 10 Stages created`);

        // ==========================================
        // 7. SUBMISSIONS & PROGRESS (Minh chứng nộp bài)
        // ==========================================
        // Học viên nộp bài cho HLV chấm:
        const submissions = [
            // Sơn Hà (User 8) nộp Route 1 Stage 1 -> ĐÃ DUYỆT (PASSED)
            [1, 8, 1, 'passed', '/uploads/1780130665978-302183037.mp4', 'Form Plank rất thẳng lưng, siết cơ bụng tốt, không bị võng lưng dưới. Đạt tiêu chuẩn hoàn thành Giai đoạn 1!', '2026-02-10 14:00:00', '2026-02-10 16:30:00'],
            // Sơn Hà (User 8) nộp Route 1 Stage 2 -> ĐANG CHỜ DUYỆT (SUBMITTED) -> Rất tuyệt để HLV demo chấm bài!
            [2, 8, 2, 'submitted', '/uploads/1780131026776-55874999.mp4', null, '2026-03-12 10:15:00', null],
            // Quốc Bảo (User 10) nộp Route 2 Stage 1 -> PASSED
            [3, 10, 5, 'passed', '/uploads/1781338891715-207658646.mp4', 'Kỹ thuật đẩy tạ dứt khoát, khóa bả vai chuẩn xác. Tiếp tục phát huy ở Stage 2 nhé!', '2026-02-15 15:00:00', '2026-02-16 09:00:00'],
            // Thu Hương (User 9) nộp Route 3 Stage 1 -> PASSED
            [4, 9, 8, 'passed', '/uploads/1781339723356-793677337.mp4', 'Động tác mềm mại, thở đều theo nhịp chuyển động. Rất xuất sắc!', '2026-02-20 08:30:00', '2026-02-20 11:00:00'],
            // Nhật Minh (User 12) nộp Route 2 Stage 1 -> SUBMITTED (Đang chờ chấm)
            [5, 12, 5, 'submitted', '/uploads/1781592898809-493653275.mp4', null, '2026-03-13 07:45:00', null]
        ];

        for (const sub of submissions) {
            await connection.query(
                `INSERT INTO route_submissions (id, user_id, route_stage_id, status, submission_video_url, coach_feedback, submitted_at, evaluated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                sub
            );
            await connection.query(
                `INSERT INTO user_route_progress (id, user_id, route_stage_id, status, submission_video_url, coach_feedback, submitted_at, evaluated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                sub
            );
        }
        console.log('✅ Route submissions & Progress synced');

        // ==========================================
        // 8. ENROLLMENTS & PURCHASES (Đăng ký học & Mua lộ trình)
        // ==========================================
        await connection.query(`INSERT INTO enrollments (user_id, coach_id, status, created_at) VALUES
            (8, 2, 'active', '2026-02-01 09:15:00'),
            (8, 4, 'active', '2026-02-10 10:00:00'),
            (9, 3, 'active', '2026-02-05 11:30:00'),
            (10, 2, 'active', '2026-02-08 14:00:00'),
            (10, 4, 'active', '2026-02-12 16:00:00'),
            (12, 4, 'active', '2026-02-15 08:45:00'),
            (13, 3, 'active', '2026-02-20 09:30:00'),
            (14, 5, 'active', '2026-02-22 17:00:00')
        `);

        await connection.query(`INSERT INTO purchases (user_id, content_id, content_type, price_paid, created_at) VALUES
            (8, 1, 'route', 490000.00, '2026-02-01 09:10:00'),
            (8, 2, 'route', 890000.00, '2026-02-10 09:50:00'),
            (9, 3, 'route', 350000.00, '2026-02-05 11:20:00'),
            (10, 1, 'route', 490000.00, '2026-02-08 13:50:00'),
            (10, 2, 'route', 890000.00, '2026-02-12 15:45:00'),
            (12, 2, 'route', 890000.00, '2026-02-15 08:30:00'),
            (14, 4, 'route', 590000.00, '2026-02-22 16:45:00')
        `);
        console.log('✅ Enrollments & Purchases inserted');

        // ==========================================
        // 9. WEIGHT LOGS (Biểu đồ cân nặng tiến trình thật)
        // ==========================================
        // Sơn Hà (User 8): Tiến trình tăng cơ từ 65kg lên 68kg cực đẹp
        const sonHaWeights = [
            [8, 65.0, '2026-01-15 07:00:00'],
            [8, 65.4, '2026-01-22 07:00:00'],
            [8, 65.8, '2026-01-29 07:00:00'],
            [8, 66.2, '2026-02-05 07:00:00'],
            [8, 66.7, '2026-02-12 07:00:00'],
            [8, 67.1, '2026-02-19 07:00:00'],
            [8, 67.5, '2026-02-26 07:00:00'],
            [8, 67.8, '2026-03-05 07:00:00'],
            [8, 68.0, '2026-03-12 07:00:00']
        ];
        for (const w of sonHaWeights) {
            await connection.query(`INSERT INTO weight_logs (user_id, weight, logged_at) VALUES (?, ?, ?)`, w);
        }

        // Thu Hương (User 9): Giảm mỡ từ 59kg xuống 56kg
        const huongWeights = [
            [9, 59.0, '2026-02-01 07:30:00'],
            [9, 58.3, '2026-02-08 07:30:00'],
            [9, 57.6, '2026-02-15 07:30:00'],
            [9, 56.8, '2026-02-22 07:30:00'],
            [9, 56.0, '2026-03-01 07:30:00']
        ];
        for (const w of huongWeights) {
            await connection.query(`INSERT INTO weight_logs (user_id, weight, logged_at) VALUES (?, ?, ?)`, w);
        }

        // Quốc Bảo (User 10): Giảm mỡ từ 87kg xuống 84kg
        const baoWeights = [
            [10, 87.0, '2026-02-05 08:00:00'],
            [10, 86.1, '2026-02-12 08:00:00'],
            [10, 85.2, '2026-02-20 08:00:00'],
            [10, 84.4, '2026-02-28 08:00:00'],
            [10, 84.0, '2026-03-08 08:00:00']
        ];
        for (const w of baoWeights) {
            await connection.query(`INSERT INTO weight_logs (user_id, weight, logged_at) VALUES (?, ?, ?)`, w);
        }
        console.log('✅ Weight logs inserted (smooth charts)');

        // ==========================================
        // 10. TRANSACTIONS (Lịch sử Nạp ví VNPay)
        // ==========================================
        const transactionsData = [
            [8, 1000000, '8T01091500', 'success', '2026-02-01 09:05:00'],
            [8, 2000000, '8T10094500', 'success', '2026-02-10 09:45:00'],
            [8, 500000, '8T25143000', 'success', '2026-02-25 14:30:00'],
            [8, 100000, '8T13064022', 'success', '2026-03-13 06:40:22'],
            [9, 500000, '9T05111500', 'success', '2026-02-05 11:15:00'],
            [9, 1000000, '9T20150000', 'success', '2026-02-20 15:00:00'],
            [10, 2000000, '10T08134000', 'success', '2026-02-08 13:40:00'],
            [10, 1000000, '10T12153000', 'success', '2026-02-12 15:30:00'],
            [12, 1500000, '12T15082000', 'success', '2026-02-15 08:20:00'],
            [14, 3500000, '14T22163000', 'success', '2026-02-22 16:30:00'],
            [16, 200000, '16T05164500', 'failed', '2026-03-05 16:45:00']
        ];
        for (const tr of transactionsData) {
            await connection.query(
                `INSERT INTO transactions (user_id, amount, txn_ref, status, created_at) VALUES (?, ?, ?, ?, ?)`,
                tr
            );
        }
        console.log(`✅ ${transactionsData.length} VNPay Transactions created`);

        // ==========================================
        // 11. WITHDRAWALS (Lệnh rút tiền của HLV)
        // ==========================================
        const withdrawalsData = [
            // Đã duyệt
            [2, 3000000.00, 'Vietcombank', '0011004567890', 'NGUYEN VAN AN', 'approved', '2026-02-15 10:00:00', '2026-02-15 14:00:00'],
            [4, 5000000.00, 'Techcombank', '19034567891011', 'LE QUANG CUONG', 'approved', '2026-02-20 11:30:00', '2026-02-20 15:30:00'],
            [6, 2000000.00, 'MB Bank', '0888999888999', 'DANG HOANG LONG', 'approved', '2026-02-25 16:00:00', '2026-02-26 09:00:00'],
            [5, 2500000.00, 'ACB', '2345678901', 'PHAM MINH DUC', 'approved', '2026-03-01 13:00:00', '2026-03-01 17:00:00'],
            
            // ĐANG CHỜ DUYỆT (PENDING) -> Để Admin vào demo bấm Duyệt Rút Tiền!
            [2, 2000000.00, 'Vietcombank', '0011004567890', 'NGUYEN VAN AN', 'pending', '2026-03-12 11:00:00', null],
            [4, 3500000.00, 'Techcombank', '19034567891011', 'LE QUANG CUONG', 'pending', '2026-03-13 08:30:00', null],
            [3, 1500000.00, 'BIDV', '12410004567892', 'TRAN BICH NGOC', 'pending', '2026-03-13 09:15:00', null]
        ];

        for (const w of withdrawalsData) {
            await connection.query(
                `INSERT INTO withdrawals (coach_id, amount, bank_name, account_number, account_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                w
            );
        }
        console.log(`✅ ${withdrawalsData.length} Coach Withdrawals inserted (with pending items for Admin demo)`);

        console.log('\n🎉 ALL REALISTIC SAMPLE DATA GENERATED SUCCESSFULLY!');
        console.log('----------------------------------------------------');
        console.log('📌 DANH SÁCH TÀI KHOẢN CHUẨN ĐỂ BẢO VỆ ĐỒ ÁN (PASS: 123456):');
        console.log('👑 ADMIN: admin@fitvibe.com (Quản trị hệ thống, duyệt bài, duyệt rút tiền)');
        console.log('🏋️ HLV 1: coach1@fitvibe.com (HLV Nguyễn Văn An - có bài nộp chờ chấm)');
        console.log('🏋️ HLV 2: coach3@fitvibe.com (HLV Lê Quang Cường - có lệnh rút tiền chờ duyệt)');
        console.log('👤 HỌC VIÊN CHÍNH: user@fitvibe.com (Hoàng Ngọc Sơn Hà - có ví 2.450.000đ, có biểu đồ cân nặng, đã học Stage 1 & nộp Stage 2)');
        console.log('👤 HỌC VIÊN 2: user1@fitvibe.com (Nguyễn Thị Thu Hương - học viên nữ)');
        console.log('👤 HỌC VIÊN 3: user2@fitvibe.com (Trần Quốc Bảo - mục tiêu giảm cân)');
        console.log('----------------------------------------------------');

    } catch (err) {
        console.error('❌ Error seeding rich data:', err);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

seedRichData();
