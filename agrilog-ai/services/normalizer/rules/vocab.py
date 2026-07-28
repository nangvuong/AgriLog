from services.normalizer.core.types import TokenType

# Từ điển ánh xạ từ vựng tiếng Việt sang token
VOCAB = {
    # Digits
    "KHÔNG": (TokenType.DIGIT, 0),
    "LẺ": (TokenType.DIGIT, 0),
    "LINH": (TokenType.DIGIT, 0),
    "MỘT": (TokenType.DIGIT, 1),
    "MỐT": (TokenType.DIGIT, 1),
    "HAI": (TokenType.DIGIT, 2),
    "BA": (TokenType.DIGIT, 3),
    "BỐN": (TokenType.DIGIT, 4),
    "TƯ": (TokenType.DIGIT, 4),
    "NĂM": (TokenType.DIGIT, 5),
    "LĂM": (TokenType.DIGIT, 5),
    "NHĂM": (TokenType.DIGIT, 5),
    "SÁU": (TokenType.DIGIT, 6),
    "BẢY": (TokenType.DIGIT, 7),
    "TÁM": (TokenType.DIGIT, 8),
    "CHÍN": (TokenType.DIGIT, 9),
    
    # Multipliers
    "MƯỜI": (TokenType.MULTIPLIER, 10),
    "MƯƠI": (TokenType.MULTIPLIER, 10),
    "TRĂM": (TokenType.MULTIPLIER, 100),
    "NGHÌN": (TokenType.MULTIPLIER, 1000),
    "NGÀN": (TokenType.MULTIPLIER, 1000),
    
    # Decimals
    "CHẤM": (TokenType.DECIMAL, "."),
    "PHẨY": (TokenType.DECIMAL, "."),
    "RƯỠI": (TokenType.DECIMAL, ".5"),
    
    # Prefixes
    "NGÀY": (TokenType.PREFIX_DAY, None),
    "MỒNG": (TokenType.PREFIX_DAY, None),
    "THÁNG": (TokenType.PREFIX_MONTH, None),
    
    # Chữ "NĂM" (Year) bị trùng lặp với số 5. Tokenizer sẽ xử lý dựa trên ngữ cảnh.
    # Mặc định ta sẽ ưu tiên xét ngữ cảnh bằng parser.
    # Trong bộ vocab này ta để riêng 1 mục YEAR để tham chiếu nếu cần
    "YEAR_PREFIX": (TokenType.PREFIX_YEAR, None),
    
    # Tháng theo chữ
    "GIÊNG": (TokenType.DIGIT, 1),
    "CHẠP": (TokenType.DIGIT, 12),
}

UNITS = {
    "HA": (TokenType.UNIT, "HA"),
    "TẤN": (TokenType.UNIT, "TẤN"),
    "TRÊN NĂM": (TokenType.UNIT, "/NĂM"),
    "/NĂM": (TokenType.UNIT, "/NĂM"),
    "TẤN TRÊN NĂM": (TokenType.UNIT, "TẤN /NĂM"),
    "TẤN/NĂM": (TokenType.UNIT, "TẤN /NĂM"),
}
