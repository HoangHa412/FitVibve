# Hướng Dẫn Tài Khoản FitVibe

## Tài Khoản Demo - Các Vai Trò (Roles)

Hệ thống FitVibe có 3 vai trò chính với quyền hạn và tính năng khác nhau:

---

## 1. NGƯỜI DÙNG (User) 👤

**Email:** `user@fitvibe.com`  
**Mật khẩu:** `123456`

### Tính Năng Chính:
- 📊 **Bảng Điều Khiển**: Xem tổng quan sức khỏe
- 💚 **Chỉ Số Sức Khỏe**: 
  - BMI (Chỉ số khối cơ thể)
  - BMR (Tỷ lệ chuyển hóa cơ bản)
  - TDEE (Lượng calo hàng ngày)
  - Nhịp tim, Huyết áp, % Mỡ cơ thể

- ⚖️ **Theo Dõi Cân Nặng**: 
  - Ghi nhận cân nặng hàng ngày
  - Xem lịch sử tiến độ
  - Biểu đồ trực quan

- 🏋️ **Kế Hoạch Tập Luyện**:
  - Xem lịch tập tuần
  - Theo dõi bài tập
  - Đếm calo tiêu thụ
  - Quản lý sức bền

- 🍽️ **Kế Hoạch Dinh Dưỡng**:
  - Quản lý bữa ăn hàng ngày
  - Theo dõi macro (Protein, Carbs, Fat)
  - Lập kế hoạch tuần

- 📚 **Nội Dung Từ Huấn Luyện Viên**:
  - Xem bài viết và hướng dẫn
  - Nhận khuyến nghị cá nhân hóa

### URL Truy Cập:
- Bảng điều khiển: `/dashboard`
- Sức khỏe: `/dashboard/health`
- Cân nặng: `/dashboard/weight`
- Tập luyện: `/dashboard/workouts`
- Dinh dưỡng: `/dashboard/meals`

---

## 2. HUẤN LUYỆN VIÊN (Coach) 🏋️

**Email:** `coach@fitvibe.com`  
**Mật khẩu:** `123456`

### Tính Năng Chính:
- 👥 **Quản Lý Học Viên**:
  - Xem danh sách 24+ học viên
  - Theo dõi tiến độ BMI
  - Kiểm tra trạng thái hoạt động
  - Tìm kiếm học viên

- 📝 **Tạo Nội Dung**:
  - Viết bài viết mới
  - Quản lý bài viết (Đã xuất bản, Chờ duyệt, Nháp)
  - Theo dõi lượt xem và bình luận
  - Phân loại nội dung

- ✅ **Hàng Chờ Duyệt**:
  - Duyệt cập nhật cân nặng từ học viên
  - Duyệt bình luận bài viết
  - Duyệt hình ảnh/ảnh tiến độ
  - Phê duyệt hoặc từ chối

- 📊 **Thống Kê**:
  - Xem số lượng học viên tích cực
  - Tỷ lệ hoàn thành kế hoạch
  - Bài viết được duyệt
  - Phân tích hiệu suất

### URL Truy Cập:
- Bảng điều khiển: `/coach`
- Học viên: `/coach/clients`
- Nội dung: `/coach/content`
- Duyệt: `/coach/moderation`
- Thống kê: `/coach/analytics`

---

## 3. QUẢN TRỊ VIÊN (Admin) 🔐

**Email:** `admin@fitvibe.com`  
**Mật khẩu:** `123456`

### Tính Năng Chính:
- 👨‍💼 **Quản Lý Thành Viên**:
  - Xem tất cả 1,240+ người dùng
  - Lọc theo vai trò (User, Coach, Admin)
  - Tìm kiếm người dùng
  - Xem trạng thái (Hoạt động, Tạm dừng)
  - Xem ngày tham gia
  - Quản lý (Xem chi tiết, Xóa tài khoản)

