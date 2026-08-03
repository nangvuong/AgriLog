"""
Activity Normalizer - Chuẩn hóa dữ liệu nhật ký hoạt động canh tác nông nghiệp chung
theo cấu trúc database PostgreSQL (agrilog_schema.sql).

Các trường chuẩn hóa:
  - ngay_thuc_hien: Quy đổi ngày tương đối → DD/MM/YYYY
  - loai_hoat_dong: Validate enum loai_hoat_dong & tự động ánh xạ sang activity_type_code DB
  - activity_type_code: Mã loại hoạt động theo CSDL (FERTILIZE, IRRIGATE, SPRAY, PRUNE, SCOUT, HARVEST, OTHER)
  - don_vi / don_vi_thu_hoach: Chuẩn hóa đơn vị đo lường → ký hiệu chuẩn
  - lieu_luong / thoi_gian_su_dung / san_luong_thu_hoach / gia_ban: Đảm bảo kiểu number
  - muc_do: Chuẩn hóa mức độ sâu bệnh theo CSDL ('LOW' | 'MEDIUM' | 'HIGH' | null)
  - cay_trong / giong_buoi: Hỗ trợ nông nghiệp chung & tương thích ngược
"""

from datetime import datetime, timedelta
import json
import logging

from services.normalizer.dates import parse_date

logger = logging.getLogger(__name__)

# Enum hợp lệ từ database — khớp 1:1 với LoaiHoatDongCanhTac & ActivityType trong agrilog-shared / agrilog_schema.sql
VALID_LOAI_HOAT_DONG = {
    "bon_phan", "tuoi_nuoc", "phun_thuoc", "phun_thuoc_bvtv",
    "cat_tia", "tia_canh", "lam_co", "be_qua",
    "sau_benh", "kiem_tra_sau_benh", "thu_hoach", "kiem_dinh_mau",
    "khac",
    "FERTILIZE", "IRRIGATE", "SPRAY", "PRUNE", "SCOUT", "HARVEST", "OTHER",
}

# Ánh xạ alias — LLM có thể output giá trị khác, quy về enum chuẩn webapp/DB
ALIAS_LOAI_HOAT_DONG: dict[str, str] = {
    "kiem_tra_sau_benh": "sau_benh",
    "phun_thuoc_bvtv": "phun_thuoc",
    "cat_tia": "tia_canh",
    "be_qua": "tia_canh",
    "kiem_dinh_mau": "sau_benh",
}

# Ánh xạ từ loai_hoat_dong sang mã activity_type_code chuẩn trong PostgreSQL CSDL
ACTIVITY_TYPE_CODE_MAP: dict[str, str] = {
    "bon_phan": "FERTILIZE",
    "fertilize": "FERTILIZE",
    "tuoi_nuoc": "IRRIGATE",
    "irrigate": "IRRIGATE",
    "phun_thuoc": "SPRAY",
    "phun_thuoc_bvtv": "SPRAY",
    "spray": "SPRAY",
    "cat_tia": "PRUNE",
    "tia_canh": "PRUNE",
    "be_qua": "PRUNE",
    "prune": "PRUNE",
    "sau_benh": "SCOUT",
    "kiem_tra_sau_benh": "SCOUT",
    "kiem_dinh_mau": "SCOUT",
    "scout": "SCOUT",
    "thu_hoach": "HARVEST",
    "harvest": "HARVEST",
    "lam_co": "OTHER",
    "khac": "OTHER",
    "other": "OTHER",
}

VALID_LOAI_VAT_TU = {
    "phan_bon", "thuoc_bvtv", "che_pham_sinh_hoc", "khac"
}


