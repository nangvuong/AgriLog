"""
STT Engine - load model sherpa-onnx MỘT LẦN khi khởi động,
sau đó xử lý tất cả request tuần tự thông qua một hàng đợi (asyncio.Queue).

Cách 1: Hàng đợi (Queue) xử lý tuần tự
- Chỉ có 1 recognizer instance dùng chung cho toàn bộ app.
- Một worker duy nhất (background task) liên tục lấy job từ queue,
  chạy inference, rồi trả kết quả về cho người gọi thông qua Future.
- Nhiều request đến cùng lúc sẽ tự động được xếp hàng, xử lý lần lượt,
  không có race condition vì chỉ 1 nơi duy nhất đụng vào recognizer.
"""

import asyncio
import logging
import wave
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field

import numpy as np
import sherpa_onnx

import config

logger = logging.getLogger(__name__)


class STTError(Exception):
    """Lỗi phát sinh trong quá trình nhận diện giọng nói."""


@dataclass
class _Job:
    """Một job trong hàng đợi: đường dẫn audio + Future để trả kết quả."""
    audio_path: str
    future: "asyncio.Future[str]"


class STTEngine:
    def __init__(self):
        logger.info("Đang load model sherpa-onnx (chỉ chạy 1 lần lúc khởi động)...")

        self._recognizer = sherpa_onnx.OfflineRecognizer.from_transducer(
            tokens=config.TOKENS_PATH,
            encoder=config.ENCODER_PATH,
            decoder=config.DECODER_PATH,
            joiner=config.JOINER_PATH,
            num_threads=config.NUM_THREADS,
            sample_rate=config.TARGET_SAMPLE_RATE,
            feature_dim=80,
        )

        logger.info("Model STT đã load xong.")

        # ----- VAD (Voice Activity Detector) -----
        # Dùng để cắt audio dài (vd. 30 phút) thành nhiều đoạn có tiếng nói
        # trước khi đưa từng đoạn vào OfflineRecognizer. OfflineRecognizer
        # là model non-streaming, không phù hợp để decode nguyên khối audio
        # rất dài trong 1 lần (tốn RAM, độ chính xác giảm). VAD giúp cắt tại
        # các khoảng lặng (hoặc tối đa VAD_MAX_SPEECH_SEC nếu nói liên tục
        # không nghỉ), gần giống cách "sherpa-onnx-vad-with-offline-asr".
        logger.info("Đang load model VAD (silero-vad)...")

        vad_config = sherpa_onnx.VadModelConfig()
        vad_config.silero_vad.model = config.VAD_MODEL_PATH
        vad_config.silero_vad.threshold = config.VAD_THRESHOLD
        vad_config.silero_vad.min_silence_duration = config.VAD_MIN_SILENCE_SEC
        vad_config.silero_vad.min_speech_duration = config.VAD_MIN_SPEECH_SEC
        vad_config.silero_vad.max_speech_duration = config.VAD_MAX_SPEECH_SEC
        vad_config.silero_vad.window_size = config.VAD_WINDOW_SIZE
        vad_config.sample_rate = config.TARGET_SAMPLE_RATE
        vad_config.num_threads = 1

        if not vad_config.validate():
            raise RuntimeError(
                "Cấu hình VAD không hợp lệ - kiểm tra lại VAD_MODEL_PATH "
                f"('{config.VAD_MODEL_PATH}') có tồn tại không."
            )

        # buffer_size_in_seconds phải đủ lớn để chứa 1 đoạn speech dài nhất
        # (VAD_MAX_SPEECH_SEC) cộng thêm khoảng đệm an toàn.
        self._vad = sherpa_onnx.VoiceActivityDetector(
            vad_config, buffer_size_in_seconds=config.VAD_MAX_SPEECH_SEC + 10
        )

        logger.info("Model VAD đã load xong.")

        # Hàng đợi job. maxsize có thể giới hạn nếu muốn chặn spam
        # (ví dụ maxsize=50 -> quá số này sẽ phải chờ put()).
        self._queue: "asyncio.Queue[_Job]" = asyncio.Queue()

        # Chỉ dùng 1 thread để chạy inference (phù hợp vì chỉ có 1 recognizer,
        # xử lý tuần tự, không cần và không nên chạy song song trên
        # cùng 1 instance).
        self._executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="stt-worker")

        self._worker_task: "asyncio.Task | None" = None

    def start(self):
        """Khởi động worker task xử lý queue. Gọi 1 lần khi app start."""
        if self._worker_task is None:
            self._worker_task = asyncio.create_task(self._worker_loop())
            logger.info("STT worker đã khởi động, sẵn sàng nhận job.")

    async def stop(self):
        """Dừng worker (gọi khi tắt bot)."""
        if self._worker_task is not None:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
        self._executor.shutdown(wait=False)

    async def _worker_loop(self):
        """
        Vòng lặp chạy nền: liên tục lấy job từ queue và xử lý TUẦN TỰ.
        Đây là nơi duy nhất được phép gọi self._recognizer, nên không
        cần lock: bản chất hàng đợi + 1 worker đã đảm bảo tuần tự.
        """
        while True:
            job = await self._queue.get()
            try:
                loop = asyncio.get_running_loop()
                text = await loop.run_in_executor(
                    self._executor, self._transcribe_sync, job.audio_path
                )
                if not job.future.cancelled():
                    job.future.set_result(text)
            except Exception as exc:  # noqa: BLE001
                logger.exception("Lỗi khi xử lý STT job: %s", job.audio_path)
                if not job.future.cancelled():
                    job.future.set_exception(STTError(str(exc)))
            finally:
                self._queue.task_done()

    def _split_by_vad(self, samples: np.ndarray) -> "list[np.ndarray]":
        """
        Chạy VAD trên toàn bộ audio, trả về danh sách các đoạn (mảng samples)
        có tiếng nói. Đây là nơi DUY NHẤT được phép dùng self._vad, và luôn
        chạy trong cùng thread với self._recognizer (executor 1 worker) nên
        không cần lock, giống cách tổ chức của recognizer.
        """
        self._vad.reset()

        window_size = config.VAD_WINDOW_SIZE
        num_samples = len(samples)
        segments: "list[np.ndarray]" = []

        i = 0
        while i + window_size <= num_samples:
            self._vad.accept_waveform(samples[i : i + window_size])
            i += window_size
            while not self._vad.empty():
                seg = self._vad.front
                segments.append(np.asarray(seg.samples, dtype=np.float32))
                self._vad.pop()

        # Đẩy nốt phần đuôi còn buffer trong VAD ra (đoạn nói cuối cùng nếu
        # audio kết thúc mà chưa có khoảng lặng theo sau).
        self._vad.flush()
        while not self._vad.empty():
            seg = self._vad.front
            segments.append(np.asarray(seg.samples, dtype=np.float32))
            self._vad.pop()

        return segments

    def _transcribe_sync(self, audio_path: str) -> str:
        """
        Hàm blocking thực sự chạy inference. Chạy trong thread riêng
        (executor), không chạy trực tiếp trên event loop chính.

        Với audio dài, thay vì decode nguyên khối, ta dùng VAD để cắt
        thành nhiều đoạn ngắn (có tiếng nói), decode từng đoạn rồi ghép
        text lại theo đúng thứ tự. Việc này giúp:
        - Tránh đưa audio quá dài vào 1 lần decode (OfflineRecognizer vốn
          thiết kế cho câu/đoạn ngắn).
        - Bỏ qua khoảng lặng dài (không tốn thời gian decode vô ích).
        """
        samples, sample_rate = _read_wav_pcm16_mono(audio_path)

        segments = self._split_by_vad(samples)

        if not segments:
            # VAD không tách được đoạn nào có thể do audio quá ngắn (dưới
            # 1 window) hoặc không đủ để VAD nhận diện -> fallback: decode
            # nguyên file như cũ để không bỏ sót nội dung.
            segments = [samples]

        texts: "list[str]" = []
        total = len(segments)
        for idx, seg_samples in enumerate(segments, start=1):
            stream = self._recognizer.create_stream()
            stream.accept_waveform(sample_rate, seg_samples)
            self._recognizer.decode_stream(stream)
            seg_text = stream.result.text.strip()
            if seg_text:
                texts.append(seg_text)
            logger.info("STT: đã xử lý đoạn %d/%d.", idx, total)

        return " ".join(texts).strip()

    async def transcribe(self, audio_path: str) -> str:
        """
        Cổng vào public: đẩy job vào queue và chờ kết quả.
        Nhiều request gọi hàm này cùng lúc sẽ tự xếp hàng, xử lý lần lượt.
        """
        loop = asyncio.get_running_loop()
        future: "asyncio.Future[str]" = loop.create_future()
        job = _Job(audio_path=audio_path, future=future)

        await self._queue.put(job)
        logger.info(
            "Đã đẩy job vào hàng đợi (đang có %d job chờ xử lý).",
            self._queue.qsize(),
        )

        try:
            return await asyncio.wait_for(future, timeout=config.STT_TIMEOUT_SEC)
        except asyncio.TimeoutError:
            future.cancel()
            raise STTError("Xử lý STT quá thời gian cho phép (timeout).")


def _read_wav_pcm16_mono(path: str) -> tuple[np.ndarray, int]:
    """
    Đọc file .wav (đã được ffmpeg chuẩn hoá 16kHz/mono/PCM16 trước đó)
    thành mảng float32 trong khoảng [-1, 1] mà sherpa-onnx yêu cầu.
    """
    with wave.open(path, "rb") as wf:
        sample_rate = wf.getframerate()
        n_frames = wf.getnframes()
        raw = wf.readframes(n_frames)

    samples_int16 = np.frombuffer(raw, dtype=np.int16)
    samples_float32 = samples_int16.astype(np.float32) / 32768.0
    return samples_float32, sample_rate


# Singleton dùng chung toàn app - import module này ở đâu cũng ra cùng 1 instance.
stt_engine = STTEngine()
