-- ============================================================
-- AGRILOG DATABASE SEED DATA
-- Phục vụ kiểm thử hệ thống Nhật ký Canh tác Nông nghiệp Thông minh đa cây trồng (AgriLog)
-- ============================================================

BEGIN;

-- 0. Xóa dữ liệu cũ và đặt lại sequence ID (Idempotent seed)
TRUNCATE TABLE 
    weather,
    harvest,
    observation,
    activity_asset,
    activity_material,
    activity_ai_extraction,
    activity_transcript,
    activity_media,
    activity,
    inventory,
    asset,
    material,
    activity_type,
    season,
    crop_variety,
    crop,
    plot,
    farmer,
    farm,
    "user"
RESTART IDENTITY CASCADE;

-- ============================================================
-- 1. USER (Tài khoản người dùng)
-- ============================================================
INSERT INTO "user" (id, username, password_hash, email, role, status)
VALUES
(1, 'admin', '$2b$10$eE5/3w/kE/examplehashadmin00000000000000000000000000', 'admin@agrilog.vn', 'ADMIN', 'ACTIVE'),
(2, 'nongdan_tu', '$2b$10$eE5/3w/kE/examplehashnongdan010000000000000000000000', 'tu.nguyen@agrilog.vn', 'FARMER', 'ACTIVE'),
(3, 'nongdan_hoa', '$2b$10$eE5/3w/kE/examplehashnongdan020000000000000000000000', 'hoa.tran@agrilog.vn', 'FARMER', 'ACTIVE'),
(4, 'quanly_nam', '$2b$10$eE5/3w/kE/examplehashquanly0000000000000000000000000', 'nam.le@agrilog.vn', 'MANAGER', 'ACTIVE');

-- ============================================================
-- 2. FARM (Trang trại bưởi)
-- ============================================================
INSERT INTO farm (id, name, owner_farmer_id, address, latitude, longitude, description)
VALUES
(1, 'Farm Bưởi Da Xanh An Khánh', NULL, 'Xã An Khánh, Huyện Châu Thành, Tỉnh Bến Tre', 10.298450, 106.342100, 'Trang trại bưởi da xanh đạt chuẩn VietGAP & GlobalGAP phục vụ xuất khẩu'),
(2, 'Farm Bưởi Sạch Tân Triều', NULL, 'Xã Tân Bình, Huyện Vĩnh Cửu, Tỉnh Đồng Nai', 11.021350, 106.812400, 'Vườn bưởi đường lá cam truyền thống vùng đất bãi bồi Tân Triều');

-- ============================================================
-- 3. FARMER (Thông tin nông dân & chủ hộ)
-- ============================================================
INSERT INTO farmer (id, user_id, farm_id, full_name, phone, email, gender, date_of_birth, address, is_owner)
VALUES
(1, 2, 1, 'Nguyễn Văn Tư', '0901234567', 'tu.nguyen@agrilog.vn', 'MALE', '1975-05-12', 'Xã An Khánh, Huyện Châu Thành, Tỉnh Bến Tre', TRUE),
(2, 3, 2, 'Trần Thị Hoa', '0912345678', 'hoa.tran@agrilog.vn', 'FEMALE', '1980-08-20', 'Xã Tân Bình, Huyện Vĩnh Cửu, Tỉnh Đồng Nai', TRUE),
(3, NULL, 1, 'Lê Văn Hùng', '0987654321', NULL, 'MALE', '1990-10-15', 'Xã An Khánh, Huyện Châu Thành, Tỉnh Bến Tre', FALSE);

-- Cập nhật liên kết FK chủ hộ (owner_farmer_id) cho bảng Farm
UPDATE farm SET owner_farmer_id = 1 WHERE id = 1;
UPDATE farm SET owner_farmer_id = 2 WHERE id = 2;

