"""
LLM Engine - quản lý llama-server (llama.cpp) chạy nền như một subprocess,
cung cấp API async để xử lý output từ STT và trả về dạng JSON có cấu trúc.

Kiến trúc:
- Khi app khởi động, start() sẽ chạy llama-server subprocess phục vụ HTTP API
    trên một port local (mặc định 8082 theo cấu hình hiện tại).
- Các request LLM đi qua HTTP POST đến endpoint /v1/chat/completions (OpenAI-
  compatible) của llama-server.
- Khi app tắt, stop() sẽ gửi SIGTERM để dọn dẹp subprocess.

Chuyển đổi số tiếng Việt → giá trị số được xử lý hoàn toàn bởi LLM thông qua
system prompt.
"""

import asyncio
import json

import logging
import signal
import time

import aiohttp

import config
from services.normalizer import normalize_activity_list

logger = logging.getLogger(__name__)


class LLMError(Exception):
    """Lỗi phát sinh trong quá trình gọi LLM."""


class LLMEngine:
    def __init__(self):
        self._session: aiohttp.ClientSession | None = None
        self._base_url = config.LLM_API_BASE_URL
        self._ready = False
        self._queue: asyncio.Queue | None = None
        self._worker_task: asyncio.Task | None = None
        self._semaphore = asyncio.Semaphore(1)  # Chỉ cho phép 1 request LLM tại 1 thời điểm

    async def start(self):
        """Tạo session HTTP, kiểm tra kết nối và khởi tạo queue worker."""
        if self._session is not None:
            logger.warning("LLM API session đã khởi tạo, bỏ qua start().")
            return

        self._session = aiohttp.ClientSession()
        self._queue = asyncio.Queue()
        self._worker_task = asyncio.create_task(self._queue_worker())

        # Kiểm tra API endpoint (health check)
        await self._wait_until_ready()
        logger.info("Kết nối tới LLM API thành công tại %s (queue worker started)", self._base_url)

    async def _wait_until_ready(self, timeout: int = 30):
        """Poll health endpoint cho đến khi server API phản hồi hoặc timeout."""
        health_url = f"{self._base_url}/health"
        start_time = time.monotonic()

        while time.monotonic() - start_time < timeout:
            try:
                async with self._session.get(health_url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                    if resp.status == 200:
                        self._ready = True
                        return
            except (aiohttp.ClientError, asyncio.TimeoutError):
                pass
            
            # API OpenAI-compatible khác có thể không có /health, thử ping models
            try:
                async with self._session.get(f"{self._base_url}/v1/models", timeout=aiohttp.ClientTimeout(total=5)) as resp:
                    if resp.status == 200:
                        self._ready = True
                        return
            except (aiohttp.ClientError, asyncio.TimeoutError):
                pass

            await asyncio.sleep(2)

        # Nếu không có phản hồi vẫn cho qua, báo warning (có thể API không có các endpoint trên)
        logger.warning(f"Không thể ping LLM API tại {self._base_url} sau {timeout}s, bỏ qua health check.")
        self._ready = True

    async def stop(self):
        """Đóng session HTTP và dừng queue worker."""
        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
            self._worker_task = None

        if self._session:
            await self._session.close()
            self._session = None

        self._ready = False

    # Schema dùng wrapper object vì llama.cpp JSON mode
    # chỉ hỗ trợ top-level object. Unwrap trong _do_post_process.
    _EXTRACT_SCHEMA = {
        "type": "json_schema",
        "json_schema": {
            "name": "farm_activity_list",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "activities": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "Hoạt động/Activity": {"type": ["string", "null"]},
                                "Cây trồng/Crop":     {"type": ["string", "null"]},
                                "Thửa ruộng/Field":    {"type": ["string", "null"]},
                                "Vật tư/Material": {"type": ["string", "null"]},
                                "Số lượng/Quantity": {"type": ["number", "null"]},
                                "Đơn vị/Unit":     {"type": ["string", "null"]},
                                "Ngày/Date":       {"type": ["string", "null"]},
                                "Ghi chú/Note":     {"type": "string"},
                            },
                            "required": [
                                "Hoạt động/Activity", "Cây trồng/Crop", "Thửa ruộng/Field",
                                "Vật tư/Material", "Số lượng/Quantity", "Đơn vị/Unit", "Ngày/Date", "Ghi chú/Note"
                            ],
                            "additionalProperties": False,
                        }
                    }
                },
                "required": ["activities"],
                "additionalProperties": False,
            },
        },
    }

    # ------------------------------------------------------------------
    # Gọi LLM (Helper chung)
    # ------------------------------------------------------------------
    async def _call_llm(self, system_prompt: str, user_content: str, schema: dict) -> dict | None:
        """
        Gửi request đến llama-server kèm JSON schema.
        Trả về dict JSON đã parse, hoặc None nếu lỗi.
        Tự động retry tối đa LLM_MAX_RETRIES lần khi gặp lỗi.
        """
        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "temperature": 0.1,
            "max_tokens": config.LLM_MAX_TOKENS,
            "stream": False,
            "response_format": {"type": "json_object"},
        }

        url = f"{self._base_url}/v1/chat/completions"
        max_retries = config.LLM_MAX_RETRIES

        for attempt in range(1, max_retries + 1):
            try:
                timeout = aiohttp.ClientTimeout(total=config.LLM_TIMEOUT_SEC)
                async with self._session.post(url, json=payload, timeout=timeout) as resp:
                    if resp.status != 200:
                        body = await resp.text()
                        logger.error(
                            "LLM server lỗi %d (lần %d/%d): %s",
                            resp.status, attempt, max_retries, body[:300],
                        )
                        if attempt < max_retries:
                            await asyncio.sleep(attempt * 2)
                            continue
                        return None

                    data = await resp.json()
                    result = data["choices"][0]["message"]["content"].strip()
                    logger.info(f"Raw LLM output (lần {attempt}): {result}")

                    if "<think>" in result:
                        parts = result.split("</think>")
                        result = parts[-1].strip() if len(parts) > 1 else result.split("<think>")[0].strip()

                    if not result:
                        logger.warning("LLM trả về kết quả rỗng (lần %d/%d).", attempt, max_retries)
                        if attempt < max_retries:
                            await asyncio.sleep(attempt * 2)
                            continue
                        return None

                    try:
                        return json.loads(result)
                    except json.JSONDecodeError as e:
                        logger.warning(
                            "Lỗi parse JSON từ LLM (lần %d/%d): %s. Result: %s",
                            attempt, max_retries, e, result[:200],
                        )
                        if attempt < max_retries:
                            await asyncio.sleep(attempt * 2)
                            continue
                        return None

            except asyncio.TimeoutError:
                logger.warning(
                    "LLM timeout sau %ds (lần %d/%d).",
                    config.LLM_TIMEOUT_SEC, attempt, max_retries,
                )
                if attempt < max_retries:
                    await asyncio.sleep(attempt * 2)
                    continue
                return None
            except Exception as e:
                logger.exception("Lỗi bất ngờ khi gọi LLM (lần %d/%d): %s", attempt, max_retries, e)
                if attempt < max_retries:
                    await asyncio.sleep(attempt * 2)
                    continue
                return None

        return None


    # ------------------------------------------------------------------
    # Trích xuất STT text -> JSON (giữ nguyên string)
    # ------------------------------------------------------------------
    async def _extract_json(self, raw_text: str) -> dict | None:
        """Gọi LLM để bóc tách và phân loại các hoạt động canh tác thành JSON array (wrapper object)."""
        system_prompt = (
            "Bạn là AI phân loại và trích xuất nhật ký hoạt động canh tác nông nghiệp từ văn bản.\n\n"
            "Quy tắc:\n"
            "- Một đoạn văn bản có thể chứa nhiều hoạt động khác nhau.\n"
            "- Tách mỗi hoạt động thành một phần tử riêng trong mảng activities.\n"
            "- Trích xuất thông tin vào đúng các trường: Hoạt động/Activity, Cây trồng/Crop, Thửa ruộng/Field, Vật tư/Material, Số lượng/Quantity, Đơn vị/Unit, Ngày/Date, Ghi chú/Note.\n"
            "- \"Số lượng/Quantity\" là kiểu số (number), không để dạng chữ.\n"
            "- Trích xuất nguyên văn thông tin ngày tháng trong văn bản (hôm nay, hôm qua, ngày mai...) vào trường \"Ngày/Date\".\n"
            "- Nếu không có thông tin thì để null.\n"
            "- \"Ghi chú/Note\" là thông tin bổ sung, không nằm trong các trường khác, nếu không có thì để chuỗi rỗng \"\".\n\n"
            "Ví dụ đầu vào:\n"
            "Hôm nay tôi làm cỏ và tưới nước cho vườn rau, sau đó bón thêm 3 kg phân hữu cơ.\n\n"
            "Ví dụ đầu ra JSON:\n"
            '{"activities": [\n'
            '  {"Hoạt động/Activity": "làm cỏ", "Cây trồng/Crop": "rau", "Thửa ruộng/Field": "vườn rau", "Vật tư/Material": null, "Số lượng/Quantity": null, "Đơn vị/Unit": null, "Ngày/Date": "hôm nay", "Ghi chú/Note": ""},\n'
            '  {"Hoạt động/Activity": "tưới nước", "Cây trồng/Crop": "rau", "Thửa ruộng/Field": "vườn rau", "Vật tư/Material": null, "Số lượng/Quantity": null, "Đơn vị/Unit": null, "Ngày/Date": "hôm nay", "Ghi chú/Note": ""},\n'
            '  {"Hoạt động/Activity": "bón phân", "Cây trồng/Crop": "rau", "Thửa ruộng/Field": "vườn rau", "Vật tư/Material": "phân hữu cơ", "Số lượng/Quantity": 3, "Đơn vị/Unit": "kg", "Ngày/Date": "hôm nay", "Ghi chú/Note": ""}\n'
            ']}'
        )
        return await self._call_llm(system_prompt, raw_text, self._EXTRACT_SCHEMA)

    # ------------------------------------------------------------------
    # Queue Worker — xử lý tuần tự các yêu cầu LLM
    # ------------------------------------------------------------------
    async def _queue_worker(self):
        """Worker vòng lặp: lấy task từ queue và xử lý tuần tự."""
        logger.info("LLM Queue Worker started.")
        while True:
            try:
                raw_text, future = await self._queue.get()
                try:
                    result = await self._do_post_process(raw_text)
                    if not future.done():
                        future.set_result(result)
                except Exception as e:
                    if not future.done():
                        future.set_exception(e)
                finally:
                    self._queue.task_done()
            except asyncio.CancelledError:
                logger.info("LLM Queue Worker stopped.")
                break

    async def post_process_stt(self, raw_text: str) -> str:
        """
        Xử lý gọi LLM qua queue.
        Nếu có nhiều yêu cầu đồng thời, chúng sẽ được xếp hàng
        và xử lý tuần tự (tránh quá tải llama-server).
        """
        if not self._ready or not self._session:
            logger.warning("LLM chưa sẵn sàng, trả về text gốc.")
            return raw_text

        if not raw_text.strip():
            return raw_text

        # Tạo Future và đẩy vào queue
        loop = asyncio.get_event_loop()
        future = loop.create_future()
        qsize = self._queue.qsize()
        if qsize > 0:
            logger.info(f"Đã có {qsize} yêu cầu trong hàng đợi LLM, xếp hàng thêm...")
        await self._queue.put((raw_text, future))

        # Chờ worker xử lý xong
        return await future

    async def _do_post_process(self, raw_text: str) -> str:
        """
        Gọi LLM, unwrap wrapper {"activities": [...]}
        và trả về JSON string của array các hoạt động.
        """
        logger.info("Bắt đầu trích xuất hoạt động canh tác...")
        result = await self._extract_json(raw_text)
        if not result:
            logger.warning("Trích xuất thất bại, trả về text gốc.")
            return raw_text

        # Unwrap wrapper {"activities": [...]} -> lấy array
        activities = result.get("activities") if isinstance(result, dict) else None
        if not activities or not isinstance(activities, list):
            logger.warning("Không có activities hợp lệ trong kết quả LLM, trả về text gốc.")
            return raw_text

        # Chuyển bước chuẩn hóa (uppercase, ngày tương đối, số lượng) sang module normalizer
        activities = normalize_activity_list(activities)

        logger.info("Trích xuất và chuẩn hóa thành công %d hoạt động.", len(activities))
        return json.dumps(activities, ensure_ascii=False, indent=2)


# Singleton dùng chung toàn app
llm_engine = LLMEngine()
