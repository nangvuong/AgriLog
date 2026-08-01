-- ============================================================
-- AGRILOG DATABASE SCHEMA
-- PostgreSQL 14+
-- ============================================================

-- Cần bật extension PostGIS nếu dùng kiểu GEOMETRY cho Plot.polygon
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'FARMER', 'MANAGER', 'VIEWER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');

CREATE TYPE season_status AS ENUM ('PLANNED', 'GROWING', 'HARVESTED', 'CANCELLED');
CREATE TYPE plot_status AS ENUM ('ACTIVE', 'FALLOW', 'INACTIVE');

CREATE TYPE source_type AS ENUM ('VOICE', 'TEXT', 'IMAGE', 'MANUAL');
CREATE TYPE ai_status AS ENUM ('PENDING', 'PROCESSING', 'FAILED', 'COMPLETED', 'CONFIRMED');

CREATE TYPE media_type AS ENUM ('IMAGE', 'AUDIO', 'VIDEO');

CREATE TYPE severity_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TYPE asset_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'RETIRED', 'LOST');

CREATE TYPE weather_condition_type AS ENUM ('SUNNY', 'CLOUDY', 'RAINY', 'STORMY', 'FOGGY', 'WINDY');

-- ============================================================
-- 2. USER
-- ============================================================