-- ============================================================
-- 4. PLOT (Lô đất / thửa đất trồng bưởi - có tọa độ PostGIS)
-- ============================================================
INSERT INTO plot (id, farm_id, code, name, area, polygon, soil_type, status)
VALUES
(1, 1, 'LO-01A', 'Lô A - Vườn Nam', 1.50, ST_GeomFromText('POLYGON((106.3421 10.2984, 106.3425 10.2984, 106.3425 10.2988, 106.3421 10.2988, 106.3421 10.2984))', 4326), 'Đất phù sa ngọt', 'ACTIVE'),
(2, 1, 'LO-01B', 'Lô B - Vườn Bắc', 2.00, ST_GeomFromText('POLYGON((106.3426 10.2989, 106.3430 10.2989, 106.3430 10.2993, 106.3426 10.2993, 106.3426 10.2989))', 4326), 'Đất phù sa ngọt', 'ACTIVE'),
(3, 2, 'LO-02A', 'Lô 1 - Bưởi Tân Triều', 3.20, ST_GeomFromText('POLYGON((106.8124 11.0213, 106.8130 11.0213, 106.8130 11.0220, 106.8124 11.0220, 106.8124 11.0213))', 4326), 'Đất phù sa cổ ven sông', 'ACTIVE');

-- ============================================================
-- 5. CROP & CROP VARIETY (Danh mục cây trồng & giống cây nông nghiệp)
-- ============================================================
INSERT INTO crop (id, name, scientific_name, category, description)
VALUES
(1, 'Bưởi', 'Citrus maxima', 'Cây ăn quả lâu năm', 'Cây có múi thuộc chi Cam chanh, thích hợp đất phù sa miền Nam'),
(2, 'Cà phê Robusta', 'Coffea canephora', 'Cây công nghiệp lâu năm', 'Cây cà phê vối thích hợp vùng đất đỏ bazan Tây Nguyên'),
(3, 'Lúa ST25', 'Oryza sativa', 'Cây lương thực ngắn ngày', 'Giống lúa thơm đặc sản chất lượng cao, thích hợp vùng Đồng bằng sông Cửu Long');

INSERT INTO crop_variety (id, crop_id, name, supplier, description)
VALUES
(1, 1, 'Bưởi Da Xanh', 'Trung tâm Giống Cây Trồng Bến Tre', 'Ruột hồng, vị ngọt thanh, không hạt, vỏ xanh ráo phù hợp xuất khẩu'),
(2, 1, 'Bưởi Đường Lá Cam', 'HTX Bưởi Tân Triều', 'Ruột vàng nhạt, mọng nước, thơm đặc trưng vùng Đồng Nai'),
(3, 1, 'Bưởi Năm Roi', 'Viện Cây Ăn Quả Miền Nam', 'Trái hình lê, vị ngọt hơi chua dôn dốt'),
(4, 2, 'Cà phê Robusta TR4', 'Viện KHKT Nông lâm nghiệp Tây Nguyên', 'Năng suất cao, kháng bệnh gỉ sắt tốt'),
(5, 3, 'Lúa ST25 Nguyên Chủng', 'DNTN Hồ Quang Trí', 'Hạt gạo dài, cơm dẻo thơm, đạt chuẩn gạo ngon nhất thế giới');

-- ============================================================
-- 6. SEASON (Vụ mùa canh tác)
-- ============================================================
INSERT INTO season (id, plot_id, crop_variety_id, planting_date, expected_harvest_date, actual_harvest_date, status, note)
VALUES
(1, 1, 1, '2025-07-01', '2026-01-25', '2026-01-25', 'HARVESTED', 'Vụ Bưởi Tết 2026 Bến Tre'),
(2, 2, 1, '2025-10-15', '2026-05-15', NULL, 'GROWING', 'Vụ Xuân Hè 2026 - Đang ra hoa và đậu trái non'),
(3, 3, 2, '2025-07-10', '2026-01-20', '2026-01-20', 'HARVESTED', 'Vụ Tết Bưởi Tân Triều 2026');

