-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th5 14, 2026 lúc 08:13 AM
-- Phiên bản máy phục vụ: 8.2.0
-- Phiên bản PHP: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `fitvibe`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookmarks`
--

DROP TABLE IF EXISTS `bookmarks`;
CREATE TABLE IF NOT EXISTS `bookmarks` (
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`post_id`),
  KEY `post_id` (`post_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('workout','diet') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `type`) VALUES
(1, 'Cơ Bụng', 'workout'),
(2, 'Cơ Ngực', 'workout'),
(3, 'Cơ Chân', 'workout'),
(4, 'Cơ Lưng', 'workout'),
(5, 'Cơ Vai', 'workout'),
(6, 'Cơ Tay', 'workout'),
(8, 'Keto', 'diet'),
(9, 'Eat Clean', 'diet'),
(10, 'Chay Healthy', 'diet'),
(11, 'Low Carb', 'diet'),
(12, 'Intermittent Fasting', 'diet');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `comments`
--

DROP TABLE IF EXISTS `comments`;
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `coach_id` int NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`user_id`,`coach_id`),
  KEY `coach_id` (`coach_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `enrollments`
--

INSERT INTO `enrollments` (`id`, `user_id`, `coach_id`, `status`, `created_at`) VALUES
(1, 6, 2, 'active', '2026-03-02 07:05:15'),
(2, 7, 2, 'active', '2026-03-02 07:05:15'),
(3, 8, 2, 'active', '2026-03-02 07:05:15'),
(4, 9, 4, 'active', '2026-03-02 07:05:15'),
(5, 10, 4, 'active', '2026-03-02 07:05:15'),
(6, 11, 5, 'active', '2026-03-02 07:05:15'),
(7, 6, 3, 'active', '2026-03-02 07:07:24'),
(8, 6, 4, 'active', '2026-03-02 07:07:25'),
(9, 6, 5, 'inactive', '2026-03-02 07:07:26');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `posts`
--

DROP TABLE IF EXISTS `posts`;
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `coach_id` int NOT NULL,
  `category_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `video_url` varchar(255) DEFAULT NULL,
  `calories_info` int DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `views` int DEFAULT '0',
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `coach_id` (`coach_id`),
  KEY `category_id` (`category_id`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `posts`
--

INSERT INTO `posts` (`id`, `coach_id`, `category_id`, `title`, `content`, `video_url`, `calories_info`, `status`, `created_at`, `views`, `price`) VALUES
(1, 2, 1, '15 Phút tập bụng dưới tại nhà', 'Thực hiện 4 hiệp, mỗi hiệp 20 cái leg raise.', 'https://youtube.com/watch?v=腹', 150, 'approved', '2026-03-01 06:56:04', 5, 0.00),
(2, 2, 8, 'Thực đơn Keto chuẩn cho người mới', 'Chia nhỏ bữa ăn, hạn chế tinh bột tối đa.', 'https://www.youtube.com/watch?v=stKhOyUYUfI', 2000, 'approved', '2026-03-01 06:56:04', 10, 0.00),
(3, 4, 3, 'Tập đùi tốn sức nhưng hiệu quả', 'Sử dụng tạ đơn 10kg cho mỗi bên.', 'https://youtube.com/watch?v=腿', 400, 'approved', '2026-03-01 06:56:04', 3, 0.00),
(4, 5, 9, 'Eat Clean: Bữa tối với ức gà áp chảo', 'Cách tẩm ướp cực ngon không bị khô.', '', 500, 'approved', '2026-03-01 06:56:04', 1, 0.00),
(5, 4, 2, 'Ngực to săn chắc với bài đẩy tạ', '3 hiệp x 12 lần hít đất và đẩy tạ.', 'https://youtube.com/watch?v=胸', 350, 'approved', '2026-03-01 06:56:04', 1, 0.00),
(6, 5, 7, 'HIIT 20 phút đốt mỡ thừa toàn thân', 'Không cần dụng cụ, tập mọi lúc mọi nơi.', 'https://youtube.com/watch?v=HIIT', 500, 'approved', '2026-03-01 06:56:04', 0, 0.00),
(7, 4, 4, 'Lưng xô dày và rộng nhanh chóng', 'Pull up và Deadlift cơ bản.', 'https://youtube.com/watch?v=背', 450, 'approved', '2026-03-01 06:56:04', 0, 0.00),
(8, 2, 10, 'Salad chay giàu protein cho Gymer', 'Kết hợp đậu hũ và các loại hạt.', '', 600, 'approved', '2026-03-01 06:56:04', 1, 0.00),
(9, 5, 11, 'Low Carb: Ăn gì để vẫn đủ sức tập?', 'Danh sách thực phẩm thay thế cơm.', '', 1200, 'approved', '2026-03-01 06:56:04', 1, 0.00),
(10, 2, 5, 'Vai rộng như vận động viên', 'Lên vai ngang và vai trước với tạ nhẹ.', 'https://youtube.com/watch?v=肩', 250, 'approved', '2026-03-01 06:56:04', 0, 0.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `profiles`
--

DROP TABLE IF EXISTS `profiles`;
CREATE TABLE IF NOT EXISTS `profiles` (
  `user_id` int NOT NULL,
  `age` int DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `height` float DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `goal` enum('weight_loss','muscle_gain','maintain') DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `profiles`
--

INSERT INTO `profiles` (`user_id`, `age`, `gender`, `height`, `weight`, `goal`) VALUES
(6, 25, 'male', 170, 70, 'weight_loss'),
(7, 30, 'female', 160, 50, 'muscle_gain'),
(8, 22, 'male', 175, 75, 'maintain'),
(9, 28, 'female', 155, 45, 'weight_loss'),
(10, 35, 'male', 180, 85, 'muscle_gain'),
(11, 24, 'female', 162, 52, 'maintain'),
(12, 19, 'male', 172, 65, 'muscle_gain'),
(13, 27, 'female', 158, 48, 'weight_loss'),
(14, NULL, NULL, NULL, NULL, NULL),
(15, NULL, NULL, NULL, NULL, NULL),
(17, 22, 'male', 175, 60, NULL),
(16, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchases`
--

DROP TABLE IF EXISTS `purchases`;
CREATE TABLE IF NOT EXISTS `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `content_id` int NOT NULL,
  `content_type` enum('post','route') COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_paid` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `content` (`content_id`,`content_type`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `purchases`
--

INSERT INTO `purchases` (`id`, `user_id`, `content_id`, `content_type`, `price_paid`, `created_at`) VALUES
(1, 17, 12, 'post', 100000.00, '2026-05-14 07:38:15'),
(2, 17, 5, 'route', 200000.00, '2026-05-14 07:54:28'),
(3, 17, 13, 'post', 300000.00, '2026-05-14 07:54:42'),
(4, 17, 6, 'route', 1000000.00, '2026-05-14 07:58:45'),
(5, 17, 7, 'route', 1000000.00, '2026-05-14 08:03:19'),
(6, 17, 8, 'route', 2000000.00, '2026-05-14 08:10:44');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `routes`
--

DROP TABLE IF EXISTS `routes`;
CREATE TABLE IF NOT EXISTS `routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `coach_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `price` decimal(10,2) DEFAULT '0.00',
  `standard` varchar(255) DEFAULT 'Chưa xác định',
  PRIMARY KEY (`id`),
  KEY `coach_id` (`coach_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `routes`
--

INSERT INTO `routes` (`id`, `coach_id`, `title`, `description`, `created_at`, `price`, `standard`) VALUES
(1, 2, 'Lộ trình 30 ngày giảm mỡ bụng cho học sinh', 'Chế độ tập luyện nhẹ nhàng nhưng đều đặn.', '2026-03-01 06:56:04', 0.00, 'NASM'),
(2, 4, 'Tăng cơ toàn thân cho người gầy lâu năm', 'Tập trung vào dinh dưỡng và tập nặng.', '2026-03-01 06:56:04', 0.00, 'ACSM'),
(3, 5, 'Yoga dẻo dai mỗi sáng 15 phút', 'Dành cho những người ít vận động.', '2026-03-01 06:56:04', 0.00, 'ISSA'),
(7, 16, 'test', 'test', '2026-05-14 08:02:58', 1000000.00, 'Chưa xác định'),
(8, 16, 'test', 'test', '2026-05-14 08:10:11', 2000000.00, 'Chưa xác định');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `route_stages`
--

DROP TABLE IF EXISTS `route_stages`;
CREATE TABLE IF NOT EXISTS `route_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `route_id` int NOT NULL,
  `stage_order` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `description` text,
  `nutrition_plan` text,
  `calories_target` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `route_id` (`route_id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `route_stages`
--

INSERT INTO `route_stages` (`id`, `route_id`, `stage_order`, `title`, `video_url`, `description`, `nutrition_plan`, `calories_target`) VALUES
(1, 1, 1, 'Ngày 1: Hít thở đúng cách', 'https://www.youtube.com/watch?v=h7cOOfpdEfk&list=RDQr4tu2td5u8&index=11', 'Học cách gồng bụng.', 'Ức gà luộc, salad rau mầm, nửa chén gạo lứt.', 500),
(2, 1, 2, 'Ngày 2: Gập bụng cơ bản', 'https://www.youtube.com/watch?v=qsiO_vC7MEQ', 'Thực hiện 3 hiệp.', 'Cá hồi áp chảo, măng tây, khoai lang nướng.', 600),
(3, 1, 3, 'Ngày 3: Plank 1 phút', 'https://youtube.com/watch?v=s3', 'Giữ đúng tư thế lưng thẳng.', 'Sữa chua không đường, 1 quả chuối, hạt chia.', 300),
(4, 2, 1, 'Tuần 1: Cảm nhận cơ bắp', 'https://youtube.com/watch?v=s4', 'Làm quen với tạ nhẹ.', 'Thịt bò xào súp lơ, cơm trắng, trứng ốp la.', 800),
(5, 2, 2, 'Tuần 2: Nâng dần mức tạ', 'https://youtube.com/watch?v=s5', 'Tăng thêm 2.5kg mỗi bên.', 'Thịt bò xào súp lơ, cơm trắng, trứng ốp la.', 800),
(6, 3, 1, 'Khởi động cột sống', 'https://youtube.com/watch?v=s6', 'Các động tác vặn mình nhẹ.', 'Sữa chua không đường, 1 quả chuối, hạt chia.', 300),
(7, 3, 2, 'Chào mặt trời', 'https://youtube.com/watch?v=s7', 'Chuỗi động tác liên hoàn.', 'Sữa chua không đường, 1 quả chuối, hạt chia.', 300),
(9, 5, 1, 'test', 'https://test', 'test', 'test nutrition', 500),
(10, 6, 1, 'test', 'http://test', 'test', 'test nutrition', 500),
(11, 7, 1, 'test', 'http://test', 'test', 'test nutrition', 500),
(12, 8, 1, 'test', 'http;//test', 'test', 'test nutrition', 500);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('user','coach','admin') DEFAULT 'user',
  `balance` decimal(15,2) DEFAULT '0.00',
  `status` enum('pending','active','locked') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `avatar_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `role`, `balance`, `status`, `created_at`, `updated_at`, `avatar_url`) VALUES
(1, 'admin@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Quản Trị Viên', 'admin', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-01 06:56:04', NULL),
(2, 'coach1@fitvibe.com', '$2b$10$UTO03f6iNjQnVg3/vuED0OJIJcSUSitMzbSwegdABV6BFN6RWieAS', 'HLV Nguyễn Văn An', 'coach', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-11 05:28:45', '/uploads/avatars/avatar-1772438428209-310624340.png'),
(3, 'coach2@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'HLV Trần Thị Bình', 'coach', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-01 07:44:44', NULL),
(4, 'coach3@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'HLV Lê Quang Cường', 'coach', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-01 06:56:04', NULL),
(5, 'coach4@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'HLV Phạm Minh Đức', 'coach', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-01 06:56:04', NULL),
(6, 'user1@fitvibe.com', '$2b$10$xaT7U8pzXdyUxt4C9q28petDOsMJPUMlspmQV.8iQcRAjxgsBjdcW', 'Học Viên 01', 'user', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-11 05:28:50', NULL),
(7, 'user2@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 02', 'user', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-01 06:56:04', NULL),
(8, 'user3@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 03', 'user', 0.00, 'locked', '2026-03-01 06:56:04', '2026-03-01 06:56:04', NULL),
(9, 'user4@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 04', 'user', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-01 06:56:04', NULL),
(10, 'user5@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 05', 'user', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-01 06:56:04', NULL),
(11, 'user6@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 06', 'user', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-01 06:56:04', NULL),
(12, 'user7@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 07', 'user', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-01 06:56:04', NULL),
(13, 'user8@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 08', 'user', 0.00, 'active', '2026-03-01 06:56:04', '2026-03-01 06:56:04', NULL),
(14, 'admin@gmail.com', '$2b$10$ofl56ODndL1FglMroQB63.cfvagiRT2hR7vpxWj3weg1y.TV.nVFa', 'adminmm', 'admin', 0.00, 'active', '2026-03-01 06:56:32', '2026-03-11 06:38:09', NULL),
(16, 'test@gmail.com', '$2b$10$ZPBL6NL77viKexEM7BVj5u3K42Hhr.Kv/nHgXkP9rQbCG1VxC2wwG', 'Test55', 'coach', 4000000.00, 'active', '2026-04-15 06:29:32', '2026-05-14 08:10:44', NULL),
(17, 'test1@gmail.com', '$2b$10$zbwHGuBznNLH3uRoD/6muu6ajOp42kpMZSxqGFU4pwiqfY8OsCE5e', 'test', 'user', 10500000.00, 'active', '2026-05-14 07:20:11', '2026-05-14 08:10:44', '/uploads/avatars/avatar-1778744916509-343364445.jpg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_route_progress`
--

DROP TABLE IF EXISTS `user_route_progress`;
CREATE TABLE IF NOT EXISTS `user_route_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `route_stage_id` int NOT NULL,
  `status` enum('pending','submitted','passed','failed') DEFAULT 'pending',
  `submission_video_url` varchar(255) DEFAULT NULL,
  `coach_feedback` text,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `evaluated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `route_stage_id` (`route_stage_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `user_route_progress`
--

INSERT INTO `user_route_progress` (`id`, `user_id`, `route_stage_id`, `status`, `submission_video_url`, `coach_feedback`, `submitted_at`, `evaluated_at`) VALUES
(1, 6, 1, 'submitted', 'https://www.youtube.com/watch?v=YT4b9AIko14', 'Kỹ thuật chưa chuẩn, cần tập trung hơn.', '2026-03-25 09:59:11', '2026-03-02 06:55:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `weight_logs`
--

DROP TABLE IF EXISTS `weight_logs`;
CREATE TABLE IF NOT EXISTS `weight_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `weight` float NOT NULL,
  `logged_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `weight_logs`
--

INSERT INTO `weight_logs` (`id`, `user_id`, `weight`, `logged_at`) VALUES
(1, 6, 70, '2026-03-02 06:55:54'),
(2, 17, 60, '2026-05-14 08:12:42');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
