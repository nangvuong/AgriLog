"""
AgriLog AI FastAPI Server (api.py)
Dịch vụ REST API dành riêng cho Web App & Mobile App:
- Nhận file âm thanh trực tiếp từ Micro trình duyệt Webapp qua API POST /api/v1/stt/transcribe
- Chuyển đổi giọng nói thành văn bản bằng mô hình sherpa-onnx (Offline VAD)
- Bóc tách tự động các Hoạt động canh tác và Danh sách Vật tư thành định dạng JSON chuẩn CSDL qua LLM
"""

from contextlib import asynccontextmanager
import json
import logging
import os
import uuid
from typing import Any, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

import config
from services.audio_converter import AudioConversionError, resample_to_16k_mono_pcm16
from services.llm_engine import llm_engine
from services.normalizer import normalize_for_webapp
from services.stt_engine import STTError, stt_engine

# Cấu hình logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger("agrilog-ai-api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Quản lý vòng đời dịch vụ FastAPI.
    Khởi tạo engine STT (sherpa-onnx) & LLM server (llama.cpp) khi ứng dụng chạy.
    """
    logger.info("🚀 Đang khởi tạo AgriLog AI WebApp API Server (api.py)...")
    os.makedirs(config.TMP_DIR, exist_ok=True)

    # 1. Khởi tạo STT Engine
    stt_engine.start()
    logger.info("✅ STT Engine (sherpa-onnx + Silero VAD) đã sẵn sàng.")

    # 2. Khởi tạo LLM Engine nếu bật
    if config.LLM_ENABLED:
        try:
            await llm_engine.start()
            logger.info("✅ LLM Engine đã khởi động thành công.")
        except Exception:
            logger.exception(
                "⚠️ Không khởi động được LLM engine. Hệ thống sẽ trả về STT text thô."
            )
    else:
        logger.info("ℹ️ LLM post-processing tắt (LLM_ENABLED=false).")

    yield

    # Tắt dịch vụ
    logger.info("🛑 Đang dừng AgriLog AI API Server...")
    await llm_engine.stop()
    await stt_engine.stop()
    logger.info("👋 Dịch vụ AI API đã dừng hoàn toàn.")


# Khởi tạo FastAPI app
app = FastAPI(
    title="AgriLog AI WebApp STT & LLM API",
    description="REST API Dịch vụ Chuyển đổi Giọng nói thành Nhật ký Canh tác cho Webapp",
    version="1.0.0",
    lifespan=lifespan,
)

# Kích hoạt CORS cho Webapp truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Schemas
class ProcessTextRequest(BaseModel):
    text: str = Field(
        ...,
        description="Văn bản thô từ nông dân (VD: Phun thuốc Regent 50ml và Bón phân NPK 2 bao cho Lô A2)",
        example="Phun thuốc Regent 50ml và Bón phân NPK 2 bao cho Lô A2",
    )


class STTResponse(BaseModel):
    status: str = Field(..., example="success")
    raw_text: str = Field(..., description="Chuỗi văn bản giọng nói vừa nhận diện (STT)")
    parsed_data: Optional[Any] = Field(
        None, description="Cấu trúc dữ liệu Nhật ký JSON chuẩn CSDL"
    )
    llm_output_text: Optional[str] = Field(
        None, description="Chuỗi JSON thô từ LLM"
    )


@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
async def health_check():
    """Kiểm tra trạng thái hoạt động của máy chủ AI FastAPI."""
    return {
        "status": "online",
        "service": "AgriLog AI WebApp Service (api.py)",
        "stt_engine": "sherpa-onnx + Silero VAD",
        "llm_enabled": config.LLM_ENABLED,
    }


@app.post(
    "/api/v1/stt/transcribe",
    response_model=STTResponse,
    status_code=status.HTTP_200_OK,
    tags=["Speech-to-Text WebApp API"],
    summary="API nhận file âm thanh thu âm từ Webapp, nhận diện giọng nói và bóc tách dữ liệu",
)
async def transcribe_audio_api(
    file: UploadFile = File(..., description="File âm thanh thu từ Micro trình duyệt Webapp (.webm, .wav, .m4a, .ogg, .mp3)"),
    process_llm: bool = Form(
        True, description="Có chạy LLM bóc tách dữ liệu nhật ký thành JSON hay không"
    ),
):
    """
    Endpoint chính tiếp nhận file ghi âm từ WebApp:
    1. Tiếp nhận file audio từ MediaRecorder trình duyệt.
    2. Resample về 16kHz mono PCM16 bằng FFmpeg.
    3. Nhận diện giọng nói tiếng Việt bằng sherpa-onnx.
    4. Chạy LLM trích xuất các hoạt động & vật tư thành JSON chuẩn CSDL.
    """
    job_id = uuid.uuid4().hex
    raw_filename = f"{job_id}_{file.filename or 'audio.webm'}"
    raw_path = os.path.join(config.TMP_DIR, raw_filename)
    wav_path = os.path.join(config.TMP_DIR, f"{job_id}_16k.wav")

    try:
        # 1. Đọc nội dung file audio gửi từ Webapp
        contents = await file.read()
        if not contents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File âm thanh từ Webapp bị rỗng (0 bytes).",
            )

        with open(raw_path, "wb") as f:
            f.write(contents)

        # 2. Resample file âm thanh về 16kHz mono PCM16 bằng FFmpeg
        try:
            await resample_to_16k_mono_pcm16(raw_path, wav_path)
        except AudioConversionError as exc:
            logger.warning(f"Chuyển đổi định dạng âm thanh thất bại: {exc}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Không thể định dạng file audio từ trình duyệt: {str(exc)}",
            )

        # 3. Chạy mô hình nhận diện giọng nói STT (sherpa-onnx)
        try:
            raw_text = await stt_engine.transcribe(wav_path)
        except STTError as exc:
            logger.error(f"Lỗi nhận diện giọng nói: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Lỗi khi xử lý giọng nói: {str(exc)}",
            )

        if not raw_text or not raw_text.strip():
            return STTResponse(
                status="success",
                raw_text="",
                parsed_data=[],
                llm_output_text=None,
            )

        # 4. Chạy mô hình LLM bóc tách câu chữ thành JSON
        parsed_data = None
        llm_output_text = None

        if process_llm and config.LLM_ENABLED:
            try:
                llm_output_text = await llm_engine.post_process_stt(raw_text)
                try:
                    flat_activities = json.loads(llm_output_text)
                    # Chuyển flat LLM output → grouped hoat_dong_list cho webapp/DB
                    if isinstance(flat_activities, list):
                        parsed_data = normalize_for_webapp(flat_activities)
                    else:
                        parsed_data = flat_activities
                except json.JSONDecodeError:
                    parsed_data = llm_output_text
            except Exception as exc:
                logger.warning(f"Lỗi LLM post-processing: {exc}")
                llm_output_text = str(exc)

        return STTResponse(
            status="success",
            raw_text=raw_text,
            parsed_data=parsed_data,
            llm_output_text=llm_output_text,
        )

    finally:
        # Dọn dẹp file tạm
        for path in (raw_path, wav_path):
            if os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass


@app.post(
    "/api/v1/stt/process-text",
    response_model=STTResponse,
    status_code=status.HTTP_200_OK,
    tags=["Nông vụ LLM Parsing"],
    summary="Bóc tách văn bản chữ gõ thành định dạng JSON CSDL",
)
async def process_text_api(payload: ProcessTextRequest):
    """
    Nhận chuỗi văn bản gõ từ WebApp và trích xuất qua LLM.
    """
    raw_text = payload.text.strip()
    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Văn bản không được để trống.",
        )

    parsed_data = None
    llm_output_text = None

    if config.LLM_ENABLED:
        try:
            llm_output_text = await llm_engine.post_process_stt(raw_text)
            try:
                flat_activities = json.loads(llm_output_text)
                # Chuyển flat LLM output → grouped hoat_dong_list cho webapp/DB
                if isinstance(flat_activities, list):
                    parsed_data = normalize_for_webapp(flat_activities)
                else:
                    parsed_data = flat_activities
            except json.JSONDecodeError:
                parsed_data = llm_output_text
        except Exception as exc:
            logger.warning(f"Lỗi LLM processing: {exc}")
            llm_output_text = str(exc)

    return STTResponse(
        status="success",
        raw_text=raw_text,
        parsed_data=parsed_data,
        llm_output_text=llm_output_text,
    )


if __name__ == "__main__":
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=int(os.getenv("AI_PORT", "8000")),
        reload=True,
    )