-- ============================================================
-- 7. ACTIVITY TYPE (Danh mục loại hoạt động canh tác)
-- ============================================================
INSERT INTO activity_type (id, code, name, description)
VALUES
(1, 'FERTILIZE', 'Bón phân', 'Bón lót, bón thúc định kỳ bằng phân hữu cơ hoặc NPK'),
(2, 'IRRIGATE', 'Tưới nước', 'Tưới tiêu duy trì độ ẩm cho cây theo từng giai đoạn'),
(3, 'SPRAY', 'Phun thuốc BVTV', 'Phun thuốc sinh học hoặc hóa học phòng trừ sâu bệnh'),
(4, 'PRUNE', 'Cắt tỉa cành', 'Tỉa cành tạo tán, cắt cành tăm, loại bỏ cành bệnh'),
(5, 'SCOUT', 'Thăm vườn / Kiểm tra', 'Quan sát sâu bệnh, đo chỉ số sinh trưởng cây'),
(6, 'HARVEST', 'Thu hoạch', 'Hái trái, phân loại chất lượng sơ bộ tại vườn'),
(7, 'OTHER', 'Hoạt động khác', 'Làm cỏ, cải tạo rãnh thoát nước, bảo trì vườn');

-- ============================================================
-- 8. MATERIAL (Danh mục vật tư đầu vào)
-- ============================================================
INSERT INTO material (id, name, category, manufacturer, default_unit, description)
VALUES
(1, 'Phân hữu cơ vi sinh Đầu Trâu', 'phan_bon', 'Bình Điền', 'kg', 'Phân hữu cơ vi sinh giàu acid humic, bón cải tạo đất'),
(2, 'Thuốc trừ sâu sinh học Abamectin 3.6EC', 'thuoc_bvtv', 'Tập đoàn Lộc Trời', 'ml', 'Thuốc trừ sâu sinh học phổ rộng, thời gian cách ly 7 ngày'),
(3, 'Chế phẩm sinh học Trichoderma spp.', 'che_pham_sinh_hoc', 'Đại học Cần Thơ', 'kg', 'Nấm đối kháng ức chế nấm bệnh hại rễ, cách ly 0 ngày'),
(4, 'Phân NPK 20-20-15+TE', 'phan_bon', 'Yara Việt Nam', 'kg', 'Phân NPK thúc trái lớn nhanh, xanh da');

-- ============================================================
-- 9. ASSET (Công cụ & máy móc nông nghiệp)
-- ============================================================
INSERT INTO asset (id, farm_id, name, type, serial_number, purchase_date, status)
VALUES
(1, 1, 'Máy bơm nước Honda GX160', 'may_bom', 'HD-2024-001', '2024-02-10', 'ACTIVE'),
(2, 1, 'Máy phun thuốc đeo lưng Oshima', 'may_phun', 'OS-2023-889', '2023-05-15', 'ACTIVE'),
(3, 2, 'Hệ thống tưới tự động nhỏ giọt Netafim', 'he_thong_tuoi', 'NF-2022-442', '2022-11-20', 'ACTIVE');

-- ============================================================
-- 10. INVENTORY (Kho vật tư của từng Farm)
-- ============================================================
INSERT INTO inventory (farm_id, material_id, quantity, unit)
VALUES
(1, 1, 500.00, 'kg'),
(1, 2, 10000.00, 'ml'),
(1, 3, 150.00, 'kg'),
(1, 4, 300.00, 'kg'),
(2, 1, 300.00, 'kg'),
(2, 4, 250.00, 'kg');

