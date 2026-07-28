-- ============================================================
-- CSDL: NHAT KY DIEN TU CHO NGUOI TRONG BUOI XUAT KHAU
-- Dialect: PostgreSQL 14+
-- ============================================================

-- ------------------------------------------------------------
-- 0. TIEN ICH CHUNG
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- toa do GPS vuon/lo dat

-- ------------------------------------------------------------
-- 1. ENUM TYPES
-- ------------------------------------------------------------
CREATE TYPE vai_tro_nguoi_dung AS ENUM (
    'nong_dan', 'quan_ly', 'ky_thuat', 'xuat_khau', 'kiem_dinh', 'admin'
);

CREATE TYPE loai_vat_tu AS ENUM (
    'phan_bon', 'thuoc_bvtv', 'che_pham_sinh_hoc'
);

CREATE TYPE loai_hoat_dong AS ENUM (
    'bon_phan', 'phun_thuoc', 'tuoi_nuoc', 'tia_canh',
    'lam_co', 'be_qua', 'kiem_tra_sau_benh', 'khac'
);

CREATE TYPE trang_thai_vu_mua AS ENUM (
    'dang_canh_tac', 'da_thu_hoach', 'dong'
);

CREATE TYPE phan_loai_chat_luong AS ENUM (
    'loai_1', 'loai_2', 'loai_xuat_khau', 'loai_noi_dia'
);

CREATE TYPE trang_thai_lo_xk AS ENUM (
    'dang_xu_ly', 'da_xuat', 'thu_hoi'
);

CREATE TYPE loai_chung_nhan AS ENUM (
    'vietgap', 'globalgap', 'kiem_dich_thuc_vat', 'kiem_nghiem_du_luong', 'khac'
);

CREATE TYPE nguon_quet_qr AS ENUM (
    'nguoi_tieu_dung', 'hai_quan', 'doi_tac', 'noi_bo'
);

CREATE TYPE hanh_dong_audit AS ENUM ('them', 'sua', 'xoa');


