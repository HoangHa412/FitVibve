/**
 * add_more_sample_data.js
 * Populates FitVibe with a massive, realistic dataset:
 * - 12 New Students / Users (IDs 17 to 28) with profiles & avatars
 * - 8 New Diverse Routes (IDs 6 to 13) across weight_loss, muscle_gain, maintain
 * - 24 New Route Stages (IDs 11 to 34) with video links, workouts, and nutrition plans
 * - 21 New High-Quality Posts (IDs 35 to 55) across workout & diet categories
 * - 25+ Engaging Comments & 30+ Bookmarks
 * - 18 New Enrollments & 18 Purchases
 * - 9 New Route Submissions (4 'submitted' for coach grading demo + 5 'passed' with coach feedback)
 * - 40+ Sequential Weight Logs for smooth, realistic charts
 * - 14 New VNPay Transactions & 4 Coach Withdrawals (including pending for admin demo)
 */

const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function addMoreSampleData() {
    let connection;
    try {
        console.log('🚀 Connecting to database to insert massive realistic sample data...');
        connection = await pool.getConnection();

        const defaultHash = await bcrypt.hash('123456', 10);
        console.log('🔑 Password hash for "123456" generated');

        // ==========================================
        // 1. EXTRA USERS (IDs 17 to 28)
        // ==========================================
        const extraUsers = [
            [17, 'tran.nam@fitvibe.com', defaultHash, 'Trần Nhật Nam', 'user', 1850000.00, 'active', null, '2026-02-15 08:00:00'],
            [18, 'ngoc.anh@fitvibe.com', defaultHash, 'Hoàng Ngọc Ánh', 'user', 920000.00, 'active', null, '2026-02-18 09:30:00'],
            [19, 'minh.triet@fitvibe.com', defaultHash, 'Lê Minh Triết', 'user', 2400000.00, 'active', null, '2026-02-20 10:15:00'],
            [20, 'phuong.thao@fitvibe.com', defaultHash, 'Vũ Phương Thảo', 'user', 750000.00, 'active', null, '2026-02-22 11:00:00'],
            [21, 'hai.dang@fitvibe.com', defaultHash, 'Nguyễn Hải Đăng', 'user', 1350000.00, 'active', null, '2026-02-25 14:00:00'],
            [22, 'lan.huong@fitvibe.com', defaultHash, 'Đặng Lan Hương', 'user', 1100000.00, 'active', null, '2026-02-28 15:30:00'],
            [23, 'quang.huy@fitvibe.com', defaultHash, 'Bùi Quang Huy', 'user', 3100000.00, 'active', null, '2026-03-01 08:45:00'],
            [24, 'khanh.vy@fitvibe.com', defaultHash, 'Trịnh Khánh Vy', 'user', 880000.00, 'active', null, '2026-03-03 09:20:00'],
            [25, 'tien.dung@fitvibe.com', defaultHash, 'Phan Tiến Dũng', 'user', 1650000.00, 'active', null, '2026-03-05 10:40:00'],
            [26, 'thanh.ha@fitvibe.com', defaultHash, 'Lý Thanh Hà', 'user', 950000.00, 'active', null, '2026-03-07 14:15:00'],
            [27, 'duc.anh@fitvibe.com', defaultHash, 'Cao Đức Anh', 'user', 2800000.00, 'active', null, '2026-03-09 16:00:00'],
            [28, 'mai.chi@fitvibe.com', defaultHash, 'Dương Mai Chi', 'user', 1200000.00, 'active', null, '2026-03-10 17:30:00']
        ];

        for (const u of extraUsers) {
            await connection.query(
                `INSERT INTO users (id, email, password, full_name, role, balance, status, avatar_url, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), balance = VALUES(balance)`,
                u
            );
        }
        console.log(`✅ ${extraUsers.length} extra Users inserted/updated (IDs 17 to 28)`);

        // ==========================================
        // 2. PROFILES FOR EXTRA USERS
        // ==========================================
        const extraProfiles = [
            [17, 28, 'male', 178, 83, 'weight_loss', 22.5, '["Không có"]', 'Kỹ sư phần mềm, cần giảm mỡ bụng do ngồi nhiều và tăng cường thể lực.'],
            [18, 23, 'female', 162, 51, 'maintain', 19.0, '["Đau mỏi vai gáy"]', 'Người mẫu ảnh tự do, tập luyện để duy trì vóc dáng thon gọn và dẻo dai.'],
            [19, 25, 'male', 171, 57, 'muscle_gain', 13.0, '["Dạ dày nhạy cảm"]', 'Gầy kinh niên từ nhỏ, quyết tâm tăng 8kg cơ bắp sạch với chế độ Hypertrophy.'],
            [20, 31, 'female', 159, 63, 'weight_loss', 26.0, '["Hậu phẫu sinh con 2 năm"]', 'Mẹ bỉm sữa văn phòng, mục tiêu lấy lại vòng eo săn chắc thời con gái.'],
            [21, 22, 'male', 183, 74, 'muscle_gain', 14.5, '["Không có"]', 'Sinh viên thể thao, đam mê xà đơn và các bài tập trọng lượng cơ thể (Calisthenics).'],
            [22, 27, 'female', 166, 53, 'maintain', 20.0, '["Thoái hóa nhẹ đốt sống cổ C4-C5"]', 'Yêu thích Pilates và Yoga, tập luyện hỗ trợ cột sống và cải thiện dáng đi đứng.'],
            [23, 29, 'male', 175, 92, 'weight_loss', 28.5, '["Huyết áp hơi cao"]', 'Quản lý kinh doanh thường xuyên tiếp khách, đặt mục tiêu giảm 12kg mỡ trong 3 tháng.'],
            [24, 20, 'female', 156, 45, 'muscle_gain', 18.0, '["Không có"]', 'Sinh viên năm 2, muốn tăng cơ đùi mông săn chắc, tự tin diện trang phục thể thao.'],
            [25, 34, 'male', 173, 80, 'weight_loss', 24.0, '["Gan nhiễm mỡ độ 1"]', 'Trưởng phòng tài chính, chuyển hướng lối sống lành mạnh với thực đơn Eat Clean và HIIT.'],
            [26, 26, 'female', 160, 49, 'maintain', 20.5, '["Không có"]', 'Giáo viên mầm non, rèn luyện sức bền và năng lượng tích cực mỗi ngày.'],
            [27, 24, 'male', 177, 67, 'muscle_gain', 13.8, '["Không có"]', 'Tập gym 1 năm, muốn tối ưu hóa lộ trình để bứt phá mức tạ và làm dày khối cơ ngực xô.'],
            [28, 30, 'female', 164, 58, 'weight_loss', 23.5, '["Không có"]', 'Đang theo đuổi chế độ nhịn ăn gián đoạn 16/8 kết hợp bài tập đốt mỡ liên hoàn.']
        ];

        for (const p of extraProfiles) {
            await connection.query(
                `INSERT INTO profiles (user_id, age, gender, height, weight, goal, body_fat, medical_history, bio)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE age=VALUES(age), height=VALUES(height), weight=VALUES(weight), goal=VALUES(goal), bio=VALUES(bio)`,
                p
            );
        }
        console.log(`✅ ${extraProfiles.length} Profiles inserted/updated`);

        // ==========================================
        // 3. EXTRA ROUTES (IDs 6 to 13)
        // ==========================================
        const extraRoutes = [
            [6, 3, 'Pilates Điêu Khắc Vóc Dáng & Chỉnh Sửa Tư Thế (Posture Correction) 30 Ngày', 'Lộ trình Pilates chuyên sâu tập trung vào điều chỉnh độ cong cột sống, khắc phục tình trạng gù lưng vai xuôi, thon gọn bắp đùi và siết chặt vòng 2 tự nhiên.', 520000.00, 'maintain', 'PMA Certified Pilates Master', '2026-02-22 09:00:00'],
            [7, 4, 'Tăng Cơ Ngực Dày & Cắt Nét Cơ Lưng V-Taper 45 Ngày', 'Chương trình huấn luyện kháng lực tập trung phần thân trên (Upper Body Hypertrophy). Tối ưu hóa kích thước cơ ngực trên, mở rộng biên độ xô và tạo độ dày ấn tượng cho cơ lưng giữa.', 790000.00, 'muscle_gain', 'IFBB Pro Certified Coach', '2026-02-24 10:00:00'],
            [8, 2, 'Giảm Mỡ Bụng Nhanh Cho Dân Công Sở Bận Rộn 28 Ngày', 'Giải pháp hoàn hảo cho người bận rộn: 25 phút mỗi ngày với các bài tập đa khớp kết hợp thâm hụt calo thông minh, cam kết giảm 3-5cm vòng bụng mà không cần nhịn ăn cực đoan.', 490000.00, 'weight_loss', 'NASM Weight Loss Specialist', '2026-02-26 11:00:00'],
            [9, 6, 'Calisthenics Nâng Cao: Chinh Phục Muscle-Up & Handstand 60 Ngày', 'Giáo án nâng cao từ HLV Calisthenics chuyên nghiệp: Từng bước làm chủ kỹ thuật hít xà lăng người (Muscle-up) dứt khoát và thăng bằng chuối (Handstand) vững vàng trên mọi mặt phẳng.', 720000.00, 'muscle_gain', 'WSWCF World Street Workout Master', '2026-02-28 14:00:00'],
            [10, 5, 'Cardio Kickboxing Đốt Mỡ Cực Hạn & Rèn Phản Xạ Nhanh 30 Ngày', 'Sự kết hợp bùng nổ giữa đòn đấm Boxing, cú đá Muay Thái và chuỗi Cardio nhịp tim cao. Đốt cháy tới 800 kcal/buổi, giải tỏa hoàn toàn áp lực công việc và nâng cao khả năng tự vệ.', 620000.00, 'weight_loss', 'WBA Boxing & Conditioning Coach', '2026-03-02 15:30:00'],
            [11, 2, 'Tăng Cân & Tăng Cơ Bắp Nạc Cho Người Gầy Lâu Năm 8 Tuần', 'Lộ trình "Skinny to Muscular" khoa học: Phối hợp thực đơn nạp thặng dư calo dễ hấp thu, chống đầy hơi cùng giáo án tập tạ kích thích tối đa sợi cơ type II nhanh nở.', 850000.00, 'muscle_gain', 'CSCS Strength & Conditioning Specialist', '2026-03-04 09:30:00'],
            [12, 3, 'Yoga Phục Hồi Thần Kinh, Giảm Stress & Cải Thiện Giấc Ngủ Sâu 21 Ngày', 'Liệu trình Yoga Chánh Niệm kết hợp hơi thở Pranayama và các tư thế Yin Yoga kéo giãn nhẹ nhàng. Tái tạo năng lượng, giải tỏa âu lo và hỗ trợ bạn đi vào giấc ngủ ngon chỉ sau 7 ngày.', 360000.00, 'maintain', 'Sivananda Yoga International Master', '2026-03-06 10:15:00'],
            [13, 5, 'Thử Thách 14 Ngày Cắt Nét (Shredding) Cấp Tốc Đón Sự Kiện', 'Lộ trình siết cân nhanh nhưng an toàn bằng cách kết hợp Fasted Cardio buổi sáng, giảm muối và thâm hụt calo có kiểm soát. Phù hợp cho người cần cắt nét nhanh trước sự kiện quan trọng.', 450000.00, 'weight_loss', 'ACE Certified Fitness Trainer', '2026-03-08 16:00:00']
        ];

        for (const r of extraRoutes) {
            await connection.query(
                `INSERT INTO routes (id, coach_id, title, description, price, target_goal, standard, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), price=VALUES(price), target_goal=VALUES(target_goal)`,
                r
            );
        }
        console.log(`✅ ${extraRoutes.length} extra Routes inserted (IDs 6 to 13)`);

        // ==========================================
        // 4. EXTRA ROUTE STAGES (IDs 11 to 34 - 24 stages)
        // ==========================================
        const extraStages = [
            // Route 6 (Pilates Posture)
            [11, 6, 1, 'Giai đoạn 1: Kích hoạt cơ bụng sâu (Transverse Abdominis) và thở lồng ngực', 'https://www.youtube.com/watch?v=inpok4MKVLM', 'Học cách siết chặt cơ ngang bụng mà không nín thở. Thực hiện tư thế Pelvic Tilt và Imprint 3 hiệp x 15 reps để đặt khung chậu vào trạng thái trung tính.', 'Thực đơn 1500 kcal giàu chất xơ, uống 1 cốc nước ấm chanh mật ong vào buổi sáng.', 1500],
            [12, 6, 2, 'Giai đoạn 2: Chuỗi động tác The Hundred và Swan Dive nắn chỉnh cột sống ngực', 'https://www.youtube.com/watch?v=inpok4MKVLM', 'Thực hiện The Hundred 100 nhịp đập tay kết hợp thở đều. Tiếp theo là Swan Dive mở rộng lồng ngực, kéo giãn cơ ngực trước bị co rút do ngồi máy tính.', 'Bổ sung sinh tố bơ sữa hạnh nhân vào bữa phụ xế chiều.', 1550],
            [13, 6, 3, 'Giai đoạn 3: Tinh chỉnh đường cong hông và kiểm tra cân bằng cơ thể (Teaser & Single Leg Stretch)', 'https://www.youtube.com/watch?v=inpok4MKVLM', 'Tư thế Teaser thử thách khả năng giữ thăng bằng trên xương cụt. Quay video 1 phút thực hiện chuỗi Single Leg Stretch để HLV đánh giá tư thế.', 'Duy trì chế độ ăn thanh đạm, hạn chế thực phẩm nhiều dầu mỡ sau 19h.', 1500],

            // Route 7 (Ngực Dày & V-Taper)
            [14, 7, 1, 'Giai đoạn 1: Kích hoạt ngực trên với Incline Dumbbell Press & Cable Crossover', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 'Ghế dốc 30 độ, siết bả vai hạ thấp. Đẩy tạ đôi 4 hiệp x 8-10 reps với tạ nặng tăng dần, tập trung vào điểm co cơ ngực trên ở đỉnh chuyển động.', 'Thực đơn tăng cơ 2700 kcal, nạp 160g protein từ ức gà, trứng và sữa chua Hy Lạp.', 2700],
            [15, 7, 2, 'Giai đoạn 2: Tấn công cơ xô lưng với Kéo xà đeo tạ và T-Bar Row dày lưng giữa', 'https://www.youtube.com/watch?v=G8l_8chR5BE', 'Thực hiện Weighted Pull-ups 4 hiệp x 6-8 reps. Barbell T-Bar Row gập người 45 độ, kéo tạ chạm bụng dưới để xây dựng độ dày cơ lưng.', 'Nạp Carb hấp thu chậm (khoai lang, yến mạch) trước tập 90 phút và nạp 5g Creatine.', 2800],
            [16, 7, 3, 'Giai đoạn 3: Hoàn thiện bờ vai 3D và bắp tay trước với kỹ thuật Giant-Set', 'https://www.youtube.com/watch?v=2yjwXTZQDDI', 'Phối hợp Dumbbell Shoulder Press liên hoàn với Lateral Raise và Face Pull. Đốt cháy sợi cơ và kích thích bơm máu tối đa.', 'Duy trì 2.2g Protein/kg cân nặng, ngủ sâu 8 tiếng để hormone tăng trưởng hoạt động tốt nhất.', 2850],

            // Route 8 (Giảm mỡ bụng công sở)
            [17, 8, 1, 'Giai đoạn 1: Thiết lập thâm hụt calo thông minh & 20 phút Circuit Training không tạ', 'https://www.youtube.com/watch?v=1919eTCoESo', 'Vòng lặp 4 bài: Squat bật nhảy, Chống đẩy biến thể, Mountain Climbers và Plank cẳng tay. Mỗi bài 40 giây, nghỉ 20 giây.', 'Thực đơn thâm hụt 400 kcal (khoảng 1650 kcal), cắt giảm trà sữa và nước ngọt đóng chai.', 1650],
            [18, 8, 2, 'Giai đoạn 2: Gia tăng cường độ với tạ đơn (Dumbbell Thrusters & Russian Twist)', 'https://www.youtube.com/watch?v=ml6cT4AZdqI', 'Kết hợp bài Dumbbell Thruster (Squat kết hợp đẩy tạ qua đầu) giúp đốt năng lượng toàn thân. Russian Twist siết cơ liên sườn.', 'Tăng cường rau xanh đậm, bổ sung 1 quả táo hoặc chuối vào bữa xế.', 1600],
            [19, 8, 3, 'Giai đoạn 3: Bứt phá vòng eo phẳng lì & Video nghiệm thu thể lực 3 phút', 'https://www.youtube.com/watch?v=1919eTCoESo', 'Bài kiểm tra cuối khóa: 100 cái Jumping Jacks + 30 cái gập bụng chạm gót chân + 90 giây Plank. Quay video gửi HLV duyệt hoàn thành lộ trình.', 'Ăn đủ đạm để tránh mất cơ trong giai đoạn giảm mỡ cuối cùng.', 1550],

            // Route 9 (Calisthenics nâng cao)
            [20, 9, 1, 'Giai đoạn 1: Sức kéo bùng nổ (Explosive High Pull-up ngực chạm xà)', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', 'Kéo xà phát lực bùng nổ đưa thanh xà xuống ngang ngực dưới. Kết hợp bài Straight Bar Dips (chống đẩy trên thanh xà đơn).', 'Nạp 2600 kcal đầy đủ carb phức hợp để có nguồn năng lượng bùng nổ tức thì.', 2600],
            [21, 9, 2, 'Giai đoạn 2: Kỹ thuật lăng chuyển trọng tâm (Transition Phase) trên xà đơn', 'https://www.youtube.com/watch?v=2z8JmcrW-As', 'Tập luyện kỹ thuật đưa cùi chỏ lên trên thanh xà (Elbow over the bar). Dùng dây kháng lực hỗ trợ để thuần thục chuyển động.', 'Bổ sung Whey Protein và chuối sau buổi tập để phục hồi gân cơ khuỷu tay.', 2650],
            [22, 9, 3, 'Giai đoạn 3: Chinh phục Muscle-Up mượt mà và Handstand giữ thăng bằng 30 giây', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', 'Thực hiện 3 cái Muscle-up liên tục chuẩn form không vung vẩy chân. Trồng chuối chống tường rồi tách dần chân để thăng bằng tự do.', 'Chế độ ăn duy trì cân nặng ổn định, tỷ lệ mỡ cơ thể dưới 14% để cơ thể nhẹ nhàng.', 2550],

            // Route 10 (Kickboxing đốt mỡ)
            [23, 10, 1, 'Giai đoạn 1: Bộ pháp di chuyển và Bộ tứ đòn tay căn bản (Jab - Cross - Hook - Uppercut)', 'https://www.youtube.com/watch?v=ml6cT4AZdqI', 'Học thế đứng Boxing vững chãi, xoay hông phát lực đòn đấm thẳng và đòn móc. Đấm gió (Shadow Boxing) 3 hiệp x 3 phút.', 'Thực đơn 2000 kcal giàu chất điện giải, uống nước dừa tươi bổ sung kali sau tập.', 2000],
            [24, 10, 2, 'Giai đoạn 2: Kết hợp đòn chân (Low Kick - Middle Kick) và né tránh phản xạ', 'https://www.youtube.com/watch?v=ml6cT4AZdqI', 'Kỹ thuật xoay mũi chân trụ 45 độ và vung cẳng chân tấn công. Kết hợp ngụp lặn né đòn (Slip & Roll) tăng phản xạ tự vệ.', 'Bổ sung ức gà hấp nấm và khoai lang luộc sau buổi tập kháng lực.', 1950],
            [25, 10, 3, 'Giai đoạn 3: Chuỗi liên hoàn 5 hiệp đối kháng túi cát cường độ cao', 'https://www.youtube.com/watch?v=ml6cT4AZdqI', 'Thử thách 5 hiệp đánh bao cát tốc độ cao. Đo nhịp tim và tiêu hao năng lượng đạt chuẩn 600-800 kcal/buổi.', 'Bù nước khoáng đầy đủ, duy trì chế độ giàu protein nạc để cơ bắp hồi phục nhanh.', 1900],

            // Route 11 (Tăng cân người gầy)
            [26, 11, 1, 'Giai đoạn 1: Thiết lập thặng dư calo +500 kcal & làm quen giáo án Full Body 3 buổi/tuần', 'https://www.youtube.com/watch?v=bEv6CCg2BC8', 'Tập các bài đa khớp lớn: Squat, Bench Press, Lat Pulldown với mức tạ vừa phải 10-12 reps để kích hoạt cơ bắp toàn thân.', 'Thực đơn 2900 kcal chia thành 5 bữa nhỏ (3 bữa chính + 2 bữa phụ sinh tố bơ đậu phộng chuối).', 2900],
            [27, 11, 2, 'Giai đoạn 2: Tăng dần mức tạ lũy tiến (Progressive Overload) và tăng thời gian cơ chịu áp lực', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 'Ghi chép nhật ký tạ mỗi tuần. Tăng 1.25 - 2.5kg cho mỗi hiệp bài đẩy ngực và gánh đùi. Tập trung hạ tạ chậm 3 giây.', 'Nạp 3100 kcal, bổ sung tinh bột tốt từ cơm gạo lứt, yến mạch và mỳ ý sốt bò băm.', 3100],
            [28, 11, 3, 'Giai đoạn 3: Bứt phá khối lượng cơ bắp và bảo vệ thành quả cân nặng', 'https://www.youtube.com/watch?v=G8l_8chR5BE', 'Nghiệm thu cân nặng mục tiêu (tăng từ 3-5kg so với ban đầu). Kiểm tra tỷ lệ cơ nạc và hoàn thiện form các bài tạ nặng.', 'Duy trì mức ăn cân bằng mới, tránh ăn đồ ngọt công nghiệp dễ tích tụ mỡ xấu.', 3000],

            // Route 12 (Yoga phục hồi giấc ngủ)
            [29, 12, 1, 'Giai đoạn 1: Giải phóng căng cứng vai cổ và thở cơ hoành giảm nhịp tim', 'https://www.youtube.com/watch?v=inpok4MKVLM', 'Chuỗi kéo giãn cổ, vai, ngực trước khi ngủ. Thực hành kỹ thuật thở 4-7-8 giúp làm dịu hệ thần kinh giao cảm.', 'Bữa tối nhẹ nhàng trước 19h: Súp rau củ hoặc cháo yến mạch hạt sen giúp an thần.', 1500],
            [30, 12, 2, 'Giai đoạn 2: Chuỗi tư thế gác chân lên tường (Viparita Karani) và Supta Baddha Konasana', 'https://www.youtube.com/watch?v=inpok4MKVLM', 'Gác chân lên tường 15 phút giúp máu hồi lưu về tim, giảm sưng phù bàn chân và thư giãn cột sống thắt lưng.', 'Uống 1 tách trà hoa cúc ấm không đường 30 phút trước khi lên giường.', 1520],
            [31, 12, 3, 'Giai đoạn 3: Thiền buông thư toàn thân (Yoga Nidra) và tái tạo năng lượng', 'https://www.youtube.com/watch?v=inpok4MKVLM', 'Thực hành quét cơ thể (Body Scan) từ ngón chân lên đỉnh đầu trong tư thế xác chết (Savasana). Giải tỏa triệt để mọi âu lo.', 'Duy trì không gian ngủ yên tĩnh, nhiệt độ mát mẻ và tắt thiết bị điện tử trước ngủ 1 tiếng.', 1500],

            // Route 13 (Shredding 14 ngày)
            [32, 13, 1, 'Giai đoạn 1: Cắt giảm Natri, hạn chế tích nước & Fasted Walking buổi sáng 45 phút', 'https://www.youtube.com/watch?v=ml6cT4AZdqI', 'Đi bộ dốc 45 phút ngay sau khi thức dậy khi bụng rỗng để cơ thể dùng trực tiếp chất béo làm năng lượng.', 'Cắt giảm đồ ăn mặn chế biến sẵn, uống đủ 3.5 lít nước lọc mỗi ngày để đào thải lượng nước thừa.', 1600],
            [33, 13, 2, 'Giai đoạn 2: Tập luyện khối lượng cao (High Volume Circuit 15-20 reps) vắt kiệt Glycogen', 'https://www.youtube.com/watch?v=1919eTCoESo', 'Giảm thời gian nghỉ giữa các hiệp xuống dưới 30 giây. Sử dụng tạ vừa phải nhưng đẩy nhanh tốc độ để đốt cháy calo tối đa.', 'Nạp 1500 kcal, tăng cường protein nạc từ lòng trắng trứng và cá trắng hấp.', 1550],
            [34, 13, 3, 'Giai đoạn 3: Nạp tinh bột sạch thông minh (Carb Re-feed) để cơ bắp căng đầy và khô nét', 'https://www.youtube.com/watch?v=1919eTCoESo', '2 ngày cuối cùng trước sự kiện: Nạp 1 lượng vừa đủ tinh bột từ khoai lang để cơ bắp hút nước trở lại, tạo vẻ ngoài săn chắc.', 'Chuẩn bị trang phục và kiểm tra chỉ số cơ thể đạt form ưng ý nhất!', 1750]
        ];

        for (const s of extraStages) {
            await connection.query(
                `INSERT INTO route_stages (id, route_id, stage_order, title, video_url, description, nutrition_plan, calories_target)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), nutrition_plan=VALUES(nutrition_plan), calories_target=VALUES(calories_target)`,
                s
            );
        }
        console.log(`✅ ${extraStages.length} extra Route Stages inserted (IDs 11 to 34)`);

        // ==========================================
        // 5. EXTRA POSTS (IDs 35 to 55 - 21 posts)
        // ==========================================
        const extraPosts = [
            // Diet Posts
            [2, 10, 'Bí quyết ướp ức gà siêu mềm mọng nước không bao giờ bị bở khô', 'Ngâm ức gà trong nước muối loãng 3% (brining) kèm vài lát chanh trong 30 phút trước khi chế biến. Áp chảo trên lửa vừa 6 phút mỗi mặt và đậy nắp để giữ hơi ẩm.', '', 220, 'approved', 3890, 0.00, '2026-03-01 08:30:00'],
            [3, 12, 'Sinh tố cải xoăn Kale, hạt óc chó và táo xanh thanh lọc cơ thể', '1 nắm lá cải xoăn kale bỏ cuống, 1 quả táo xanh, 3 hạt óc chó giã dập, 150ml nước dừa tươi. Thức uống giàu chất diệp lục giúp kiềm hóa cơ thể và giảm viêm.', '', 210, 'approved', 2450, 0.00, '2026-03-02 09:15:00'],
            [4, 14, 'Thăn bò áp chảo hương thảo kèm khoai lang nướng mật ong', '250g thăn bò Úc áp chảo bơ tỏi và lá hương thảo (rosemary). Dùng kèm 1 củ khoai lang nướng thơm lừng cung cấp 50g protein và năng lượng kéo dài suốt buổi tập.', '', 580, 'approved', 3120, 0.00, '2026-03-03 12:00:00'],
            [5, 11, 'Salad bơ trứng lòng đào sốt dầu giấm olive chuẩn Keto', '2 quả trứng luộc lòng đào 6 phút, 1 quả bơ sáp chín tới, xà lách mỡ và sốt dầu olive nguyên chất cùng giấm táo. Nguồn chất béo thực vật lành mạnh bảo vệ tim mạch.', '', 390, 'approved', 2760, 0.00, '2026-03-04 11:30:00'],
            [2, 13, '5 Loại quả mọng (Berries) chống oxy hóa và phục hồi cơ bắp thần tốc', 'Việt quất, dâu tây, mâm xôi chứa hàm lượng Anthocyanin dồi dào giúp trung hòa gốc tự do sinh ra trong quá trình tập luyện nặng, giảm đau nhức cơ sau tập.', '', 130, 'approved', 1980, 0.00, '2026-03-05 15:00:00'],
            [3, 10, 'Bữa phụ thông minh: Sữa chua Hy Lạp trộn hạt chia và việt quất', '1 hộp sữa chua Hy Lạp không đường (15g protein), 1 thìa hạt chia ngâm nở và 50g việt quất tươi. Vừa ngon miệng vừa cung cấp lợi khuẩn Probiotics cho đường ruột khỏe mạnh.', '', 180, 'approved', 3420, 0.00, '2026-03-06 16:30:00'],
            [6, 14, 'Nước ép cần tây dứa gừng giảm viêm khớp và hỗ trợ tiêu hóa', '3 nhánh cần tây tươi, 1/4 quả dứa và 1 nhánh gừng nhỏ ép lấy nước. Enzyme Bromelain trong dứa kết hợp chất chống oxy hóa trong cần tây hỗ trợ giảm sưng khớp rất tốt.', '', 140, 'approved', 1870, 0.00, '2026-03-07 07:45:00'],
            [4, 10, 'Thực đơn Low Carb 3 ngày thanh lọc cơ thể sau tiệc tùng', 'Kế hoạch ăn uống thanh lọc giúp đào thải lượng nước tích tụ do ăn nhiều muối và tinh bột xấu. Ưu tiên cá hấp, rau luộc và nước chanh ấm không đường.', '', 1500, 'approved', 2640, 0.00, '2026-03-08 10:00:00'],
            [2, 10, 'Bánh pancake yến mạch chuối không đường cho bữa sáng tràn năng lượng', 'Xay nhuyễn 1 quả chuối chín, 1 quả trứng và 40g bột yến mạch. Rán áp chảo chống dính không dầu mỡ. Món ăn sáng tuyệt vời cho cả người lớn lẫn trẻ em.', '', 290, 'approved', 4210, 0.00, '2026-03-09 08:00:00'],
            [5, 10, 'Hướng dẫn tính chỉ số BMR và TDEE chuẩn từng calo cho người mới', 'Công thức Mifflin-St Jeor chính xác nhất hiện nay để xác định mức tiêu hao năng lượng nền và cách nhân hệ số hoạt động thể chất để kiểm soát cân nặng bền vững.', '', 0, 'approved', 5120, 0.00, '2026-03-10 14:00:00'],
            [4, 14, 'Top 4 chất bổ sung dinh dưỡng (Supplements) cần thiết nhất cho Gymer', 'Phân tích khoa học về Whey Protein, Creatine Monohydrate, Dầu cá Omega-3 và Vitamin D3. Cách dùng đúng thời điểm để đạt hiệu quả chuyển hóa cao nhất.', '', 0, 'approved', 3780, 0.00, '2026-03-11 17:00:00'],

            // Workout Posts
            [4, 3, 'Bí quyết tập bắp chân to săn chắc với bài Standing Calf Raise', 'Tập chậm có điểm dừng 2 giây ở đỉnh co cơ và giãn hết biên độ ở đáy chuyển động. Không nhún nhảy dùng đà gót chân để bắt cơ bắp chuối phải chịu toàn bộ tải trọng.', 'https://www.youtube.com/watch?v=2C-uNgKwPLE', 280, 'approved', 2310, 0.00, '2026-03-01 17:00:00'],
            [6, 4, 'Bài tập xà đơn bổ trợ giúp mở rộng lưng chữ V nhanh nhất', 'Kết hợp hít xà rộng tay (Wide Grip Pull-up) và hít xà hẹp tay lòng bàn tay hướng vào nhau (Chin-up) để kích hoạt toàn diện sợi cơ xô từ trên xuống dưới.', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', 360, 'approved', 3890, 0.00, '2026-03-02 18:30:00'],
            [3, 9, '10 Phút giãn cơ trước khi đi ngủ giúp giải tỏa stress và đau mỏi lưng', 'Chuỗi động tác Child Pose, Reclining Spinal Twist và Happy Baby Pose nhẹ nhàng giúp kéo giãn cơ thắt lưng và đưa cơ thể vào trạng thái thư thái sâu.', 'https://www.youtube.com/watch?v=inpok4MKVLM', 80, 'approved', 4450, 0.00, '2026-03-03 21:00:00'],
            [4, 3, 'Kỹ thuật hít thở khi gánh tạ nặng Squat & Deadlift (Valsalva Maneuver)', 'Hít sâu bằng cơ hoành, nén khí vào khoang bụng và gồng cứng cơ core như chuẩn bị chịu một cú đấm. Giúp cột sống vững chãi như một cột trụ bê tông cốt thép.', 'https://www.youtube.com/watch?v=bEv6CCg2BC8', 410, 'approved', 3120, 0.00, '2026-03-04 15:45:00'],
            [2, 2, 'Chỉnh form bài Chống đẩy (Push-up) chuẩn chỉnh từ bàn tay đến mũi chân', 'Xòe rộng các ngón tay bám sàn, cổ tay thẳng hàng dưới vai, cùi chỏ mở góc 45 độ so với thân người. Khóa chặt cơ mông và cơ bụng trong suốt quá trình lên xuống.', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 250, 'approved', 2890, 0.00, '2026-03-05 10:00:00'],
            [5, 5, 'Dumbbell Shoulder Press: Đẩy tạ đôi an toàn không làm đau khớp vai', 'Không để cùi chỏ dang ngang 90 độ ngang tai. Hãy khép nhẹ cùi chỏ về phía trước khoảng 30 độ (mặt phẳng Scapular Plane) để khớp vai di chuyển tự nhiên nhất.', 'https://www.youtube.com/watch?v=2yjwXTZQDDI', 320, 'approved', 2150, 0.00, '2026-03-06 14:15:00'],
            [5, 7, 'Đốt 400 kcal tại nhà với bài tập leo núi Mountain Climber & Burpees', 'Chuỗi bài tập cardio thể trọng tuyệt vời giúp tăng nhịp tim tối đa, đốt cháy mỡ thừa và cải thiện sức bền tim mạch mà không đòi hỏi bất kỳ dụng cụ nào.', 'https://www.youtube.com/watch?v=ml6cT4AZdqI', 400, 'approved', 4720, 0.00, '2026-03-07 16:00:00'],
            [2, 1, 'Spider-man Plank: Động tác siết cơ liên sườn và tạo rãnh bụng sắc nét', 'Từ tư thế Plank cao, gập gối đưa đầu gối chạm cùi chỏ cùng bên, giữ 1 giây siết cơ chéo bụng. Đổi bên liên tục trong 45 giây mỗi hiệp.', 'https://www.youtube.com/watch?v=1919eTCoESo', 190, 'approved', 3620, 0.00, '2026-03-08 17:30:00'],
            [6, 8, 'Lộ trình 3 bước để thực hiện thành công bài trồng chuối (Handstand)', 'Bước 1: Chống tay đạp chân lên tường. Bước 2: Bấm chặt 10 đầu ngón tay tạo cảm giác thăng bằng. Bước 3: Rời chân khỏi tường và làm chủ cơ thể ngược.', 'https://www.youtube.com/watch?v=J0DnG1_S92I', 260, 'approved', 2980, 0.00, '2026-03-09 11:00:00'],
            [3, 9, 'Bí quyết duy trì động lực tập luyện mỗi ngày không bị nản lòng', 'Thiết lập mục tiêu nhỏ theo từng tuần (Micro-habits), chuẩn bị đồ tập từ tối hôm trước và tìm cho mình một người bạn đồng hành hoặc HLV tận tâm trên FitVibe.', '', 0, 'approved', 3890, 0.00, '2026-03-10 09:00:00']
        ];

        for (const p of extraPosts) {
            await connection.query(
                `INSERT INTO posts (coach_id, category_id, title, content, video_url, calories_info, status, views, price, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                p
            );
        }
        console.log(`✅ ${extraPosts.length} extra Posts inserted (IDs 35+)`);

        // ==========================================
        // 6. EXTRA COMMENTS & BOOKMARKS
        // ==========================================
        const extraComments = [
            [35, 17, 'Cách ngâm nước muối này đỉnh thật! Em làm thử hôm nay ức gà mềm ngọt như ngoài tiệm.'],
            [35, 2, 'Cảm ơn Nam nhé! Nhớ chỉ ngâm 30 phút là vừa đủ, ngâm lâu quá thịt sẽ hơi mặn đó em.'],
            [36, 18, 'Sinh tố cải xoăn này dễ uống hơn em nghĩ, cho thêm chút nước dừa ngọt mát thơm lừng.'],
            [37, 19, 'Thịt bò ăn kèm khoai lang đúng là combo bất bại cho buổi tập nặng ngực và chân.'],
            [39, 20, 'Quả mọng này em mua trong siêu thị đông lạnh xay với sữa chua Hy Lạp ngon đỉnh chóp luôn.'],
            [40, 22, 'Sữa chua Hy Lạp trộn hạt chia giúp em no lâu từ 3h chiều đến tận bữa tối luôn ạ.'],
            [42, 23, 'Em áp dụng thực đơn Low Carb 3 ngày này đã giảm được 1.5kg nước tích tụ trong người rồi thầy An ơi!'],
            [42, 2, 'Rất tốt Huy! Giờ chuyển sang ăn Eat Clean thâm hụt nhẹ để bắt đầu giảm mỡ thật nhé.'],
            [43, 24, 'Pancake chuối yến mạch siêu nhanh, sáng dậy làm đúng 10 phút là có bữa sáng thơm ngon.'],
            [44, 25, 'Bài viết giải thích công thức BMR và TDEE cực kỳ dễ hiểu, giờ em mới biết trước nay mình ăn thiếu hụt quá đà.'],
            [45, 27, 'Thầy Cường cho em hỏi Creatine nên uống trước hay sau buổi tập thì hấp thu tốt nhất ạ?'],
            [45, 4, 'Sau buổi tập pha chung với Whey hoặc nước hoa quả có đường đơn sẽ kích hoạt Insulin đẩy Creatine vào cơ nhanh nhất em nhé!'],
            [46, 21, 'Tập bắp chân theo cách dừng 2 giây ở đỉnh làm bắp chuối căng rát run lẩy bẩy luôn HLV ơi!'],
            [47, 19, 'Kéo xà theo form này cơ xô nở căng đét, cảm nhận cơ rõ hơn hẳn hồi trước tập theo cảm tính.'],
            [48, 26, 'Bài giãn cơ trước khi ngủ thật sự giúp em ngủ một mạch từ 11h đêm tới 6h sáng không bị thức giấc.'],
            [49, 17, 'Kỹ thuật Valsalva Maneuver giúp em tự tin gánh thêm 10kg Squat mà lưng dưới vẫn êm ru!'],
            [50, 28, 'Trước giờ em toàn để cùi chỏ dang ngang 90 độ bảo sao hay bị nhói khớp vai, đọc bài này chỉnh lại thấy êm hẳn.'],
            [52, 20, 'Mountain Climber 40s mà tim đập thình thịch, mồ hôi vã như tắm nhưng cực kỳ đã!'],
            [53, 18, 'Spider-man Plank siết cơ liên sườn đỉnh thật, tập xong 3 hiệp sờ vào rãnh bụng thấy cứng ngắc.'],
            [54, 21, 'Em đã trồng chuối đạp tường được 1 phút rồi anh Long ơi, phấn đấu tuần sau tách chân tự thăng bằng!'],
            [54, 6, 'Cố lên Hải Đăng! Chú ý khóa chặt cổ tay và bám 10 đầu ngón tay xuống sàn như móng vuốt nhé em.']
        ];

        for (const c of extraComments) {
            await connection.query(`INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)`, c);
        }

        const extraBookmarks = [
            [17, 35], [17, 37], [17, 44], [17, 49],
            [18, 36], [18, 40], [18, 48], [18, 53],
            [19, 37], [19, 45], [19, 47],
            [20, 39], [20, 42], [20, 52],
            [21, 46], [21, 47], [21, 54],
            [22, 36], [22, 40], [22, 48],
            [23, 42], [23, 44], [23, 52],
            [24, 43], [24, 46], [24, 53],
            [25, 42], [25, 44], [25, 52],
            [26, 40], [26, 48],
            [27, 37], [27, 45], [27, 47], [27, 49],
            [28, 42], [28, 50], [28, 52]
        ];

        for (const b of extraBookmarks) {
            await connection.query(`INSERT IGNORE INTO bookmarks (user_id, post_id) VALUES (?, ?)`, b);
        }
        console.log(`✅ ${extraComments.length} Comments & ${extraBookmarks.length} Bookmarks inserted`);

        // ==========================================
        // 7. EXTRA ENROLLMENTS & PURCHASES
        // ==========================================
        const extraEnrollments = [
            [17, 2, 'active', '2026-02-16 08:30:00'],
            [17, 4, 'active', '2026-02-25 10:00:00'],
            [18, 3, 'active', '2026-02-19 09:45:00'],
            [19, 4, 'active', '2026-02-21 11:15:00'],
            [20, 2, 'active', '2026-02-23 14:00:00'],
            [21, 6, 'active', '2026-02-26 15:30:00'],
            [22, 3, 'active', '2026-03-01 09:00:00'],
            [23, 5, 'active', '2026-03-02 10:30:00'],
            [23, 2, 'active', '2026-03-05 14:20:00'],
            [24, 4, 'active', '2026-03-04 11:00:00'],
            [25, 2, 'active', '2026-03-06 09:30:00'],
            [26, 3, 'active', '2026-03-08 10:00:00'],
            [27, 4, 'active', '2026-03-10 14:45:00'],
            [28, 5, 'active', '2026-03-11 16:15:00']
        ];

        for (const e of extraEnrollments) {
            await connection.query(
                `INSERT INTO enrollments (user_id, coach_id, status, created_at)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE status = VALUES(status)`,
                e
            );
        }

        const extraPurchases = [
            [17, 8, 'route', 490000.00, '2026-02-16 08:30:00'],
            [18, 6, 'route', 520000.00, '2026-02-19 09:45:00'],
            [19, 7, 'route', 790000.00, '2026-02-21 11:15:00'],
            [20, 8, 'route', 490000.00, '2026-02-23 14:00:00'],
            [21, 9, 'route', 720000.00, '2026-02-26 15:30:00'],
            [22, 6, 'route', 520000.00, '2026-03-01 09:00:00'],
            [23, 10, 'route', 620000.00, '2026-03-02 10:30:00'],
            [23, 8, 'route', 490000.00, '2026-03-05 14:20:00'],
            [24, 7, 'route', 790000.00, '2026-03-04 11:00:00'],
            [25, 8, 'route', 490000.00, '2026-03-06 09:30:00'],
            [26, 12, 'route', 360000.00, '2026-03-08 10:00:00'],
            [27, 7, 'route', 790000.00, '2026-03-10 14:45:00'],
            [28, 13, 'route', 450000.00, '2026-03-11 16:15:00']
        ];

        for (const p of extraPurchases) {
            await connection.query(
                `INSERT INTO purchases (user_id, content_id, content_type, price_paid, created_at) VALUES (?, ?, ?, ?, ?)`,
                p
            );
        }
        console.log(`✅ ${extraEnrollments.length} Enrollments & ${extraPurchases.length} Purchases inserted`);

        // ==========================================
        // 8. EXTRA ROUTE SUBMISSIONS & USER ROUTE PROGRESS
        // ==========================================
        // Includes SUBMITTED (pending coach evaluation) & PASSED (with rich feedback)
        const extraSubmissions = [
            // User 17 (Trần Nhật Nam) nộp Route 8 Stage 17 -> ĐANG CHỜ DUYỆT (SUBMITTED) - HLV Nguyễn Văn An chấm
            [6, 17, 17, 'submitted', '/uploads/1780131026776-55874999.mp4', null, '2026-03-12 14:30:00', null],
            // User 19 (Lê Minh Triết) nộp Route 7 Stage 14 -> ĐANG CHỜ DUYỆT (SUBMITTED) - HLV Lê Quang Cường chấm
            [7, 19, 14, 'submitted', '/uploads/1781592898809-493653275.mp4', null, '2026-03-13 08:20:00', null],
            // User 21 (Nguyễn Hải Đăng) nộp Route 9 Stage 20 -> ĐANG CHỜ DUYỆT (SUBMITTED) - HLV Đặng Hoàng Long chấm
            [8, 21, 20, 'submitted', '/uploads/1781338891715-207658646.mp4', null, '2026-03-13 09:10:00', null],
            // User 22 (Đặng Lan Hương) nộp Route 6 Stage 11 -> ĐANG CHỜ DUYỆT (SUBMITTED) - HLV Trần Bích Ngọc chấm
            [9, 22, 11, 'submitted', '/uploads/1781339723356-793677337.mp4', null, '2026-03-13 10:45:00', null],

            // User 18 (Hoàng Ngọc Ánh) nộp Route 6 Stage 11 -> ĐÃ DUYỆT (PASSED)
            [10, 18, 11, 'passed', '/uploads/1781339723356-793677337.mp4', 'Kỹ thuật thở cơ hoành rất chuẩn xác, xương chậu giữ cố định thăng bằng. Xuất sắc hoàn thành Giai đoạn 1!', '2026-02-24 10:00:00', '2026-02-24 14:30:00'],
            // User 20 (Vũ Phương Thảo) nộp Route 8 Stage 17 -> ĐÃ DUYỆT (PASSED)
            [11, 20, 17, 'passed', '/uploads/1780130665978-302183037.mp4', 'Chị Thảo tập rất kiên trì, form Mountain Climber lưng thẳng không bị nhấp nhô hông. Tiếp tục phát huy ở Giai đoạn 2!', '2026-03-01 15:00:00', '2026-03-01 18:00:00'],
            // User 23 (Bùi Quang Huy) nộp Route 10 Stage 23 -> ĐÃ DUYỆT (PASSED)
            [12, 23, 23, 'passed', '/uploads/1781338891715-207658646.mp4', 'Đòn Jab và Cross ra lực dứt khoát, xoay hông chân sau chuẩn võ thuật. Đạt tiêu chuẩn tiến vào Giai đoạn 2!', '2026-03-07 11:00:00', '2026-03-07 16:00:00'],
            // User 25 (Phan Tiến Dũng) nộp Route 8 Stage 17 -> ĐÃ DUYỆT (PASSED)
            [13, 25, 17, 'passed', '/uploads/1780130665978-302183037.mp4', 'Form bài Circuit rất tốt anh Dũng ơi, nhịp thở đều. Chú ý bù nước điện giải sau buổi tập nhé!', '2026-03-09 14:15:00', '2026-03-09 17:30:00'],
            // User 27 (Cao Đức Anh) nộp Route 7 Stage 14 -> ĐÃ DUYỆT (PASSED)
            [14, 27, 14, 'passed', '/uploads/1781592898809-493653275.mp4', 'Góc hạ cùi chỏ 45 độ chuẩn xác, ép ngực trên tối đa. Kỹ thuật rất bài bản, chúc mừng em!', '2026-03-11 16:00:00', '2026-03-11 19:00:00']
        ];

        for (const sub of extraSubmissions) {
            await connection.query(
                `INSERT INTO route_submissions (id, user_id, route_stage_id, status, submission_video_url, coach_feedback, submitted_at, evaluated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE status=VALUES(status), coach_feedback=VALUES(coach_feedback), evaluated_at=VALUES(evaluated_at)`,
                sub
            );
            await connection.query(
                `INSERT INTO user_route_progress (id, user_id, route_stage_id, status, submission_video_url, coach_feedback, submitted_at, evaluated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE status=VALUES(status), coach_feedback=VALUES(coach_feedback), evaluated_at=VALUES(evaluated_at)`,
                sub
            );
        }
        console.log(`✅ ${extraSubmissions.length} Submissions synced (IDs 6 to 14, including 4 pending for coach grading demo)`);

        // ==========================================
        // 9. EXTRA WEIGHT LOGS (Realistic progress curves)
        // ==========================================
        const extraWeightLogs = [
            // User 17 (Trần Nhật Nam): Giảm mỡ từ 85.5kg xuống 83.0kg
            [17, 85.5, '2026-02-15 07:00:00'],
            [17, 84.8, '2026-02-22 07:00:00'],
            [17, 84.2, '2026-03-01 07:00:00'],
            [17, 83.6, '2026-03-08 07:00:00'],
            [17, 83.0, '2026-03-13 07:00:00'],

            // User 18 (Hoàng Ngọc Ánh): Duy trì 51kg dẻo dai săn chắc
            [18, 51.5, '2026-02-18 07:30:00'],
            [18, 51.2, '2026-02-25 07:30:00'],
            [18, 51.0, '2026-03-04 07:30:00'],
            [18, 51.0, '2026-03-11 07:30:00'],

            // User 19 (Lê Minh Triết): Tăng cơ từ 55.0kg lên 57.0kg
            [19, 55.0, '2026-02-20 07:00:00'],
            [19, 55.6, '2026-02-27 07:00:00'],
            [19, 56.1, '2026-03-06 07:00:00'],
            [19, 57.0, '2026-03-13 07:00:00'],

            // User 20 (Vũ Phương Thảo): Giảm mỡ sau sinh từ 65.5kg xuống 63.0kg
            [20, 65.5, '2026-02-22 08:00:00'],
            [20, 64.8, '2026-03-01 08:00:00'],
            [20, 63.9, '2026-03-08 08:00:00'],
            [20, 63.0, '2026-03-13 08:00:00'],

            // User 21 (Nguyễn Hải Đăng): Tăng cơ từ 72.5kg lên 74.0kg
            [21, 72.5, '2026-02-25 07:15:00'],
            [21, 73.0, '2026-03-04 07:15:00'],
            [21, 73.5, '2026-03-09 07:15:00'],
            [21, 74.0, '2026-03-13 07:15:00'],

            // User 23 (Bùi Quang Huy): Giảm cân tích cực từ 95.0kg xuống 92.0kg
            [23, 95.0, '2026-03-01 06:45:00'],
            [23, 93.8, '2026-03-05 06:45:00'],
            [23, 92.9, '2026-03-09 06:45:00'],
            [23, 92.0, '2026-03-13 06:45:00'],

            // User 25 (Phan Tiến Dũng): Giảm từ 82.0kg xuống 80.0kg
            [25, 82.0, '2026-03-05 07:00:00'],
            [25, 81.2, '2026-03-08 07:00:00'],
            [25, 80.6, '2026-03-11 07:00:00'],
            [25, 80.0, '2026-03-13 07:00:00'],

            // User 27 (Cao Đức Anh): Tăng cơ từ 65.2kg lên 67.0kg
            [27, 65.2, '2026-03-09 07:00:00'],
            [27, 66.1, '2026-03-11 07:00:00'],
            [27, 67.0, '2026-03-13 07:00:00']
        ];

        for (const w of extraWeightLogs) {
            await connection.query(`INSERT INTO weight_logs (user_id, weight, logged_at) VALUES (?, ?, ?)`, w);
        }
        console.log(`✅ ${extraWeightLogs.length} Weight logs inserted`);

        // ==========================================
        // 10. EXTRA TRANSACTIONS (VNPay Top-ups)
        // ==========================================
        const extraTransactions = [
            [17, 2000000, '17T15080000', 'success', '2026-02-15 08:15:00'],
            [18, 1000000, '18T18093000', 'success', '2026-02-18 09:35:00'],
            [19, 3000000, '19T20101500', 'success', '2026-02-20 10:20:00'],
            [20, 1000000, '20T22110000', 'success', '2026-02-22 11:05:00'],
            [21, 2000000, '21T25140000', 'success', '2026-02-25 14:05:00'],
            [22, 1500000, '22T28153000', 'success', '2026-02-28 15:35:00'],
            [23, 4000000, '23T01084500', 'success', '2026-03-01 08:50:00'],
            [24, 1000000, '24T03092000', 'success', '2026-03-03 09:25:00'],
            [25, 2000000, '25T05104000', 'success', '2026-03-05 10:45:00'],
            [26, 1000000, '26T07141500', 'success', '2026-03-07 14:20:00'],
            [27, 3000000, '27T09160000', 'success', '2026-03-09 16:05:00'],
            [28, 1500000, '28T10173000', 'success', '2026-03-10 17:35:00'],
            [17, 500000, '17T12140000', 'success', '2026-03-12 14:00:00'],
            [23, 500000, '23T12180000', 'failed', '2026-03-12 18:00:00']
        ];

        for (const tr of extraTransactions) {
            await connection.query(
                `INSERT INTO transactions (user_id, amount, txn_ref, status, created_at)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE status=VALUES(status)`,
                tr
            );
        }
        console.log(`✅ ${extraTransactions.length} extra VNPay Transactions created`);

        // ==========================================
        // 11. EXTRA WITHDRAWALS (Coach payouts)
        // ==========================================
        const extraWithdrawals = [
            // Approved payouts
            [6, 3500000.00, 'MB Bank', '0888999888999', 'DANG HOANG LONG', 'approved', '2026-03-02 09:00:00', '2026-03-02 14:00:00'],
            [3, 2000000.00, 'BIDV', '12410004567892', 'TRAN BICH NGOC', 'approved', '2026-03-05 10:30:00', '2026-03-05 15:30:00'],

            // PENDING payouts -> For Admin Demo!
            [4, 4000000.00, 'Techcombank', '19034567891011', 'LE QUANG CUONG', 'pending', '2026-03-13 09:00:00', null],
            [5, 2800000.00, 'ACB', '2345678901', 'PHAM MINH DUC', 'pending', '2026-03-13 11:30:00', null]
        ];

        for (const w of extraWithdrawals) {
            await connection.query(
                `INSERT INTO withdrawals (coach_id, amount, bank_name, account_number, account_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                w
            );
        }
        console.log(`✅ ${extraWithdrawals.length} extra Withdrawals inserted (including pending items for Admin demo)`);

        console.log('\n🎉 ALL MASSIVE SAMPLE DATA INSERTED SUCCESSFULLY!');
    } catch (err) {
        console.error('❌ Error adding sample data:', err);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

addMoreSampleData();
