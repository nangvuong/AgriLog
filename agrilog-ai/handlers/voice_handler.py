"""
Handler xử lý khi người dùng gửi file audio (.wav) vào bot Telegram.
"""

import logging
import os
import uuid

from telegram import Update
from telegram.ext import ContextTypes

import config
from services.audio_converter import AudioConversionError, resample_to_16k_mono_pcm16
from services.llm_engine import llm_engine
from services.stt_engine import STTError, stt_engine

logger = logging.getLogger(__name__)

# Telegram giới hạn 1 tin nhắn text tối đa 4096 ký tự. Với audio dài (vd. 30
# phút), transcript rất dễ vượt mức này -> phải gửi dưới dạng file thay vì
# edit_text (nếu không sẽ lỗi khi gửi).
TELEGRAM_TEXT_LIMIT = 4096


async def handle_audio_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Nhận file audio (voice message, audio, hoặc document .wav),
    resample bằng ffmpeg, chạy STT, trả kết quả text cho người dùng.
    """
    message = update.effective_message

    # Lấy file object tuỳ theo loại người dùng gửi (voice / audio / document)
    tg_file_obj = None
    if message.voice:
        tg_file_obj = message.voice
    elif message.audio:
        tg_file_obj = message.audio
    elif message.document:
        tg_file_obj = message.document

    if tg_file_obj is None:
        await message.reply_text("Vui lòng gửi một file audio (.wav, voice message...).")
        return

    # Kiểm tra kích thước file trước khi tải
    file_size = getattr(tg_file_obj, "file_size", None) or 0
    if file_size > config.MAX_FILE_SIZE_MB * 1024 * 1024:
        await message.reply_text(
            f"File quá lớn (giới hạn {config.MAX_FILE_SIZE_MB}MB). Vui lòng gửi file nhỏ hơn."
        )
        return

    os.makedirs(config.TMP_DIR, exist_ok=True)

    # Tên file duy nhất cho mỗi request, tránh đụng độ khi nhiều người dùng cùng lúc
    job_id = uuid.uuid4().hex
    raw_path = os.path.join(config.TMP_DIR, f"{job_id}_raw")
    wav_path = os.path.join(config.TMP_DIR, f"{job_id}_16k.wav")

    processing_msg = await message.reply_text("⏳ Đang xử lý audio, vui lòng chờ...")

    try:
        # 1. Tải file gốc về
        tg_file = await tg_file_obj.get_file()
        await tg_file.download_to_drive(raw_path)

        # 2. Resample về 16kHz, mono, PCM16 bằng ffmpeg
        try:
            await resample_to_16k_mono_pcm16(raw_path, wav_path)
        except AudioConversionError as exc:
            logger.warning("Convert audio thất bại: %s", exc)
            await processing_msg.edit_text(
                "Không thể xử lý file audio này. Vui lòng kiểm tra lại định dạng file."
            )
            return

        # 3. Đẩy vào hàng đợi STT (model đã load sẵn, xử lý tuần tự)
        try:
            text = await stt_engine.transcribe(wav_path)
        except STTError as exc:
            logger.error("STT thất bại: %s", exc)
            await processing_msg.edit_text(
                "Có lỗi xảy ra khi nhận diện giọng nói. Vui lòng thử lại sau."
            )
            return

        # 4. (Tuỳ chọn) Đưa text thô qua LLM để chỉnh sửa format
        if config.LLM_ENABLED and text:
            await processing_msg.edit_text("🤖 Đang chỉnh sửa văn bản...")
            text = await llm_engine.post_process_stt(text)

        # 5. Trả kết quả
        if not text:
            await processing_msg.edit_text("Không nhận diện được nội dung trong file audio.")
        elif len(text) <= TELEGRAM_TEXT_LIMIT:
            await processing_msg.edit_text(text)
        else:
            # Kết quả quá dài để gửi trong 1 tin nhắn (thường gặp với audio
            # dài, vd. 30 phút) -> gửi dưới dạng file .txt đính kèm.
            txt_path = os.path.join(config.TMP_DIR, f"{job_id}_result.txt")
            try:
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(text)
                await processing_msg.edit_text(
                    f"Kết quả dài ({len(text)} ký tự), gửi dưới dạng file văn bản bên dưới."
                )
                with open(txt_path, "rb") as f:
                    await message.reply_document(f, filename="ket_qua.txt")
            finally:
                if os.path.exists(txt_path):
                    os.remove(txt_path)

    except Exception:  # noqa: BLE001
        logger.exception("Lỗi không xác định khi xử lý audio.")
        await processing_msg.edit_text("Đã có lỗi xảy ra, vui lòng thử lại.")

    finally:
        # 6. Luôn dọn dẹp file tạm dù thành công hay thất bại
        for path in (raw_path, wav_path):
            try:
                if os.path.exists(path):
                    os.remove(path)
            except OSError:
                logger.warning("Không xoá được file tạm: %s", path)