def complete_missing_date_parts(val_str: str, now: datetime) -> str:
    """
    Bổ sung các cấp thời gian cao hơn bị thiếu:
    - Chỉ có Ngày -> thêm Tháng và Năm hiện tại.
    - Có Ngày/Tháng -> thêm Năm hiện tại.
    """
    if not val_str:
        return val_str

    clean_str = val_str.replace("-", "/").replace(".", "/").strip()
    parts = [p.strip() for p in clean_str.split("/") if p.strip()]

    # 1. Trường hợp chỉ có 1 số (chỉ có Ngày) -> thêm Tháng và Năm hiện tại
    if len(parts) == 1 and parts[0].isdigit():
        day = int(parts[0])
        if 1 <= day <= 31:
            return f"{day:02d}/{now.month:02d}/{now.year:04d}"

    # 2. Trường hợp có 2 số (Ngày và Tháng) -> thêm Năm hiện tại
    elif len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
        day = int(parts[0])
        month = int(parts[1])
        if 1 <= day <= 31 and 1 <= month <= 12:
            return f"{day:02d}/{month:02d}/{now.year:04d}"

    # 3. Trường hợp có 3 số (Ngày, Tháng, Năm) -> chuẩn hóa format DD/MM/YYYY
    elif len(parts) == 3 and all(p.isdigit() for p in parts):
        day = int(parts[0])
        month = int(parts[1])
        year = int(parts[2])
        if year < 100:
            year += 2000
        if 1 <= day <= 31 and 1 <= month <= 12 and 1900 <= year <= 2100:
            return f"{day:02d}/{month:02d}/{year:04d}"

    return val_str


def normalize_relative_date(date_str: str) -> str:
    """
    Quy đổi từ chỉ thời gian tương đối (hôm qua, hôm nay, ngày mai...),
    chuỗi ngày tháng bằng chữ/số, và tự động bổ sung tháng/năm nếu bị thiếu.
    """
    now = datetime.now()
    val = str(date_str or "").strip().upper()

    if not val or val in ("NULL", "NONE"):
        return now.strftime("%d/%m/%Y")
    if "HÔM KIA" in val or "HOM KIA" in val or "HÔM KÌA" in val:
        return (now - timedelta(days=2)).strftime("%d/%m/%Y")
    if "NGÀY KIA" in val or "NGAY KIA" in val or "MỐT" in val:
        return (now + timedelta(days=2)).strftime("%d/%m/%Y")
    if "QUA" in val or "YESTERDAY" in val:
        return (now - timedelta(days=1)).strftime("%d/%m/%Y")
    if "MAI" in val or "TOMORROW" in val:
        return (now + timedelta(days=1)).strftime("%d/%m/%Y")
    if "NAY" in val or "TODAY" in val or "HIỆN TẠI" in val or "SÁNG NAY" in val or "CHIỀU NAY" in val:
        return now.strftime("%d/%m/%Y")

    completed = complete_missing_date_parts(val, now)
    if completed != val:
        return completed

    try:
        parsed = parse_date(date_str)
        if parsed and parsed.strip():
            return complete_missing_date_parts(parsed.strip().upper(), now)
    except Exception:
        pass

    return str(date_str).strip().upper()


def normalize_unit(unit_str: str | None) -> str | None:
    """
    Chuẩn hóa các đơn vị đo lường trong nông nghiệp (khối lượng, thể tích, đóng gói, diện tích)
    về ký hiệu chuẩn theo cột unit VARCHAR(20) trong database PostgreSQL.
    """
    if unit_str is None:
        return None
    val = str(unit_str).strip().upper()
    if not val or val in ("NULL", "NONE", ""):
        return None

    # Khối lượng
    if val in ("KG", "KÝ", "KÍ", "KÝ LÔ", "KÍ LÔ", "KILOGAM", "KILOGRAM", "KILO", "CÂN", "CAN", "CAG"):
        return "kg"
    if val in ("G", "GAM", "GRAM", "GR"):
        return "g"
    if val in ("TẤN", "TAN", "TON"):
        return "tấn"
    if val in ("TẠ", "TA"):
        return "tạ"
    if val in ("YẾN", "YEN"):
        return "yến"

    # Thể tích
    if val in ("LÍT", "LIT", "LITER", "LITRE", "L"):
        return "l"
    if val in ("ML", "MILILIT", "MILLILITER", "MI LI LÍT", "MILI LÍT"):
        return "ml"
    if val in ("CC", "C.C"):
        return "cc"

    # Đóng gói / bao bì / nông sản
    if val in ("BAO", "TẢI", "BAO TẢI"):
        return "bao"
    if val in ("GÓI", "GOI", "BỊCH", "BICH", "TÚI", "TUI"):
        return "gói"
    if val in ("CHAI", "BÌNH", "BINH", "LỌ", "LO"):
        return "chai"
    if val in ("THÙNG", "THUNG", "XÔ", "XO"):
        return "thùng"
    if val in ("VIÊN", "VIEN"):
        return "viên"
    if val in ("QUẢ", "QUA", "TRÁI", "TRAI"):
        return "quả"

    # Diện tích
    if val in ("HA", "HECTA", "HÉC TA", "HEC TA", "HECTARE"):
        return "ha"
    if val in ("M2", "M²", "MÉT VUÔNG", "MET VUONG"):
        return "m2"
    if val in ("SÀO", "SAO"):
        return "sào"
    if val in ("CÔNG", "CONG"):
        return "công"
    if val in ("MẪU", "MAU"):
        return "mẫu"

    return val.lower()


