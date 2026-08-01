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
    # JSON Schema trích xuất — Khớp 1:1 với CSDL PostgreSQL
    # ------------------------------------------------------------------
    # Bảng chính: hoat_dong_canh_tac (bảng 8 trong schema)
    #   + ngay_thuc_hien    DATE NOT NULL
    #   + loai_hoat_dong    loai_hoat_dong NOT NULL (enum)
    #   + mo_ta             TEXT
    #   + thoi_tiet         VARCHAR(100)
    #
    # Bảng tham chiếu: lo_dat (bảng 5)
    #   + ma_lo             VARCHAR(50)
    #   + giong_buoi        VARCHAR(100)
    #
    # Bảng con: chi_tiet_vat_tu_su_dung (bảng 9)
    #   + ten_vat_tu        VARCHAR(255) — từ bảng vat_tu_dau_vao
    #   + loai_vat_tu       loai_vat_tu (enum: phan_bon | thuoc_bvtv | che_pham_sinh_hoc)
    #   + lieu_luong        NUMERIC(10,2) NOT NULL
    #   + don_vi            VARCHAR(20) NOT NULL (ml, g, l, kg)
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
                                # --- Bảng hoat_dong_canh_tac ---
                                "loai_hoat_dong": {
                                    "type": "string",
                                    "enum": [
                                        "bon_phan", "phun_thuoc", "tuoi_nuoc",
                                        "tia_canh", "lam_co", "be_qua",
                                        "kiem_tra_sau_benh", "khac"
                                    ],
                                },
                                "ngay_thuc_hien": {"type": ["string", "null"]},
                                "mo_ta":          {"type": ["string", "null"]},
                                "thoi_tiet":      {"type": ["string", "null"]},

                                # --- Bảng lo_dat (tham chiếu) ---
                                "ma_lo":          {"type": ["string", "null"]},
                                "giong_buoi":     {"type": ["string", "null"]},

                                # --- Bảng chi_tiet_vat_tu_su_dung ---
                                "ten_vat_tu":     {"type": ["string", "null"]},
                                "loai_vat_tu": {
                                    "type": ["string", "null"],
                                    "enum": [
                                        "phan_bon", "thuoc_bvtv",
                                        "che_pham_sinh_hoc", None
                                    ],
                                },
                                "lieu_luong":     {"type": ["number", "null"]},
                                "don_vi":         {"type": ["string", "null"]},
                            },
                            "required": [
                                "loai_hoat_dong", "ngay_thuc_hien", "mo_ta",
                                "thoi_tiet", "ma_lo", "giong_buoi",
                                "ten_vat_tu", "loai_vat_tu", "lieu_luong", "don_vi",
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
        Gọi LLM để bóc tách và phân loại các hoạt động canh tác bưởi từ
        văn bản thành JSON array. Các trường trích xuất khớp 1:1 với bảng
        hoat_dong_canh_tac, chi_tiet_vat_tu_su_dung và lo_dat.
        """
        system_prompt = (
            "Bạn là AI trích xuất nhật ký hoạt động canh tác bưởi xuất khẩu "
            "từ giọng nói nông dân Việt Nam (có thể có từ ngữ địa phương).\n\n"

            "## Quy tắc trích xuất\n"
            "- Một đoạn văn bản có thể chứa nhiều hoạt động khác nhau, tách mỗi hoạt động thành một phần tử riêng.\n"
            "- Trích xuất thông tin vào đúng các trường sau:\n\n"

            "### Bảng hoat_dong_canh_tac (Nhật ký hàng ngày)\n"
            '  - "loai_hoat_dong" (bắt buộc): Enum giá trị cố định, PHẢI là một trong:\n'
            '      "bon_phan", "phun_thuoc", "tuoi_nuoc", "tia_canh", "lam_co", "be_qua", "kiem_tra_sau_benh", "khac"\n'
            "    Quy ước ánh xạ:\n"
            '      bón phân / rải phân / phân bón / NPK / DAP → "bon_phan"\n'
            '      phun thuốc / xịt thuốc / thuốc sâu / thuốc trừ sâu / BVTV → "phun_thuoc"\n'
            '      tưới nước / tưới / bơm nước → "tuoi_nuoc"\n'
            '      tỉa cành / cắt cành / tạo tán / cắt nhánh → "tia_canh"\n'
            '      làm cỏ / nhổ cỏ / phát cỏ / cắt cỏ / phun cỏ → "lam_co"\n'
            '      bẻ quả / tỉa quả / tỉa trái / bẻ trái non → "be_qua"\n'
            '      kiểm tra sâu bệnh / khảo sát dịch hại / sâu vẽ bùa / nhện đỏ / rầy / nấm → "kiem_tra_sau_benh"\n'
            '      nếu không khớp mục nào ở trên → "khac"\n'
            '  - "ngay_thuc_hien": Trích xuất nguyên văn thông tin ngày tháng (hôm nay, hôm qua, ngày 15, sáng nay...). Nếu không rõ để null.\n'
            '  - "mo_ta": Mô tả chi tiết hành động (nguyên văn ngắn gọn, ví dụ: "Phun thuốc trừ sâu vẽ bùa cho lô A2").\n'
            '  - "thoi_tiet": Thời tiết nếu nông dân đề cập (nắng, mưa, nắng gắt, mát...). Nếu không có để null.\n\n'

            "### Bảng lo_dat (Lô đất / thửa trong vườn bưởi)\n"
            '  - "ma_lo": Mã lô (ví dụ: "A2", "B1", "LO3", "lô 5"). Nếu không rõ để null.\n'
            '  - "giong_buoi": Giống bưởi (Da Xanh, Năm Roi, Diễn, Đường lá cam...). Nếu không rõ để null.\n\n'

            "### Bảng chi_tiet_vat_tu_su_dung (Vật tư đầu vào)\n"
            '  - "ten_vat_tu": Tên đầy đủ vật tư / thuốc / phân bón (Regent 800WG, Bassa 50EC, DAP 16-48-0, phân hữu cơ...). Nếu không có để null.\n'
            '  - "loai_vat_tu": Phân loại vật tư, PHẢI là một trong:\n'
            '      "phan_bon" (phân bón, NPK, DAP, hữu cơ, vi sinh)\n'
            '      "thuoc_bvtv" (thuốc bảo vệ thực vật, thuốc trừ sâu, trừ nấm, trừ cỏ)\n'
            '      "che_pham_sinh_hoc" (chế phẩm sinh học, trichoderma, EM)\n'
            '      null (nếu hoạt động không sử dụng vật tư)\n'
            '  - "lieu_luong": Số lượng / liều lượng sử dụng (kiểu number). Chuyển số bằng chữ sang số. Nếu không có để null.\n'
            '  - "don_vi": Đơn vị đo lường (ml, g, kg, lít, bao, gói, chai...). Nếu không có để null.\n\n'

            "## Ví dụ\n"
            "Đầu vào: Sáng nay tôi phun thuốc Regent năm mươi ml cho lô A2 bưởi da xanh, "
            "rồi chiều đi bón thêm 3 kg phân hữu cơ cho lô B1 trời nắng.\n\n"
            "Đầu ra JSON:\n"
            '{"activities": [\n'
            '  {"loai_hoat_dong": "phun_thuoc", "ngay_thuc_hien": "sáng nay", '
            '"mo_ta": "Phun thuốc Regent 50ml cho lô A2 bưởi da xanh", '
            '"thoi_tiet": null, '
            '"ma_lo": "A2", "giong_buoi": "da xanh", '
            '"ten_vat_tu": "Regent", "loai_vat_tu": "thuoc_bvtv", '
            '"lieu_luong": 50, "don_vi": "ml"},\n'
            '  {"loai_hoat_dong": "bon_phan", "ngay_thuc_hien": "chiều nay", '
            '"mo_ta": "Bón 3 kg phân hữu cơ cho lô B1", '
            '"thoi_tiet": "nắng", '
            '"ma_lo": "B1", "giong_buoi": null, '
            '"ten_vat_tu": "phân hữu cơ", "loai_vat_tu": "phan_bon", '
            '"lieu_luong": 3, "don_vi": "kg"}\n'
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

    async def _do_post_process(self, raw_text: str) -> str:
        """
        Gọi LLM, unwrap wrapper {"activities": [...]}
        và trả về JSON string của array các hoạt động (đã chuẩn hóa theo schema DB).
        """
        logger.info("Bắt đầu trích xuất hoạt động canh tác bưởi...")
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

        logger.info("Trích xuất và chuẩn hóa thành công %d hoạt động.", len(activities))
        return json.dumps(activities, ensure_ascii=False, indent=2)


# Singleton dùng chung toàn app
llm_engine = LLMEngine()