-- ============================================================
-- 11. ACTIVITY (Nhật ký canh tác điện tử)
-- ============================================================
INSERT INTO activity (id, season_id, farmer_id, activity_type_id, description, note, start_time, end_time, latitude, longitude, source_type, ai_status)
VALUES
(1, 1, 1, 1, 'Bón lót phân hữu cơ vi sinh Đầu Trâu đầu vụ cho Lô A', 'Bón quanh tán cây, kết hợp xới nhẹ mặt đất', '2025-07-05 07:30:00', '2025-07-05 10:00:00', 10.298450, 106.342100, 'MANUAL', NULL),
(2, 1, 3, 3, 'Phun thuốc sinh học Abamectin phòng nhện đỏ giai đoạn trái non', 'Phun vào sáng sớm trời mát, không có gió lớn', '2025-08-15 06:30:00', '2025-08-15 08:30:00', 10.298450, 106.342100, 'VOICE', 'CONFIRMED'),
(3, 2, 1, 2, 'Tưới nước định kỳ giữ ẩm vườn bưởi', 'Tưới phun mưa dưới gốc 45 phút/cây', '2025-11-10 16:00:00', '2025-11-10 17:30:00', 10.298900, 106.342600, 'MANUAL', NULL),
(4, 2, 3, 5, 'Kiểm tra sâu vẽ bùa trên đọt non Lô B', 'Chụp ảnh chồi non bị sâu hại gửi chuyên gia', '2025-12-01 08:00:00', '2025-12-01 09:00:00', 10.298900, 106.342600, 'IMAGE', 'COMPLETED'),
(5, 1, 1, 6, 'Thu hoạch Bưởi Da Xanh vụ Tết chuẩn xuất khẩu', 'Hái đúng độ già, cắt cuống sát trái, bọc mút xốp', '2026-01-25 06:00:00', '2026-01-25 11:30:00', 10.298450, 106.342100, 'MANUAL', NULL),
(6, 3, 2, 6, 'Thu hoạch Bưởi Đường Lá Cam vụ Tết 2026', 'Thu hoạch trái đều, vỏ mỏng chín vàng', '2026-01-20 07:00:00', '2026-01-20 12:00:00', 11.021350, 106.812400, 'MANUAL', NULL);

-- ============================================================
-- 12. ACTIVITY MATERIAL (Chi tiết vật tư sử dụng trong hoạt động)
-- ============================================================
INSERT INTO activity_material (activity_id, material_id, quantity, unit)
VALUES
(1, 1, 120.00, 'kg'), -- Hoạt động 1 dùng 120kg phân hữu cơ vi sinh
(1, 3, 10.00, 'kg'),  -- Hoạt động 1 dùng kết hợp 10kg nấm Trichoderma
(2, 2, 500.00, 'ml'); -- Hoạt động 2 phun 500ml Abamectin

-- ============================================================
-- 13. ACTIVITY ASSET (Máy móc sử dụng trong hoạt động)
-- ============================================================
INSERT INTO activity_asset (activity_id, asset_id, usage_duration)
VALUES
(2, 2, 120), -- Máy phun Oshima dùng 120 phút
(3, 1, 90),  -- Máy bơm Honda dùng 90 phút
(6, 3, 60);  -- Hệ thống tưới nhỏ giọt Netafim dùng 60 phút

-- ============================================================
-- 14. ACTIVITY MEDIA (Hình ảnh / Video đính kèm)
-- ============================================================
INSERT INTO activity_media (activity_id, media_type, file_name, file_url, thumbnail_url, mime_type, file_size, duration)
VALUES
(2, 'IMAGE', 'phun_thuoc_nhen_do.jpg', 'https://example.com/media/phun_thuoc_nhen_do.jpg', 'https://example.com/media/thumb_phun_thuoc.jpg', 'image/jpeg', 1048576, NULL),
(4, 'IMAGE', 'sau_ve_bua_dot_non.jpg', 'https://example.com/media/sau_ve_bua_dot_non.jpg', 'https://example.com/media/thumb_sau_ve_bua.jpg', 'image/jpeg', 2097152, NULL);

-- ============================================================
-- 15. ACTIVITY TRANSCRIPT (Nhận dạng giọng nói sang văn bản)
-- ============================================================
INSERT INTO activity_transcript (activity_id, transcript, language, confidence)
VALUES
(2, 'Sáng nay Hùng phun thuốc sinh học Abamectin cho lô A chống nhện đỏ, hết 500ml pha 2 phuy', 'vi', 0.952);

