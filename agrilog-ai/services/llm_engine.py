"""
LLM Engine - Tích hợp Google AI Studio (Gemini API generateContent),
cung cấp API async để xử lý output từ STT và trả về dạng JSON có cấu trúc.

Kiến trúc:
- Khi app khởi động, start() sẽ kiểm tra kết nối tới Google AI API
  tại GEMINI_API_BASE_URL (mặc định https://generativelanguage.googleapis.com).
- Các request LLM đi qua HTTP POST đến endpoint /v1beta/models/{model}:generateContent
  với responseMimeType="application/json".
- Khi app tắt, stop() đóng ClientSession HTTP.

Chuyển đổi số tiếng Việt → giá trị số được xử lý hoàn toàn bởi LLM thông qua
system prompt.

Schema trích xuất được thiết kế để khớp 1:1 với cấu trúc database PostgreSQL
(bảng hoat_dong_canh_tac + chi_tiet_vat_tu_su_dung + lo_dat + vu_mua).
"""

import asyncio
import json
import logging
import signal
import ssl
import time

import aiohttp
try:
    import certifi
    _SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    _SSL_CONTEXT = ssl.create_default_context()

import config
from services.normalizer import normalize_activity_list

logger = logging.getLogger(__name__)


class LLMError(Exception):
    """Lỗi phát sinh trong quá trình gọi LLM."""


