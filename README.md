# AgriLog — Hệ thống Nhật ký Canh tác Nông nghiệp Thông minh đa cây trồng

**AgriLog** là nền tảng phần mềm quản lý và theo dõi nhật ký canh tác điện tử đa năng cho ngành nông nghiệp (cây ăn quả, cây công nghiệp, cây lương thực, rau màu...), tích hợp trí tuệ nhân tạo (AI) để bóc tách thông tin từ giọng nói và hình ảnh thực tế tại vườn/trang trại, tuân thủ các tiêu chuẩn kiểm định và truy xuất nguồn gốc quốc tế (GlobalGAP, VietGAP, USDA, EU).

---

## 1. Kiến trúc Tổng quan (Monorepo Architecture)

Dự án được tổ chức theo mô hình Monorepo gồm **4 package chính**:

```mermaid
graph TD
  A[agrilog-shared<br/><i>Enums, DTOs, Domain Types</i>]
  B[agrilog-server<br/><i>NestJS Backend REST API</i>]
  C[agrilog-web<br/><i>React 18 + Vite Frontend SPA</i>]
  D[agrilog-ai<br/><i>AI Service (STT + LLM Extraction)</i>]
  E[PostgreSQL + PostGIS<br/><i>Docker Container</i>]

  B -->|Import data contract & validation rules| A
  C -->|Import data contract & UI types| A
  C -->|HTTP / REST API| B
  B -->|AI Metadata & SQL Queries| E
  C -->|Audio / Text STT Processing| D
```

| Package | Thư mục | Mô tả vai trò |
| :--- | :--- | :--- |
| **`agrilog-shared`** | `agrilog-shared/` | Thư viện dùng chung (Single Source of Truth) chứa Enums, DTOs và Interfaces thuần TypeScript. Đảm bảo tính nhất quán dữ liệu giữa Frontend và Backend. |
| **`agrilog-server`** | `agrilog-server/` | Backend RESTful API được xây dựng theo kiến trúc Modular của NestJS, tích hợp với CSDL PostgreSQL + PostGIS (xử lý tọa độ đa giác vườn trồng và lưu trữ metadata AI). |
| **`agrilog-web`** | `agrilog-web/` | Web Frontend SPA xây dựng bằng React 18, TypeScript và Vite theo kiến trúc Feature/Layered. |
| **`agrilog-ai`** | `agrilog-ai/` | Dịch vụ AI kép (FastAPI REST Server + Telegram Bot) chuyên xử lý nhận dạng giọng nói ngoại tuyến (Sherpa-ONNX + VAD) và bóc tách thông tin canh tác bằng LLM ([Tài liệu API AI](./agrilog-ai/API_DOCS.md)). |

---

## 2. Cấu trúc Thư mục Gốc

```text
AgriLog/
├── agrilog-shared/         # Package thư viện dùng chung (DTOs, Enums, Types)
├── agrilog-server/         # Package Backend NestJS REST API
├── agrilog-web/            # Package Web Frontend React + Vite
├── agrilog-ai/             # Package Dịch vụ AI (FastAPI REST API & Telegram Bot)
├── agrilog_schema.sql      # Schema CSDL PostgreSQL + PostGIS (20 bảng)
├── agrilog_seed.sql        # Dữ liệu mẫu khởi tạo đầy đủ (Idempotent Seed)
├── docker-compose.yml      # Cấu hình khởi chạy CSDL PostgreSQL + PostGIS
└── README.md               # Tài liệu hướng dẫn tổng quan dự án
```

---

## 3. Hướng dẫn Khởi chạy Nhanh (Quickstart)

### Bước 1: Khởi chạy Cơ sở dữ liệu bằng Docker Compose
Dự án sử dụng image `postgis/postgis:16-3.4` và tự động import schema cùng dữ liệu mẫu:

```bash
# Tại thư mục gốc AgriLog/
docker compose down -v
docker compose up -d
```
> *Lưu ý*: CSDL được ánh xạ sang cổng **`5433`** (`localhost:5433`) để tránh xung đột với các service PostgreSQL khác trên máy.

### Bước 2: Build gói Thư viện chung (`agrilog-shared`)
Cần build gói `agrilog-shared` trước khi chạy Server hoặc Web:

```bash
cd agrilog-shared
npm install
npm run build
cd ..
```

### Bước 3: Cấu hình và Khởi chạy Backend (`agrilog-server`)
```bash
cd agrilog-server
npm install
cp .env.example .env
npm run start:dev
```
Server sẽ chạy tại `http://localhost:3000`.

### Bước 4: Khởi chạy Web Frontend (`agrilog-web`)
```bash
cd agrilog-web
npm install
npm run dev
```
Giao diện ứng dụng sẽ sẵn sàng tại `http://localhost:5173`.

---

## 4. Nguyên tắc Phát triển

1. **Tuân thủ Hợp đồng Dữ liệu**:
   - Mọi thay đổi về cấu trúc request/response hoặc các hằng số nghiệp vụ đều phải bắt đầu từ `agrilog-shared`.
2. **Không lặp lại mã (DRY)**:
   - Các định nghĩa Enum hoặc DTO không được khai báo lặp lại tại Frontend hay Backend mà phải import từ gói `agrilog-shared`.
3. **Kiểm thử Schema & Seed**:
   - Khi chỉnh sửa cấu trúc DB tại `agrilog_schema.sql`, luôn cập nhật script seed tương ứng tại `agrilog_seed.sql`.
