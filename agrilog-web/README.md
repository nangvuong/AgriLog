# AgriLog Web - Giao diện Authentication & Chuỗi Cung Ứng Bưởi Xuất Khẩu

Ứng dụng Frontend cho **Nhật ký điện tử người trồng bưởi xuất khẩu (AgriLog)**, thiết kế hiện đại (Glassmorphism, Gradient) với bảng màu **Blue + Green + White** theo chuẩn chuỗi cung ứng nông nghiệp toàn cầu & GlobalGAP.

---

## 1. Cấu Trúc Dự Án (chuẩn Modular & Shared UI)

```text
src/
├── components/
│   ├── ui/                       # [NEW] Bộ UI Components dùng chung cho toàn bộ dự án
│   │   ├── Button.tsx            # Button chuẩn với variants: primary, secondary, outline, ghost, danger
│   │   ├── Input.tsx             # Input có label, helper text, error text, icon left/right
│   │   ├── Card.tsx              # Card glassmorphic: Card, CardHeader, CardTitle, CardDescription...
│   │   ├── Badge.tsx             # Badge trạng thái/vai trò với hiệu ứng màu sắc & pulse dot
│   │   ├── Alert.tsx             # Alert banner: error, success, warning, info
│   │   └── index.ts              # Export UI barrel
│   ├── Header.tsx                # Layout Header & Navbar
│   └── HeroBanner.tsx            # Layout Banner Vườn Bưởi GPS GlobalGAP
├── pages/                        # [NEW] Danh sách các Trang (Pages)
│   ├── LoginPage.tsx             # Trang Đăng nhập (tích hợp chọn tài khoản kiểm thử nhanh)
│   ├── RegisterPage.tsx          # Trang Đăng ký chuỗi cung ứng (chọn 6 vai trò nông nghiệp)
│   ├── ProfilePage.tsx           # Trang Hồ sơ cá nhân (thẻ truy xuất lô bưởi, đồng bộ backend)
│   ├── ChangePasswordPage.tsx    # Trang Đổi mật khẩu
│   └── index.ts                  # Export pages barrel
├── page/                         # Alias tương thích cho đường dẫn /page -> /pages
├── services/
│   └── api.ts                    # Tích hợp 4 API Auth NestJS + Chế độ Demo Mock
├── types/
│   └── auth.ts                   # Type definitions cho người dùng và DTOs
└── App.tsx                       # Component chính kết nối định tuyến & Layout
```

---

## 2. Kết nối với 4 Endpoints Backend (`/api/v1/auth`)

Giao diện đã tích hợp đầy đủ 4 endpoint xác thực từ **NestJS Backend**:

| Chức năng | Endpoint API | Trạng thái bảo mật | Trang tương ứng |
| :--- | :--- | :--- | :--- |
| **Đăng nhập** | `POST http://localhost:3000/api/v1/auth/login` | Public | [`LoginPage`](file:///Users/nangvuong/Desktop/AgriLog/agrilog-web/src/pages/LoginPage.tsx) |
| **Đăng ký** | `POST http://localhost:3000/api/v1/auth/register` | Public | [`RegisterPage`](file:///Users/nangvuong/Desktop/AgriLog/agrilog-web/src/pages/RegisterPage.tsx) |
| **Hồ sơ cá nhân** | `GET http://localhost:3000/api/v1/auth/me` | Bearer JWT | [`ProfilePage`](file:///Users/nangvuong/Desktop/AgriLog/agrilog-web/src/pages/ProfilePage.tsx) |
| **Đổi mật khẩu** | `POST http://localhost:3000/api/v1/auth/change-password` | Bearer JWT | [`ChangePasswordPage`](file:///Users/nangvuong/Desktop/AgriLog/agrilog-web/src/pages/ChangePasswordPage.tsx) |

> **Tính năng đặc biệt (Chế độ Demo Mock)**: Trên thanh Header có nút chuyển đổi giữa **API NestJS (:3000)** và **Chế độ Demo Mock**. Nếu bạn muốn kiểm thử giao diện mà không cần chạy server backend, chỉ cần bật **Chế độ Demo Mock**!

---

## 3. Hướng dẫn chạy Frontend

### Bước 1: Di chuyển vào thư mục agrilog-web
```bash
cd /Users/nangvuong/Desktop/AgriLog/agrilog-web
```

### Bước 2: Chạy chế độ phát triển (Dev Server)
```bash
npm run dev
```

### Bước 3: Mở trình duyệt
Truy cập địa chỉ hiển thị trong terminal (thường là **http://localhost:5173**).
