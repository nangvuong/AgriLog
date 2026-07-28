"""
Đọc toàn bộ cấu hình từ biến môi trường (.env).
Không hardcode token hay đường dẫn model trong code.
"""

import os
from dotenv import load_dotenv

# Nạp file .env nếu có (khi chạy local). Trên server có thể set env trực tiếp.
load_dotenv()


def _require(name: str) -> str:
    """Lấy biến môi trường bắt buộc, báo lỗi rõ ràng nếu thiếu."""
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Thiếu biến môi trường bắt buộc: {name}")
    return value


# ----- Telegram -----
TELEGRAM_BOT_TOKEN = _require("TELEGRAM_BOT_TOKEN")

# ----- sherpa-onnx model -----
TOKENS_PATH = os.getenv("TOKENS_PATH", "models/tokens.txt")
ENCODER_PATH = os.getenv("ENCODER_PATH", "models/encoder.int8.onnx")
DECODER_PATH = os.getenv("DECODER_PATH", "models/decoder.onnx")
JOINER_PATH = os.getenv("JOINER_PATH", "models/joiner.int8.onnx")
NUM_THREADS = int(os.getenv("NUM_THREADS", "4"))

# ----- sherpa-onnx VAD (dùng để cắt audio dài thành từng đoạn có tiếng nói
# trước khi đưa vào OfflineRecognizer, tránh decode nguyên khối audio dài) -----
VAD_MODEL_PATH = os.getenv("VAD_MODEL_PATH", "models/silero_vad.onnx")
VAD_THRESHOLD = float(os.getenv("VAD_THRESHOLD", "0.5"))
VAD_MIN_SILENCE_SEC = float(os.getenv("VAD_MIN_SILENCE_SEC", "0.5"))
VAD_MIN_SPEECH_SEC = float(os.getenv("VAD_MIN_SPEECH_SEC", "0.25"))
# Độ dài tối đa 1 đoạn (giây) dù không có khoảng lặng - chặn trường hợp nói
# liên tục không nghỉ khiến 1 đoạn quá dài, ảnh hưởng chất lượng decode.
VAD_MAX_SPEECH_SEC = float(os.getenv("VAD_MAX_SPEECH_SEC", "25"))
VAD_WINDOW_SIZE = int(os.getenv("VAD_WINDOW_SIZE", "512"))

# ----- Audio -----
TARGET_SAMPLE_RATE = 16000

# ----- Thư mục tạm -----
TMP_DIR = os.getenv("TMP_DIR", "tmp")

# ----- Giới hạn -----
# LƯU Ý QUAN TRỌNG: Telegram Bot API bản cloud (mặc định) chỉ cho bot tải
# (getFile/download) file tối đa 20MB, BẤT KỂ giá trị MAX_FILE_SIZE_MB đặt
# ở đây. Muốn nhận file audio 30 phút (thường 50-100MB+ tuỳ định dạng gốc),
# bắt buộc phải tự host Local Bot API Server
# (https://github.com/tdlib/telegram-bot-api) - khi đó giới hạn tải file
# mới lên tới 2000MB. Giá trị dưới đây đặt theo mức trần đó.
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "2000"))
# ffmpeg convert 1 file dài (vd. 30 phút, nhiều định dạng nén) hiếm khi mất
# quá vài phút, nhưng để dư thời gian phòng server yếu / file rất dài.
FFMPEG_TIMEOUT_SEC = int(os.getenv("FFMPEG_TIMEOUT_SEC", "1800"))  # 30 phút
# STT chạy CPU, với audio ~30 phút (đã cắt VAD) có thể mất nhiều phút tuỳ
# cấu hình máy; đặt timeout rộng để không bị huỷ giữa chừng.
STT_TIMEOUT_SEC = int(os.getenv("STT_TIMEOUT_SEC", "3600"))  # 60 phút

# ----- LLM (External API) -----
# Đường dẫn API tương thích OpenAI (Ví dụ: http://127.0.0.1:8082)
LLM_API_BASE_URL = os.getenv("LLM_API_BASE_URL", "http://127.0.0.1:8082")
# Số token tối đa cho mỗi request LLM (tương ứng với độ dài input + output).
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "2048"))
# Timeout cho mỗi request LLM (giây)
LLM_TIMEOUT_SEC = int(os.getenv("LLM_TIMEOUT_SEC", "120"))
# Số lần thử lại tối đa khi gặp lỗi (timeout, lỗi server, JSON parse lỗi)
LLM_MAX_RETRIES = int(os.getenv("LLM_MAX_RETRIES", "3"))
# Bật/tắt LLM post-processing (đặt false nếu chỉ muốn STT thô)
LLM_ENABLED = os.getenv("LLM_ENABLED", "true").lower() in ("true", "1", "yes")

