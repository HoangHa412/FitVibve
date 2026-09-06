# FitVibe - Nền tảng Sức khỏe & Thể dục Toàn diện

FitVibe là một nền tảng web hiện đại cho phép người dùng quản lý sức khỏe, theo dõi chỉ số sức khỏe, và kết nối với các huấn luyện viên chuyên nghiệp. Nền tảng hỗ trợ ba loại người dùng: Người dùng thường, Huấn luyện viên, và Quản trị viên.

## Tính năng chính

### Cho Người dùng
- **Theo dõi sức khỏe**: BMI, BMR, TDEE, tỷ lệ mỡ cơ thể
- **Ghi nhận cân nặng**: Theo dõi thay đổi cân nặng hàng ngày
- **Kế hoạch tập luyện**: Danh sách bài tập và tiến độ
- **Kế hoạch dinh dưỡng**: Ghi chép bữa ăn hàng ngày
- **Mục tiêu cá nhân**: Thiết lập và theo dõi mục tiêu sức khỏe

### Cho Huấn luyện viên
- **Quản lý học viên**: Theo dõi danh sách học viên
- **Tạo nội dung**: Viết bài viết, hướng dẫn tập luyện
- **Duyệt nội dung**: Phê duyệt cập nhật từ học viên
- **Phân tích dữ liệu**: Xem thống kê tiến độ học viên

### Cho Quản trị viên
- **Quản lý thành viên**: Toàn quyền quản lý người dùng
- **Duyệt bài viết**: Phê duyệt nội dung từ huấn luyện viên
- **Báo cáo thống kê**: Phân tích toàn bộ nền tảng
- **Kiểm soát hệ thống**: Quản lý danh mục và cài đặt

## Công nghệ sử dụng

- **Frontend**: Next.js 16 + React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Authentication**: Context API + localStorage (đã có sẵn)
- **Language**: TypeScript
- **Design System**: Custom design tokens với hệ màu Mint/Emerald

## Cấu trúc dự án

```
/vercel/share/v0-project
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── dashboard/
│   │   ├── page.tsx             # User dashboard
│   │   ├── health/              # Health metrics
│   │   ├── weight/              # Weight tracking
│   │   ├── workouts/            # Workout plans
│   │   └── meals/               # Nutrition plans
│   ├── coach/
│   │   ├── page.tsx             # Coach dashboard
│   │   ├── clients/             # Client management
│   │   ├── content/             # Content creation
│   │   └── moderation/          # Content approval
│   ├── admin/
│   │   ├── page.tsx             # Admin dashboard
│   │   ├── members/             # User management
│   │   ├── posts/               # Post approval
│   │   └── reports/             # Analytics
│   └── auth/
│       └── setup-profile/       # Profile setup
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── landing/
│   │   └── LandingPage.tsx
│   └── layout/
│       └── DashboardLayout.tsx
├── contexts/
│   └── AuthContext.tsx          # Auth management
├── lib/
│   └── utils.ts                 # Utility functions
└── tailwind.config.ts           # Tailwind config
```

## Hướng dẫn bắt đầu

### Yêu cầu
- Node.js 18+ 
- pnpm (package manager)

### Cài đặt

1. **Clone hoặc tải dự án**
```bash
cd /vercel/share/v0-project
```

2. **Cài đặt dependencies**
```bash
pnpm install
```

3. **Chạy development server**
```bash
pnpm dev
```

4. **Mở ứng dụng**
Truy cập `http://localhost:3000` trong trình duyệt

## Tài khoản thử nghiệm

Hiện tại, ứng dụng sử dụng localStorage để lưu trữ. Bạn có thể:
- Đăng ký tài khoản mới
- Chọn vai trò người dùng hoặc huấn luyện viên
- Thiết lập hồ sơ sức khỏe cá nhân

## Bước tiếp theo - Tích hợp Backend

Để chuyển sang sản xuất, bạn cần:

1. **Tích hợp Database** (Supabase, Neon, hoặc tương tự)
   - Tạo schema cho users, health_metrics, workouts, meals
   - Thiết lập Row Level Security (RLS)

2. **Thay thế localStorage bằng API**
   - Cập nhật AuthContext để gọi API
   - Tạo Route Handlers cho authentication
   - Implements secure session management

3. **Thêm tính năng nâng cao**
   - Biểu đồ và visualizations (Recharts)
   - File upload (ảnh tiến độ)
   - Thông báo real-time
   - Email notifications

4. **Triển khai**
   - Deploy lên Vercel
   - Cấu hình environment variables
   - Setup domain custom

## Tính năng hiện tại (Mock)

- Đăng nhập/Đăng ký với Context API
- Điều hướng dựa trên vai trò
- Giao diện đáp ứng
- Design tokens tùy chỉnh
- Lưu trữ phiên trong localStorage

## Liên hệ & Hỗ trợ

Vui lòng tham khảo tài liệu Next.js và shadcn/ui để biết thêm chi tiết.

---

**Tạo bởi v0 - Vercel's AI Assistant**
Ngôn ngữ: Tiếng Việt
Phiên bản: 1.0
