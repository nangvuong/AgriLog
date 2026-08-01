# AgriLog Shared (`agrilog-shared`)

Thư viện **Hợp đồng dữ liệu dùng chung (Single Source of Truth)** chứa các **DTO Interfaces, Enums và Domain Types thuần túy (Pure TypeScript)** cho toàn bộ hệ thống **Backend (`agrilog-server`)** và **Frontend (`agrilog-web`)** trong dự án **AgriLog** (Hệ thống Nhật ký Canh tác Nông nghiệp Thông minh đa cây trồng).

---

## 1. Nguyên tắc Thiết kế Cốt lõi

> [!IMPORTANT]
> - **Thuần TypeScript (Zero Framework Dependencies)**: Thư viện không chứa decorators của NestJS/Swagger (`@ApiProperty()`, `@IsNotEmpty()`, v.v.) hay bất kỳ dependency liên quan đến cơ sở dữ liệu hay giao diện UI.
> - **Đồng bộ tuyệt đối**: Cả Frontend và Backend bắt buộc phải import định nghĩa từ `agrilog-shared`, không được tự ý khai báo lại các Enum hoặc cấu trúc DTO cục bộ.

---

## 2. Cấu trúc Thư mục

```text
agrilog-shared/
├── src/
│   ├── dtos/          # Các Data Transfer Object (DTO) cho API requests & responses
│   │   └── index.ts   # Entry point export các DTO
│   ├── enums/         # Các Enums nghiệp vụ toàn hệ thống (UserRole, ActivityType, SeasonStatus, ...)
│   │   └── index.ts   # Entry point export các Enums
│   ├── types/         # Các TypeScript types/interfaces chung (Pagination, Meta, GeoJSON, ...)
│   │   └── index.ts   # Entry point export các Types
│   └── index.ts       # Entry point gốc xuất (export *) toàn bộ dtos, enums, types
├── dist/              # Thư mục mã nguồn sau khi biên dịch (ES2022/ESM + *.d.ts)
├── package.json       # Tên package: "agrilog-shared"
└── tsconfig.json      # Cấu hình compiler TypeScript
```

---

## 3. Quy chuẩn Tích hợp

### Với Web Frontend (`agrilog-web`)
Frontend import trực tiếp các Interface/Type và Enum để định kiểu props, state và kết quả gọi API:

```ts
import { type UserRole, type ActivityType } from 'agrilog-shared';
import { type ILoginRequestDto, type IFarmingLogDto } from 'agrilog-shared';
```

### Với Backend Server (`agrilog-server`)
Backend khai báo các class DTO định dạng cho Swagger/ValidationPipe và **`implements`** interface từ `agrilog-shared` để đảm bảo hợp đồng dữ liệu không bao giờ bị lệch:

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { type ILoginRequestDto } from 'agrilog-shared';

export class LoginRequestDto implements ILoginRequestDto {
  @ApiProperty({ example: 'nongdan_tu' })
  @IsNotEmpty()
  @IsString()
  username!: string;

  @ApiProperty({ example: 'matkhau123' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
```

---

## 4. Hướng dẫn Biên dịch (Build)

Mỗi khi thêm mới hoặc chỉnh sửa DTO/Enum trong thư viện này, cần chạy lệnh biên dịch lại để cập nhật thư mục `dist/`:

```bash
cd agrilog-shared
npm install
npm run build
```
