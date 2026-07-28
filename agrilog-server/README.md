# AgriLog Server - Nhật Ký Bưởi Xuất Khẩu (NestJS Backend)

Hệ thống Backend cho ứng dụng **Nhật ký điện tử người trồng bưởi xuất khẩu**, được xây dựng trên **NestJS 11**, **PostgreSQL + PostGIS**, bảo mật **JWT Authentication**, kèm tài liệu API đầy đủ qua **Swagger**.

---

## 1. Cài đặt & Khởi chạy

### Bước 1: Khởi động Cơ sở dữ liệu PostgreSQL + PostGIS
```bash
npm run db:up
```

### Bước 2: Khởi động NestJS Server
```bash
# Chế độ phát triển (watch mode)
npm run start:dev
```
> Khi server khởi động, hệ thống sẽ tự động kiểm tra, khởi tạo bảng từ [schema_nhat_ky_buoi.sql](file:///Users/nangvuong/Desktop/AgriLog/agrilog-server/schema_nhat_ky_buoi.sql) và chèn dữ liệu mẫu từ [02_sample_data.sql](file:///Users/nangvuong/Desktop/AgriLog/agrilog-server/database/seeds/02_sample_data.sql) nếu CSDL đang trống.

---

## 2. Swagger API Documentation

Sau khi chạy server, truy cập đường dẫn sau trên trình duyệt để mở giao diện tài liệu API tương tác:

- **Swagger URL**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Base API URL**: `http://localhost:3000/api/v1`

---

## 3. Danh sách APIs Authentication (`/api/v1/auth`)

| Method | Endpoint | Bảo mật | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Đăng ký tài khoản mới (nông dân, quản lý, kỹ thuật, xuất khẩu, kiểm định, admin) |
| `POST` | `/api/v1/auth/login` | Public | Đăng nhập bằng `so_dien_thoai_hoac_email` + `mat_khau`, nhận về `access_token` JWT |
| `GET` | `/api/v1/auth/me` | Bearer JWT | Lấy thông tin hồ sơ tài khoản đang đăng nhập |
| `POST` | `/api/v1/auth/change-password` | Bearer JWT | Đổi mật khẩu của người dùng |

### Ví dụ Payload Đăng Ký (`POST /api/v1/auth/register`)
```json
{
  "ho_ten": "Nguyễn Văn Nông",
  "so_dien_thoai": "0901234567",
  "email": "nongdan@agrilog.vn",
  "mat_khau": "matkhau123",
  "vai_tro": "nong_dan",
  "vung_trong_id": 1
}
```

### Ví dụ Payload Đăng Nhập (`POST /api/v1/auth/login`)
```json
{
  "so_dien_thoai_hoac_email": "0901234567",
  "mat_khau": "matkhau123"
}
```
*Kết quả trả về:*
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "ho_ten": "Nguyễn Văn Nông",
    "so_dien_thoai": "0901234567",
    "email": "nongdan@agrilog.vn",
    "vai_tro": "nong_dan",
    "vung_trong_id": 1,
    "trang_thai": true,
    "ngay_tao": "2026-07-28T09:00:00.000Z"
  }
}
```

---

## 4. Kiến trúc Module

- **`DatabaseModule`** ([database.module.ts](file:///Users/nangvuong/Desktop/AgriLog/agrilog-server/src/database/database.module.ts)): Global Module quản lý kết nối PostgreSQL qua `DatabaseService` và tự động khởi tạo/seed bằng `SeedService`.
- **`AuthModule`** ([auth.module.ts](file:///Users/nangvuong/Desktop/AgriLog/agrilog-server/src/auth/auth.module.ts)): Quản lý đăng ký, đăng nhập, đổi mật khẩu với bảo mật mật khẩu bằng `bcryptjs` và phát hành JWT Token (`JwtStrategy`, `JwtAuthGuard`).
