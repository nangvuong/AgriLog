"""
Điểm khởi động của bot: load model STT (1 lần), khởi tạo bot Telegram,
đăng ký handler, chạy polling.
"""

import logging

from telegram.ext import Application, MessageHandler, filters

import config
from handlers.voice_handler import handle_audio_message
from services.llm_engine import llm_engine
from services.stt_engine import stt_engine

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


async def on_startup(app: Application):
    # Khởi động worker xử lý hàng đợi STT khi bot bắt đầu chạy
    stt_engine.start()

    # Khởi động LLM server (llama.cpp) nếu được bật
    if config.LLM_ENABLED:
        try:
            await llm_engine.start()
        except Exception:
            logger.exception(
                "Không khởi động được LLM server. Bot vẫn chạy nhưng "
                "sẽ trả về text STT thô (không qua LLM chỉnh sửa)."
            )
    else:
        logger.info("LLM post-processing đã tắt (LLM_ENABLED=false).")

    logger.info("Bot đã sẵn sàng nhận file audio.")


async def on_shutdown(app: Application):
    await llm_engine.stop()
    await stt_engine.stop()


def main():
    application = (
        Application.builder()
        .token(config.TELEGRAM_BOT_TOKEN)
        .post_init(on_startup)
        .post_shutdown(on_shutdown)
        .build()
    )

    # Nhận voice message, audio, hoặc document (ví dụ file .wav gửi dạng file)
    application.add_handler(
        MessageHandler(
            filters.VOICE | filters.AUDIO | filters.Document.ALL,
            handle_audio_message,
        )
    )

    logger.info("Bot đang khởi động (polling)...")
    application.run_polling(allowed_updates=["message"])


if __name__ == "__main__":
    main()
