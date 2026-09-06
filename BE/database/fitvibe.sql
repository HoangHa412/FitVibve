CREATE DATABASE IF NOT EXISTS fitvibe;
USE fitvibe;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('user', 'coach', 'admin') DEFAULT 'user',
    status ENUM('pending', 'active', 'locked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    user_id INT PRIMARY KEY,
    age INT,
    gender ENUM('male', 'female', 'other'),
    height FLOAT, -- in cm
    weight FLOAT, -- in kg
    goal ENUM('weight_loss', 'muscle_gain', 'maintain'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('workout', 'diet') NOT NULL
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coach_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(255),
    calories_info INT, -- e.g. calories burned or calories per serving
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bookmarks (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    PRIMARY KEY (user_id, post_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE weight_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    weight FLOAT NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coach_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE route_stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    stage_order INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(255),
    description TEXT,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

CREATE TABLE user_route_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    route_stage_id INT NOT NULL,
    status ENUM('pending', 'submitted', 'passed', 'failed') DEFAULT 'pending',
    submission_video_url VARCHAR(255),
    coach_feedback TEXT,
    submitted_at TIMESTAMP NULL,
    evaluated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (route_stage_id) REFERENCES route_stages(id) ON DELETE CASCADE
);

CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    coach_id INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, coach_id)
);

-- Dummy Data
-- Insert dummy categories
INSERT INTO categories (name, type) VALUES 
('Cơ Bụng', 'workout'), 
('Cơ Ngực', 'workout'), 
('Cơ Chân', 'workout'), 
('Cơ Lưng', 'workout'),
('Cơ Vai', 'workout'),
('Cơ Tay', 'workout'),
('Cardio', 'workout'),
('Keto', 'diet'), 
('Eat Clean', 'diet'), 
('Chay Healthy', 'diet'),
('Low Carb', 'diet'),
('Intermittent Fasting', 'diet');

-- Passwords are '123456' hashed with bcrypt
INSERT INTO users (email, password, full_name, role, status) VALUES 
('admin@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Quản Trị Viên', 'admin', 'active'),
('coach1@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'HLV Nguyễn Văn An', 'coach', 'active'),
('coach2@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'HLV Trần Thị Bình', 'coach', 'pending'),
('coach3@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'HLV Lê Quang Cường', 'coach', 'active'),
('coach4@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'HLV Phạm Minh Đức', 'coach', 'active'),
('user1@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 01', 'user', 'active'),
('user2@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 02', 'user', 'active'),
('user3@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 03', 'user', 'locked'),
('user4@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 04', 'user', 'active'),
('user5@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 05', 'user', 'active'),
('user6@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 06', 'user', 'active'),
('user7@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 07', 'user', 'active'),
('user8@fitvibe.com', '$2a$10$PjZ0zSxkL5L/t3jO4k3pYOC2.1S2K4Vb5SMyF/L7.IXXeD9.B.1.e', 'Học Viên 08', 'user', 'active');

INSERT INTO profiles (user_id, age, gender, height, weight, goal) VALUES 
(6, 25, 'male', 170, 70, 'weight_loss'),
(7, 30, 'female', 160, 50, 'muscle_gain'),
(8, 22, 'male', 175, 75, 'maintain'),
(9, 28, 'female', 155, 45, 'weight_loss'),
(10, 35, 'male', 180, 85, 'muscle_gain'),
(11, 24, 'female', 162, 52, 'maintain'),
(12, 19, 'male', 172, 65, 'muscle_gain'),
(13, 27, 'female', 158, 48, 'weight_loss');

-- Post by coach
INSERT INTO posts (coach_id, category_id, title, content, video_url, calories_info, status) VALUES 
(2, 1, '15 Phút tập bụng dưới tại nhà', 'Thực hiện 4 hiệp, mỗi hiệp 20 cái leg raise.', 'https://youtube.com/watch?v=腹', 150, 'approved'),
(2, 8, 'Thực đơn Keto chuẩn cho người mới', 'Chia nhỏ bữa ăn, hạn chế tinh bột tối đa.', '', 2000, 'approved'),
(4, 3, 'Tập đùi tốn sức nhưng hiệu quả', 'Sử dụng tạ đơn 10kg cho mỗi bên.', 'https://youtube.com/watch?v=腿', 400, 'approved'),
(5, 9, 'Eat Clean: Bữa tối với ức gà áp chảo', 'Cách tẩm ướp cực ngon không bị khô.', '', 500, 'approved'),
(4, 2, 'Ngực to săn chắc với bài đẩy tạ', '3 hiệp x 12 lần hít đất và đẩy tạ.', 'https://youtube.com/watch?v=胸', 350, 'pending'),
(5, 7, 'HIIT 20 phút đốt mỡ thừa toàn thân', 'Không cần dụng cụ, tập mọi lúc mọi nơi.', 'https://youtube.com/watch?v=HIIT', 500, 'pending'),
(4, 4, 'Lưng xô dày và rộng nhanh chóng', 'Pull up và Deadlift cơ bản.', 'https://youtube.com/watch?v=背', 450, 'approved'),
(2, 10, 'Salad chay giàu protein cho Gymer', 'Kết hợp đậu hũ và các loại hạt.', '', 600, 'approved'),
(5, 11, 'Low Carb: Ăn gì để vẫn đủ sức tập?', 'Danh sách thực phẩm thay thế cơm.', '', 1200, 'approved'),
(2, 5, 'Vai rộng như vận động viên', 'Lên vai ngang và vai trước với tạ nhẹ.', 'https://youtube.com/watch?v=肩', 250, 'pending');

-- Routes by coach
INSERT INTO routes (coach_id, title, description) VALUES 
(2, 'Lộ trình 30 ngày giảm mỡ bụng cho học sinh', 'Chế độ tập luyện nhẹ nhàng nhưng đều đặn.'),
(4, 'Tăng cơ toàn thân cho người gầy lâu năm', 'Tập trung vào dinh dưỡng và tập nặng.'),
(5, 'Yoga dẻo dai mỗi sáng 15 phút', 'Dành cho những người ít vận động.');

INSERT INTO route_stages (route_id, stage_order, title, video_url, description) VALUES 
(1, 1, 'Ngày 1: Hít thở đúng cách', 'https://youtube.com/watch?v=s1', 'Học cách gồng bụng.'),
(1, 2, 'Ngày 2: Gập bụng cơ bản', 'https://youtube.com/watch?v=s2', 'Thực hiện 3 hiệp.'),
(1, 3, 'Ngày 3: Plank 1 phút', 'https://youtube.com/watch?v=s3', 'Giữ đúng tư thế lưng thẳng.'),
(2, 1, 'Tuần 1: Cảm nhận cơ bắp', 'https://youtube.com/watch?v=s4', 'Làm quen với tạ nhẹ.'),
(2, 2, 'Tuần 2: Nâng dần mức tạ', 'https://youtube.com/watch?v=s5', 'Tăng thêm 2.5kg mỗi bên.'),
(3, 1, 'Khởi động cột sống', 'https://youtube.com/watch?v=s6', 'Các động tác vặn mình nhẹ.'),
(3, 2, 'Chào mặt trời', 'https://youtube.com/watch?v=s7', 'Chuỗi động tác liên hoàn.');

-- Dummy Enrollments
INSERT INTO enrollments (user_id, coach_id) VALUES 
(6, 2), (7, 2), (8, 2),
(9, 4), (10, 4),
(11, 5);
