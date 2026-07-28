# AgriLog Web - Giao diện Authentication & Chuỗi Cung Ứng Bưởi Xuất Khẩu

Ứng dụng Frontend cho **Nhật ký điện tử người trồng bưởi xuất khẩu (AgriLog)**, thiết kế hiện đại (Glassmorphism, Gradient) với bảng màu **Blue + Green + White** theo chuẩn chuỗi cung ứng nông nghiệp toàn cầu & GlobalGAP.

---

## 1. Công nghệ sử dụng

- **React 19 + TypeScript + Vite**
- **Tailwind CSS 3**: Hệ thống màu tùy chỉnh (`agri.green`, `agri.blue`, `white`), hiệu ứng bóng mờ `glass` và viền sáng `glow-green` / `glow-blue`.
- **Lucide React**: Bộ icon phong phú cho từng tính năng (`Leaf`, `ShieldCheck`, `QrCode`, `Phone`, `Mail`, `KeyRound`, `UserCheck`, ...).
- **Motion (Framer Motion)**: Hiệu ứng chuyển tab mượt mà (`AnimatePresence`), hover/tap animations, thông báo toast động.

---

## 2. Kết nối với 4 Endpoints Backend (`/api/v1/auth`)

Giao diện đã tích hợp đầy đủ 4 endpoint xác thực từ **NestJS Backend**:

| Chức năng | Endpoint API | Trạng thái bảo mật | Mô tả trên Giao diện |
| :--- | :--- | :--- | :--- |
| **Đăng nhập** | `POST http://localhost:3000/api/v1/auth/login` | Public | Card `LoginView` hỗ trợ số điện thoại/email + mật khẩu, kèm nút chọn tài khoản kiểm thử nhanh (1 click). |
| **Đăng ký** | `POST http://localhost:3000/api/v1/auth/register` | Public | Card `RegisterView` hỗ trợ chọn 6 vai trò nông nghiệp (`nong_dan`, `quan_ly`, `ky_thuat`, `xuat_khau`, `kiem_dinh`, `admin`) với huy hiệu màu sắc riêng. |
| **Hồ sơ cá nhân** | `GET http://localhost:3000/api/v1/auth/me` | Bearer JWT | Card `ProfileView` hiển thị vai trò bưởi xuất khẩu, mã QR lô bưởi, ID vùng trồng và nút đồng bộ trực tiếp từ máy chủ. |
| **Đổi mật khẩu** | `POST http://localhost:3000/api/v1/auth/change-password` | Bearer JWT | Card `ChangePasswordView` kiểm tra mật khẩu cũ/mới và cập nhật mật khẩu mới. |

> **Tính năng đặc biệt (Chế độ Demo Mock)**: Trên thanh Header có nút chuyển đổi giữa **API NestJS (:3000)** và **Chế độ Demo Mock**. Nếu bạn muốn kiểm thử giao diện mà không cần chạy server backend, chỉ cần chọn **Chế độ Demo Mock**!

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
Truy cập địa chỉ hiển thị trong terminal (thường là **http://localhost:5173** hoặc **http://localhost:5174**).

---

## 4. Danh sách Component chính

- **`src/components/Header.tsx`**: Navbar trắng sứ + glassmorphism, logo bưởi xuất khẩu, chuyển đổi tab và nút bật/tắt Demo Mode.
- **`src/components/HeroBanner.tsx`**: Artwork vườn bưởi da xanh kỹ thuật số (`hero.png`), tọa độ GPS nông nghiệp, huy hiệu GlobalGAP và mô tả chuỗi giá trị xuất khẩu.
- **`src/components/LoginView.tsx`**: Form đăng nhập với validation, nút ẩn/hiện mật khẩu và các nút tài khoản mẫu nhanh.
- **`src/components/RegisterView.tsx`**: Form đăng ký chuỗi cung ứng, chọn vai trò tương tác.
- **`src/components/ProfileView.tsx`**: Dashboard người dùng với thẻ quyền truy xuất lô bưởi xuất khẩu.
- **`src/components/ChangePasswordView.tsx`**: Giao diện đổi mật khẩu an toàn.
