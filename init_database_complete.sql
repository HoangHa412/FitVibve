-- FitVibe Complete Database Schema & Seed Data
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS `fitvibe` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fitvibe`;

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. Table: users
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'coach', 'admin') DEFAULT 'user',
  `balance` DECIMAL(15,2) DEFAULT 0.00,
  `status` ENUM('pending', 'active', 'locked') DEFAULT 'active',
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table: profiles
-- --------------------------------------------------------
DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
  `user_id` INT PRIMARY KEY,
  `age` INT DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other') DEFAULT NULL,
  `height` FLOAT DEFAULT NULL, -- in cm
  `weight` FLOAT DEFAULT NULL, -- in kg
  `goal` ENUM('weight_loss', 'muscle_gain', 'maintain') DEFAULT NULL,
  `body_fat` FLOAT DEFAULT NULL, -- in percentage
  `medical_history` JSON DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  CONSTRAINT `fk_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table: coach_certificates
-- --------------------------------------------------------
DROP TABLE IF EXISTS `coach_certificates`;
CREATE TABLE `coach_certificates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `coach_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_certificates_coach` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table: categories
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('workout', 'diet') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Table: posts
-- --------------------------------------------------------
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `coach_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT,
  `video_url` VARCHAR(255) DEFAULT NULL,
  `calories_info` INT DEFAULT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `views` INT DEFAULT 0,
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_posts_coach` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_posts_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Table: comments
-- --------------------------------------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `post_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Table: bookmarks
-- --------------------------------------------------------
DROP TABLE IF EXISTS `bookmarks`;
CREATE TABLE `bookmarks` (
  `user_id` INT NOT NULL,
  `post_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `post_id`),
  CONSTRAINT `fk_bookmarks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookmarks_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Table: routes
-- --------------------------------------------------------
DROP TABLE IF EXISTS `routes`;
CREATE TABLE `routes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `coach_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `target_goal` VARCHAR(50) DEFAULT 'general_fitness',
  `standard` VARCHAR(255) DEFAULT 'Chưa xác định',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_routes_coach` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. Table: route_stages
-- --------------------------------------------------------
DROP TABLE IF EXISTS `route_stages`;
CREATE TABLE `route_stages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `route_id` INT NOT NULL,
  `stage_order` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `video_url` VARCHAR(255) DEFAULT NULL,
  `description` TEXT,
  `nutrition_plan` TEXT,
  `calories_target` INT DEFAULT 0,
  CONSTRAINT `fk_stages_route` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 10. Table: route_submissions
-- --------------------------------------------------------
DROP TABLE IF EXISTS `route_submissions`;
CREATE TABLE `route_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `route_stage_id` INT NOT NULL,
  `status` ENUM('pending', 'submitted', 'passed', 'failed') DEFAULT 'pending',
  `submission_video_url` VARCHAR(255) DEFAULT NULL,
  `coach_feedback` TEXT,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `evaluated_at` TIMESTAMP NULL,
  CONSTRAINT `fk_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_stage` FOREIGN KEY (`route_stage_id`) REFERENCES `route_stages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 11. Table: user_route_progress (Compatibility)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `user_route_progress`;
CREATE TABLE `user_route_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `route_stage_id` INT NOT NULL,
  `status` ENUM('pending', 'submitted', 'passed', 'failed') DEFAULT 'pending',
  `submission_video_url` VARCHAR(255) DEFAULT NULL,
  `coach_feedback` TEXT,
  `submitted_at` TIMESTAMP NULL,
  `evaluated_at` TIMESTAMP NULL,
  CONSTRAINT `fk_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_stage` FOREIGN KEY (`route_stage_id`) REFERENCES `route_stages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 12. Table: enrollments
-- --------------------------------------------------------
DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `coach_id` INT NOT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_enrollment` (`user_id`, `coach_id`),
  CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_coach` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 13. Table: purchases
-- --------------------------------------------------------
DROP TABLE IF EXISTS `purchases`;
CREATE TABLE `purchases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `content_id` INT NOT NULL,
  `content_type` ENUM('post', 'route') NOT NULL,
  `price_paid` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_purchases_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 14. Table: weight_logs
-- --------------------------------------------------------
DROP TABLE IF EXISTS `weight_logs`;
CREATE TABLE `weight_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `weight` FLOAT NOT NULL,
  `logged_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_weight_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 15. Table: transactions (VNPay Top-up)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `txn_ref` VARCHAR(50) NOT NULL UNIQUE,
  `status` ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 16. Table: withdrawals (Coach payout)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `withdrawals`;
CREATE TABLE `withdrawals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `coach_id` INT NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `bank_name` VARCHAR(255) NOT NULL,
  `account_number` VARCHAR(255) NOT NULL,
  `account_name` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_withdrawals_coach` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- SEED DATA
-- Mật khẩu tất cả tài khoản là '123456':
-- Hash: $2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12
-- ========================================================

-- Categories
INSERT INTO `categories` (`id`, `name`, `type`) VALUES
(1, 'Cơ Bụng', 'workout'),
(2, 'Cơ Ngực', 'workout'),
(3, 'Cơ Chân', 'workout'),
(4, 'Cơ Lưng & Xô', 'workout'),
(5, 'Cơ Vai', 'workout'),
(6, 'Cơ Tay', 'workout'),
(7, 'Cardio & HIIT', 'workout'),
(8, 'Keto', 'diet'),
(9, 'Eat Clean', 'diet'),
(10, 'Chay Healthy', 'diet'),
(11, 'Low Carb', 'diet'),
(12, 'Intermittent Fasting', 'diet');

-- Users
INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `role`, `balance`, `status`, `avatar_url`, `created_at`) VALUES
(1, 'admin@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'Quản Trị Viên Hệ Thống', 'admin', 0.00, 'active', NULL, '2026-01-01 08:00:00'),
(2, 'coach1@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'HLV Nguyễn Văn An', 'coach', 3500000.00, 'active', '/uploads/avatars/avatar-1772438428209-310624340.png', '2026-01-10 09:00:00'),
(3, 'coach2@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'HLV Trần Thị Bình', 'coach', 1200000.00, 'active', NULL, '2026-01-15 10:00:00'),
(4, 'coach3@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'HLV Lê Quang Cường', 'coach', 5800000.00, 'active', NULL, '2026-02-01 11:00:00'),
(5, 'coach4@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'HLV Phạm Minh Đức', 'coach', 2400000.00, 'active', NULL, '2026-02-05 14:00:00'),
(6, 'coach@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'HLV Đặng Hoàng Long', 'coach', 4200000.00, 'active', NULL, '2026-02-10 15:00:00'),
(7, 'user@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'Vũ Minh Tuấn', 'user', 2500000.00, 'active', '/uploads/avatars/avatar-1778744916509-343364445.jpg', '2026-02-15 08:00:00'),
(8, 'user1@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'Nguyễn Thị Hoa', 'user', 800000.00, 'active', NULL, '2026-02-18 09:30:00'),
(9, 'user2@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'Trần Đình Trọng', 'user', 1500000.00, 'active', NULL, '2026-02-20 10:15:00'),
(10, 'user3@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'Lê Bích Thảo', 'user', 0.00, 'locked', NULL, '2026-02-22 11:00:00'),
(11, 'user4@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'Hoàng Văn Nam', 'user', 500000.00, 'active', NULL, '2026-02-25 13:00:00'),
(12, 'user5@fitvibe.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'Đỗ Quỳnh Anh', 'user', 300000.00, 'active', NULL, '2026-03-01 14:00:00'),
(13, 'test@gmail.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'HLV Test Chuyên Nghiệp', 'coach', 4000000.00, 'active', NULL, '2026-03-05 16:00:00'),
(14, 'test1@gmail.com', '$2b$10$bqQ.6IbDZ7OmbLLgxJXiDO.7lqejNntg7KbbA3vtc3WsmciIkrE12', 'Học Viên Test Mẫu', 'user', 10500000.00, 'active', '/uploads/avatars/avatar-1778744916509-343364445.jpg', '2026-03-10 17:00:00');

-- Profiles
INSERT INTO `profiles` (`user_id`, `age`, `gender`, `height`, `weight`, `goal`, `body_fat`, `medical_history`, `bio`) VALUES
(1, 32, 'male', 175, 72, 'maintain', 15.5, '["Không có bệnh lý nền"]', 'Quản trị viên hệ thống FitVibe'),
(2, 29, 'male', 180, 78, 'muscle_gain', 12.0, '["Không có chấn thương"]', 'HLV Thể hình chứng chỉ NASM 5 năm kinh nghiệm, chuyên sâu tăng cơ và giảm mỡ'),
(3, 27, 'female', 165, 52, 'maintain', 18.5, '["Không"]', 'Chuyên gia Yoga & Dinh dưỡng Eat Clean cân bằng thân tâm trí'),
(4, 31, 'male', 178, 82, 'muscle_gain', 13.5, '["Đã phục hồi dây chằng 2022"]', 'Master Trainer chứng chỉ ACSM, chuyên huấn luyện tăng sức mạnh và phát triển cơ bắp'),
(5, 26, 'male', 173, 68, 'weight_loss', 14.0, '["Không"]', 'HLV HIIT & Cardio chuyên sâu, giúp học viên đốt mỡ hiệu quả trong thời gian ngắn'),
(6, 28, 'male', 176, 75, 'muscle_gain', 13.0, '["Không"]', 'HLV cá nhân 1-1 chuyên nghiệp, tận tâm đồng hành cùng mục tiêu của bạn'),
(7, 25, 'male', 172, 68, 'weight_loss', 19.5, '["Dị ứng phấn hoa nhẹ"]', 'Mong muốn giảm 5kg mỡ bụng và săn chắc cơ thể'),
(8, 23, 'female', 160, 48, 'muscle_gain', 21.0, '["Không"]', 'Mục tiêu tăng cơ mông đùi và cải thiện vóc dáng'),
(9, 30, 'male', 175, 80, 'weight_loss', 24.0, '["Huyết áp ổn định"]', 'Mục tiêu giảm cân và cải thiện sức bền tim mạch'),
(10, 24, 'female', 158, 46, 'maintain', 20.0, '["Không"]', 'Tập luyện để duy trì năng lượng tích cực mỗi ngày'),
(11, 28, 'male', 170, 74, 'weight_loss', 22.5, '["Không"]', 'Mục tiêu săn chắc cơ bụng và giảm mỡ eo'),
(12, 22, 'female', 163, 53, 'muscle_gain', 21.5, '["Không"]', 'Tập luyện thể thao nâng cao sức khỏe và sự dẻo dai'),
(13, 29, 'male', 182, 80, 'muscle_gain', 11.5, '["Không"]', 'HLV thể hình tự do chứng nhận ISSA'),
(14, 22, 'male', 175, 60, 'muscle_gain', 14.0, '["Không"]', 'Tài khoản học viên test trải nghiệm các khóa học');

-- Coach Certificates
INSERT INTO `coach_certificates` (`id`, `coach_id`, `image_url`) VALUES
(1, 2, '/uploads/certificates/1778749197759-BangHLV.jpg'),
(2, 2, '/uploads/certificates/1778749197754-BangHLV2.jpg'),
(3, 4, '/uploads/certificates/1778749197759-BangHLV.jpg'),
(4, 6, '/uploads/certificates/1778749197754-BangHLV2.jpg'),
(5, 13, '/uploads/certificates/1778749197759-BangHLV.jpg');

-- Posts
INSERT INTO `posts` (`id`, `coach_id`, `category_id`, `title`, `content`, `video_url`, `calories_info`, `status`, `views`, `price`, `created_at`) VALUES
(1, 2, 1, '15 Phút tập bụng dưới tại nhà cực kỳ hiệu quả', 'Chuỗi bài tập gồng core và leg raise tác động trực tiếp vào vùng bụng dưới. Thực hiện 4 hiệp, mỗi hiệp 20 lần kết hợp thở đúng kỹ thuật.', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 180, 'approved', 45, 0.00, '2026-03-01 08:00:00'),
(2, 2, 8, 'Thực đơn Keto chuẩn 7 ngày cho người mới bắt đầu', 'Nguyên tắc vàng: 70% chất béo tốt, 25% protein và dưới 5% carbohydrate. Chi tiết các bữa ăn sáng, trưa, tối giúp cơ thể nhanh chóng vào trạng thái ketosis.', '', 1900, 'approved', 88, 0.00, '2026-03-02 09:00:00'),
(3, 4, 3, 'Kỹ thuật Squat chuẩn Form phát triển toàn diện đùi & mông', 'Hướng dẫn đặt chân, mở gối, giữ lưng trung tính và cách gồng bụng an toàn khi tập với tạ đơn hoặc tạ đòn. Tránh hoàn toàn lỗi cong lưng.', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', 380, 'approved', 62, 0.00, '2026-03-03 10:00:00'),
(4, 3, 9, 'Eat Clean: Bữa tối dinh dưỡng với Ức gà áp chảo sốt bơ tỏi', 'Cách tẩm ướp ức gà mềm mọng không khô cứng kết hợp măng tây và khoai lang nướng thơm ngon, đầy đủ protein và vi chất.', '', 480, 'approved', 50, 0.00, '2026-03-04 11:00:00'),
(5, 4, 2, 'Bí quyết tăng cơ ngực dày và cắt nét với bài Dumbbell Press', '3 hiệp x 12 lần hít đất khởi động, sau đó nâng dần mức tạ dumbbell để kích thích sợi cơ ngực trên và ngực giữa.', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', 320, 'approved', 75, 0.00, '2026-03-05 13:00:00'),
(6, 5, 7, 'HIIT 20 phút đốt mỡ thần tốc không cần dụng cụ', 'Bài tập cường độ cao ngắt quãng giúp cơ thể tiếp tục đốt calo liên tục trong 24 giờ sau khi tập luyện (hiệu ứng EPOC).', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 450, 'approved', 110, 0.00, '2026-03-06 14:00:00'),
(7, 4, 4, 'Xây dựng lưng chữ V rộng và dày với Pull Up & Barbell Row', 'Chi tiết cách cảm nhận cơ lưng xô thay vì mỏi cẳng tay, phương pháp khóa xương bả vai chuẩn xác cho gymer.', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', 400, 'approved', 95, 0.00, '2026-03-07 15:00:00'),
(8, 3, 10, 'Salad đậu hũ bơ hạt giàu thực vật protein cho người ăn chay', 'Công thức làm nước sốt mè rang béo ngậy ít calo kết hợp đậu hũ áp chảo giòn tan và hạt chia, quinoa.', '', 520, 'approved', 38, 0.00, '2026-03-08 16:00:00'),
(9, 2, 5, 'Bờ vai rộng vững chắc với bài tập Lateral Raise & Overhead Press', 'Khắc phục vai xuôi, tạo nét tròn đầy cho khớp vai với mức tạ vừa phải và kỹ thuật kiểm soát cơ bắp tối đa.', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 260, 'approved', 70, 0.00, '2026-03-09 17:00:00'),
(10, 6, 1, 'Chuyên đề: Đốt mỡ bụng nâng cao và kỹ thuật Hollow Body Hold', 'Phân tích cơ học gồng core, kiểm soát hơi thở và các bài tập tăng cường sức mạnh sàn chậu.', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', 220, 'approved', 34, 150000.00, '2026-03-10 18:00:00'),
(11, 2, 7, 'Cardio Tabata 10 phút tăng cường thể lực buổi sáng', 'Tập luyện nhanh trước khi đi làm giúp tinh thần minh mẫn, tăng tuần hoàn máu và tỉnh táo cả ngày.', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 200, 'pending', 12, 0.00, '2026-03-11 09:00:00');

-- Comments
INSERT INTO `comments` (`id`, `post_id`, `user_id`, `content`, `created_at`) VALUES
(1, 1, 7, 'Bài tập rất dễ làm theo, sau 1 tuần tập bụng mình đã săn chắc hơn nhiều!', '2026-03-05 10:00:00'),
(2, 1, 8, 'HLV giải thích kỹ thuật thở rất dễ hiểu, cảm ơn thầy!', '2026-03-06 11:30:00'),
(3, 3, 9, 'Trước giờ mình hay bị đau gối khi squat, xem clip này chỉnh lại form là hết hẳn!', '2026-03-07 14:00:00'),
(4, 4, 7, 'Món ức gà sốt bơ tỏi này ăn ngon xuất sắc, không hề bị khô chút nào.', '2026-03-08 18:00:00');

-- Bookmarks
INSERT INTO `bookmarks` (`user_id`, `post_id`, `created_at`) VALUES
(7, 1, '2026-03-05 10:05:00'),
(7, 3, '2026-03-06 14:10:00'),
(7, 4, '2026-03-08 18:05:00'),
(8, 1, '2026-03-06 11:35:00'),
(14, 1, '2026-03-10 10:00:00'),
(14, 5, '2026-03-10 10:05:00');

-- Routes
INSERT INTO `routes` (`id`, `coach_id`, `title`, `description`, `price`, `target_goal`, `standard`, `created_at`) VALUES
(1, 2, 'Lộ trình 30 ngày giảm mỡ bụng & săn chắc vòng eo', 'Lộ trình huấn luyện khoa học từng ngày từ cơ bản đến nâng cao, kết hợp bài tập core, cardio ngắt quãng và hướng dẫn thực đơn chi tiết.', 0.00, 'weight_loss', 'NASM Certified', '2026-03-01 08:00:00'),
(2, 4, 'Lộ trình 60 ngày tăng cơ toàn diện cho người gầy', 'Chiến lược dinh dưỡng thặng dư calo thông minh kết hợp tập luyện lũy tiến mức tạ (progressive overload) để phát triển cơ bắp tự nhiên.', 0.00, 'muscle_gain', 'ACSM Certified', '2026-03-01 09:00:00'),
(3, 3, 'Lộ trình Yoga dẻo dai & phục hồi cột sống mỗi sáng 15 phút', 'Dành riêng cho dân văn phòng và người ít vận động, giúp giải phóng áp lực cổ vai gáy và duy trì sự linh hoạt của khớp sống.', 0.00, 'maintain', 'ISSA Certified', '2026-03-01 10:00:00'),
(4, 6, 'Lộ trình Bootcamp tăng tốc đốt mỡ & định hình cơ thể', 'Chương trình huấn luyện đặc biệt với các bài tập tổng hợp compound và siêu chuỗi superset giúp biến đổi vóc dáng nhanh chóng.', 500000.00, 'weight_loss', 'Master Trainer Standard', '2026-03-05 12:00:00'),
(5, 13, 'Lộ trình Calisthenics làm chủ trọng lượng cơ thể', 'Tập luyện từ hít đất, kéo xà, lặn xà đến các kỹ năng nâng cao như Muscle-up và Handstand vững chãi.', 800000.00, 'muscle_gain', 'ISSA Elite', '2026-03-08 15:00:00');

-- Route Stages
INSERT INTO `route_stages` (`id`, `route_id`, `stage_order`, `title`, `video_url`, `description`, `nutrition_plan`, `calories_target`) VALUES
(1, 1, 1, 'Giai đoạn 1: Kỹ thuật gồng bụng & Hít thở cơ hoành', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 'Làm chủ hơi thở và kích hoạt nhóm cơ core sâu (Transversus Abdominis). Thực hiện 3 hiệp gồng bụng 30 giây.', 'Ức gà luộc xé phay, salad rau mầm sốt giấm táo, 1/2 chén gạo lứt đỏ.', 450),
(2, 1, 2, 'Giai đoạn 2: Gập bụng cơ bản & Leg Raise đúng kỹ thuật', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', 'Tác động trực tiếp vào cơ thẳng bụng trên và dưới mà không gây áp lực lên thắt lưng.', 'Cá hồi áp chảo măng tây nướng, khoai lang vàng luộc và hạt điều rang mộc.', 550),
(3, 1, 3, 'Giai đoạn 3: Plank tĩnh và Plank xoay eo nâng cao', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 'Giữ đúng form lưng thẳng, siết mông và bụng để đốt cháy tối đa năng lượng vùng eo.', 'Sữa chua Hy Lạp không đường, 1 quả chuối sứ chín, 1 muỗng hạt chia ngâm nở.', 350),
(4, 1, 4, 'Giai đoạn 4: Thử thách HIIT Tabata bụng 15 phút', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', 'Chuỗi liên hoàn Mountain Climber, Bicycle Crunch và Russian Twist.', 'Sinh tố bơ yến mạch whey protein mát lành và dồi dào năng lượng phục hồi.', 400),
(5, 2, 1, 'Giai đoạn 1: Cảm nhận cơ bắp & Khởi động khớp vai, háng', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', 'Làm quen với thanh đòn không tải và tạo kết nối não - cơ (mind-muscle connection).', 'Thịt bò áp chảo, bông cải xanh luộc, 1 chén cơm gạo trắng dẻo, 1 quả trứng ốp.', 750),
(6, 2, 2, 'Giai đoạn 2: Nâng dần mức tạ lũy tiến 5-10%', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 'Thực hiện các bài Bench Press, Squat và Romanian Deadlift với mức tạ vừa sức.', 'Cơm thịt heo nạc rim dầu ô liu, canh rau ngót nấu thịt băm, chuối tiêu.', 850),
(7, 3, 1, 'Giai đoạn 1: Khởi động xoay mở cột sống và khớp cổ', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 'Các động tác Cat-Cow (Mèo - Bò) và Child Pose (Đứa trẻ) giúp thư giãn hệ thần kinh.', 'Nước ép táo cần tây tươi mát, cháo yến mạch hạt sen thanh đạm.', 300),
(8, 3, 2, 'Giai đoạn 2: Chuỗi động tác Chào Mặt Trời (Sun Salutation)', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', '12 tư thế liên hoàn đồng bộ theo từng nhịp hít vào và thở ra sâu.', 'Bánh mì ngũ cốc nguyên cám phết bơ đậu phộng và lát táo tươi.', 380),
(9, 4, 1, 'Giai đoạn 1: Kiểm tra thể lực & Kích hoạt đốt mỡ', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 'Thực hiện chuỗi Burpee, Jumping Jack và High Knees 4 hiệp.', 'Salad tôm nướng sốt cam tươi, khoai tây nghiền ít béo.', 420),
(10, 5, 1, 'Giai đoạn 1: Kỹ thuật hít đất chuẩn và Hollow Body', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', 'Nền tảng của Calisthenics: kiểm soát toàn bộ cơ thể trong không gian.', 'Trứng luộc lòng đào, bánh mì đen và sữa hạt hạnh nhân.', 500);

-- Route Submissions
INSERT INTO `route_submissions` (`id`, `user_id`, `route_stage_id`, `status`, `submission_video_url`, `coach_feedback`, `submitted_at`, `evaluated_at`) VALUES
(1, 7, 1, 'passed', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 'Kỹ thuật gồng cơ bụng rất tốt, lưng dưới áp sát thảm chuẩn xác. Tiếp tục phát huy!', '2026-03-02 08:30:00', '2026-03-02 09:15:00'),
(2, 7, 2, 'submitted', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', NULL, '2026-03-05 16:00:00', NULL),
(3, 8, 1, 'passed', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 'Động tác chuẩn, giữ nhịp thở đều đặn rất tốt.', '2026-03-03 10:00:00', '2026-03-03 14:00:00'),
(4, 14, 1, 'passed', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 'Form đẹp, đã đạt chuẩn giai đoạn 1!', '2026-03-10 11:00:00', '2026-03-10 12:00:00');

-- User Route Progress (Compatibility)
INSERT INTO `user_route_progress` (`id`, `user_id`, `route_stage_id`, `status`, `submission_video_url`, `coach_feedback`, `submitted_at`, `evaluated_at`) VALUES
(1, 7, 1, 'passed', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 'Kỹ thuật gồng cơ bụng rất tốt, lưng dưới áp sát thảm chuẩn xác. Tiếp tục phát huy!', '2026-03-02 08:30:00', '2026-03-02 09:15:00'),
(2, 7, 2, 'submitted', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', NULL, '2026-03-05 16:00:00', NULL),
(3, 8, 1, 'passed', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 'Động tác chuẩn, giữ nhịp thở đều đặn rất tốt.', '2026-03-03 10:00:00', '2026-03-03 14:00:00'),
(4, 14, 1, 'passed', 'https://www.youtube.com/watch?v=h7cOOfpdEfk', 'Form đẹp, đã đạt chuẩn giai đoạn 1!', '2026-03-10 11:00:00', '2026-03-10 12:00:00');

-- Enrollments
INSERT INTO `enrollments` (`id`, `user_id`, `coach_id`, `status`, `created_at`) VALUES
(1, 7, 2, 'active', '2026-02-16 08:00:00'),
(2, 7, 4, 'active', '2026-02-18 09:00:00'),
(3, 8, 2, 'active', '2026-02-19 10:00:00'),
(4, 9, 4, 'active', '2026-02-21 11:00:00'),
(5, 11, 5, 'active', '2026-02-26 14:00:00'),
(6, 12, 3, 'active', '2026-03-02 15:00:00'),
(7, 14, 2, 'active', '2026-03-10 09:00:00'),
(8, 14, 6, 'active', '2026-03-10 09:30:00');

-- Purchases
INSERT INTO `purchases` (`id`, `user_id`, `content_id`, `content_type`, `price_paid`, `created_at`) VALUES
(1, 7, 10, 'post', 150000.00, '2026-03-10 18:30:00'),
(2, 7, 4, 'route', 500000.00, '2026-03-06 10:00:00'),
(3, 14, 4, 'route', 500000.00, '2026-03-10 10:00:00'),
(4, 14, 5, 'route', 800000.00, '2026-03-10 10:30:00');

-- Weight Logs
INSERT INTO `weight_logs` (`id`, `user_id`, `weight`, `logged_at`) VALUES
(1, 7, 72.5, '2026-02-15 07:00:00'),
(2, 7, 71.8, '2026-02-22 07:00:00'),
(3, 7, 70.9, '2026-03-01 07:00:00'),
(4, 7, 69.8, '2026-03-08 07:00:00'),
(5, 7, 68.0, '2026-03-15 07:00:00'),
(6, 8, 47.0, '2026-02-20 07:00:00'),
(7, 8, 47.5, '2026-02-27 07:00:00'),
(8, 8, 48.0, '2026-03-06 07:00:00'),
(9, 9, 83.0, '2026-02-20 07:00:00'),
(10, 9, 81.5, '2026-02-27 07:00:00'),
(11, 9, 80.0, '2026-03-06 07:00:00'),
(12, 14, 60.0, '2026-03-10 07:00:00'),
(13, 14, 61.2, '2026-03-15 07:00:00');

-- Transactions (VNPay Top-up)
INSERT INTO `transactions` (`id`, `user_id`, `amount`, `txn_ref`, `status`, `created_at`) VALUES
(1, 7, 1000000, 'VNP_TXN_20260301_001', 'success', '2026-03-01 08:30:00'),
(2, 7, 2000000, 'VNP_TXN_20260305_002', 'success', '2026-03-05 09:15:00'),
(3, 14, 5000000, 'VNP_TXN_20260310_003', 'success', '2026-03-10 09:00:00'),
(4, 14, 5000000, 'VNP_TXN_20260310_004', 'success', '2026-03-10 10:00:00'),
(5, 9, 2000000, 'VNP_TXN_20260311_005', 'pending', '2026-03-11 14:00:00');

-- Withdrawals (Coach Payout)
INSERT INTO `withdrawals` (`id`, `coach_id`, `amount`, `bank_name`, `account_number`, `account_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 2000000.00, 'Vietcombank', '10123456789', 'NGUYEN VAN AN', 'approved', '2026-03-04 10:00:00', '2026-03-04 15:00:00'),
(2, 4, 3000000.00, 'Techcombank', '19033445566778', 'LE QUANG CUONG', 'approved', '2026-03-06 11:00:00', '2026-03-06 16:30:00'),
(3, 6, 1500000.00, 'MBBank', '0987654321001', 'DANG HOANG LONG', 'pending', '2026-03-11 16:00:00', '2026-03-11 16:00:00');
