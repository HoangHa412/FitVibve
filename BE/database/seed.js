/**
 * seed.js - Reset and seed the FitVibe database with sample data
 * Run: node database/seed.js
 */

const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
    try {
        console.log('⏳ Hashing passwords...');
        const hash = await bcrypt.hash('123456', 10);
        console.log('✅ Password hash created');

        // ── TRUNCATE ──────────────────────────────────
        console.log('⏳ Clearing old data...');
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const t of ['user_route_progress', 'route_stages', 'routes', 'bookmarks', 'comments', 'posts', 'weight_logs', 'profiles', 'users', 'categories']) {
            await pool.query(`TRUNCATE TABLE \`${t}\``);
        }
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Old data cleared');

        // ── CATEGORIES ────────────────────────────────
        await pool.query(`INSERT INTO categories (name, type) VALUES
      ('Cơ Bụng', 'workout'), ('Cơ Ngực', 'workout'), ('Cơ Chân', 'workout'),
      ('Cơ Lưng', 'workout'), ('Cơ Vai', 'workout'), ('Cơ Tay', 'workout'),
      ('Cardio', 'workout'),
      ('Keto', 'diet'), ('Eat Clean', 'diet'), ('Chay Healthy', 'diet'),
      ('Low Carb', 'diet'), ('Intermittent Fasting', 'diet')`);
        console.log('✅ Categories inserted');

        // ── USERS ─────────────────────────────────────
        await pool.query(`INSERT INTO users (email, password, full_name, role, status) VALUES
      ('admin@fitvibe.com', ?, 'Quản Trị Viên', 'admin', 'active'),
      ('coach1@fitvibe.com', ?, 'HLV Nguyễn Văn An', 'coach', 'active'),
      ('coach2@fitvibe.com', ?, 'HLV Trần Thị Bình', 'coach', 'pending'),
      ('coach3@fitvibe.com', ?, 'HLV Lê Quang Cường', 'coach', 'active'),
      ('coach4@fitvibe.com', ?, 'HLV Phạm Minh Đức', 'coach', 'active'),
      ('user1@fitvibe.com', ?, 'Học Viên 01', 'user', 'active'),
      ('user2@fitvibe.com', ?, 'Học Viên 02', 'user', 'active'),
      ('user3@fitvibe.com', ?, 'Học Viên 03', 'user', 'locked'),
      ('user4@fitvibe.com', ?, 'Học Viên 04', 'user', 'active'),
      ('user5@fitvibe.com', ?, 'Học Viên 05', 'user', 'active'),
      ('user6@fitvibe.com', ?, 'Học Viên 06', 'user', 'active'),
      ('user7@fitvibe.com', ?, 'Học Viên 07', 'user', 'active'),
      ('user8@fitvibe.com', ?, 'Học Viên 08', 'user', 'active')`,
            Array(13).fill(hash));
        console.log('✅ Users inserted (all passwords: 123456)');

        // ── PROFILES ──────────────────────────────────
        await pool.query(`INSERT INTO profiles (user_id, age, gender, height, weight, goal) VALUES
      (6, 25, 'male', 170, 70, 'weight_loss'),
      (7, 30, 'female', 160, 50, 'muscle_gain'),
      (8, 22, 'male', 175, 75, 'maintain'),
      (9, 28, 'female', 155, 45, 'weight_loss'),
      (10, 35, 'male', 180, 85, 'muscle_gain'),
      (11, 24, 'female', 162, 52, 'maintain'),
      (12, 19, 'male', 172, 65, 'muscle_gain'),
      (13, 27, 'female', 158, 48, 'weight_loss')`);
        console.log('✅ Profiles inserted');

        // ── POSTS ─────────────────────────────────────
        await pool.query(`INSERT INTO posts (coach_id, category_id, title, content, video_url, calories_info, status) VALUES
      (2, 1, '15 Phút tập bụng dưới tại nhà', 'Thực hiện 4 hiệp, mỗi hiệp 20 cái leg raise.', 'https://youtube.com/watch?v=demo1', 150, 'approved'),
      (2, 8, 'Thực đơn Keto chuẩn cho người mới', 'Chia nhỏ bữa ăn, hạn chế tinh bột tối đa.', '', 2000, 'approved'),
      (4, 3, 'Tập đùi tốn sức nhưng hiệu quả', 'Sử dụng tạ đơn 10kg cho mỗi bên.', 'https://youtube.com/watch?v=demo2', 400, 'approved'),
      (5, 9, 'Eat Clean: Bữa tối với ức gà áp chảo', 'Cách tẩm ướp cực ngon không bị khô.', '', 500, 'approved'),
      (4, 2, 'Ngực to săn chắc với bài đẩy tạ', '3 hiệp x 12 lần hít đất và đẩy tạ.', 'https://youtube.com/watch?v=demo3', 350, 'pending'),
      (5, 7, 'HIIT 20 phút đốt mỡ thừa toàn thân', 'Không cần dụng cụ, tập mọi lúc mọi nơi.', 'https://youtube.com/watch?v=demo4', 500, 'pending'),
      (4, 4, 'Lưng xô dày và rộng nhanh chóng', 'Pull up và Deadlift cơ bản.', 'https://youtube.com/watch?v=demo5', 450, 'approved'),
      (2, 10, 'Salad chay giàu protein cho Gymer', 'Kết hợp đậu hũ và các loại hạt.', '', 600, 'approved'),
      (5, 11, 'Low Carb: Ăn gì để vẫn đủ sức tập?', 'Danh sách thực phẩm thay thế cơm.', '', 1200, 'approved'),
      (2, 5, 'Vai rộng như vận động viên', 'Lên vai ngang và vai trước với tạ nhẹ.', 'https://youtube.com/watch?v=demo6', 250, 'pending')`);
        console.log('✅ Posts inserted');

        // ── ROUTES ────────────────────────────────────
        await pool.query(`INSERT INTO routes (coach_id, title, description) VALUES
      (2, 'Lộ trình 30 ngày giảm mỡ bụng', 'Chế độ tập luyện nhẹ nhàng nhưng đều đặn.'),
      (4, 'Tăng cơ toàn thân cho người gầy', 'Tập trung vào dinh dưỡng và tập nặng.'),
      (5, 'Yoga dẻo dai mỗi sáng 15 phút', 'Dành cho những người ít vận động.')`);

        await pool.query(`INSERT INTO route_stages (route_id, stage_order, title, video_url, description) VALUES
      (1, 1, 'Ngày 1: Hít thở đúng cách', 'https://youtube.com/watch?v=s1', 'Học cách gồng bụng.'),
      (1, 2, 'Ngày 2: Gập bụng cơ bản', 'https://youtube.com/watch?v=s2', 'Thực hiện 3 hiệp.'),
      (1, 3, 'Ngày 3: Plank 1 phút', 'https://youtube.com/watch?v=s3', 'Giữ đúng tư thế lưng thẳng.'),
      (2, 1, 'Tuần 1: Cảm nhận cơ bắp', 'https://youtube.com/watch?v=s4', 'Làm quen với tạ nhẹ.'),
      (2, 2, 'Tuần 2: Nâng dần mức tạ', 'https://youtube.com/watch?v=s5', 'Tăng thêm 2.5kg mỗi bên.'),
      (3, 1, 'Khởi động cột sống', 'https://youtube.com/watch?v=s6', 'Các động tác vặn mình nhẹ.'),
      (3, 2, 'Chào mặt trời', 'https://youtube.com/watch?v=s7', 'Chuỗi động tác liên hoàn.')`);
        console.log('✅ Routes & Stages inserted');

        console.log('\n🎉 Database seeded successfully!');
        console.log('📝 Accounts (all password: 123456):');
        console.log('   admin@fitvibe.com  → Admin');
        console.log('   coach1@fitvibe.com → Coach (active)');
        console.log('   coach2@fitvibe.com → Coach (pending)');
        console.log('   user1@fitvibe.com  → User');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
}

seed();
