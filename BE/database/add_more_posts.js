/**
 * add_more_posts.js - Add more realistic fitness recipes and workout guides
 */
const pool = require('../config/db');

async function addMorePosts() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Adding extra diverse posts and comments...');

        const extraPosts = [
            // Extra Meals / Diets
            [2, 10, 'Bát yến mạch ngâm qua đêm (Overnight Oats) quả mọng & hạt chia', 'Công thức bữa sáng tiện lợi cho người bận rộn: 50g yến mạch cán vỡ, 150ml sữa tươi không đường, 1 thìa hạt chia, 1/2 muỗng whey protein và topping việt quất/dâu tây. Ngâm qua đêm trong tủ lạnh.', '', 350, 'approved', 2180, 0.00, '2026-02-05 07:15:00'],
            [3, 10, 'Salad ức gà áp chảo sốt mè rang chuẩn Healthy', '200g ức gà ướp muối tiêu áp chảo vàng 2 mặt, xé nhỏ trộn cùng xà lách romaine, cà chua bi, dưa leo, ngô ngọt và 1 thìa sốt mè rang Kewpie ít béo.', '', 420, 'approved', 3410, 0.00, '2026-02-07 11:45:00'],
            [4, 14, 'Bò lúc lắc xào ớt chuông kèm cơm gạo lứt huyết rồng', '200g thăn bò thái vuông áp chảo lửa lớn cùng ớt chuông xanh đỏ và hành tây. Ăn kèm 1 chén cơm gạo lứt giúp bổ sung 45g protein và carbohydrate hấp thu chậm.', '', 530, 'approved', 2890, 0.00, '2026-02-09 18:30:00'],
            [2, 11, 'Cá hồi áp chảo sốt chanh leo măng tây chuẩn vị Keto', '200g phi lê cá hồi áp chảo bơ tỏi ăn kèm măng tây xào dầu olive. Giàu chất béo Omega-3 tốt cho tim mạch và kháng viêm cơ bắp.', '', 480, 'approved', 1950, 0.00, '2026-02-11 19:00:00'],
            [5, 13, 'Bánh mì ngũ cốc kẹp trứng ốp la, bơ tươi và dưa leo', '2 lát bánh mì nguyên cám, 2 quả trứng gà ốp la lòng đào, 1/2 quả bơ sáp cắt lát mỏng. Cân bằng hoàn hảo giữa protein, chất béo tốt và chất xơ.', '', 390, 'approved', 2740, 0.00, '2026-02-13 08:00:00'],
            [3, 12, 'Đậu phụ sốt cà chua nấm hương giàu đạm thực vật', '300g đậu phụ mơ rán non sốt cà chua tươi và nấm hương khô. Món chay giàu isoflavone thanh đạm, dễ tiêu hóa.', '', 310, 'approved', 1420, 0.00, '2026-02-15 12:00:00'],
            [4, 14, 'Sinh tố chuối bơ đậu phộng & Whey Protein phục hồi cơ bắp', '1 quả chuối đông lạnh, 1 muỗng Whey Isolate vani, 15g bơ đậu phộng nguyên chất, 200ml sữa hạt. Uống ngay sau buổi tập 30 phút để kích hoạt đồng hóa cơ bắp.', '', 440, 'approved', 4120, 0.00, '2026-02-17 17:30:00'],
            [2, 10, 'Canh rong biển đậu hũ non nấu ức gà băm', 'Rong biển khô ngâm nở nấu cùng đậu hũ non và 100g ức gà băm nhuyễn. Thanh nhiệt, giàu khoáng chất I-ốt và giải độc gan.', '', 220, 'approved', 1630, 0.00, '2026-02-19 19:15:00'],

            // Extra Workouts
            [4, 4, 'Kỹ thuật Deadlift chuẩn form: Tối ưu sức mạnh cơ lưng và đùi sau', 'Setup thanh đòn trên giữa bàn chân, hông nâng cao hơn gối nhưng thấp hơn vai. Kéo tạ sát ống đồng, gồng chặt cơ xô và thở ra dứt khoát khi đứng thẳng.', 'https://www.youtube.com/watch?v=op9kVnSso6Q', 450, 'approved', 3650, 0.00, '2026-02-21 15:00:00'],
            [2, 3, 'Bulgarian Split Squat: Bài tập sát thủ cho mông đùi săn chắc', 'Đặt 1 chân lên ghế phía sau, hạ gối sau vuông góc sàn. Tác động sâu vào cơ mông lớn (gluteus maximus) và cơ đùi trước mà không gây áp lực lên cột sống.', 'https://www.youtube.com/watch?v=2C-uNgKwPLE', 380, 'approved', 2980, 0.00, '2026-02-23 09:30:00'],
            [6, 6, 'Dips xà kép: Xây dựng cơ ngực dưới và tay sau cắt nét', 'Nghiêng người về phía trước 15-30 độ để tập trung vào cơ ngực dưới; giữ thân người thẳng đứng để cô lập cơ tam đầu tay sau (triceps). Không hạ quá sâu qua 90 độ khuỷu tay.', 'https://www.youtube.com/watch?v=2z8JmcrW-As', 310, 'approved', 2430, 0.00, '2026-02-25 16:00:00'],
            [4, 5, 'Overhead Press (OHP): Đẩy tạ qua đầu phát triển cơ vai toàn diện', 'Đứng thẳng, siết chặt cơ mông và cơ bụng để bảo vệ thắt lưng. Đẩy đòn tạ theo đường thẳng qua đỉnh đầu, khóa khớp vai an toàn.', 'https://www.youtube.com/watch?v=2yjwXTZQDDI', 340, 'approved', 2110, 0.00, '2026-02-27 10:00:00'],
            [5, 1, 'Plank biến thể 7 phút: Đốt mỡ bụng sâu và siết cơ liên sườn', 'Chuỗi liên hoàn 45s mỗi động tác: Plank cẳng tay -> Side Plank trái/phải -> Plank chạm vai -> Plank gối chạm cùi chỏ. Nghỉ 15s giữa các bài.', 'https://www.youtube.com/watch?v=1919eTCoESo', 160, 'approved', 4890, 0.00, '2026-03-01 07:00:00'],
            [3, 9, 'Bài tập giãn cơ sâu (Dynamic & Foam Rolling) giải tỏa căng mỏi', 'Kỹ thuật lăn bọt (Foam Roller) giải phóng cơ mạc (myofascial release) cho cơ đùi trước, đùi sau và lưng giữa sau các buổi tập tạ nặng.', 'https://www.youtube.com/watch?v=inpok4MKVLM', 90, 'approved', 1560, 0.00, '2026-03-03 18:00:00'],
            [6, 8, 'Chống đẩy kim cương (Diamond Push-up) cô lập cơ tay sau', 'Đặt 2 ngón cái và 2 ngón trỏ chụm vào nhau tạo thành hình thoi dưới ngực. Bài tập thể trọng kinh điển giúp bắp tay sau dày dặn và sắc nét.', 'https://www.youtube.com/watch?v=J0DnG1_S92I', 220, 'approved', 1980, 0.00, '2026-03-05 14:30:00'],
            [5, 7, 'Cardio nhảy dây biến tốc: Đốt 300 kcal trong 20 phút', 'Nhảy bước chân nhanh 1 phút kết hợp nhảy tốc độ cao 30s. Giúp tăng mật độ xương, cải thiện độ nhanh nhẹn và đốt mỡ hiệu quả cao hơn chạy bộ thông thường.', 'https://www.youtube.com/watch?v=ml6cT4AZdqI', 300, 'approved', 3820, 0.00, '2026-03-07 16:45:00']
        ];

        for (const p of extraPosts) {
            await connection.query(
                `INSERT INTO posts (coach_id, category_id, title, content, video_url, calories_info, status, views, price, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                p
            );
        }

        console.log(`✅ Added ${extraPosts.length} more realistic posts`);
    } catch (err) {
        console.error('Error adding posts:', err);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

addMorePosts();