def normalize_severity(val: str | None) -> str | None:
    """
    Chuẩn hóa mức độ sâu bệnh về severity_level enum ('LOW', 'MEDIUM', 'HIGH', null)
    theo bảng observation trong PostgreSQL CSDL.
    """
    if val is None:
        return None
    s = str(val).strip().upper()
    if not s or s in ("NULL", "NONE", ""):
        return None
    if s in ("LOW", "NHẸ", "NHE", "ÍT", "IT", "NHỎ", "NHO"):
        return "LOW"
    if s in ("MEDIUM", "TRUNG BÌNH", "TRUNG BINH", "VỪA", "VUA", "BÌNH THƯỜNG"):
        return "MEDIUM"
    if s in ("HIGH", "NẶNG", "NANG", "CAO", "NGHIÊM TRỌNG", "NGHIEM TRONG", "NHIỀU", "NHIEU"):
        return "HIGH"
    return "LOW"


def normalize_number(val: any) -> float | int | None:
    """
    Chuyển chuỗi hoặc số về kiểu float/int hợp lệ cho các cột NUMERIC trong CSDL.
    """
    if val is None:
        return None
    s = str(val).strip().upper()
    if not s or s in ("NULL", "NONE", ""):
        return None
    try:
        num = float(s)
        return int(num) if num.is_integer() else num
    except (ValueError, TypeError):
        return None


def _normalize_material(mat: dict) -> dict:
    """Chuẩn hóa một item trong mảng materials."""
    ten_vt = mat.get("ten_vat_tu") or ""
    loai_vt = str(mat.get("loai_vat_tu") or "").strip().lower()
    return {
        "ten_vat_tu": str(ten_vt).strip().upper() if ten_vt else None,
        "loai_vat_tu": loai_vt if loai_vt in VALID_LOAI_VAT_TU else None,
        "lieu_luong": normalize_number(mat.get("lieu_luong")),
        "don_vi": normalize_unit(mat.get("don_vi")),
    }


def _normalize_asset(ast: dict) -> dict:
    """Chuẩn hóa một item trong mảng assets."""
    ten_cc = ast.get("ten_cong_cu") or ""
    return {
        "ten_cong_cu": str(ten_cc).strip().upper() if ten_cc else None,
        "thoi_gian_su_dung": normalize_number(ast.get("thoi_gian_su_dung")),
    }


def _normalize_observation(obs: dict) -> dict:
    """Chuẩn hóa một item trong mảng observations."""
    tc = obs.get("trieu_chung") or ""
    mt_sb = obs.get("mo_ta_sau_benh")
    return {
        "trieu_chung": str(tc).strip() if tc else None,
        "muc_do": normalize_severity(obs.get("muc_do")),
        "mo_ta_sau_benh": str(mt_sb).strip() if mt_sb and str(mt_sb).strip().upper() not in ("NULL", "NONE", "") else None,
    }


def _normalize_harvest(harv: dict) -> dict:
    """Chuẩn hóa một item trong mảng harvests."""
    pham_cap = harv.get("pham_cap")
    thuong_lai = harv.get("thuong_lai")
    return {
        "san_luong_thu_hoach": normalize_number(harv.get("san_luong_thu_hoach")),
        "don_vi_thu_hoach": normalize_unit(harv.get("don_vi_thu_hoach")),
        "pham_cap": str(pham_cap).strip().upper() if pham_cap and str(pham_cap).strip().upper() not in ("NULL", "NONE", "") else None,
        "thuong_lai": str(thuong_lai).strip().upper() if thuong_lai and str(thuong_lai).strip().upper() not in ("NULL", "NONE", "") else None,
        "gia_ban": normalize_number(harv.get("gia_ban")),
    }


