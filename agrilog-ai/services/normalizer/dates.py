from services.normalizer.core.tokenizer import Tokenizer
from services.normalizer.core.parser import DateParser

def parse_date(text: str) -> str:
    """Chuyển đổi các định dạng ngày/tháng/năm thông qua Tokenizer và Grammar Parser."""
    if not text:
        return text
    
    tokens = Tokenizer.tokenize(text)
    return DateParser.parse_date_tokens(tokens)
