"""
Activity Normalizer - Chuẩn hóa dữ liệu nhật ký hoạt động canh tác bưởi
theo cấu trúc database PostgreSQL (schema_nhat_ky_buoi.sql).

Các trường chuẩn hóa:
  - ngay_thuc_hien: Quy đổi ngày tương đối → DD/MM/YYYY
  - loai_hoat_dong: Validate enum loai_hoat_dong
  - don_vi:         Chuẩn hóa đơn vị đo lường → ký hiệu chuẩn
  - lieu_luong:     Đảm bảo kiểu number
  - Các trường text: UPPERCASE
"""

from datetime import datetime, timedelta
import json
import logging

from services.normalizer.dates import parse_date

logger = logging.getLogger(__name__)

# Enum hợp lệ từ database — khớp 1:1 với LoaiHoatDongCanhTac trong agrilog-shared
VALID_LOAI_HOAT_DONG = {
    "bon_phan", "tuoi_nuoc", "phun_thuoc", "phun_thuoc_bvtv",
    "cat_tia", "tia_canh", "lam_co", "be_qua",
    "sau_benh", "kiem_tra_sau_benh", "thu_hoach", "kiem_dinh_mau",
    "khac",
}

# Ánh xạ alias — LLM có thể output giá trị khác, quy về enum chuẩn webapp/DB
ALIAS_LOAI_HOAT_DONG: dict[str, str] = {
    "kiem_tra_sau_benh": "sau_benh",     # LLM dùng tên dài, webapp/DB dùng tên ngắn
    "phun_thuoc_bvtv": "phun_thuoc",     # Gộp về phun_thuoc nếu cần
    "cat_tia": "tia_canh",               # Gộp alias
}

