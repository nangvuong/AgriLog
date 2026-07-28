# Thiết kế hệ thống Nhật ký điện tử cho vườn bưởi xuất khẩu

## 1. Mục tiêu và bối cảnh nghiệp vụ

Hệ thống phục vụ người trông (canh tác) bưởi xuất khẩu ghi lại toàn bộ quá trình chăm sóc — từ lúc ra hoa đến khi đóng gói xuất khẩu — nhằm:

- Đáp ứng yêu cầu **truy xuất nguồn gốc** của nước nhập khẩu (Mỹ, Trung Quốc, EU, Hàn Quốc...) và chuẩn **VietGAP / GlobalGAP**.
- Kiểm soát **thời gian cách ly thuốc BVTV** (PHI - Pre-Harvest Interval) trước khi thu hoạch, tránh dư lượng vượt ngưỡng (MRL).
- Tạo **mã số vùng trồng (Growing Area Code)** và **mã cơ sở đóng gói (Packing House Code)** gắn với từng lô hàng.
- Cho phép cơ quan kiểm dịch, đơn vị xuất khẩu và người tiêu dùng cuối **quét mã QR** để xem lại nhật ký canh tác của lô hàng.

## 2. Các vai trò người dùng

| Vai trò | Mô tả | Quyền chính |
|---|---|---|
| Nông dân / Người trông vườn | Ghi nhật ký hằng ngày tại vườn (điện thoại) | Tạo hoạt động, nhập vật tư sử dụng, chụp ảnh minh chứng |
| Quản lý trang trại / Hợp tác xã | Quản lý nhiều vườn/hộ | Duyệt nhật ký, quản lý vùng trồng, phân vùng mã số |
| Cán bộ kỹ thuật / Kiểm định nội bộ | Kiểm tra tuân thủ trước thu hoạch | Cảnh báo vi phạm thời gian cách ly, duyệt lô thu hoạch |
| Đơn vị đóng gói / Xuất khẩu | Gộp lô, dán mã QR, xin chứng nhận | Tạo lô xuất khẩu, sinh QR, đính kèm chứng nhận |
| Cơ quan kiểm dịch / Đối tác nhập khẩu | Chỉ xem, không sửa | Xem báo cáo truy xuất theo mã lô |
| Người tiêu dùng | Không cần đăng nhập | Quét QR xem thông tin công khai của lô |

## 3. Thiết kế cơ sở dữ liệu (CSDL)

### 3.1 Danh sách bảng chính

**`nguoi_dung`** — tài khoản hệ thống
- `id` (PK), `ho_ten`, `so_dien_thoai`, `email`, `mat_khau_hash`, `vai_tro` (enum: nong_dan/quan_ly/ky_thuat/xuat_khau/kiem_dinh/admin), `vung_trong_id` (FK, nullable), `trang_thai`, `ngay_tao`

**`vung_trong`** — mã số vùng trồng (growing area code), có thể gồm nhiều vườn của cùng 1 hợp tác xã
- `id` (PK), `ma_vung_trong` (unique, do cơ quan BVTV cấp), `ten_hop_tac_xa`, `tinh_thanh`, `ngay_cap_ma`, `thi_truong_duoc_phep` (JSON: ["US","CN","EU"])

**`vuon`** — vườn/hộ canh tác
- `id` (PK), `ten_vuon`, `dia_chi`, `toa_do_gps` (lat, lng), `dien_tich_ha`, `vung_trong_id` (FK), `nguoi_quan_ly_id` (FK → nguoi_dung), `ngay_tao`

**`lo_dat`** (thửa/lô trong vườn — có thể theo dõi tới từng lô hoặc từng cây)
- `id` (PK), `ma_lo`, `vuon_id` (FK), `so_cay`, `giong_buoi` (VD: Da Xanh, Nam Roi, Diễn), `nam_trong`, `toa_do_gps`

**`vu_mua`** — mùa vụ canh tác của một lô
- `id` (PK), `lo_dat_id` (FK), `ten_vu` (VD: "Vụ 2026"), `ngay_ra_hoa`, `ngay_du_kien_thu_hoach`, `trang_thai` (dang_canh_tac/da_thu_hoach/dong)

**`vat_tu_dau_vao`** — danh mục phân bón, thuốc BVTV (master data, có kiểm soát)
- `id` (PK), `ten_vat_tu`, `loai` (phan_bon/thuoc_bvtv/che_pham_sinh_hoc), `hoat_chat`, `so_dang_ky_luu_hanh`, `nha_san_xuat`, `thoi_gian_cach_ly_ngay` (PHI), `nam_trong_danh_muc_cam` (bool — đối chiếu danh mục cấm của Bộ NN&PTNT / nước nhập khẩu)