-- ------------------------------------------------------------
-- 2. VUNG TRONG (Growing Area Code)
-- ------------------------------------------------------------
CREATE TABLE vung_trong (
    id                      SERIAL PRIMARY KEY,
    ma_vung_trong           VARCHAR(50) NOT NULL UNIQUE,
    ten_hop_tac_xa          VARCHAR(255),
    tinh_thanh              VARCHAR(100),
    ngay_cap_ma             DATE,
    thi_truong_duoc_phep    JSONB DEFAULT '[]'::JSONB, -- vd: ["US","CN","EU"]
    ngay_tao                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE vung_trong IS 'Ma so vung trong do co quan BVTV cap, co the gom nhieu vuon';


-- ------------------------------------------------------------
-- 3. NGUOI DUNG
-- ------------------------------------------------------------
CREATE TABLE nguoi_dung (
    id              SERIAL PRIMARY KEY,
    ho_ten          VARCHAR(255) NOT NULL,
    so_dien_thoai   VARCHAR(20) UNIQUE,
    email           VARCHAR(255) UNIQUE,
    mat_khau_hash   TEXT NOT NULL,
    vai_tro         vai_tro_nguoi_dung NOT NULL DEFAULT 'nong_dan',
    vung_trong_id   INTEGER REFERENCES vung_trong(id) ON DELETE SET NULL,
    trang_thai      BOOLEAN NOT NULL DEFAULT TRUE,
    ngay_tao        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_nguoi_dung_vai_tro ON nguoi_dung(vai_tro);


-- ------------------------------------------------------------
-- 4. VUON
-- ------------------------------------------------------------
CREATE TABLE vuon (
    id                  SERIAL PRIMARY KEY,
    ten_vuon            VARCHAR(255) NOT NULL,
    dia_chi             TEXT,
    toa_do_gps          GEOGRAPHY(POINT, 4326),
    dien_tich_ha        NUMERIC(10,2),
    vung_trong_id       INTEGER REFERENCES vung_trong(id) ON DELETE SET NULL,
    nguoi_quan_ly_id    INTEGER REFERENCES nguoi_dung(id) ON DELETE SET NULL,
    ngay_tao            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vuon_vung_trong ON vuon(vung_trong_id);
CREATE INDEX idx_vuon_gps ON vuon USING GIST(toa_do_gps);


-- ------------------------------------------------------------
-- 5. LO DAT (thua/lo trong vuon)
-- ------------------------------------------------------------
CREATE TABLE lo_dat (
    id              SERIAL PRIMARY KEY,
    ma_lo           VARCHAR(50) NOT NULL,
    vuon_id         INTEGER NOT NULL REFERENCES vuon(id) ON DELETE CASCADE,
    so_cay          INTEGER,
    giong_buoi      VARCHAR(100), -- vd: Da Xanh, Nam Roi, Dien
    nam_trong       INTEGER,
    toa_do_gps      GEOGRAPHY(POINT, 4326),
    UNIQUE (vuon_id, ma_lo)
);

CREATE INDEX idx_lo_dat_vuon ON lo_dat(vuon_id);


-- ------------------------------------------------------------
-- 6. VU MUA
-- ------------------------------------------------------------
CREATE TABLE vu_mua (
    id                          SERIAL PRIMARY KEY,
    lo_dat_id                   INTEGER NOT NULL REFERENCES lo_dat(id) ON DELETE CASCADE,
    ten_vu                      VARCHAR(100) NOT NULL, -- vd: "Vu 2026"
    ngay_ra_hoa                 DATE,
    ngay_du_kien_thu_hoach      DATE,
    trang_thai                  trang_thai_vu_mua NOT NULL DEFAULT 'dang_canh_tac',
    ngay_tao                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vu_mua_lo_dat ON vu_mua(lo_dat_id);
CREATE INDEX idx_vu_mua_trang_thai ON vu_mua(trang_thai);


-- ------------------------------------------------------------
-- 7. VAT TU DAU VAO (danh muc phan bon / thuoc BVTV)
-- ------------------------------------------------------------
CREATE TABLE vat_tu_dau_vao (
    id                          SERIAL PRIMARY KEY,
    ten_vat_tu                  VARCHAR(255) NOT NULL,
    loai                        loai_vat_tu NOT NULL,
    hoat_chat                   VARCHAR(255),
    so_dang_ky_luu_hanh         VARCHAR(100),
    nha_san_xuat                VARCHAR(255),
    thoi_gian_cach_ly_ngay      INTEGER NOT NULL DEFAULT 0, -- PHI (Pre-Harvest Interval)
    nam_trong_danh_muc_cam      BOOLEAN NOT NULL DEFAULT FALSE,
    ngay_tao                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vat_tu_loai ON vat_tu_dau_vao(loai);
CREATE INDEX idx_vat_tu_cam ON vat_tu_dau_vao(nam_trong_danh_muc_cam);


-- ------------------------------------------------------------
-- 8. HOAT DONG CANH TAC (bang trung tam, ghi hang ngay)
-- ------------------------------------------------------------
CREATE TABLE hoat_dong_canh_tac (
    id                      BIGSERIAL PRIMARY KEY,
    vu_mua_id               INTEGER NOT NULL REFERENCES vu_mua(id) ON DELETE CASCADE,
    nguoi_thuc_hien_id      INTEGER REFERENCES nguoi_dung(id) ON DELETE SET NULL,
    ngay_thuc_hien          DATE NOT NULL,
    loai_hoat_dong          loai_hoat_dong NOT NULL,
    mo_ta                   TEXT,
    hinh_anh                JSONB DEFAULT '[]'::JSONB, -- mang URL anh minh chung
    thoi_tiet               VARCHAR(100),
    vi_tri_gps_ghi_nhan     GEOGRAPHY(POINT, 4326),
    ngay_tao                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hoat_dong_vu_mua ON hoat_dong_canh_tac(vu_mua_id);
CREATE INDEX idx_hoat_dong_ngay ON hoat_dong_canh_tac(ngay_thuc_hien);
CREATE INDEX idx_hoat_dong_loai ON hoat_dong_canh_tac(loai_hoat_dong);


-- ------------------------------------------------------------
-- 9. CHI TIET VAT TU SU DUNG (bang noi hoat dong <-> vat tu)
-- ------------------------------------------------------------
CREATE TABLE chi_tiet_vat_tu_su_dung (
    id                              BIGSERIAL PRIMARY KEY,
    hoat_dong_id                    BIGINT NOT NULL REFERENCES hoat_dong_canh_tac(id) ON DELETE CASCADE,
    vat_tu_id                       INTEGER NOT NULL REFERENCES vat_tu_dau_vao(id),
    lieu_luong                      NUMERIC(10,2) NOT NULL,
    don_vi                          VARCHAR(20) NOT NULL, -- vd: ml, g, l, kg
    ngay_du_kien_het_cach_ly        DATE, -- tinh = ngay phun + PHI cua vat tu

    CONSTRAINT chk_lieu_luong_duong CHECK (lieu_luong > 0)
);

CREATE INDEX idx_ct_vat_tu_hoat_dong ON chi_tiet_vat_tu_su_dung(hoat_dong_id);
CREATE INDEX idx_ct_vat_tu_vat_tu ON chi_tiet_vat_tu_su_dung(vat_tu_id);
CREATE INDEX idx_ct_vat_tu_het_cach_ly ON chi_tiet_vat_tu_su_dung(ngay_du_kien_het_cach_ly);

-- Trigger: tu dong tinh ngay het cach ly + chan vat tu cam
CREATE OR REPLACE FUNCTION fn_tinh_ngay_het_cach_ly()
RETURNS TRIGGER AS $$
DECLARE
    v_phi INTEGER;
    v_cam BOOLEAN;
    v_ngay_thuc_hien DATE;
BEGIN
    SELECT thoi_gian_cach_ly_ngay, nam_trong_danh_muc_cam
        INTO v_phi, v_cam
        FROM vat_tu_dau_vao WHERE id = NEW.vat_tu_id;

    IF v_cam THEN
        RAISE EXCEPTION 'Vat tu id=% nam trong danh muc cam, khong duoc su dung', NEW.vat_tu_id;
    END IF;

    SELECT ngay_thuc_hien INTO v_ngay_thuc_hien
        FROM hoat_dong_canh_tac WHERE id = NEW.hoat_dong_id;

    NEW.ngay_du_kien_het_cach_ly := v_ngay_thuc_hien + (v_phi || ' days')::INTERVAL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tinh_ngay_het_cach_ly
    BEFORE INSERT OR UPDATE ON chi_tiet_vat_tu_su_dung
    FOR EACH ROW EXECUTE FUNCTION fn_tinh_ngay_het_cach_ly();


-- ------------------------------------------------------------
-- 10. THU HOACH
-- ------------------------------------------------------------
CREATE TABLE thu_hoach (
    id                          SERIAL PRIMARY KEY,
    vu_mua_id                   INTEGER NOT NULL REFERENCES vu_mua(id) ON DELETE CASCADE,
    ngay_thu_hoach              DATE NOT NULL,
    san_luong_kg                NUMERIC(10,2) NOT NULL,
    phan_loai_chat_luong        phan_loai_chat_luong NOT NULL DEFAULT 'loai_2',
    nguoi_thu_hoach_id          INTEGER REFERENCES nguoi_dung(id) ON DELETE SET NULL,
    kiem_tra_cach_ly_dat        BOOLEAN NOT NULL DEFAULT FALSE,
    ngay_tao                    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_san_luong_duong CHECK (san_luong_kg > 0)
);

CREATE INDEX idx_thu_hoach_vu_mua ON thu_hoach(vu_mua_id);
CREATE INDEX idx_thu_hoach_ngay ON thu_hoach(ngay_thu_hoach);

-- Trigger: tu dong kiem tra thoi gian cach ly truoc khi cho phep ghi nhan "dat"
CREATE OR REPLACE FUNCTION fn_kiem_tra_cach_ly_thu_hoach()
RETURNS TRIGGER AS $$
DECLARE
    v_con_vi_pham INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_con_vi_pham
    FROM chi_tiet_vat_tu_su_dung ctv
    JOIN hoat_dong_canh_tac hd ON hd.id = ctv.hoat_dong_id
    WHERE hd.vu_mua_id = NEW.vu_mua_id
      AND ctv.ngay_du_kien_het_cach_ly > NEW.ngay_thu_hoach;

    NEW.kiem_tra_cach_ly_dat := (v_con_vi_pham = 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kiem_tra_cach_ly_thu_hoach
    BEFORE INSERT OR UPDATE ON thu_hoach
    FOR EACH ROW EXECUTE FUNCTION fn_kiem_tra_cach_ly_thu_hoach();


-- ------------------------------------------------------------
-- 11. CO SO DONG GOI
-- ------------------------------------------------------------
CREATE TABLE co_so_dong_goi (
    id              SERIAL PRIMARY KEY,
    ma_co_so        VARCHAR(50) NOT NULL UNIQUE, -- Packing House Code
    ten_co_so       VARCHAR(255) NOT NULL,
    dia_chi         TEXT
);


-- ------------------------------------------------------------
-- 12. LO XUAT KHAU
-- ------------------------------------------------------------
CREATE TABLE lo_xuat_khau (
    id                      SERIAL PRIMARY KEY,
    ma_lo_xk                VARCHAR(100) NOT NULL UNIQUE,
    thi_truong_xuat_khau    VARCHAR(100) NOT NULL,
    ngay_dong_goi           DATE NOT NULL,
    khoi_luong_kg           NUMERIC(10,2) NOT NULL,
    co_so_dong_goi_id       INTEGER REFERENCES co_so_dong_goi(id),
    ma_qr                   UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    trang_thai              trang_thai_lo_xk NOT NULL DEFAULT 'dang_xu_ly',
    ngay_tao                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lo_xk_ma_qr ON lo_xuat_khau(ma_qr);
CREATE INDEX idx_lo_xk_trang_thai ON lo_xuat_khau(trang_thai);


-- ------------------------------------------------------------
-- 13. THU HOACH <-> LO XUAT KHAU (nhieu-nhieu)
-- ------------------------------------------------------------
CREATE TABLE thu_hoach_lo_xuat_khau (
    thu_hoach_id            INTEGER NOT NULL REFERENCES thu_hoach(id) ON DELETE CASCADE,
    lo_xuat_khau_id         INTEGER NOT NULL REFERENCES lo_xuat_khau(id) ON DELETE CASCADE,
    khoi_luong_dong_gop_kg  NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (thu_hoach_id, lo_xuat_khau_id),

    CONSTRAINT chk_khoi_luong_dong_gop_duong CHECK (khoi_luong_dong_gop_kg > 0)
);


-- ------------------------------------------------------------
-- 14. CHUNG NHAN
-- ------------------------------------------------------------
CREATE TABLE chung_nhan (
    id                  SERIAL PRIMARY KEY,
    lo_xuat_khau_id     INTEGER NOT NULL REFERENCES lo_xuat_khau(id) ON DELETE CASCADE,
    loai_chung_nhan     loai_chung_nhan NOT NULL,
    so_chung_nhan       VARCHAR(100),
    ngay_cap            DATE,
    han_su_dung         DATE,
    file_dinh_kem_url   TEXT
);

CREATE INDEX idx_chung_nhan_lo_xk ON chung_nhan(lo_xuat_khau_id);


-- ------------------------------------------------------------
-- 15. NHAT KY TRUY XUAT (log quet QR)
-- ------------------------------------------------------------
CREATE TABLE nhat_ky_truy_xuat (
    id                  BIGSERIAL PRIMARY KEY,
    lo_xuat_khau_id     INTEGER NOT NULL REFERENCES lo_xuat_khau(id) ON DELETE CASCADE,
    thoi_gian_quet      TIMESTAMPTZ NOT NULL DEFAULT now(),
    dia_diem_quet       VARCHAR(255),
    nguon_quet          nguon_quet_qr NOT NULL DEFAULT 'nguoi_tieu_dung'
);

CREATE INDEX idx_nhat_ky_truy_xuat_lo_xk ON nhat_ky_truy_xuat(lo_xuat_khau_id);
CREATE INDEX idx_nhat_ky_truy_xuat_thoi_gian ON nhat_ky_truy_xuat(thoi_gian_quet);


-- ------------------------------------------------------------
-- 16. NHAT KY THAY DOI (audit log toan he thong)
-- ------------------------------------------------------------
CREATE TABLE nhat_ky_thay_doi (
    id                  BIGSERIAL PRIMARY KEY,
    bang_bi_thay_doi    VARCHAR(100) NOT NULL,
    ban_ghi_id          BIGINT NOT NULL,
    nguoi_thuc_hien_id  INTEGER REFERENCES nguoi_dung(id) ON DELETE SET NULL,
    hanh_dong           hanh_dong_audit NOT NULL,
    du_lieu_cu          JSONB,
    du_lieu_moi         JSONB,
    thoi_gian           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_bang_ban_ghi ON nhat_ky_thay_doi(bang_bi_thay_doi, ban_ghi_id);


-- ------------------------------------------------------------
-- 17. VIEW TIEN ICH: TRUY XUAT NGUON GOC THEO MA QR
-- Dung cho trang cong khai khi nguoi dung quet QR
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_truy_xuat_lo_xuat_khau AS
SELECT
    lxk.ma_qr,
    lxk.ma_lo_xk,
    lxk.thi_truong_xuat_khau,
    lxk.ngay_dong_goi,
    lxk.khoi_luong_kg,
    csdg.ma_co_so         AS ma_co_so_dong_goi,
    csdg.ten_co_so        AS ten_co_so_dong_goi,
    vt.ma_vung_trong,
    vt.ten_hop_tac_xa,
    v.ten_vuon,
    ld.giong_buoi,
    vm.ten_vu,
    th.ngay_thu_hoach,
    th.phan_loai_chat_luong
FROM lo_xuat_khau lxk
JOIN co_so_dong_goi csdg          ON csdg.id = lxk.co_so_dong_goi_id
JOIN thu_hoach_lo_xuat_khau thlxk ON thlxk.lo_xuat_khau_id = lxk.id
JOIN thu_hoach th                 ON th.id = thlxk.thu_hoach_id
JOIN vu_mua vm                    ON vm.id = th.vu_mua_id
JOIN lo_dat ld                    ON ld.id = vm.lo_dat_id
JOIN vuon v                       ON v.id = ld.vuon_id
JOIN vung_trong vt                ON vt.id = v.vung_trong_id;

COMMENT ON VIEW vw_truy_xuat_lo_xuat_khau IS
    'View phuc vu trang truy xuat cong khai: nhap ma_qr de lay toan bo thong tin lo hang';


-- ============================================================
-- HET FILE
-- ============================================================