class LLMEngine:
    def __init__(self):
        self._session: aiohttp.ClientSession | None = None
        self._base_url = config.GEMINI_API_BASE_URL
        self._ready = False
        self._queue: asyncio.Queue | None = None
        self._worker_task: asyncio.Task | None = None
        self._semaphore = asyncio.Semaphore(1)  # Chỉ cho phép 1 request LLM tại 1 thời điểm

    async def start(self):
        """Tạo session HTTP, kiểm tra kết nối và khởi tạo queue worker."""
        if self._session is not None:
            logger.warning("LLM API session đã khởi tạo, bỏ qua start().")
            return

        connector = aiohttp.TCPConnector(ssl=_SSL_CONTEXT)
        self._session = aiohttp.ClientSession(connector=connector)
        self._queue = asyncio.Queue()
        self._worker_task = asyncio.create_task(self._queue_worker())

        # Kiểm tra API endpoint (health check)
        await self._wait_until_ready()
        logger.info("Kết nối tới LLM API thành công tại %s (queue worker started)", self._base_url)

    async def _wait_until_ready(self, timeout: int = 30):
        """Poll endpoint cho đến khi Google AI API phản hồi hoặc timeout."""
        models_url = f"{self._base_url}/v1beta/models?key={config.GEMINI_API_KEY}"
        start_time = time.monotonic()

        while time.monotonic() - start_time < timeout:
            try:
                async with self._session.get(models_url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                    if resp.status in (200, 400, 401, 403):
                        self._ready = True
                        return
            except (aiohttp.ClientError, asyncio.TimeoutError):
                pass

            await asyncio.sleep(2)

        logger.warning("Không thể ping Google AI API tại %s sau %ds, bỏ qua health check.", self._base_url, timeout)
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

    # ------------------------------------------------------------------
    # JSON Schema trích xuất — Khớp 1:1 với CSDL PostgreSQL agrilog_schema.sql
    # ------------------------------------------------------------------
    # Bảng activity & activity_type (bảng 8, 9): loai_hoat_dong, ngay_thuc_hien, mo_ta, thoi_tiet
    # Bảng plot & crop (bảng 5, 6): ma_lo, cay_trong, giong_buoi
    # Bảng material & activity_material (bảng 13, 14): Array materials[]
    # Bảng asset & activity_asset (bảng 16, 17): Array assets[]
    # Bảng observation (bảng 18): Array observations[]
    # Bảng harvest (bảng 19): Array harvests[]
    # ------------------------------------------------------------------
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
                                # --- Bảng activity & activity_type ---
                                "loai_hoat_dong": {
                                    "type": "string",
                                    "enum": [
                                        "bon_phan", "phun_thuoc", "tuoi_nuoc",
                                        "cat_tia", "tia_canh", "lam_co", "be_qua",
                                        "sau_benh", "kiem_tra_sau_benh", "thu_hoach", "khac"
                                    ],
                                },
                                "ngay_thuc_hien": {"type": ["string", "null"]},
                                "mo_ta":          {"type": ["string", "null"]},
                                "thoi_tiet":      {"type": ["string", "null"]},

                                # --- Bảng plot & crop ---
                                "ma_lo":      {"type": ["string", "null"]},
                                "cay_trong":  {"type": ["string", "null"]},
                                "giong_buoi": {"type": ["string", "null"]},

                                # --- Bảng material & activity_material (array, >= 0 items) ---
                                "materials": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "ten_vat_tu": {"type": "string"},
                                            "loai_vat_tu": {
                                                "type": ["string", "null"],
                                                "enum": ["phan_bon", "thuoc_bvtv", "che_pham_sinh_hoc", "khac", None],
                                            },
                                            "lieu_luong": {"type": ["number", "null"]},
                                            "don_vi":     {"type": ["string", "null"]},
                                        },
                                        "required": ["ten_vat_tu", "loai_vat_tu", "lieu_luong", "don_vi"],
                                        "additionalProperties": False,
                                    },
                                },

                                # --- Bảng asset & activity_asset (array, >= 0 items) ---
                                "assets": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "ten_cong_cu":       {"type": "string"},
                                            "thoi_gian_su_dung": {"type": ["number", "null"]},
                                        },
                                        "required": ["ten_cong_cu", "thoi_gian_su_dung"],
                                        "additionalProperties": False,
                                    },
                                },

                                # --- Bảng observation (array, >= 0 items) ---
                                "observations": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "trieu_chung": {"type": "string"},
                                            "muc_do": {
                                                "type": ["string", "null"],
                                                "enum": ["LOW", "MEDIUM", "HIGH", None],
                                            },
                                            "mo_ta_sau_benh": {"type": ["string", "null"]},
                                        },
                                        "required": ["trieu_chung", "muc_do", "mo_ta_sau_benh"],
                                        "additionalProperties": False,
                                    },
                                },

                                # --- Bảng harvest (array, >= 0 items) ---
                                "harvests": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "san_luong_thu_hoach": {"type": ["number", "null"]},
                                            "don_vi_thu_hoach":    {"type": ["string", "null"]},
                                            "pham_cap":            {"type": ["string", "null"]},
                                            "thuong_lai":          {"type": ["string", "null"]},
                                            "gia_ban":             {"type": ["number", "null"]},
                                        },
                                        "required": ["san_luong_thu_hoach", "don_vi_thu_hoach", "pham_cap", "thuong_lai", "gia_ban"],
                                        "additionalProperties": False,
                                    },
                                },
                            },
                            "required": [
                                "loai_hoat_dong", "ngay_thuc_hien", "mo_ta",
                                "thoi_tiet", "ma_lo", "cay_trong", "giong_buoi",
                                "materials", "assets", "observations", "harvests",
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
        Gửi request đến Cerebras Cloud API (OpenAI-compatible) kèm JSON schema.
        Trả về dict JSON đã parse, hoặc None nếu lỗi.
        Tự động retry tối đa LLM_MAX_RETRIES lần khi gặp lỗi.
        """
        base_url = self._base_url.rstrip("/")
        url = f"{base_url}/v1beta/models/{config.GEMINI_MODEL}:generateContent?key={config.GEMINI_API_KEY}"
        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_content}]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": config.LLM_MAX_TOKENS,
                "responseMimeType": "application/json",
            },
        }
        headers = {
            "Content-Type": "application/json",
        }
        max_retries = config.LLM_MAX_RETRIES

        for attempt in range(1, max_retries + 1):
            try:
                timeout = aiohttp.ClientTimeout(total=config.LLM_TIMEOUT_SEC)
                async with self._session.post(url, json=payload, headers=headers, timeout=timeout) as resp:
                    if resp.status != 200:
                        body = await resp.text()
                        if resp.status in (400, 401, 403):
                            logger.error(
                                "Lỗi xác thực/client (%d) từ Google AI API (không retry): %s",
                                resp.status, body[:300],
                            )
                            return None
                        if resp.status == 429:
                            logger.warning("Google AI API bị giới hạn tần suất (429), sẽ thử lại...")
                        else:
                            logger.error(
                                "Google AI server lỗi %d (lần %d/%d): %s",
                                resp.status, attempt, max_retries, body[:300],
                            )
                        if attempt < max_retries:
                            await asyncio.sleep(attempt * 2)
                            continue
                        return None

                    data = await resp.json()
                    candidates = data.get("candidates", [])
                    if not candidates:
                        logger.warning("Google AI trả về rỗng không có candidate (lần %d/%d): %s", attempt, max_retries, data)
                        if attempt < max_retries:
                            await asyncio.sleep(attempt * 2)
                            continue
                        return None

                    parts = candidates[0].get("content", {}).get("parts", [])
                    result = parts[0].get("text", "").strip() if parts else ""
                    logger.info(f"Raw LLM output (lần {attempt}): {result}")

                    if "<think>" in result:
                        parts = result.split("</think>")
                        result = parts[-1].strip() if len(parts) > 1 else result.split("<think>")[0].strip()

                    # Loại bỏ markdown fences nếu mô hình trả về block ```json ... ```
                    if result.startswith("```"):
                        lines = result.splitlines()
                        if lines[0].startswith("```"):
                            lines = lines[1:]
                        if lines and lines[-1].startswith("```"):
                            lines = lines[:-1]
                        result = "\n".join(lines).strip()

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
    # Trích xuất STT text -> JSON (theo cấu trúc CSDL nhật ký bưởi)
    # ------------------------------------------------------------------
    async def _extract_json(self, raw_text: str) -> dict | None:
        """
        Gọi LLM để bóc tách và phân loại các hoạt động canh tác nông nghiệp từ
        văn bản thành JSON array. Các trường trích xuất khớp 1:1 với các bảng
        trong cơ sở dữ liệu PostgreSQL agrilog_schema.sql.
        """
        system_prompt = (
            "Bạn là AI chuyên gia trích xuất nhật ký hoạt động canh tác nông nghiệp "
            "(cây ăn trái, bưởi, lúa, rau màu...) từ giọng nói nông dân Việt Nam.\n\n"

            "## Quy tắc trích xuất\n"
            "- Một đoạn văn bản có thể chứa NHIỀU hoạt động khác nhau. Tách mỗi loại hoạt động thành một phần tử riêng trong mảng activities.\n"
            "- Mỗi hoạt động chứa các MẢNG (arrays) con: materials, assets, observations, harvests.\n"
            "- Nếu hoạt động không có vật tư/công cụ/quan sát/thu hoạch, đặt mảng tương ứng là rỗng [].\n"
            "- Một hoạt động CÓ THỂ có nhiều vật tư, nhiều công cụ, nhiều loại sâu bệnh, nhiều đợt thu hoạch.\n\n"

            "### 1. Thông tin chung hoạt động (bảng activity & activity_type)\n"
            '  - "loai_hoat_dong" (bắt buộc): Phải là một trong:\n'
            '      "bon_phan"       — bón phân, NPK, DAP, phân hữu cơ, bón lót/thúc\n'
            '      "phun_thuoc"     — phun/xịt thuốc, trừ sâu, trừ bệnh, trừ cỏ\n'
            '      "tuoi_nuoc"      — tưới nước, tưới tiêu, bơm nước\n'
            '      "cat_tia"        — cắt tỉa cành, tạo tán, bấm ngọn\n'
            '      "lam_co"         — làm cỏ, cắt cỏ\n'
            '      "be_qua"         — bẻ quả, tỉa trái non\n'
            '      "sau_benh"       — thăm vườn, kiểm tra sâu bệnh, theo dõi cây\n'
            '      "thu_hoach"      — thu hoạch, hái trái, gặt lúa, thu hái\n'
            '      "khac"           — hoạt động khác\n'
            '  - "ngay_thuc_hien": Ngày tháng nguyên văn ("hôm nay", "hôm qua", "ngày 15"...). Null nếu không rõ.\n'
            '  - "mo_ta": Mô tả chi tiết hoạt động.\n'
            '  - "thoi_tiet": Thời tiết ("nắng", "mưa"...). Null nếu không đề cập.\n'
            '  - "ma_lo": Mã lô đất ("A2", "B1"...). Null nếu không có.\n'
            '  - "cay_trong"/"giong_buoi": Tên cây trồng ("Bưởi Da Xanh", "Sầu Riêng", "Lúa ST25"...). Null nếu không rõ.\n\n'

            "### 2. materials — Danh sách vật tư sử dụng (bảng material & activity_material)\n"
            "  Mỗi loại vật tư là một object trong mảng materials:\n"
            '  - "ten_vat_tu" (bắt buộc): Tên vật tư ("Regent 800WG", "NPK 20-20-15", "Trichoderma"...)\n'
            '  - "loai_vat_tu": "phan_bon" | "thuoc_bvtv" | "che_pham_sinh_hoc" | "khac" | null\n'
            '  - "lieu_luong": Số lượng dùng (kiểu number). Null nếu không có.\n'
            '  - "don_vi": Đơn vị ("ml", "g", "kg", "lít", "bao", "gói"...). Null nếu không có.\n\n'

            "### 3. assets — Danh sách công cụ & máy móc sử dụng (bảng asset & activity_asset)\n"
            "  Mỗi loại công cụ là một object trong mảng assets:\n"
            '  - "ten_cong_cu" (bắt buộc): Tên công cụ ("máy phun đeo lưng", "máy bơm nước", "máy cắt cỏ"...)\n'
            '  - "thoi_gian_su_dung": Thời gian dùng (phút, kiểu number). Null nếu không nói.\n\n'

            "### 4. observations — Danh sách quan sát/sâu bệnh (bảng observation)\n"
            "  Mỗi loại sâu bệnh/triệu chứng là một object trong mảng observations:\n"
            '  - "trieu_chung" (bắt buộc): Tên sâu bệnh hoặc triệu chứng ("sâu vẽ bùa", "nhện đỏ", "vàng lá"...)\n'
            '  - "muc_do": "LOW" (nhẹ) | "MEDIUM" (vừa) | "HIGH" (nặng) | null\n'
            '  - "mo_ta_sau_benh": Mô tả chi tiết. Null nếu không có.\n\n'

            "### 5. harvests — Danh sách sản lượng thu hoạch (bảng harvest)\n"
            "  Mỗi đợt/loại thu hoạch là một object trong mảng harvests:\n"
            '  - "san_luong_thu_hoach": Số lượng thu (kiểu number). Null nếu không có.\n'
            '  - "don_vi_thu_hoach": Đơn vị ("kg", "tấn", "tạ", "quả"...). Null nếu không có.\n'
            '  - "pham_cap": Phẩm cấp ("Loại 1", "Xuất khẩu", "Nội địa"...). Null nếu không có.\n'
            '  - "thuong_lai": Tên thương lái/vựa mua. Null nếu không có.\n'
            '  - "gia_ban": Đơn giá bán (VNĐ/đơn vị, number). Null nếu không có.\n\n'

            "## Ví dụ\n"
            "Đầu vào: Sáng nay tôi dùng máy phun đeo lưng phun Regent 50ml và Confidor 30ml cho lô A2 bưởi da xanh, "
            "phát hiện sâu vẽ bùa mức độ nặng và nhện đỏ mức độ vừa. "
            "Chiều thu hoạch 1500 kg loại 1 và 300 kg loại 2 bán cho công ty Nông sản giá 25000 và 18000.\n\n"
            "Đầu ra JSON:\n"
            '{"activities": [\n'
            '  {\n'
            '    "loai_hoat_dong": "phun_thuoc",\n'
            '    "ngay_thuc_hien": "sáng nay",\n'
            '    "mo_ta": "Phun thuốc phòng trừ sâu vẽ bùa và nhện đỏ cho lô A2 bưởi da xanh",\n'
            '    "thoi_tiet": null,\n'
            '    "ma_lo": "A2",\n'
            '    "cay_trong": "bưởi da xanh",\n'
            '    "giong_buoi": "bưởi da xanh",\n'
            '    "materials": [\n'
            '      {"ten_vat_tu": "Regent 800WG", "loai_vat_tu": "thuoc_bvtv", "lieu_luong": 50, "don_vi": "ml"},\n'
            '      {"ten_vat_tu": "Confidor", "loai_vat_tu": "thuoc_bvtv", "lieu_luong": 30, "don_vi": "ml"}\n'
            '    ],\n'
            '    "assets": [\n'
            '      {"ten_cong_cu": "máy phun đeo lưng", "thoi_gian_su_dung": null}\n'
            '    ],\n'
            '    "observations": [\n'
            '      {"trieu_chung": "sâu vẽ bùa", "muc_do": "HIGH", "mo_ta_sau_benh": "sâu vẽ bùa hại lá non nặng"},\n'
            '      {"trieu_chung": "nhện đỏ", "muc_do": "MEDIUM", "mo_ta_sau_benh": null}\n'
            '    ],\n'
            '    "harvests": []\n'
            '  },\n'
            '  {\n'
            '    "loai_hoat_dong": "thu_hoach",\n'
            '    "ngay_thuc_hien": "chiều nay",\n'
            '    "mo_ta": "Thu hoạch bưởi bán cho công ty Nông sản",\n'
            '    "thoi_tiet": null,\n'
            '    "ma_lo": null,\n'
            '    "cay_trong": "bưởi da xanh",\n'
            '    "giong_buoi": "bưởi da xanh",\n'
            '    "materials": [],\n'
            '    "assets": [],\n'
            '    "observations": [],\n'
            '    "harvests": [\n'
            '      {"san_luong_thu_hoach": 1500, "don_vi_thu_hoach": "kg", "pham_cap": "loại 1", "thuong_lai": "công ty Nông sản", "gia_ban": 25000},\n'
            '      {"san_luong_thu_hoach": 300, "don_vi_thu_hoach": "kg", "pham_cap": "loại 2", "thuong_lai": "công ty Nông sản", "gia_ban": 18000}\n'
            '    ]\n'
            '  }\n'
            "]}"
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

    async def post_process_stt_with_metadata(self, raw_text: str) -> dict:
        """
        Xử lý gọi LLM qua queue và trả về dictionary đầy đủ metadata:
        input, output, model_name (và model), processing_time (giây) / processing_time_ms.
        """
        start_time = time.monotonic()
        output_str = await self.post_process_stt(raw_text)
        elapsed = time.monotonic() - start_time
        try:
            activities = json.loads(output_str)
        except (json.JSONDecodeError, TypeError):
            activities = output_str

        return {
            "input": raw_text,
            "output": activities,
            "model": config.GEMINI_MODEL,
            "model_name": config.GEMINI_MODEL,
            "processing_time": round(elapsed, 3),
            "processing_time_ms": int(elapsed * 1000),
        }

    async def _do_post_process(self, raw_text: str) -> str:
        """
        Gọi LLM, unwrap wrapper {"activities": [...]}
        và trả về JSON string của array các hoạt động (đã chuẩn hóa theo schema DB).
        """
        logger.info("Bắt đầu trích xuất hoạt động canh tác bưởi...")
        start_time = time.monotonic()
        result = await self._extract_json(raw_text)
        if not result:
            logger.warning("Trích xuất thất bại, trả về text gốc.")
            return raw_text

        # Unwrap wrapper {"activities": [...]} -> lấy array
        activities = result.get("activities") if isinstance(result, dict) else None
        if not activities or not isinstance(activities, list):
            logger.warning("Không có activities hợp lệ trong kết quả LLM, trả về text gốc.")
            return raw_text

        # Chuyển bước chuẩn hóa (ngày tương đối, liều lượng, đơn vị) sang module normalizer
        activities = normalize_activity_list(activities)

        elapsed = time.monotonic() - start_time
        logger.info(
            "Trích xuất và chuẩn hóa thành công %d hoạt động (model: %s, thời gian xử lý: %.3fs).",
            len(activities),
            config.GEMINI_MODEL,
            elapsed,
        )
        return json.dumps(activities, ensure_ascii=False, indent=2)


# Singleton dùng chung toàn app
llm_engine = LLMEngine()