CREATE TABLE "user" (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    email           VARCHAR(100) UNIQUE,
    role            user_role    NOT NULL DEFAULT 'FARMER',
    last_login      TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. FARM
-- ============================================================

CREATE TABLE farm (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    -- owner_farmer_id thay cho cột "owner" dạng text tự do (tránh trùng lặp
    -- thông tin với bảng Farmer). Đặt FK sau khi tạo bảng Farmer (deferred).
    owner_farmer_id BIGINT,
    address         TEXT,
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. FARMER
-- ============================================================

CREATE TABLE farmer (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES "user"(id) ON DELETE SET NULL,
    farm_id         BIGINT REFERENCES farm(id) ON DELETE CASCADE,
    full_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(100),
    gender          gender_type,
    date_of_birth   DATE,
    address         TEXT,
    is_owner        BOOLEAN NOT NULL DEFAULT FALSE, -- đánh dấu chủ farm
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- Thêm FK owner_farmer_id sau khi farmer đã tồn tại
ALTER TABLE farm
    ADD CONSTRAINT fk_farm_owner_farmer
    FOREIGN KEY (owner_farmer_id) REFERENCES farmer(id) ON DELETE SET NULL;

-- ============================================================
-- 5. PLOT
-- ============================================================

CREATE TABLE plot (
    id          BIGSERIAL PRIMARY KEY,
    farm_id     BIGINT NOT NULL REFERENCES farm(id) ON DELETE CASCADE,
    code        VARCHAR(30) NOT NULL,
    name        VARCHAR(100),
    area        DECIMAL(10,2) CHECK (area >= 0),
    polygon     GEOMETRY(POLYGON,4326),             -- đổi sang GEOMETRY(POLYGON,4326) nếu dùng PostGIS
    soil_type   VARCHAR(50),
    status      plot_status NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (farm_id, code)
);

-- ============================================================
-- 6. CROP / CROP VARIETY
-- ============================================================

CREATE TABLE crop (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(150),
    category        VARCHAR(50),
    description     TEXT
);

CREATE TABLE crop_variety (
    id          BIGSERIAL PRIMARY KEY,
    crop_id     BIGINT NOT NULL REFERENCES crop(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    supplier    VARCHAR(100),
    description TEXT
);

-- ============================================================
-- 7. SEASON
-- ============================================================

CREATE TABLE season (
    id                      BIGSERIAL PRIMARY KEY,
    plot_id                 BIGINT NOT NULL REFERENCES plot(id) ON DELETE CASCADE,
    crop_variety_id         BIGINT NOT NULL REFERENCES crop_variety(id) ON DELETE RESTRICT,
    planting_date           DATE NOT NULL,
    expected_harvest_date   DATE,
    actual_harvest_date     DATE,
    status                  season_status NOT NULL DEFAULT 'PLANNED',
    note                    TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now(),
    CHECK (expected_harvest_date IS NULL OR expected_harvest_date >= planting_date),
    CHECK (actual_harvest_date IS NULL OR actual_harvest_date >= planting_date)
);

-- ============================================================
-- 8. ACTIVITY TYPE
-- ============================================================

CREATE TABLE activity_type (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(50) NOT NULL UNIQUE,   -- FERTILIZE, IRRIGATE, SPRAY, HARVEST...
    name        VARCHAR(100) NOT NULL,
    description TEXT
);

-- ============================================================
-- 9. ACTIVITY (bảng trung tâm)
-- ============================================================

CREATE TABLE activity (
    id                  BIGSERIAL PRIMARY KEY,
    season_id           BIGINT NOT NULL REFERENCES season(id) ON DELETE CASCADE,
    farmer_id           BIGINT NOT NULL REFERENCES farmer(id) ON DELETE RESTRICT,
    activity_type_id    BIGINT NOT NULL REFERENCES activity_type(id) ON DELETE RESTRICT,
    description         TEXT,
    note                TEXT,
    start_time          TIMESTAMP NOT NULL,
    end_time            TIMESTAMP,
    latitude            DECIMAL(10,7),
    longitude           DECIMAL(10,7),
    source_type         source_type NOT NULL DEFAULT 'MANUAL',
    ai_status           ai_status,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now(),
    CHECK (end_time IS NULL OR end_time >= start_time)
);

CREATE INDEX idx_activity_season ON activity(season_id);
CREATE INDEX idx_activity_farmer ON activity(farmer_id);
CREATE INDEX idx_activity_type ON activity(activity_type_id);

-- ============================================================
-- 10. ACTIVITY MEDIA
-- ============================================================

CREATE TABLE activity_media (
    id              BIGSERIAL PRIMARY KEY,
    activity_id     BIGINT NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    media_type      media_type NOT NULL,
    file_name       VARCHAR(255),
    file_url        TEXT NOT NULL,
    thumbnail_url   TEXT,
    mime_type       VARCHAR(100),
    file_size       BIGINT CHECK (file_size >= 0),
    duration        INTEGER CHECK (duration >= 0), -- giây
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. ACTIVITY TRANSCRIPT
-- ============================================================

CREATE TABLE activity_transcript (
    id          BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    transcript  TEXT NOT NULL,
    language    VARCHAR(20),
    confidence  DECIMAL(4,3) CHECK (confidence BETWEEN 0 AND 1),
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. ACTIVITY AI EXTRACTION
-- ============================================================

CREATE TABLE activity_ai_extraction (
    id                  BIGSERIAL PRIMARY KEY,
    activity_id         BIGINT NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    model_name          VARCHAR(100) NOT NULL,
    prompt_version      VARCHAR(50),
    input_text          TEXT,
    output_json         JSONB,
    confidence          DECIMAL(4,3) CHECK (confidence BETWEEN 0 AND 1),
    processing_time_ms  INTEGER CHECK (processing_time_ms >= 0),
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. MATERIAL
-- ============================================================

CREATE TABLE material (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    category        VARCHAR(50),
    manufacturer    VARCHAR(100),
    default_unit    VARCHAR(20),
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- 14. ACTIVITY MATERIAL (N-N)
-- ============================================================

CREATE TABLE activity_material (
    id          BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL REFERENCES material(id) ON DELETE RESTRICT,
    quantity    DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
    unit        VARCHAR(20),
    UNIQUE (activity_id, material_id)
);

-- ============================================================
-- 15. INVENTORY
-- ============================================================

CREATE TABLE inventory (
    id          BIGSERIAL PRIMARY KEY,
    farm_id     BIGINT NOT NULL REFERENCES farm(id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL REFERENCES material(id) ON DELETE RESTRICT,
    quantity    DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit        VARCHAR(20),
    updated_at  TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (farm_id, material_id)
);

-- ============================================================
-- 16. ASSET
-- ============================================================

CREATE TABLE asset (
    id              BIGSERIAL PRIMARY KEY,
    farm_id         BIGINT NOT NULL REFERENCES farm(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(50),
    serial_number   VARCHAR(100),
    purchase_date   DATE,
    status          asset_status NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- 17. ACTIVITY ASSET (N-N)
-- ============================================================

CREATE TABLE activity_asset (
    id              BIGSERIAL PRIMARY KEY,
    activity_id     BIGINT NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    asset_id        BIGINT NOT NULL REFERENCES asset(id) ON DELETE RESTRICT,
    usage_duration  INTEGER CHECK (usage_duration >= 0), -- phút
    UNIQUE (activity_id, asset_id)
);

-- ============================================================
-- 18. OBSERVATION
-- ============================================================

CREATE TABLE observation (
    id          BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    symptom     VARCHAR(200) NOT NULL,
    severity    severity_level NOT NULL DEFAULT 'LOW',
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- 19. HARVEST
-- ============================================================

CREATE TABLE harvest (
    id              BIGSERIAL PRIMARY KEY,
    activity_id     BIGINT NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    quantity        DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
    unit            VARCHAR(20),
    quality         VARCHAR(50),
    buyer           VARCHAR(150),
    selling_price   DECIMAL(15,2) CHECK (selling_price >= 0),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- 20. WEATHER
-- ============================================================
-- Lưu ý: mỗi bản ghi Weather gắn với 1 activity cụ thể (ghi nhận tại thời
-- điểm/địa điểm của hoạt động đó). Nếu muốn tái sử dụng dữ liệu thời tiết
-- cho nhiều activity cùng lúc/cùng địa điểm, nên tách Weather độc lập theo
-- (farm_id/plot_id, recorded_at) và nối N-N qua bảng trung gian riêng.

CREATE TABLE weather (
    id                  BIGSERIAL PRIMARY KEY,
    activity_id         BIGINT NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    temperature         DECIMAL(5,2),
    humidity            DECIMAL(5,2) CHECK (humidity BETWEEN 0 AND 100),
    rainfall            DECIMAL(5,2) CHECK (rainfall >= 0),
    wind_speed          DECIMAL(5,2) CHECK (wind_speed >= 0),
    weather_condition   weather_condition_type,
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES bổ sung cho các FK còn lại (tăng hiệu năng JOIN)
-- ============================================================

CREATE INDEX idx_farmer_user ON farmer(user_id);
CREATE INDEX idx_farmer_farm ON farmer(farm_id);
CREATE INDEX idx_plot_farm ON plot(farm_id);
CREATE INDEX idx_crop_variety_crop ON crop_variety(crop_id);
CREATE INDEX idx_season_plot ON season(plot_id);
CREATE INDEX idx_season_crop_variety ON season(crop_variety_id);
CREATE INDEX idx_activity_media_activity ON activity_media(activity_id);
CREATE INDEX idx_activity_transcript_activity ON activity_transcript(activity_id);
CREATE INDEX idx_activity_ai_extraction_activity ON activity_ai_extraction(activity_id);
CREATE INDEX idx_activity_material_activity ON activity_material(activity_id);
CREATE INDEX idx_activity_material_material ON activity_material(material_id);
CREATE INDEX idx_inventory_farm ON inventory(farm_id);
CREATE INDEX idx_inventory_material ON inventory(material_id);
CREATE INDEX idx_asset_farm ON asset(farm_id);
CREATE INDEX idx_activity_asset_activity ON activity_asset(activity_id);
CREATE INDEX idx_activity_asset_asset ON activity_asset(asset_id);
CREATE INDEX idx_observation_activity ON observation(activity_id);
CREATE INDEX idx_harvest_activity ON harvest(activity_id);
CREATE INDEX idx_weather_activity ON weather(activity_id);

-- ============================================================
-- TRIGGER: tự động cập nhật updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng trigger cho các bảng có cột updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT unnest(ARRAY[
            'user','farm','farmer','plot','season','activity',
            'material','inventory','asset'
        ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();', t
        );
    END LOOP;
END $$;