-- ============================================================
-- 16. ACTIVITY AI EXTRACTION (Kết quả AI bóc tách thông tin tự động)
-- ============================================================
INSERT INTO activity_ai_extraction (activity_id, model_name, prompt_version, input_text, output_json, confidence, processing_time_ms)
VALUES
(2, 'gemini-3.1-pro-speech', 'v1.2', 'Sáng nay Hùng phun thuốc sinh học Abamectin cho lô A chống nhện đỏ, hết 500ml pha 2 phuy', 
'{"activity_type": "SPRAY", "material_name": "Abamectin", "quantity": 500, "unit": "ml", "plot_code": "LO-01A", "target_pest": "Nhện đỏ"}'::JSONB, 0.965, 420);

-- ============================================================
-- 17. OBSERVATION (Ghi nhận dịch hại & sức khỏe cây trồng)
-- ============================================================
INSERT INTO observation (activity_id, symptom, severity, description)
VALUES
(4, 'Sâu vẽ bùa gây hại đọt non khoảng 5%', 'LOW', 'Sâu xuất hiện rải rác trên các chồi mới nhú, cần theo dõi thêm không cần phun thuốc hóa học'),
(4, 'Bệnh loét vi khuẩn nhẹ trên lá cũ', 'LOW', 'Vết loét nhỏ đã khô, không lây lan sang trái non');

-- ============================================================
-- 18. HARVEST (Ghi nhận thu hoạch và chất lượng trái)
-- ============================================================
INSERT INTO harvest (activity_id, quantity, unit, quality, buyer, selling_price)
VALUES
(5, 4500.00, 'kg', 'Loại 1 Xuất Khẩu (1.2 - 1.8 kg/trái)', 'Công ty TNHH Xuất Khẩu Trái Cây Bến Tre', 42000.00),
(6, 3800.00, 'kg', 'Loại 1 (Trái đẹp chơi Tết)', 'Hợp tác xã Nông sản Đồng Nai', 38000.00);

-- ============================================================
-- 19. WEATHER (Ghi nhận thời tiết tại thời điểm canh tác)
-- ============================================================
INSERT INTO weather (activity_id, temperature, humidity, rainfall, wind_speed, weather_condition)
VALUES
(1, 28.50, 78.00, 0.00, 5.20, 'SUNNY'),
(2, 27.00, 82.00, 0.00, 4.00, 'CLOUDY'),
(5, 26.00, 75.00, 0.00, 6.50, 'SUNNY');

-- ============================================================
-- 20. CẬP NHẬT LẠI CÁC SEQUENCE ID (Tránh xung đột khoá chính khi INSERT mới)
-- ============================================================
SELECT setval(pg_get_serial_sequence('"user"', 'id'), coalesce(max(id),0) + 1, false) FROM "user";
SELECT setval(pg_get_serial_sequence('farm', 'id'), coalesce(max(id),0) + 1, false) FROM farm;
SELECT setval(pg_get_serial_sequence('farmer', 'id'), coalesce(max(id),0) + 1, false) FROM farmer;
SELECT setval(pg_get_serial_sequence('plot', 'id'), coalesce(max(id),0) + 1, false) FROM plot;
SELECT setval(pg_get_serial_sequence('crop', 'id'), coalesce(max(id),0) + 1, false) FROM crop;
SELECT setval(pg_get_serial_sequence('crop_variety', 'id'), coalesce(max(id),0) + 1, false) FROM crop_variety;
SELECT setval(pg_get_serial_sequence('season', 'id'), coalesce(max(id),0) + 1, false) FROM season;
SELECT setval(pg_get_serial_sequence('activity', 'id'), coalesce(max(id),0) + 1, false) FROM activity;
SELECT setval(pg_get_serial_sequence('observation', 'id'), coalesce(max(id),0) + 1, false) FROM observation;
SELECT setval(pg_get_serial_sequence('weather', 'id'), coalesce(max(id),0) + 1, false) FROM weather;
SELECT setval(pg_get_serial_sequence('harvest', 'id'), coalesce(max(id),0) + 1, false) FROM harvest;

COMMIT;