VALID_LOAI_VAT_TU = {
    "phan_bon", "thuoc_bvtv", "che_pham_sinh_hoc"
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

    # Nhóm từ khóa tương đối (chỉ cần chứa từ khóa như 'NAY', 'QUA', 'MAI'...)
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

    # Thử kiểm tra bổ sung tháng/năm trên chính chuỗi đầu vào (VD: "15", "15/08", "15-8")
    completed = complete_missing_date_parts(val, now)
    if completed != val:
        return completed

    # Nếu không phải dạng số trực tiếp, thử parse bằng grammar parser (VD: "ngày 15", "ngày mười lăm tháng tám")
    try:
        parsed = parse_date(date_str)
        if parsed and parsed.strip():
            return complete_missing_date_parts(parsed.strip().upper(), now)
    except Exception:
        pass

    return str(date_str).strip().upper()



def normalize_unit(unit_str: str) -> str | None:
    """
    Chuẩn hóa các đơn vị đo lường trong nông nghiệp (khối lượng, thể tích, đóng gói, diện tích)
    về ký hiệu chuẩn viết thường theo cột don_vi VARCHAR(20) trong bảng chi_tiet_vat_tu_su_dung.
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

    # Đóng gói / bao bì
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


def normalize_activity_list(activities: list[dict]) -> list[dict]:
    """
    Chuẩn hóa danh sách hoạt động canh tác bưởi theo cấu trúc database:
    - ngay_thuc_hien: Quy đổi ngày tương đối → DD/MM/YYYY.
    - loai_hoat_dong: Validate thuộc enum hợp lệ, fallback → "khac".
    - loai_vat_tu:    Validate thuộc enum hợp lệ, fallback → null.
    - don_vi:         Chuẩn hóa đơn vị đo lường (kg, ml, l, bao...).
    - lieu_luong:     Đảm bảo kiểu number.
    - Các trường text: UPPERCASE.
    """
    if not isinstance(activities, list):
        return activities

    normalized = []
    for item in activities:
        if not isinstance(item, dict):
            normalized.append(item)
            continue

        norm_item = {}
        for k, v in item.items():
            # --- Chuẩn hóa ngày thực hiện ---
            if k == "ngay_thuc_hien":
                norm_item[k] = normalize_relative_date(str(v) if v is not None else "")

            # --- Validate loai_hoat_dong enum + ánh xạ alias ---
            elif k == "loai_hoat_dong":
                val = str(v).strip().lower() if v else "khac"
                # Ánh xạ alias trước (VD: kiem_tra_sau_benh → sau_benh)
                val = ALIAS_LOAI_HOAT_DONG.get(val, val)
                norm_item[k] = val if val in VALID_LOAI_HOAT_DONG else "khac"

            # --- Validate loai_vat_tu enum ---
            elif k == "loai_vat_tu":
                if v is not None:
                    val = str(v).strip().lower()
                    norm_item[k] = val if val in VALID_LOAI_VAT_TU else None
                else:
                    norm_item[k] = None

            # --- Liều lượng (number) ---
            elif k == "lieu_luong":
                if v is not None and str(v).strip().upper() not in ("NULL", "NONE", ""):
                    try:
                        norm_item[k] = float(v) if "." in str(v) else int(v)
                    except (ValueError, TypeError):
                        norm_item[k] = v
                else:
                    norm_item[k] = None

            # --- Đơn vị ---
            elif k == "don_vi":
                norm_item[k] = normalize_unit(v)

            # --- Các trường text (mo_ta, thoi_tiet, ma_lo, giong_buoi, ten_vat_tu) ---
            else:
                if v is not None and str(v).strip().upper() not in ("NULL", "NONE", ""):
                    norm_item[k] = str(v).strip().upper()
                else:
                    norm_item[k] = None

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
    Chuyển đổi danh sách flat activities (mỗi phần tử = 1 hoạt động + 1 vật tư)
    từ output LLM sang định dạng grouped theo webapp/database:

    Input (LLM flat):
    [
      {"loai_hoat_dong": "phun_thuoc", "ten_vat_tu": "Regent", "lieu_luong": 50, "don_vi": "ml", ...},
      {"loai_hoat_dong": "phun_thuoc", "ten_vat_tu": "Trichoderma", "lieu_luong": 250, "don_vi": "g", ...},
      {"loai_hoat_dong": "bon_phan", "ten_vat_tu": "NPK 20-20-15", "lieu_luong": 2, "don_vi": "bao", ...}
    ]

    Output (Webapp/DB IHoatDongItemDto[]):
    [
      {
        "loai_hoat_dong": "phun_thuoc",
        "mo_ta": "...",
        "vat_tu_list": [
          {"ten_vat_tu": "Regent", "lieu_luong": "50 ml", "loai_vat_tu": "thuoc_bvtv"},
          {"ten_vat_tu": "Trichoderma", "lieu_luong": "250 g", "loai_vat_tu": "che_pham_sinh_hoc"}
        ]
      },
      {
        "loai_hoat_dong": "bon_phan",
        "mo_ta": "...",
        "vat_tu_list": [
          {"ten_vat_tu": "NPK 20-20-15", "lieu_luong": "2 bao", "loai_vat_tu": "phan_bon"}
        ]
      }
    ]
    """
    if not isinstance(activities, list):
        return activities

    # Gom nhóm theo loai_hoat_dong (giữ thứ tự xuất hiện)
    grouped: dict[str, dict] = {}
    order: list[str] = []

    for item in activities:
        if not isinstance(item, dict):
            continue

        loai = item.get("loai_hoat_dong", "khac")

        if loai not in grouped:
            grouped[loai] = {
                "loai_hoat_dong": loai,
                "mo_ta": item.get("mo_ta"),
                "vat_tu_list": [],
            }
            order.append(loai)
        else:
            # Nối mô tả nếu hoạt động cùng loại có mô tả khác
            existing_mo_ta = grouped[loai].get("mo_ta")
            new_mo_ta = item.get("mo_ta")
            if new_mo_ta and existing_mo_ta and new_mo_ta != existing_mo_ta:
                grouped[loai]["mo_ta"] = f"{existing_mo_ta}; {new_mo_ta}"

        # Thêm vật tư vào danh sách (nếu có tên vật tư)
        ten_vat_tu = item.get("ten_vat_tu")
        if ten_vat_tu and str(ten_vat_tu).strip().upper() not in ("NULL", "NONE", ""):
            lieu_luong = item.get("lieu_luong")
            don_vi = item.get("don_vi")

            # Ghép lieu_luong + don_vi thành chuỗi "50 ml" cho webapp
            lieu_luong_str = ""
            if lieu_luong is not None and str(lieu_luong).strip().upper() not in ("NULL", "NONE", ""):
                lieu_luong_str = str(lieu_luong)
                if don_vi and str(don_vi).strip().upper() not in ("NULL", "NONE", ""):
                    lieu_luong_str = f"{lieu_luong} {don_vi}"

            vat_tu_item = {
                "ten_vat_tu": str(ten_vat_tu).strip(),
                "lieu_luong": lieu_luong_str,
            }

            loai_vat_tu = item.get("loai_vat_tu")
            if loai_vat_tu and str(loai_vat_tu).strip().lower() in VALID_LOAI_VAT_TU:
                vat_tu_item["loai_vat_tu"] = str(loai_vat_tu).strip().lower()

            grouped[loai]["vat_tu_list"].append(vat_tu_item)

    return [grouped[k] for k in order]

