# AgriLog Shared (`agrilog-shared`)

Thư viện **Enum & DTO Interfaces thuần túy (Pure TypeScript)** dùng chung cho cả hệ thống **Backend (`agrilog-server`)** và **Frontend (`agrilog-web`)** thuộc dự án **Nhật ký điện tử cho người trồng bưởi xuất khẩu (AgriLog)**.

> [!IMPORTANT]
> **Nguyên tắc thiết kế**: Không chia sẻ decorators (`@ApiProperty()`, `@IsNotEmpty()`, v.v.) hay các dependency của Server (`@nestjs/swagger`, `class-validator`) trong thư viện này. Thư viện chỉ chứa các **interface/type TypeScript thuần túy** và **enums**.

---

## 1. Cấu trúc thư viện

```text
agrilog-shared/
├── src/
│   ├── enums/
│   │   ├── user-role.enum.ts       # Enum VaiTroNguoiDung (6 vai trò chuỗi bưởi xuất khẩu) & ROLE_INFO
│   │   ├── batch-status.enum.ts    # Enum TrangThaiLoBuoi (trạng thái lô xuất khẩu GlobalGAP)
│   │   ├── activity-type.enum.ts   # Enum LoaiHoatDongCanhTac (nhật ký bón phân, tưới, phun thuốc...)
│   │   ├── standard.enum.ts        # Enum TieuChuanKiemDinh (GlobalGAP, VietGAP, USDA, EU...)
│   │   └── index.ts                # Barrel export cho enums
│   ├── dtos/
│   │   ├── auth.dto.ts             # ILoginDto, IRegisterDto, IChangePasswordDto, IUserProfile, IAuthResponse
│   │   ├── batch.dto.ts            # ICreatePomeloBatchDto, IPomeloBatchDto
│   │   ├── log.dto.ts              # ICreateFarmingLogDto, IFarmingLogDto
│   │   └── index.ts                # Barrel export cho dtos
│   └── index.ts                    # Entry point chính
├── dist/                           # Mã nguồn compiled JavaScript (ES2022/ESM) & TypeScript declarations (*.d.ts)
└── package.json                    # Cấu hình package agrilog-shared
```

---

## 2. Cách Phân Tách Trách Nhiệm (Frontend & Backend)

### Frontend (`agrilog-web`)
Sử dụng trực tiếp các type/interface DTO và enum từ `agrilog-shared` mà không cần bất kỳ file type cục bộ nào:

```ts
import { ROLE_INFO, VaiTroNguoiDung } from 'agrilog-shared';
import type { AuthResponse, LoginDto, RegisterDto, UserProfile } from 'agrilog-shared';
```

### Backend (`agrilog-server`)
Định nghĩa các DTO class riêng tại `src/auth/dto/` có gắn decorator của Swagger (`@ApiProperty`) và Validation (`class-validator`), đồng thời **`implements`** interface từ `agrilog-shared` để đảm bảo đồng bộ 100% hợp đồng dữ liệu với Frontend:

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { type ILoginDto } from 'agrilog-shared';

export class LoginDto implements ILoginDto {
  @ApiProperty({ example: '0901234567' })
  @IsNotEmpty()
  @IsString()
  so_dien_thoai_hoac_email!: string;

  @ApiProperty({ example: 'matkhau123' })
  @IsNotEmpty()
  @IsString()
  mat_khau!: string;
}
```

---

## 3. Build Thư Viện
```bash
cd /Users/nangvuong/Desktop/AgriLog/agrilog-shared
npm run build
```