**`hoat_dong_canh_tac`** — nhật ký từng hoạt động (bảng trung tâm, ghi hằng ngày)
- `id` (PK), `vu_mua_id` (FK), `nguoi_thuc_hien_id` (FK), `ngay_thuc_hien`, `loai_hoat_dong` (enum: bon_phan/phun_thuoc/tuoi_nuoc/tia_canh/lam_co/be_qua/khac), `mo_ta`, `hinh_anh` (mảng URL ảnh minh chứng), `thoi_tiet` (nullable), `vi_tri_gps_ghi_nhan`

**`chi_tiet_vat_tu_su_dung`** — bảng nối nhiều-nhiều giữa hoạt động và vật tư
- `id` (PK), `hoat_dong_id` (FK), `vat_tu_id` (FK), `lieu_luong`, `don_vi`, `ngay_du_kien_het_cach_ly` (tính = ngày phun + PHI của vật tư)

**`thu_hoach`**
- `id` (PK), `vu_mua_id` (FK), `ngay_thu_hoach`, `san_luong_kg`, `phan_loai_chat_luong` (loai_1/loai_2/loai_xuat_khau), `nguoi_thu_hoach_id` (FK), `kiem_tra_cach_ly_dat` (bool, hệ thống tự kiểm tra chéo với `chi_tiet_vat_tu_su_dung`)

**`lo_xuat_khau`**
- `id` (PK), `ma_lo_xk` (unique), `thi_truong_xuat_khau`, `ngay_dong_goi`, `khoi_luong_kg`, `co_so_dong_goi_id` (FK), `ma_qr` (unique, dùng render QR), `trang_thai` (dang_xu_ly/da_xuat/thu_hoi)

**`thu_hoach_lo_xuat_khau`** — bảng nối: một lô xuất khẩu có thể gộp từ nhiều đợt thu hoạch
- `thu_hoach_id` (FK), `lo_xuat_khau_id` (FK), `khoi_luong_dong_gop_kg`

**`co_so_dong_goi`**
- `id` (PK), `ma_co_so` (Packing House Code), `ten_co_so`, `dia_chi`

**`chung_nhan`**
- `id` (PK), `lo_xuat_khau_id` (FK), `loai_chung_nhan` (VietGAP/GlobalGAP/Kiem_dich_thuc_vat/Kiem_nghiem_du_luong), `so_chung_nhan`, `ngay_cap`, `han_su_dung`, `file_dinh_kem_url`

**`nhat_ky_truy_xuat`** — log mỗi lần quét QR (phục vụ thống kê + phát hiện hàng giả)
- `id` (PK), `lo_xuat_khau_id` (FK), `thoi_gian_quet`, `dia_diem_quet` (IP-geo hoặc GPS nếu quét trong app), `nguon_quet` (nguoi_tieu_dung/hai_quan/doi_tac)

**`nhat_ky_thay_doi`** (audit log) — ai sửa gì, khi nào, phục vụ đối chứng khi bị thanh tra
- `id` (PK), `bang_bi_thay_doi`, `ban_ghi_id`, `nguoi_thuc_hien_id`, `hanh_dong` (them/sua/xoa), `du_lieu_cu` (JSON), `du_lieu_moi` (JSON), `thoi_gian`

### 3.2 Ràng buộc nghiệp vụ quan trọng cần code hóa (không chỉ nằm trong CSDL)

1. **Chặn thu hoạch sớm**: khi tạo `thu_hoach`, hệ thống kiểm tra mọi `chi_tiet_vat_tu_su_dung` gắn với `vu_mua_id` — nếu `ngay_thu_hoach < ngay_du_kien_het_cach_ly` của bất kỳ vật tư nào → cảnh báo đỏ, chặn hoặc yêu cầu quản lý duyệt tay.
2. **Chặn vật tư cấm**: khi thêm `chi_tiet_vat_tu_su_dung`, nếu `vat_tu.nam_trong_danh_muc_cam = true` → không cho lưu.
3. **Truy vết ngược từ mã QR**: từ `lo_xuat_khau` → `thu_hoach_lo_xuat_khau` → `thu_hoach` → `vu_mua` → `lo_dat` → toàn bộ `hoat_dong_canh_tac` + `chi_tiet_vat_tu_su_dung` trong vụ đó. Đây là truy vấn lõi của trang truy xuất công khai.
4. **Offline-first**: nông dân ghi nhật ký ngay tại vườn nơi sóng yếu → app cần lưu tạm local (IndexedDB/SQLite) và đồng bộ khi có mạng.