- 📋 **Duyệt Bài Viết**:
  - Xem bài viết chờ duyệt từ huấn luyện viên
  - Phê duyệt bài viết
  - Từ chối nội dung
  - Xem báo cáo vi phạm
  - Quản lý danh mục

- 📊 **Báo Cáo & Thống Kê**:
  - DAU (Daily Active Users)
  - MAU (Monthly Active Users)
  - Tỷ lệ hoàn thành
  - Người dùng rơi rụng
  - Biểu đồ tăng trưởng người dùng
  - Hoạt động người dùng
  - Nội dung được tạo
  - Huấn luyện viên hàng đầu
  - Nội dung phổ biến
  - Mục tiêu sức khỏe hàng đầu

- ⚙️ **Kiểm Soát Hệ Thống**:
  - Tình trạng API
  - Tình trạng Database
  - Dung lượng lưu trữ
  - Dịch vụ Email

### URL Truy Cập:
- Bảng điều khiển: `/admin`
- Thành viên: `/admin/members`
- Duyệt bài viết: `/admin/posts`
- Danh mục: `/admin/categories`
- Báo cáo: `/admin/reports`

---

## Sơ Đồ Quyền Hạn (Permission Matrix)

| Tính Năng | User | Coach | Admin |
|-----------|------|-------|-------|
| Xem bảng điều khiển cá nhân | ✅ | ✅ | ✅ |
| Quản lý sức khỏe cá nhân | ✅ | ❌ | ❌ |
| Tạo nội dung | ❌ | ✅ | ❌ |
| Quản lý học viên | ❌ | ✅ | ❌ |
| Duyệt nội dung học viên | ❌ | ✅ | ❌ |
| Duyệt bài viết | ❌ | ❌ | ✅ |
| Quản lý tất cả thành viên | ❌ | ❌ | ✅ |
| Xem báo cáo hệ thống | ❌ | ❌ | ✅ |

---

## Quy Trình Sử Dụng

### Người Dùng:
1. Đăng nhập với `user@fitvibe.com`
2. Xem bảng điều khiển tổng quan
3. Cập nhật chỉ số sức khỏe
4. Ghi nhận cân nặng hàng ngày
5. Xem kế hoạch tập luyện từ huấn luyện viên
6. Theo dõi dinh dưỡng

### Huấn Luyện Viên:
1. Đăng nhập với `coach@fitvibe.com`
2. Xem danh sách học viên
3. Tạo bài viết hướng dẫn
4. Duyệt cập nhật từ học viên
5. Phân tích tiến độ nhóm

### Quản Trị Viên:
1. Đăng nhập với `admin@fitvibe.com`
2. Giám sát tất cả người dùng
3. Duyệt nội dung từ huấn luyện viên
4. Xem báo cáo tổng quát
5. Quản lý danh mục
6. Kiểm tra tình trạng hệ thống

---

## Lưu Ý Bảo Mật

⚠️ **Đây là tài khoản demo dành cho test/development**

Các tài khoản này sử dụng mật khẩu đơn giản vì mục đích demo. Trong production:
- Sử dụng mật khẩu mạnh
- Bật xác thực 2 yếu tố (2FA)
- Cập nhật quyền hạn theo vai trò
- Sử dụng hashing mật khẩu (bcrypt)
- Kiểm tra quyền truy cập ở server-side

---

## Xử Lý Sự Cố

### Không thể đăng nhập:
- Kiểm tra email và mật khẩu chính xác
- Xóa cache trình duyệt
- Thử incognito/private mode

### Bị redirect về trang chủ:
- Vai trò tài khoản không khớp với trang
- Hãy đăng nhập lại với tài khoản phù hợp

### Phiên hết hạn:
- Nhấp "Đăng xuất" rồi đăng nhập lại
- Session được lưu trong localStorage

---

## Liên Hệ & Hỗ Trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
- Console DevTools (F12) để xem lỗi
- AuthContext để xem trạng thái đăng nhập
- Routing logic để xác nhận quyền truy cập
