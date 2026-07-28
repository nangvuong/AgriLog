"""
Activity Normalizer - Chuẩn hóa dữ liệu nhật ký hoạt động canh tác
(viết hoa giá trị, quy đổi ngày tương đối / ngày bằng chữ sang định dạng DD/MM/YYYY).
"""

from datetime import datetime, timedelta
import json
import logging

from services.normalizer.dates import parse_date

logger = logging.getLogger(__name__)


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
    if "NAY" in val or "TODAY" in val or "HIỆN TẠI" in val:
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
    về ký hiệu chuẩn viết hoa (KG, LÍT, BAO, GÓI, CHAI, HA...).
    """
    if unit_str is None:
        return None
    val = str(unit_str).strip().upper()
    if not val or val in ("NULL", "NONE", ""):
        return None

    # Khối lượng
    if val in ("KG", "KÝ", "KÍ", "KÝ LÔ", "KÍ LÔ", "KILOGAM", "KILOGRAM", "KILO", "CÂN", "CAN", "CAG"):
        return "KG"
    if val in ("G", "GAM", "GRAM", "GR"):
        return "G"
    if val in ("TẤN", "TAN", "TON"):
        return "TẤN"
    if val in ("TẠ", "TA"):
        return "TẠ"
    if val in ("YẾN", "YEN"):
        return "YẾN"

    # Thể tích
    if val in ("LÍT", "LIT", "LITER", "LITRE", "L"):
        return "LÍT"
    if val in ("ML", "MILILIT", "MILLILITER", "MI LI LÍT", "MILI LÍT"):
        return "ML"
    if val in ("CC", "C.C"):
        return "CC"

    # Đóng gói / bao bì
    if val in ("BAO", "TẢI", "BAO TẢI"):
        return "BAO"
    if val in ("GÓI", "GOI", "BỊCH", "BICH", "TÚI", "TUI"):
        return "GÓI"
    if val in ("CHAI", "BÌNH", "BINH", "LỌ", "LO"):
        return "CHAI"
    if val in ("THÙNG", "THUNG", "XÔ", "XO"):
        return "THÙNG"
    if val in ("VIÊN", "VIEN"):
        return "VIÊN"

    # Diện tích
    if val in ("HA", "HECTA", "HÉC TA", "HEC TA", "HECTARE"):
        return "HA"
    if val in ("M2", "M²", "MÉT VUÔNG", "MET VUONG"):
        return "M2"
    if val in ("SÀO", "SAO"):
        return "SÀO"
    if val in ("CÔNG", "CONG"):
        return "CÔNG"
    if val in ("MẪU", "MAU"):
        return "MẪU"

    return val


def normalize_activity_list(activities: list[dict]) -> list[dict]:
    """
    Chuẩn hóa danh sách hoạt động canh tác:
    - Chuyển các trường văn bản sang UPPERCASE.
    - Chuẩn hóa ngày tháng về dạng DD/MM/YYYY.
    - Chuẩn hóa đơn vị đo lường (KG, LÍT, BAO, HA...).
    - Đảm bảo Số lượng/Quantity đúng kiểu dữ liệu.
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
            if k == "Ngày/Date":
                norm_item[k] = normalize_relative_date(str(v) if v is not None else "")
            elif k == "Số lượng/Quantity":
                if v is not None and str(v).strip().upper() not in ("NULL", "NONE", ""):
                    try:
                        norm_item[k] = float(v) if "." in str(v) else int(v)
                    except (ValueError, TypeError):
                        norm_item[k] = v
                else:
                    norm_item[k] = None
            elif k == "Đơn vị/Unit":
                norm_item[k] = normalize_unit(v)
            elif k == "Ghi chú/Note":
                norm_item[k] = str(v).strip().upper() if v is not None else ""
            else:
                # Các trường string (Hoạt động, Cây trồng, Thửa ruộng, Vật tư) -> UPPERCASE
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
