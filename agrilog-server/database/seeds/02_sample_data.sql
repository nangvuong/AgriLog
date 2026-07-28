-- ============================================================
-- SAMPLE SEED DATA: NHẬT KÝ BƯỞI XUẤT KHẨU
-- Phục vụ kiểm thử hệ thống & view vw_truy_xuat_lo_xuat_khau
-- ============================================================

BEGIN;

-- 1. Thêm vùng trồng (Growing Area Code)
INSERT INTO vung_trong (ma_vung_trong, ten_hop_tac_xa, tinh_thanh, ngay_cap_ma, thi_truong_duoc_phep)
VALUES
('VN-BT-00123', 'HTX Bưởi Da Xanh An Khánh - Bến Tre', 'Bến Tre', '2024-01-15', '["US", "CN", "EU", "JP"]'::JSONB),
('VN-DN-00456', 'HTX Nông Nghiệp Sạch Tân Triều', 'Đồng Nai', '2024-03-20', '["US", "EU"]'::JSONB)
ON CONFLICT (ma_vung_trong) DO NOTHING;

-- 2. Thêm người dùng (Nông dân, Quản lý, Kỹ thuật, Kiểm định, Xuất khẩu)
INSERT INTO nguoi_dung (ho_ten, so_dien_thoai, email, mat_khau_hash, vai_tro, vung_trong_id, trang_thai)
VALUES
('Nguyễn Văn Nông', '0901234567', 'nongdan1@agrilog.vn', '$2b$10$eE5/3w/kE/examplehash...', 'nong_dan', 1, TRUE),
('Trần Văn Quản', '0901234568', 'quanly@agrilog.vn', '$2b$10$eE5/3w/kE/examplehash...', 'quan_ly', 1, TRUE),
('Lê Thị Kỹ Thuật', '0901234569', 'kythuat@agrilog.vn', '$2b$10$eE5/3w/kE/examplehash...', 'ky_thuat', 1, TRUE),
('Phạm Hoàng Kiểm Định', '0901234570', 'kiemdinh@agrilog.vn', '$2b$10$eE5/3w/kE/examplehash...', 'kiem_dinh', 1, TRUE),
('Vũ Thị Xuất Khẩu', '0901234571', 'xuatkhau@agrilog.vn', '$2b$10$eE5/3w/kE/examplehash...', 'xuat_khau', 1, TRUE)
ON CONFLICT (so_dien_thoai) DO NOTHING;

-- 3. Thêm vườn bưởi (Sử dụng PostGIS geography cho tọa độ GPS)
INSERT INTO vuon (ten_vuon, dia_chi, toa_do_gps, dien_tich_ha, vung_trong_id, nguoi_quan_ly_id)
VALUES
('Vườn Bưởi Số 1 - Châu Thành', 'Xã An Khánh, Châu Thành, Bến Tre', ST_SetSRID(ST_MakePoint(106.3421, 10.2984), 4326)::geography, 2.50, 1, 2),
('Vườn Bưởi Số 2 - Giồng Trôm', 'Xã Mỹ Thạnh, Giồng Trôm, Bến Tre', ST_SetSRID(ST_MakePoint(106.3812, 10.1542), 4326)::geography, 3.20, 1, 2);

-- 4. Thêm lô đất (thửa đất trong vườn)
INSERT INTO lo_dat (ma_lo, vuon_id, so_cay, giong_buoi, nam_trong, toa_do_gps)
VALUES
('LO-01A', 1, 350, 'Bưởi Da Xanh', 2020, ST_SetSRID(ST_MakePoint(106.3421, 10.2984), 4326)::geography),
('LO-01B', 1, 400, 'Bưởi Da Xanh', 2021, ST_SetSRID(ST_MakePoint(106.3425, 10.2988), 4326)::geography),
('LO-02A', 2, 500, 'Bưởi Da Xanh', 2019, ST_SetSRID(ST_MakePoint(106.3812, 10.1542), 4326)::geography)
ON CONFLICT (vuon_id, ma_lo) DO NOTHING;

