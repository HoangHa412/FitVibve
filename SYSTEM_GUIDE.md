# 📖 TÀI LIỆU HƯỚNG DẪN HỆ THỐNG FITVIBE
> **Nền tảng Quản lý Luyện tập, Dinh dưỡng & Kết nối Huấn luyện viên Cá nhân trực tuyến**

---

## 📌 MỤC LỤC
1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Sơ đồ phân quyền (Permission Matrix)](#2-sơ-đồ-phân-quyền-permission-matrix)
3. [Danh sách tài khoản theo phân quyền](#3-danh-sách-tài-khoản-theo-phân-quyền)
4. [Chi tiết chức năng của từng vai trò](#4-chi-tiết-chức-năng-của-từng-vai-trò)
   - [4.1. Quản Trị Viên (Admin)](#41-quản-trị-viên-admin)
   - [4.2. Huấn Luyện Viên (Coach)](#42-huấn-luyện-viên-coach)
   - [4.3. Học Viên / Người Dùng (User)](#43-học-viên--người-dùng-user)
5. [Quy trình nghiệp vụ tiêu biểu (User Flows)](#5-quy-trình-nghiệp-vụ-tiêu-biểu-user-flows)
6. [Thông tin kỹ thuật & Triển khai](#6-thông-tin-kỹ-thuật--triển-khai)

---

## 1. TỔNG QUAN HỆ THỐNG

**FitVibe** là nền tảng thể hình và dinh dưỡng toàn diện kết nối giữa **Học viên (User)**, **Huấn luyện viên (Coach)** và **Quản trị viên (Admin)**:
* **Học viên**: Theo dõi sức khỏe (BMI/BMR/TDEE), ghi nhận biểu đồ cân nặng, mua và học các lộ trình tập luyện có thực đơn dinh dưỡng chi tiết, nộp video bài tập để HLV nhận xét, nạp tiền ví qua VNPay và nhận tư vấn thông minh.
* **Huấn luyện viên**: Xuất bản bài viết chuyên môn, thiết kế lộ trình tập luyện nhiều giai đoạn có video và chế độ dinh dưỡng, quản lý học viên, chấm điểm và góp ý kỹ thuật cho bài tập của học viên, quản lý doanh thu và yêu cầu rút tiền về tài khoản ngân hàng.
* **Quản trị viên**: Giám sát hệ thống, kiểm duyệt nội dung và yêu cầu rút tiền, quản lý danh mục và người dùng, theo dõi các chỉ số báo cáo tăng trưởng.

---

## 2. SƠ ĐỒ PHÂN QUYỀN (PERMISSION MATRIX)

| Chức năng / Quyền hạn | Quản Trị Viên (Admin) | Huấn Luyện Viên (Coach) | Học Viên (User) |
|---|:---:|:---:|:---:|
| **Xem Dashboard phân tích toàn hệ thống** | ✅ | ❌ | ❌ |
| **Quản lý & Khóa/Mở/Xóa tài khoản người dùng** | ✅ | ❌ | ❌ |
| **Kiểm duyệt bài viết của Huấn luyện viên** | ✅ | ❌ | ❌ |
| **Quản lý danh mục bài tập & dinh dưỡng** | ✅ | ❌ | ❌ |
| **Phê duyệt yêu cầu rút tiền của Huấn luyện viên** | ✅ | ❌ | ❌ |
| **Tạo & Quản lý bài viết tập luyện / dinh dưỡng** | ❌ | ✅ | ❌ |
| **Tạo Lộ trình nhiều giai đoạn (Video + Dinh dưỡng)** | ❌ | ✅ | ❌ |
| **Xem danh sách học viên theo dõi mình** | ❌ | ✅ | ❌ |
| **Chấm điểm & Góp ý video bài tập của học viên** | ❌ | ✅ | ❌ |
| **Quản lý Ví thu nhập & Yêu cầu rút tiền ngân hàng** | ❌ | ✅ | ❌ |
| **Cập nhật hồ sơ HLV & Quản lý Chứng chỉ bằng cấp** | ❌ | ✅ | ❌ |
| **Xem Dashboard chỉ số sức khỏe (BMI, BMR, TDEE)** | ❌ | ❌ | ✅ |
| **Nhật ký & Biểu đồ theo dõi cân nặng theo thời gian** | ❌ | ❌ | ✅ |
| **Khám phá & Đọc bài viết, Lưu Bookmark, Bình luận** | ❌ | ✅ | ✅ |
| **Mua bài viết chuyên sâu & Lộ trình tập luyện** | ❌ | ❌ | ✅ |
| **Học lộ trình mở khóa tuần tự theo từng giai đoạn** | ❌ | ❌ | ✅ |
| **Quay & Nộp video bài tập để HLV chấm điểm** | ❌ | ❌ | ✅ |
| **Đăng ký / Hủy theo dõi Huấn luyện viên** | ❌ | ❌ | ✅ |
| **Nạp tiền vào ví cá nhân qua cổng VNPay** | ❌ | ❌ | ✅ |
| **Gợi ý lộ trình thông minh & Trợ lý AI tư vấn** | ❌ | ❌ | ✅ |

---

## 3. DANH SÁCH TÀI KHOẢN THEO PHÂN QUYỀN

> 💡 **Tất cả tài khoản mẫu dưới đây đều sử dụng Mật khẩu chung:** `123456`

### 3.1. Nhóm Quản Trị Viên (Admin)
| Email | Họ và Tên | Vai trò | Mục đích sử dụng |
|---|---|:---:|---|
| `admin@fitvibe.com` | **Quản Trị Viên Hệ Thống** | `admin` | Quản lý toàn bộ hệ thống, thành viên, duyệt bài viết, duyệt rút tiền |

---

### 3.2. Nhóm Huấn Luyện Viên (Coach)
| Email | Họ và Tên | Chuyên môn / Chứng chỉ | Dữ liệu mẫu có sẵn |
|---|---|---|---|
| `coach1@fitvibe.com` | **HLV Nguyễn Văn An** | HLV Thể hình NASM 5 năm KN | 4 bài viết, 1 lộ trình 4 giai đoạn, 3 học viên, 2 chứng chỉ, số dư ví 3.500.000đ |
| `coach2@fitvibe.com` | **HLV Trần Thị Bình** | Yoga & Dinh dưỡng Eat Clean | 1 lộ trình Yoga 2 giai đoạn, 1 học viên, số dư ví 1.200.000đ |
| `coach3@fitvibe.com` | **HLV Lê Quang Cường** | Master Trainer ACSM, Thể hình | 3 bài viết, 1 lộ trình tăng cơ, 2 học viên, 1 chứng chỉ, số dư 5.800.000đ |
| `coach4@fitvibe.com` | **HLV Phạm Minh Đức** | HIIT & Cardio đốt mỡ nhanh | 2 bài viết, 1 học viên, số dư 2.400.000đ |
| `coach@fitvibe.com` | **HLV Đặng Hoàng Long** | HLV Cá nhân 1-1 Chuyên nghiệp | 1 lộ trình Bootcamp 500k, 1 bài viết chuyên đề 150k, 1 chứng chỉ, số dư 4.200.000đ |
| `test@gmail.com` | **HLV Test Chuyên Nghiệp** | Calisthenics & Bodyweight | 1 lộ trình Calisthenics 800k, 1 chứng chỉ, số dư 4.000.000đ |

---

### 3.3. Nhóm Học Viên / Người Dùng (User)
| Email | Họ và Tên | Thông số thể trạng | Dữ liệu mẫu có sẵn |
|---|---|---|---|
| `user@fitvibe.com` | **Vũ Minh Tuấn** | Nam, 25t, 172cm, 68kg (Giảm mỡ) | Ví: **2.500.000đ**, đã mua lộ trình Bootcamp, 5 nhật ký cân nặng, 3 bookmark |
| `user1@fitvibe.com` | **Nguyễn Thị Hoa** | Nữ, 23t, 160cm, 48kg (Tăng cơ) | Ví: **800.000đ**, đang học lộ trình HLV An, 3 nhật ký cân nặng |
| `user2@fitvibe.com` | **Trần Đình Trọng** | Nam, 30t, 175cm, 80kg (Giảm mỡ) | Ví: **1.500.000đ**, theo dõi HLV Cường, 3 nhật ký cân nặng |
| `user3@fitvibe.com` | **Lê Bích Thảo** | Nữ, 24t, 158cm, 46kg | *Tài khoản bị khóa (`locked`)* dùng để test phân quyền khóa |
| `user4@fitvibe.com` | **Hoàng Văn Nam** | Nam, 28t, 170cm, 74kg (Giảm mỡ) | Ví: **500.000đ**, theo dõi HLV Đức |
| `user5@fitvibe.com` | **Đỗ Quỳnh Anh** | Nữ, 22t, 163cm, 53kg (Tăng cơ) | Ví: **300.000đ**, theo dõi HLV Bình |
| `test1@gmail.com` | **Học Viên Test Mẫu** | Nam, 22t, 175cm, 60kg | Ví: **10.500.000đ**, đã mua 2 lộ trình (Bootcamp & Calisthenics), 2 bài nộp video |

---

## 4. CHI TIẾT CHỨC NĂNG CỦA TỪNG VAI TRÒ

### 4.1. QUẢN TRỊ VIÊN (Admin)
Truy cập qua URL: `/admin`
1. **Bảng điều khiển tổng quan (`/admin`)**:
   - Thống kê nhanh: Tổng số người dùng, số bài viết mới trong tháng, doanh thu bán khóa học, tổng tiền rút.
   - Biểu đồ biến động người dùng hoạt động (DAU/MAU).
2. **Quản lý thành viên (`/admin/members`)**:
   - Danh sách toàn bộ tài khoản trong hệ thống kèm vai trò, ngày tạo, số dư, trạng thái.
   - Tìm kiếm theo tên / email; lọc theo vai trò (`User`, `Coach`, `Admin`).
   - Khóa / Mở khóa tài khoản người dùng ngay lập tức.
   - Reset mật khẩu tài khoản về mặc định.
   - Xóa tài khoản người dùng vi phạm.
3. **Duyệt bài viết của HLV (`/admin/posts`)**:
   - Danh sách các bài viết HLV gửi lên đang ở trạng thái Chờ duyệt (`pending`).
   - Xem chi tiết nội dung, video hướng dẫn đính kèm, lượng calo ước tính.
   - Nút hành động: **Phê duyệt (Approve)** hoặc **Từ chối (Reject)**.
4. **Quản lý danh mục (`/admin/categories`)**:
   - Thêm danh mục mới (Phân loại theo Bài tập `workout` hoặc Chế độ ăn `diet`).
   - Chỉnh sửa tên, loại danh mục.
   - Xóa danh mục không còn sử dụng.
5. **Duyệt yêu cầu rút tiền (`/admin/withdrawals`)**:
   - Danh sách yêu cầu rút tiền của Huấn luyện viên kèm số tiền, tên ngân hàng, số tài khoản, tên chủ thẻ.
   - Duyệt lệnh chuyển khoản thành công hoặc từ chối hoàn tiền lại vào ví HLV.
6. **Báo cáo & Thống kê nâng cao (`/admin/reports`)**:
   - Biểu đồ tròn phân bố mục tiêu thể hình của học viên (Giảm cân, Tăng cơ, Duy trì).
   - Biểu đồ cột xếp hạng Huấn luyện viên có nhiều nội dung chất lượng nhất.
   - Xuất dữ liệu báo cáo ra file Excel/CSV.

---

### 4.2. HUẤN LUYỆN VIÊN (Coach)
Truy cập qua URL: `/coach`
1. **Bảng điều khiển Huấn luyện viên (`/coach`)**:
   - Thống kê: Tổng số bài viết, số bài đã xuất bản, bài chờ duyệt, bài tập học viên chờ chấm điểm, số lượng học viên đang theo dõi và số dư ví thu nhập.
2. **Quản lý nội dung bài viết (`/coach/content`)**:
   - Soạn thảo bài viết mới kèm mô tả, danh mục, lượng calo, link video YouTube hoặc video upload nội bộ.
   - Thiết lập nội dung miễn phí hoặc đặt giá bán (VNĐ).
   - Chỉnh sửa, cập nhật hoặc xóa bài viết cá nhân.
3. **Thiết kế Lộ trình tập luyện (`/coach/routes`)**:
   - Tạo lộ trình theo mục tiêu thể trạng (`weight_loss`, `muscle_gain`, `maintain`) và tiêu chuẩn chứng nhận (NASM, ACSM, ISSA...).
   - Chia nhỏ lộ trình thành **nhiều Giai đoạn (Stages)** tuần tự.
   - Thiết lập chi tiết từng giai đoạn: Tiêu đề, link video hướng dẫn động tác, bài viết kỹ thuật, **Kế hoạch dinh dưỡng (Nutrition Plan)** và Calo tiêu thụ mục tiêu.
4. **Quản lý học viên (`/coach/clients`)**:
   - Danh sách học viên đang đăng ký theo dõi hoặc mua khóa học.
   - Xem thể trạng, mục tiêu sức khỏe và chỉ số của từng học viên.
5. **Chấm điểm & Duyệt bài tập (`/coach/moderation` hoặc `/coach/submissions`)**:
   - Danh sách video bài tập học viên nộp cho từng giai đoạn của lộ trình.
   - Xem video động tác của học viên.
   - Đánh giá: **Đạt (Passed)** hoặc **Chưa đạt (Failed)** kèm **Lời nhận xét góp ý kỹ thuật (Coach Feedback)**.
6. **Ví thu nhập & Rút tiền (`/coach/wallet`)**:
   - Theo dõi doanh thu kiếm được từ học viên mua bài viết và lộ trình.
   - Gửi yêu cầu rút tiền: Nhập số tiền muốn rút, chọn ngân hàng, số tài khoản, tên người thụ hưởng.
   - Xem lịch sử các đợt rút tiền và trạng thái duyệt của Admin.
7. **Hồ sơ & Chứng chỉ chuyên môn (`/coach/profile`)**:
   - Cập nhật tiểu sử cá nhân (Bio), chuyên môn thể thao.
   - Tải lên ảnh bằng cấp, chứng chỉ huấn luyện viên quốc tế (NASM, ACE, ACSM, ISSA...).

---

### 4.3. HỌC VIÊN / NGƯỜI DÙNG (User)
Truy cập qua URL: `/dashboard`
1. **Bảng điều khiển sức khỏe cá nhân (`/dashboard`)**:
   - Tự động tính toán các chỉ số sinh trắc:
     - **BMI** (Body Mass Index - Chỉ số khối cơ thể) kèm phân loại thể trạng.
     - **BMR** (Basal Metabolic Rate - Tỷ lệ chuyển hóa cơ bản).
     - **TDEE** (Total Daily Energy Expenditure - Mức calo tiêu thụ hàng ngày).
   - Widget nạp tiền nhanh vào ví tài khoản.
2. **Nhật ký theo dõi cân nặng (`/dashboard/weight`)**:
   - Ghi lại cân nặng định kỳ (kg).
   - Biểu đồ đường trực quan hóa quá trình tăng/giảm cân theo tuần/tháng.
3. **Khám phá bài viết & Chế độ ăn (`/dashboard/workouts` & `/dashboard/meals`)**:
   - Xem kho bài viết chất lượng từ các Huấn luyện viên hàng đầu theo nhóm cơ (Bụng, Ngực, Chân, Lưng, Vai, Tay) hoặc chế độ ăn (Keto, Eat Clean, Chay, Low Carb...).
   - Đọc hướng dẫn, xem video kỹ thuật, lưu bài viết yêu thích (Bookmark), tham gia bình luận thảo luận.
   - Mở khóa bài viết chuyên sâu có phí.
4. **Lộ trình tập luyện tuần tự (`/dashboard/routes`)**:
   - Tham gia các lộ trình chuyên sâu (30 ngày giảm mỡ, 60 ngày tăng cơ, Yoga dẻo dai...).
   - **Cơ chế mở khóa tuần tự (Sequential Progression)**: Học viên phải hoàn thành và được HLV duyệt vượt qua giai đoạn trước mới được mở video và bài tập của giai đoạn sau.
   - Xem thực đơn dinh dưỡng chi tiết cho từng bữa ăn tương ứng với từng ngày tập.
5. **Nộp video bài tập (Video Submission)**:
   - Quay video thực hiện bài tập và gửi link video/upload cho Huấn luyện viên.
   - Nhận thông báo đánh giá (Passed/Failed) và lời khuyên chỉnh form từ chính HLV phụ trách.
6. **Nạp tiền ví điện tử qua VNPay (`/dashboard` -> Nạp tiền)**:
   - Chọn mệnh giá nạp (100k, 200k, 500k, 1 triệu, 2 triệu, 5 triệu...).
   - Chuyển hướng tới cổng thanh toán VNPay (hỗ trợ quét mã VNPAY-QR, Thẻ ATM nội địa, Internet Banking).
   - Tự động cộng số dư vào ví ngay khi thanh toán thành công.
7. **Gợi ý cá nhân hóa & Tư vấn AI (`/dashboard/ai-consultant` & `/dashboard`)**:
   - Hệ thống tự động phân tích BMI, tỷ lệ mỡ và mục tiêu để đề xuất lộ trình và bài viết phù hợp nhất.
   - Trò chuyện với trợ lý ảo AI để hỏi đáp về chế độ ăn uống, cách chia Macro và bài tập thay thế.

---

## 5. QUY TRÌNH NGHIỆP VỤ TIÊU BIỂU (USER FLOWS)

```
                       [LUỒNG HỌC TẬP & TẬP LUYỆN]
                       
   [Học viên (User)]                                    [HLV (Coach)]
           |                                                  |
           |---- 1. Khám phá & Mua lộ trình tập ------------->| (Tạo Lộ trình & Stages)
           |                                                  |
           |---- 2. Xem Video & Thực đơn Giai đoạn 1 -------->|
           |                                                  |
           |---- 3. Quay & Nộp video bài tập ---------------->|
           |                                                  |
           |                                                  |-- 4. Xem video & Chấm điểm
           |                                                  |      (Đạt / Góp ý sửa form)
           |                                                  |
           |<--- 5. Nhận kết quả Đạt (Passed) ----------------|
           |
   [Mở khóa Giai đoạn 2]
```

```
                       [LUỒNG DOANH THU & RÚT TIỀN]
                       
   [Học viên (User)]             [Huấn luyện viên (Coach)]             [Quản trị viên (Admin)]
           |                                |                                    |
   (Nạp ví VNPay)                           |                                    |
           |                                |                                    |
           |---- Mua Khóa học / Lộ trình -->| (+Cộng số dư vào ví HLV)           |
                                            |                                    |
                                            |---- Gửi Lệnh Yêu cầu Rút tiền ---->|
                                            |                                    |
                                            |                                    |-- Kiểm tra & Duyệt
                                            |                                    |   (Chuyển khoản)
                                            |<--- Nhận thông báo Lệnh duyệt -----|
```

---

## 6. THÔNG TIN KỸ THUẬT & TRIỂN KHAI

* **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Radix UI, Lucide Icons, Recharts.
* **Backend**: Node.js, Express 5, MySQL2 (Connection Pool `utf8mb4`), JWT, BcryptJS, Multer.
* **Database**: MySQL 8.0 (`utf8mb4_unicode_ci`).
* **Hạ tầng Container**: Chạy 100% trên Docker Compose với 3 dịch vụ: `fitvibe-frontend` (Port 3000), `fitvibe-backend` (Port 5000), `fitvibe-mysql` (Port 3306).
