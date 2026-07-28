import re
from services.normalizer.core.types import Token, TokenType
from services.normalizer.rules.vocab import VOCAB, UNITS

# Các từ tiếng Việt có thể là thành phần của năm (VD: HAI KHÔNG HAI SÁU = 2026)
_YEAR_DIGIT_WORDS = {
    "KHÔNG", "MỘT", "MỐT", "HAI", "BA", "BỐN", "TƯ",
    "LĂM", "NHĂM", "SÁU", "BẢY", "TÁM", "CHÍN"
}

class Tokenizer:
    @staticmethod
    def tokenize(text: str) -> list[Token]:
        if not text:
            return []
            
        text = text.upper().strip()
        
        # Tiền xử lý các đơn vị nhiều từ trước (vd: TẤN TRÊN NĂM)
        # Sắp xếp theo độ dài giảm dần để cụm dài nhất được replace trước
        sorted_units = sorted(UNITS.items(), key=lambda x: len(x[0]), reverse=True)
        for u_phrase, (u_type, u_val) in sorted_units:
            if " " in u_phrase:
                safe_phrase = u_phrase.replace(" ", "_")
                text = re.sub(rf"\b{u_phrase}\b", safe_phrase, text)
                
        # Tách chữ và các ký tự đặc biệt
        raw_tokens = re.findall(r'\w+(?:_\w+)*|[^\w\s]', text, re.UNICODE)
        
        tokens = []
        for i, raw in enumerate(raw_tokens):
            w = raw.replace("_", " ")
            
            # Ưu tiên check unit
            if w in UNITS:
                tokens.append(Token(TokenType.UNIT, UNITS[w][1], raw))
                continue
                
            # Xử lý từ NĂM (số 5 hoặc Year)
            if w == "NĂM":
                is_digit = False
                
                # --- Look-ahead ---
                if i + 1 < len(raw_tokens):
                    next_w = raw_tokens[i+1].replace("_", " ")
                    # NĂM đứng trước hệ số nhân hoặc dấu thập phân → là số 5
                    if next_w in ["MƯƠI", "MƯỜI", "TRĂM", "NGHÌN", "NGÀN", "CHẤM", "PHẨY", "RƯỠI"]:
                        is_digit = True
                    # NĂM đứng ngay trước đơn vị đo lường → là số 5
                    elif next_w in UNITS:
                        is_digit = True
                
                # --- Look-ahead sâu: đếm chữ số theo sau ---
                # Nếu sau NĂM có ≥2 chữ số/chữ tiếng Việt liên tiếp (VD: HAI KHÔNG HAI SÁU)
                # thì đây là NĂM (Year)
                if not is_digit:
                    digit_count = 0
                    for j in range(i + 1, min(i + 5, len(raw_tokens))):
                        jw = raw_tokens[j].replace("_", " ")
                        if jw in _YEAR_DIGIT_WORDS or jw.isdigit():
                            digit_count += 1
                        else:
                            break
                    if digit_count >= 2:
                        is_digit = False  # Đây là PREFIX_YEAR, giữ nguyên
                
                # --- Look-behind ---
                if i > 0:
                    prev_w = raw_tokens[i-1].replace("_", " ")
                    # Đứng sau LẺ/LINH/SỐ/KHÔNG/CHẤM/PHẨY → số 5 (VD: "LINH NĂM", "KHÔNG NĂM", "CHẤM NĂM")
                    if prev_w in ["LẺ", "LINH", "SỐ", "KHÔNG", "CHẤM", "PHẨY"]:
                        is_digit = True
                    # Sau THÁNG/NGÀY/MỒNG → số 5 (VD: "THÁNG NĂM" = tháng 5)
                    if prev_w in ["THÁNG", "NGÀY", "MỒNG"]:
                        is_digit = True
                    # Sau MƯỜI/MƯƠI: NĂM chỉ là số 5 khi look-ahead không tìm thấy
                    # chuỗi năm (≥2 chữ số). VD: "MƯỜI NĂM" = 15, nhưng
                    # "MƯỜI NĂM HAI KHÔNG HAI SÁU" → MƯỜI (10) rồi NĂM (Year) 2026
                    if prev_w in ["MƯỜI", "MƯƠI"]:
                        # Kiểm tra look-ahead: có ≥2 chữ số ngay sau NĂM không?
                        digit_count_after = 0
                        for j in range(i + 1, min(i + 5, len(raw_tokens))):
                            jw = raw_tokens[j].replace("_", " ")
                            if jw in _YEAR_DIGIT_WORDS or jw.isdigit():
                                digit_count_after += 1
                            else:
                                break
                        if digit_count_after < 2:
                            # Không đủ chữ số để hình thành năm → NĂM là số 5 (VD: MƯỜI NĂM = 15)
                            is_digit = True
                        # else: NĂM là PREFIX_YEAR (VD: MƯỜI NĂM 2026 = tháng 10, năm 2026)
                        
                if is_digit:
                    tokens.append(Token(TokenType.DIGIT, 5, raw))
                else:
                    tokens.append(Token(TokenType.PREFIX_YEAR, None, raw))
                continue
                
            if w in VOCAB:
                t_type, t_val = VOCAB[w]
                tokens.append(Token(t_type, t_val, raw))
                continue
                
            if w.isdigit():
                tokens.append(Token(TokenType.DIGIT, int(w), raw))
                continue
                
            tokens.append(Token(TokenType.LITERAL, w, raw))
            
        return tokens