def normalize_activity_list(activities: list[dict]) -> list[dict]:
    """
    Chuẩn hóa danh sách hoạt động canh tác theo cấu trúc mới (array-based):
    - Mỗi activity có các mảng: materials[], assets[], observations[], harvests[].
    - Chuẩn hóa các trường chính: ngay_thuc_hien, loai_hoat_dong, activity_type_code,
      ma_lo, cay_trong, mo_ta, thoi_tiet.
    - Chuẩn hóa từng item bên trong mỗi mảng con.

    Tương thích ngược với format flat cũ (nếu có materials là None/thiếu trường).
    """
    if not isinstance(activities, list):
        return activities

    normalized = []
    for item in activities:
        if not isinstance(item, dict):
            normalized.append(item)
            continue

        norm_item = {}

        # 1. Chuẩn hóa ngày thực hiện
        norm_item["ngay_thuc_hien"] = normalize_relative_date(
            str(item.get("ngay_thuc_hien") or "")
        )

        # 2. Chuẩn hóa loại hoạt động & mã DB
        raw_loai = str(item.get("loai_hoat_dong") or item.get("activity_type_code") or "khac").strip().lower()
        loai = ALIAS_LOAI_HOAT_DONG.get(raw_loai, raw_loai)
        loai_vn = loai if loai in VALID_LOAI_HOAT_DONG else "khac"
        norm_item["loai_hoat_dong"] = loai_vn
        norm_item["activity_type_code"] = ACTIVITY_TYPE_CODE_MAP.get(loai_vn, "OTHER")

        # 3. Chuẩn hóa Lô & Cây trồng
        ma_lo = item.get("ma_lo")
        norm_item["ma_lo"] = str(ma_lo).strip().upper() if ma_lo and str(ma_lo).strip().upper() not in ("NULL", "NONE", "") else None

        cay = item.get("cay_trong") or item.get("giong_buoi")
        cay_str = str(cay).strip().upper() if cay and str(cay).strip().upper() not in ("NULL", "NONE", "") else None
        norm_item["cay_trong"] = cay_str
        norm_item["giong_buoi"] = cay_str

        # 4. Mô tả & Thời tiết
        mo_ta = item.get("mo_ta")
        norm_item["mo_ta"] = str(mo_ta).strip() if mo_ta and str(mo_ta).strip() not in ("NULL", "NONE", "", "null") else None

        thoi_tiet = item.get("thoi_tiet")
        norm_item["thoi_tiet"] = str(thoi_tiet).strip() if thoi_tiet and str(thoi_tiet).strip() not in ("NULL", "NONE", "", "null") else None

        # 5. Chuẩn hóa mảng materials
        raw_materials = item.get("materials")
        if isinstance(raw_materials, list):
            norm_item["materials"] = [
                _normalize_material(m) for m in raw_materials if isinstance(m, dict)
            ]
        else:
            # Tương thích ngược với format flat cũ
            ten_vt = item.get("ten_vat_tu")
            if ten_vt and str(ten_vt).strip().upper() not in ("NULL", "NONE", ""):
                norm_item["materials"] = [_normalize_material({
                    "ten_vat_tu": ten_vt,
                    "loai_vat_tu": item.get("loai_vat_tu"),
                    "lieu_luong": item.get("lieu_luong"),
                    "don_vi": item.get("don_vi"),
                })]
            else:
                norm_item["materials"] = []

        # 6. Chuẩn hóa mảng assets
        raw_assets = item.get("assets")
        if isinstance(raw_assets, list):
            norm_item["assets"] = [
                _normalize_asset(a) for a in raw_assets if isinstance(a, dict)
            ]
        else:
            # Tương thích ngược với format flat cũ
            ten_cc = item.get("ten_cong_cu") or item.get("may_moc")
            if ten_cc and str(ten_cc).strip().upper() not in ("NULL", "NONE", ""):
                norm_item["assets"] = [_normalize_asset({
                    "ten_cong_cu": ten_cc,
                    "thoi_gian_su_dung": item.get("thoi_gian_su_dung"),
                })]
            else:
                norm_item["assets"] = []

        # 7. Chuẩn hóa mảng observations
        raw_obs = item.get("observations")
        if isinstance(raw_obs, list):
            norm_item["observations"] = [
                _normalize_observation(o) for o in raw_obs if isinstance(o, dict)
            ]
        else:
            # Tương thích ngược với format flat cũ
            tc = item.get("trieu_chung") or item.get("sau_benh")
            if tc and str(tc).strip().upper() not in ("NULL", "NONE", ""):
                norm_item["observations"] = [_normalize_observation({
                    "trieu_chung": tc,
                    "muc_do": item.get("muc_do"),
                    "mo_ta_sau_benh": item.get("mo_ta_sau_benh"),
                })]
            else:
                norm_item["observations"] = []

        # 8. Chuẩn hóa mảng harvests
        raw_harvests = item.get("harvests")
        if isinstance(raw_harvests, list):
            norm_item["harvests"] = [
                _normalize_harvest(h) for h in raw_harvests if isinstance(h, dict)
            ]
        else:
            # Tương thích ngược với format flat cũ
            sl_th = normalize_number(item.get("san_luong_thu_hoach"))
            pham_cap = item.get("pham_cap")
            thuong_lai = item.get("thuong_lai")
            if sl_th is not None or pham_cap or thuong_lai:
                norm_item["harvests"] = [_normalize_harvest({
                    "san_luong_thu_hoach": item.get("san_luong_thu_hoach"),
                    "don_vi_thu_hoach": item.get("don_vi_thu_hoach"),
                    "pham_cap": pham_cap,
                    "thuong_lai": thuong_lai,
                    "gia_ban": item.get("gia_ban"),
                })]
            else:
                norm_item["harvests"] = []

        normalized.append(norm_item)

    return normalized


