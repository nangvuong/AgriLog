# Hướng dẫn sử dụng Cơ Sở Dữ Liệu PostgreSQL - Nhật Ký Bưởi Xuất Khẩu

Hệ thống cơ sở dữ liệu **Nhật ký bưởi xuất khẩu (`agrilog_db`)** được cấu hình bằng Docker Compose với hỗ trợ **PostGIS** (quản lý tọa độ địa lý GPS vườn/lô đất). Việc **khởi tạo bảng (Schema)** theo `schema_nhat_ky_buoi.sql` và **seed dữ liệu mẫu** sẽ diễn ra **tự động khi khởi động NestJS server**.

---

## 1. Kiến trúc dịch vụ (Docker Compose)

| Dịch vụ | Image | Container Name | Cổng (Port) | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **postgres** | `postgis/postgis:16-3.4` | `agrilog-postgres` | `5432:5432` | PostgreSQL 16 tích hợp PostGIS kèm Persistent Volume |

> [!NOTE]
> Tại sao sử dụng image `postgis/postgis:16-3.4` thay vì `postgres:16`?
> Trong file [schema_nhat_ky_buoi.sql](file:///Users/nangvuong/Desktop/AgriLog/agrilog-server/schema_nhat_ky_buoi.sql#L10) sử dụng extension `postgis` và kiểu dữ liệu `GEOGRAPHY(POINT, 4326)` để lưu trữ tọa độ vườn/lô đất. Image chuẩn của PostgreSQL không cài sẵn PostGIS, do đó bắt buộc dùng image `postgis/postgis`.

---

## 2. Cấu hình & Biến môi trường

Các thông số cấu hình nằm trong file [`.env`](file:///Users/nangvuong/Desktop/AgriLog/agrilog-server/.env) (được sao chép mẫu trong [`.env.example`](file:///Users/nangvuong/Desktop/AgriLog/agrilog-server/.env.example)):

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=agrilog_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

---

## 3. Quy trình Khởi tạo Bảng (Schema) & Seed Dữ Liệu Tự Động Khi Khởi Động Server

1. **Bước 1: Bật Container CSDL PostgreSQL**
   ```bash
   docker compose up -d
   # hoặc
   npm run db:up
   ```
   *Lệnh này khởi chạy container PostgreSQL + PostGIS trống với volume lưu trữ lâu dài.*

2. **Bước 2: Khởi động NestJS Server (Tự động tạo bảng & seed dữ liệu)**
   ```bash
   npm run start:dev
   ```
   *Khi NestJS khởi động ([SeedService](file:///Users/nangvuong/Desktop/AgriLog/agrilog-server/src/database/seed.service.ts)), hệ thống tự động kiểm tra CSDL:*
   - **Nếu bảng `vung_trong` chưa tồn tại**: Tự động đọc file [schema_nhat_ky_buoi.sql](file:///Users/nangvuong/Desktop/AgriLog/agrilog-server/schema_nhat_ky_buoi.sql) để khởi tạo toàn bộ bảng, enum, trigger, hàm và view.
   - **Nếu CSDL chưa có dữ liệu**: Tự động đọc và thực thi file seed [02_sample_data.sql](file:///Users/nangvuong/Desktop/AgriLog/agrilog-server/database/seeds/02_sample_data.sql).
   - **Nếu CSDL đã có sẵn bảng và dữ liệu**: Tự động ghi log bỏ qua để không chạy lại hay ghi đè.

---

## 4. Quản lý & Vận hành CSDL (npm scripts)

### Khởi động DB
```bash
npm run db:up
```

### Xem log DB
```bash
npm run db:logs
```

### Tắt DB
```bash
npm run db:down
```

### Reset toàn bộ dữ liệu DB (Xóa volume)
```bash
npm run db:reset
```

### Vào Terminal psql trực tiếp trong Container
```bash
npm run db:psql
```

---

## 5. Kiểm tra nhanh dữ liệu & Truy xuất mã QR

Sau khi đã khởi động DB (`npm run db:up`) và bật NestJS server (`npm run start:dev`) để hoàn tất khởi tạo bảng và seed dữ liệu:

Vào giao diện SQL terminal:
```bash
npm run db:psql
```

Trong giao diện `psql`, chạy lệnh:
```sql
SELECT * FROM vw_truy_xuat_lo_xuat_khau;
```
Kết quả trả về thông tin chi tiết của lô xuất khẩu mẫu `LOT-2026-US-001` (Mã QR: `11111111-1111-1111-1111-111111111111`) bao gồm cơ sở đóng gói, hợp tác xã, giống bưởi và ngày thu hoạch.
