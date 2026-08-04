# AgriLog Server (`agrilog-server`)

**AgriLog Server** là backend RESTful API phục vụ hệ thống **Nhật ký Canh tác Nông nghiệp Thông minh đa cây trồng**. Ứng dụng được xây dựng trên nền tảng **NestJS (TypeScript)** kết hợp cơ sở dữ liệu **PostgreSQL + PostGIS** để xử lý dữ liệu nông nghiệp thực tế cho đa dạng cây trồng (cây ăn quả, cây công nghiệp, cây lương thực, rau màu...) và dữ liệu địa lý không gian (tọa độ đa giác lô đất trồng).

---

## 1. Kiến trúc Modular NestJS

```text
agrilog-server/
├── src/
│   ├── config/              # Quản lý cấu hình (Biến môi trường, kết nối DB, JWT, Port)
│   ├── common/              # Các tiện ích và thành phần dùng chung toàn cục
│   │   ├── decorators/      # Custom Decorators (VD: @CurrentUser(), @Roles())
│   │   ├── filters/         # Exception Filters (Chuẩn hóa format lỗi trả về JSON)
│   │   ├── guards/          # Guards bảo mật (JWT Auth Guard, Role-based Guard)
│   │   ├── interceptors/    # Interceptors (Logging, transform response)
│   │   └── pipes/           # Validation Pipes (Kiểm tra DTO đầu vào)
│   ├── database/            # Quản lý kết nối CSDL, Migrations & Seeds
│   ├── modules/             # Các Feature Module nghiệp vụ theo Domain
│   │   ├── auth/            # Module xác thực & phân quyền (Login, Register, JWT)
│   │   ├── users/           # Module quản lý tài khoản & nông dân
│   │   ├── farms/           # Module quản lý trang trại & lô đất canh tác (Plot + GeoJSON)
│   │   └── farming-logs/    # Module nhật ký canh tác điện tử & bóc tách AI
│   ├── app.controller.ts    # Root Controller (Health check endpoint)
│   ├── app.module.ts        # Root Module (Kết nối các Modules con)
│   ├── app.service.ts       # Root Service
│   └── main.ts              # Entry point khởi chạy app (Prefix /api, CORS, ValidationPipe)
├── .env.example             # Mẫu biến môi trường chuẩn
├── nest-cli.json            # Cấu hình NestJS CLI
├── package.json
└── tsconfig.json
```

---

## 2. Quản lý Kết nối CSDL, Migrations & Seeds

Backend được thiết kế với tầng quản lý cơ sở dữ liệu chuyên biệt tại `src/database/`, tích hợp giữa **TypeORM**, **PostgreSQL/PostGIS** và **NestJS Config**:

```text
src/
├── config/
│   └── database.config.ts         # Cấu hình TypeORM & PostGIS đọc từ biến môi trường (.env)
├── database/
│   ├── data-source.ts             # DataSource độc lập phục vụ CLI TypeORM (Migration CLI)
│   ├── database.module.ts         # NestJS Global Module (TypeOrmModule.forRootAsync)
│   ├── database.service.ts        # Service tiện ích (Health check, Raw SQL query, Execute SQL file)
│   ├── migrations/                # Thư mục lưu lịch sử các file Migration schema
│   │   ├── BaselineSchema.ts      # Migration mẫu khởi tạo toàn bộ 20 bảng chuẩn nông nghiệp
│   │   └── index.ts               # Barrel export migrations
│   ├── seeds/                     # Bộ công cụ Seed dữ liệu mẫu
│   │   ├── seed.service.ts        # NestJS SeedService thực hiện nạp dữ liệu vào CSDL
│   │   ├── run-seed.ts            # CLI Runner độc lập để chạy lệnh npm run db:seed
│   │   └── index.ts               # Barrel export seeds
│   └── index.ts
```

### 2.1. Cấu hình Kết nối (`database.config.ts`)
- Mặc định kết nối tới PostgreSQL/PostGIS tại `localhost:5433` (được cấu hình trong `docker-compose.yml` của dự án).
- Bật tính năng connection pooling (quản lý số lượng kết nối đồng thời), hỗ trợ kiểu dữ liệu địa lý đa giác (`GEOMETRY(POLYGON, 4326)`).
- **Tuân thủ an toàn Production**: Mặc định đặt `synchronize: false` nhằm bảo vệ dữ liệu thực tế, mọi thay đổi cấu trúc bảng bắt buộc phải đi qua **Migrations**.

### 2.2. Các Lệnh CLI Quản trị Migrations & Seeds

Các lệnh đã được tích hợp sẵn trong `package.json` của `agrilog-server`:

| Lệnh CLI | Mô tả |
| :--- | :--- |
| **`npm run db:seed`** | Khởi chạy script seed độc lập (`src/database/seeds/run-seed.ts`), tự động nạp danh mục cây trồng, vườn, nông dân và nhật ký canh tác mẫu vào CSDL. |
| **`npm run migration:generate -- -n <TênMigration>`** | Tự động so sánh thay đổi giữa các Entity và CSDL hiện tại để sinh ra file migration mới tại `src/database/migrations/`. |
| **`npm run migration:run`** | Thực thi các file migration mới chưa chạy lên CSDL. |
| **`npm run migration:revert`** | Hoàn tác (rollback) file migration gần nhất đã thực thi. |

---

## 3. Hướng dẫn Khởi chạy

### Bước 1: Chuẩn bị Biến môi trường
Sao chép file cấu hình mẫu `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Nội dung `.env` mẫu:
```env
PORT=3000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://washout-diagnosis-dimly.ngrok-free.dev
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/agrilog_db
JWT_SECRET=agrilog_secret_key_development_only
JWT_EXPIRES_IN=1d
```

### Bước 2: Cài đặt Dependencies
```bash
npm install
```

### Bước 3: Khởi chạy Server
```bash
# Chạy ở chế độ phát triển (Tự động tải lại khi đổi code - Hot Reload)
npm run start:dev

# Chạy kiểm tra build production
npm run build
npm run start:prod
```

API sẽ khởi chạy tại: `http://localhost:3000/api` (nếu cấu hình global prefix `/api` trong `main.ts`).

---

## 4. Tích hợp với `agrilog-shared`
Trong tất cả các Controller của NestJS, luôn import DTO và Enum từ gói `@agrilog/shared` hoặc `agrilog-shared` để validate dữ liệu đầu vào thông qua `ValidationPipe`.
