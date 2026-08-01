# AgriLog Web (`agrilog-web`)

**AgriLog Web** là giao diện Web Frontend SPA (Single Page Application) thuộc hệ thống **Nhật ký Canh tác Nông nghiệp Thông minh đa cây trồng**. Ứng dụng được thiết kế theo tiêu chuẩn trải nghiệm người dùng hiện đại, tốc độ cao, hỗ trợ người nông dân, hợp tác xã và doanh nghiệp nông nghiệp ghi nhận nhật ký canh tác điện tử, quản lý trang trại và theo dõi vụ mùa dễ dàng.

Ứng dụng được xây dựng trên nền tảng **React 18**, **TypeScript**, **Vite**, sử dụng **Vanilla CSS** với hệ thống Design Tokens nhất quán.

---

## 1. Cấu trúc Feature/Layered Architecture

```text
agrilog-web/
├── public/                  # Các tài nguyên tĩnh (favicon, logo, ảnh không qua bundler)
├── src/
│   ├── assets/              # Hình ảnh, icons, fonts được import vào code
│   ├── components/          # Các UI components tái sử dụng
│   │   ├── common/          # Components bố cục chung (Header, Footer, Navbar, Modal)
│   │   └── ui/              # Design System / UI Primitives (Button, Input, Card, Badge)
│   ├── config/              # Cấu hình app (API Base URL, hằng số chung, theme tokens)
│   ├── context/             # React Contexts / State toàn cục (AuthContext, ThemeContext)
│   ├── hooks/               # Custom React Hooks (useAuth, useFetch, useDebounce)
│   ├── layouts/             # Các bố cục trang (MainLayout, AuthLayout, DashboardLayout)
│   ├── pages/               # Các trang giao diện chính (phân chia theo Route/Domain)
│   │   ├── Auth/            # LoginPage, RegisterPage, ChangePasswordPage
│   │   ├── Farmer/          # FarmerHomePage, FarmingLogPage, FarmDetail, PlotMap
│   │   └── Admin/           # Trang quản trị hệ thống
│   ├── routes/              # Cấu hình điều hướng (AppRouter, ProtectedRoute, PublicRoute)
│   ├── services/            # API Client (Tích hợp HTTP/REST gọi sang agrilog-server)
│   ├── types/               # Kiểu dữ liệu UI cục bộ (cho View/Form State)
│   ├── utils/               # Tiện ích bổ trợ (format ngày tháng, tiền tệ, geolocation helper)
│   ├── App.tsx              # Root Component (bao bọc Router & Context Providers)
│   ├── main.tsx             # Entry point mount React vào DOM (#root)
│   └── styles.css           # CSS toàn cục & Design Tokens
├── index.html               # Template HTML gốc
├── package.json             # Cấu hình package ("name": "agrilog-web")
├── vite.config.ts           # Cấu hình Vite bundler & proxy dev server
└── tsconfig.json
```

---

## 2. Quy chuẩn Thiết kế & Giao diện (Aesthetics & UI)

- **Vanilla CSS & Design Tokens**: Tất cả màu sắc, font chữ, độ bo góc, bóng mờ và khoảng cách được quản lý bằng biến CSS (CSS Variables) tại `styles.css`.
- **Trải nghiệm mượt mà**: Sử dụng micro-animations cho các nút bấm, hiệu ứng hover, thẻ card thông tin lô đất và trạng thái tải dữ liệu.
- **Responsive**: Giao diện tối ưu hóa cho cả thiết bị máy tính bàn và điện thoại di động (giúp nông dân dễ dàng thao tác tại vườn).

---

## 3. Đồng bộ Dữ liệu với `agrilog-shared`

Frontend sử dụng trực tiếp các định nghĩa từ gói **`agrilog-shared`** cho mọi giao tiếp dữ liệu:
```ts
import { type UserRole, type ActivityType } from 'agrilog-shared';
import { type IFarmingLogDto, type ILoginRequestDto } from 'agrilog-shared';
```

---

## 4. Hướng dẫn Khởi chạy

### Bước 1: Cài đặt Dependencies
```bash
npm install
```

### Bước 2: Khởi chạy Máy chủ Phát triển (Development Server)
```bash
npm run dev
```
Giao diện ứng dụng sẽ sẵn sàng tại địa chỉ: `http://localhost:5173`.

### Bước 3: Build Bản chạy Chính thức (Production)
```bash
# Biên dịch TypeScript và tạo gói tĩnh tại thư mục dist/
npm run build

# Xem trước kết quả build
npm run preview
```