def normalize_activity_json(llm_output: str) -> str:
    """
    Nhận JSON string từ LLM, chuyển thành object, chuẩn hóa và trả về JSON string.
    """
    try:
        data = json.loads(llm_output)
        if isinstance(data, list):
            norm_list = normalize_activity_list(data)
            return json.dumps(norm_list, ensure_ascii=False, indent=2)
        elif isinstance(data, dict) and "activities" in data:
            norm_list = normalize_activity_list(data["activities"])
            return json.dumps(norm_list, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.warning(f"Lỗi parse JSON khi chuẩn hóa hoạt động canh tác: {e}")

    return llm_output


def normalize_for_webapp(activities: list[dict]) -> list[dict]:
    """
    Chuyển đổi danh sách flat activities từ output LLM sang định dạng chuẩn
    nhóm theo hoạt động cho WebApp & Backend (agrilog-server Database):
    
    Output item cho mỗi nhóm hoạt động:
    {
      "loai_hoat_dong": "phun_thuoc",
      "activity_type_code": "SPRAY",
      "ngay_thuc_hien": "15/08/2026",
      "mo_ta": "...",
      "thoi_tiet": "...",
      "ma_lo": "A1",
      "cay_trong": "BƯỞI DA XANH",
      "giong_buoi": "BƯỞI DA XANH",
      "vat_tu_list": [
        {"ten_vat_tu": "REGENT 800WG", "loai_vat_tu": "thuoc_bvtv", "lieu_luong": "50 ml", "lieu_luong_num": 50, "don_vi": "ml"}
      ],
      "cong_cu_list": [
        {"ten_cong_cu": "MÁY PHUN THUỐC ĐEO LƯNG", "thoi_gian_su_dung": 60}
      ],
      "sau_benh_list": [
        {"trieu_chung": "SÂU VẼ BÙA", "muc_do": "HIGH", "mo_ta_sau_benh": "Sâu vẽ bùa hại lá non"}
      ],
      "thu_hoach_list": [
        {"san_luong": 1500, "don_vi": "kg", "pham_cap": "LOẠI 1 (XUẤT KHẨU)", "thuong_lai": "CÔNG TY NÔNG SẢN SẠCH", "gia_ban": 25000}
      ]
    }
    """
    if not isinstance(activities, list):
        return activities

    # Gom nhóm theo loai_hoat_dong (giữ thứ tự xuất hiện)
    grouped: dict[str, dict] = {}
    order: list[str] = []

    for item in activities:
        if not isinstance(item, dict):
            continue

        loai = str(item.get("loai_hoat_dong") or "khac").strip().lower()
        loai_vn = ALIAS_LOAI_HOAT_DONG.get(loai, loai)
        if loai_vn not in VALID_LOAI_HOAT_DONG:
            loai_vn = "khac"

        if loai_vn not in grouped:
            grouped[loai_vn] = {
                "loai_hoat_dong": loai_vn,
                "activity_type_code": ACTIVITY_TYPE_CODE_MAP.get(loai_vn, "OTHER"),
                "ngay_thuc_hien": normalize_relative_date(str(item.get("ngay_thuc_hien") or "")),
                "mo_ta": item.get("mo_ta"),
                "thoi_tiet": item.get("thoi_tiet"),
                "ma_lo": item.get("ma_lo"),
                "cay_trong": item.get("cay_trong") or item.get("giong_buoi"),
                "giong_buoi": item.get("giong_buoi") or item.get("cay_trong"),
                "vat_tu_list": [],
                "cong_cu_list": [],
                "sau_benh_list": [],
                "thu_hoach_list": [],
            }
            order.append(loai_vn)
        else:
            # Nối mô tả nếu hoạt động cùng loại có mô tả khác
            existing_mo_ta = grouped[loai_vn].get("mo_ta")
            new_mo_ta = item.get("mo_ta")
            if new_mo_ta and existing_mo_ta and new_mo_ta != existing_mo_ta:
                grouped[loai_vn]["mo_ta"] = f"{existing_mo_ta}; {new_mo_ta}"
            elif not existing_mo_ta and new_mo_ta:
                grouped[loai_vn]["mo_ta"] = new_mo_ta

            # Cập nhật thông tin chung nếu item trước bị null
            for field in ("ngay_thuc_hien", "thoi_tiet", "ma_lo", "cay_trong", "giong_buoi"):
                if not grouped[loai_vn].get(field) and item.get(field):
                    grouped[loai_vn][field] = item.get(field)

        # 1. Thêm vật tư (activity_material)
        ten_vat_tu = item.get("ten_vat_tu")
        if ten_vat_tu and str(ten_vat_tu).strip().upper() not in ("NULL", "NONE", ""):
            ll_num = normalize_number(item.get("lieu_luong"))
            dv_str = normalize_unit(item.get("don_vi"))
            lieu_luong_str = ""
            if ll_num is not None:
                lieu_luong_str = str(ll_num)
                if dv_str:
                    lieu_luong_str = f"{ll_num} {dv_str}"

            vt_item = {
                "ten_vat_tu": str(ten_vat_tu).strip().upper(),
                "lieu_luong": lieu_luong_str,
                "lieu_luong_num": ll_num,
                "don_vi": dv_str,
            }
            loai_vt = str(item.get("loai_vat_tu") or "").strip().lower()
            if loai_vt in VALID_LOAI_VAT_TU:
                vt_item["loai_vat_tu"] = loai_vt
            grouped[loai_vn]["vat_tu_list"].append(vt_item)

        # 2. Thêm công cụ / máy móc (activity_asset)
        ten_cc = item.get("ten_cong_cu") or item.get("may_moc")
        if ten_cc and str(ten_cc).strip().upper() not in ("NULL", "NONE", ""):
            grouped[loai_vn]["cong_cu_list"].append({
                "ten_cong_cu": str(ten_cc).strip().upper(),
                "thoi_gian_su_dung": normalize_number(item.get("thoi_gian_su_dung")),
            })

        # 3. Thêm quan sát / sâu bệnh (observation)
        tc = item.get("trieu_chung") or item.get("sau_benh")
        if tc and str(tc).strip().upper() not in ("NULL", "NONE", ""):
            grouped[loai_vn]["sau_benh_list"].append({
                "trieu_chung": str(tc).strip(),
                "muc_do": normalize_severity(item.get("muc_do")),
                "mo_ta_sau_benh": item.get("mo_ta_sau_benh") or item.get("mo_ta"),
            })

        # 4. Thêm thu hoạch (harvest)
        sl_th = normalize_number(item.get("san_luong_thu_hoach"))
        pham_cap = item.get("pham_cap")
        thuong_lai = item.get("thuong_lai")
        if sl_th is not None or pham_cap or thuong_lai:
            grouped[loai_vn]["thu_hoach_list"].append({
                "san_luong": sl_th,
                "don_vi": normalize_unit(item.get("don_vi_thu_hoach")) or "kg",
                "pham_cap": str(pham_cap).strip().upper() if pham_cap else None,
                "thuong_lai": str(thuong_lai).strip().upper() if thuong_lai else None,
                "gia_ban": normalize_number(item.get("gia_ban")),
            })

    return [grouped[k] for k in order]