-- 5. Thêm vụ mùa
INSERT INTO vu_mua (lo_dat_id, ten_vu, ngay_ra_hoa, ngay_du_kien_thu_hoach, trang_thai)
VALUES
(1, 'Vụ Tết 2026 (Lô 01A)', '2025-07-01', '2026-01-20', 'da_thu_hoach'),
(2, 'Vụ Xuân Hè 2026 (Lô 01B)', '2025-10-15', '2026-05-15', 'dang_canh_tac'),
(3, 'Vụ Tết 2026 (Lô 02A)', '2025-07-10', '2026-01-25', 'da_thu_hoach');

-- 6. Thêm vật tư đầu vào (phân bón, thuốc BVTV, chế phẩm sinh học)
INSERT INTO vat_tu_dau_vao (ten_vat_tu, loai, hoat_chat, so_dang_ky_luu_hanh, nha_san_xuat, thoi_gian_cach_ly_ngay, nam_trong_danh_muc_cam)
VALUES
('Phân hữu cơ vi sinh Đầu Trâu', 'phan_bon', 'Chất hữu cơ 20%, N-P-K 2-2-1', 'PB-2023-001', 'Bình Điền', 0, FALSE),
('Thuốc trừ sâu sinh học Abamectin 3.6EC', 'thuoc_bvtv', 'Abamectin', 'BVTV-2022-089', 'Tập đoàn Lộc Trời', 7, FALSE),
('Chế phẩm sinh học Trichoderma', 'che_pham_sinh_hoc', 'Nấm đối kháng Trichoderma spp.', 'CP-2023-012', 'Đại học Cần Thơ', 0, FALSE),
('Phân NPK 20-20-15+TE', 'phan_bon', 'N 20%, P2O5 20%, K2O 15%, TE', 'PB-2023-088', 'Yara Việt Nam', 0, FALSE);

-- 7. Thêm hoạt động canh tác hàng ngày
INSERT INTO hoat_dong_canh_tac (vu_mua_id, nguoi_thuc_hien_id, ngay_thuc_hien, loai_hoat_dong, mo_ta, hinh_anh, thoi_tiet, vi_tri_gps_ghi_nhan)
VALUES
(1, 1, '2025-07-10', 'bon_phan', 'Bón lót phân hữu cơ vi sinh đầu vụ để nuôi hoa và rễ', '["https://example.com/images/bon_phan_1.jpg"]'::JSONB, 'Nắng nhẹ, 28°C', ST_SetSRID(ST_MakePoint(106.3421, 10.2984), 4326)::geography),
(1, 1, '2025-09-15', 'phun_thuoc', 'Phun phòng nhện đỏ và sâu vẽ bùa giai đoạn trái non', '["https://example.com/images/phun_thuoc_1.jpg"]'::JSONB, 'Trời mát, 27°C', ST_SetSRID(ST_MakePoint(106.3421, 10.2984), 4326)::geography),
(1, 1, '2025-12-15', 'tuoi_nuoc', 'Tưới nước định kỳ duy trì độ ẩm cho trái lớn chín đều', '[]'::JSONB, 'Nắng tốt, 30°C', ST_SetSRID(ST_MakePoint(106.3421, 10.2984), 4326)::geography);

-- 8. Thêm chi tiết vật tư sử dụng cho hoạt động canh tác (Trigger sẽ tự động tính ngày hết cách ly)
INSERT INTO chi_tiet_vat_tu_su_dung (hoat_dong_id, vat_tu_id, lieu_luong, don_vi)
VALUES
(1, 1, 50.00, 'kg'),  -- Bón phân hữu cơ (PHI = 0 ngày -> het cach ly: 2025-07-10)
(2, 2, 250.00, 'ml'), -- Phun Abamectin (PHI = 7 ngày -> het cach ly: 2025-09-22)
(1, 3, 5.00, 'kg');   -- Nấm Trichoderma (PHI = 0 ngày)

-- 9. Thêm ghi nhận thu hoạch (Trigger sẽ tự kiểm tra kiem_tra_cach_ly_dat)
INSERT INTO thu_hoach (vu_mua_id, ngay_thu_hoach, san_luong_kg, phan_loai_chat_luong, nguoi_thu_hoach_id)
VALUES
(1, '2026-01-20', 4500.00, 'loai_xuat_khau', 1),
(1, '2026-01-21', 1200.00, 'loai_1', 1),
(3, '2026-01-25', 6000.00, 'loai_xuat_khau', 1);