## 4. Thiết kế Web

### 4.1 Kiến trúc tổng thể

```
[App di động / PWA cho nông dân] ---sync---> [API Backend] ---> [PostgreSQL/MySQL]
[Web quản trị cho HTX/quản lý]   ------------> [API Backend]
[Trang truy xuất công khai (quét QR, không cần đăng nhập)] --> [API Backend, chỉ đọc]
```

### 4.2 Sơ đồ trang theo vai trò

**A. App/PWA cho nông dân (ưu tiên mobile, thao tác nhanh, offline)**
- Trang chủ: danh sách vụ mùa đang canh tác + nhắc việc ("Còn 3 ngày nữa hết thời gian cách ly")
- Ghi nhật ký nhanh: chọn loại hoạt động → chụp ảnh → chọn vật tư từ danh mục có sẵn (không gõ tay) → lưu (kể cả offline)
- Lịch sử nhật ký theo vụ, dạng timeline
- Cảnh báo vi phạm (màu đỏ) nếu sắp thu hoạch nhưng chưa hết cách ly

**B. Web quản trị cho quản lý HTX / kỹ thuật**
- Dashboard tổng quan: số vườn, số vụ đang canh tác, số cảnh báo cách ly, sản lượng dự kiến
- Quản lý vườn/lô đất (bản đồ GPS, danh sách)
- Quản lý danh mục vật tư (thêm/khoá vật tư cấm, cập nhật PHI)
- Duyệt nhật ký / duyệt thu hoạch
- Tạo lô xuất khẩu: chọn các đợt thu hoạch để gộp lô → hệ thống tự sinh mã QR
- Quản lý chứng nhận (upload file VietGAP/GlobalGAP, hạn sử dụng)
- Báo cáo xuất theo yêu cầu hải quan/đối tác (export PDF/Excel)

**C. Trang truy xuất công khai (không cần đăng nhập, quét QR)**
- Nhập/quét `ma_qr` → hiển thị: vùng trồng, giống bưởi, ngày thu hoạch, ngày đóng gói, các chứng nhận, tóm tắt hoạt động canh tác (không lộ dữ liệu nhạy cảm nội bộ), bản đồ vị trí vườn
- Thiết kế đơn giản, tải nhanh, hỗ trợ đa ngôn ngữ (Anh/Trung/Việt) vì người xem có thể là hải quan nước ngoài

### 4.3 Đề xuất công nghệ

| Thành phần | Lựa chọn đề xuất | Lý do |
|---|---|---|
| Backend API | Node.js (NestJS/Express) hoặc Laravel (PHP) | Hệ sinh thái quen thuộc, dễ tuyển dụng tại VN |
| CSDL | PostgreSQL | Hỗ trợ JSON, dữ liệu địa lý (PostGIS) cho GPS vườn |
| Frontend quản trị | React + Tailwind | Dashboard giàu tương tác |
| App nông dân | PWA (React) với IndexedDB để lưu offline, hoặc Flutter nếu cần app native | Vùng nông thôn sóng yếu, cần offline-first |
| Sinh mã QR | thư viện `qrcode` (Node) hoặc tương đương | Tạo mã gắn `ma_qr` khi tạo lô xuất khẩu |
| Lưu ảnh minh chứng | S3-compatible storage (MinIO/AWS S3) | Ảnh chụp tại vườn dung lượng lớn |
| Xác thực | JWT + phân quyền theo vai trò (RBAC) | Đơn giản, dễ mở rộng |

## 5. Gợi ý lộ trình triển khai

1. **Giai đoạn 1**: CSDL lõi + ghi nhật ký hoạt động canh tác (nông dân dùng được ngay)
2. **Giai đoạn 2**: Danh mục vật tư + cảnh báo thời gian cách ly (giá trị tuân thủ cao nhất)
3. **Giai đoạn 3**: Thu hoạch + đóng gói lô xuất khẩu + sinh mã QR
4. **Giai đoạn 4**: Trang truy xuất công khai + báo cáo cho hải quan/đối tác
5. **Giai đoạn 5**: Offline sync cho app nông dân, tích hợp bản đồ GPS

---

*Tài liệu này là bản thiết kế khung. Có thể điều chỉnh thêm bảng `thoi_tiet` (nhật ký thời tiết tự động từ API), bảng `kiem_tra_du_luong` (kết quả xét nghiệm mẫu), hoặc mở rộng theo từng chuẩn cụ thể (US-APHIS, GlobalGAP v6...) tùy thị trường xuất khẩu mục tiêu.*