-- 10. Thêm cơ sở đóng gói (Packing House Code)
INSERT INTO co_so_dong_goi (ma_co_so, ten_co_so, dia_chi)
VALUES
('PH-BT-001', 'Nhà Máy Đóng Gói Nông Sản Xuất Khẩu Bến Tre', 'KCN An Hiệp, Huyện Châu Thành, Bến Tre'),
('PH-BT-002', 'Cơ Sở Đóng Gói Trái Cây Sạch Hưng Phú', 'Xã Hưng Phú, Giồng Trôm, Bến Tre')
ON CONFLICT (ma_co_so) DO NOTHING;

-- 11. Thêm lô xuất khẩu
INSERT INTO lo_xuat_khau (ma_lo_xk, thi_truong_xuat_khau, ngay_dong_goi, khoi_luong_kg, co_so_dong_goi_id, ma_qr, trang_thai)
VALUES
('LOT-2026-US-001', 'US', '2026-01-22', 4000.00, 1, '11111111-1111-1111-1111-111111111111'::UUID, 'da_xuat'),
('LOT-2026-EU-002', 'EU', '2026-01-27', 5500.00, 1, '22222222-2222-2222-2222-222222222222'::UUID, 'dang_xu_ly')
ON CONFLICT (ma_lo_xk) DO NOTHING;

-- 12. Thêm liên kết thu hoạch <-> lô xuất khẩu
INSERT INTO thu_hoach_lo_xuat_khau (thu_hoach_id, lo_xuat_khau_id, khoi_luong_dong_gop_kg)
VALUES
(1, 1, 4000.00), -- 4000kg từ lô thu hoạch 1 vào lô xuất khẩu US
(3, 2, 5500.00)  -- 5500kg từ lô thu hoạch 3 vào lô xuất khẩu EU
ON CONFLICT DO NOTHING;

-- 13. Thêm chứng nhận cho lô xuất khẩu
INSERT INTO chung_nhan (lo_xuat_khau_id, loai_chung_nhan, so_chung_nhan, ngay_cap, han_su_dung, file_dinh_kem_url)
VALUES
(1, 'globalgap', 'GG-2025-998811', '2025-01-01', '2026-12-31', 'https://example.com/certs/globalgap.pdf'),
(1, 'kiem_dich_thuc_vat', 'KDTV-VN-US-4421', '2026-01-22', '2026-02-22', 'https://example.com/certs/kdtv-us.pdf'),
(2, 'globalgap', 'GG-2025-998811', '2025-01-01', '2026-12-31', 'https://example.com/certs/globalgap.pdf'),
(2, 'kiem_nghiem_du_luong', 'KNDL-2026-0128', '2026-01-26', '2026-07-26', 'https://example.com/certs/kndl-eu.pdf');

-- 14. Thêm nhật ký truy xuất (log khi quét QR)
INSERT INTO nhat_ky_truy_xuat (lo_xuat_khau_id, dia_diem_quet, nguon_quet)
VALUES
(1, 'Cảng Long Beach, Los Angeles, USA', 'hai_quan'),
(1, 'Siêu thị Whole Foods LA, California, USA', 'nguoi_tieu_dung'),
(1, 'Siêu thị Whole Foods SF, California, USA', 'nguoi_tieu_dung'),
(2, 'Cảng Rotterdam, Netherlands', 'hai_quan');

-- 15. Thêm mẫu log nhật ký thay đổi (Audit log)
INSERT INTO nhat_ky_thay_doi (bang_bi_thay_doi, ban_ghi_id, nguoi_thuc_hien_id, hanh_dong, du_lieu_cu, du_lieu_moi)
VALUES
('lo_xuat_khau', 1, 2, 'sua', '{"trang_thai": "dang_xu_ly"}'::JSONB, '{"trang_thai": "da_xuat"}'::JSONB);

COMMIT;
