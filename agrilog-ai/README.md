## Kiến Trúc Xử Lý Dữ Liệu (Data Processing Pipeline)

```
[ Telegram Voice / Text ] 
         │
         ▼
 [ Audio Converter (FFmpeg) ]  ──(nếu là Audio)──►  [ STT Engine (Sherpa-ONNX + VAD) ]
                                                              │
                                                              ▼
                                                     [ Raw STT Text ]
                                                              │
         ┌────────────────────────────────────────────────────┘
         ▼
 [ LLM Engine (Llama.cpp) ]  ──► Bóc tách phân loại trường (JSON Schema)
         │
         ▼
 [ Normalizer Pipeline ]     ──► Chuẩn hóa UPPERCASE, Ngày DD/MM/YYYY, Đơn vị, Số lượng
         │
         ▼
[ Formatted JSON Output ]    ──► Trả về Telegram Bot
```

---

## Giải Thích Thuật Toán & Quy Trình Xử Lý Dữ Liệu Từng Bước (Step-by-Step Algorithms & Data Pipeline)

Quy trình xử lý của hệ thống CadproAI được chia làm **4 bước kế tiếp nhau (4-Stage Pipeline)**, mỗi bước tích hợp các thuật toán AI và xử lý luật học (Rule-based) chuyên biệt:

### Bước 1: Tiền Xử Lý Âm Thanh & Thuật Toán Nhận Dạng Giọng Nói (STT + VAD Algorithm)
- **Quy trình dữ liệu:**
  1. Người dùng gửi tin nhắn thoại hoặc file ghi âm (`.ogg`, `.mp3`, `.m4a`, `.wav`) qua Telegram Bot.
  2. `audio_converter.py` dùng engine `FFmpeg` chuẩn hóa dải tần âm thanh về định dạng duy nhất: **PCM s16le, đơn kênh (Mono), tần số lấy mẫu 16,000 Hz**.
  3. Mảng dữ liệu âm thanh thuần (`numpy float32 array`) được chuyển cho bộ giải mã giọng nói `STTEngine`.
- **Thuật toán cốt lõi (`services/stt_engine.py`):**
  - **Thuật toán Phát hiện Giọng nói Silero VAD (Voice Activity Detection):**
    - Khung mẫu âm thanh (Frame window: 512 samples ~ 32ms) được nạp vào mô hình thần kinh **Silero VAD** để tính xác suất xuất hiện tiếng nói $P(\text{speech})$.
    - **Ngưỡng kép & Máy trạng thái (Thresholding & State Machine):** Khi $P > 0.5$, hệ thống mở trạng thái bắt đầu tiếng nói; khi $P < 0.5$ duy trì liên tục trong thời gian im lặng tối thiểu (`min_silence_duration = 500ms`), hệ thống ngắt đoạn nói.
    - Nhờ VAD, file ghi âm dài 10–30 phút được chia tự động thành các đoạn có tiếng nói 3–10 giây, loại bỏ hoàn toàn khoảng lặng, **tránh tràn bộ nhớ RAM** và giảm 40–60% khối lượng tính toán cho mô hình dịch.
  - **Thuật toán Giải mã Giọng nói Sherpa-ONNX (Transducer / Zipformer):**
    - Từng đoạn audio nhỏ được đưa qua Encoder để tạo đặc trưng âm thanh, tiếp đó qua Joint Network & Decoder để chuyển đổi thành văn bản tiếng Việt.
    - Kết quả từng đoạn được ghép lại (`join`) thành một đoạn văn bản hoàn chỉnh (`Raw STT Text`).

### Bước 2: Bóc Tách Cấu Trúc Ngữ Nghĩa & Hàng Đợi Bất Đồng Bộ (LLM Extraction & Async Queue)
- **Quy trình dữ liệu:**
  1. Văn bản thô từ STT (hoặc tin nhắn văn bản trực tiếp từ người dùng) được gửi vào `LLMEngine.extract_agriculture_info(text)`.
  2. Yêu cầu được nạp vào hàng đợi bất đồng bộ **`asyncio.Queue`**.
- **Thuật toán cốt lõi (`services/llm_engine.py`):**
  - **Thuật toán Hàng đợi Tuần tự hóa (FIFO Async Queue Worker):**
    - Để bảo vệ mô hình Llama (`llama-server`) không bị nghẽn khi nhiều nông dân gửi yêu cầu cùng lúc, một background worker (`_process_queue`) xử lý tuần tự từng request (FIFO - First In, First Out).
  - **Thuật toán Phân loại Ngữ nghĩa Zero-shot (Separation of Concerns Prompting):**
    - System Prompt được tối giản tối đa: LLM *chỉ* chịu trách nhiệm nhận diện và gán ngữ nghĩa văn bản vào 8 trường cấu trúc JSON (`Hoạt động/Activity`, `Cây trồng/Crop`, `Thửa ruộng/Field`, `Vật tư/Material`, `Số lượng/Quantity`, `Đơn vị/Unit`, `Ngày/Date`, `Ghi chú/Note`).
    - LLM giữ **nguyên văn từ ngữ** (Raw Span Extraction) không tốn token cho định dạng quy đổi, giúp tốc độ sinh từ (Inference Speed) nhanh gấp nhiều lần.
  - **Thuật toán Phục hồi Lỗi Tự động (3-Attempt Exponential Backoff Retry):**
    - Nếu Llama server bị nghẽn mạng, timeout hoặc output JSON bị sai cú pháp, hệ thống tự động thử lại tối đa 3 lần với thời gian chờ tăng gấp đôi: $T_{\text{wait}} = 2^k \text{ giây}$ (2s, 4s, 6s).

### Bước 3: Thuật Toán Chuẩn Hóa Dữ Liệu Ngữ Pháp & Lĩnh Vực (Domain & Grammar Normalization Pipeline)
Toàn bộ JSON thô từ LLM được chuyển cho bộ xử lý hậu kỳ luật học tại `services/normalizer/`:
- **Thuật toán Chuẩn hóa Viết hoa (`UPPERCASE`):** Toàn bộ các trường văn bản đều được loại bỏ khoảng trắng thừa (`strip()`) và in hoa đồng nhất.
- **Thuật toán Quy đổi Thời gian Thông minh (`activity_normalizer.py` & `dates.py`):**
  - **Nhận diện Từ khóa theo Chuỗi con (Substring Keyword Matching):**
    - Quét cụm từ xuất hiện trong trường `Ngày/Date`:
      - Chứa `"HÔM KIA"`, `"NGÀY KIA"` hay `"MỐT"` $\rightarrow$ Quy đổi độ lệch ngày $\Delta d = \pm 2$.
      - Chứa `"QUA"` hay `"YESTERDAY"` $\rightarrow$ $\Delta d = -1$ (Hôm qua).
      - Chứa `"MAI"` hay `"TOMORROW"` $\rightarrow$ $\Delta d = +1$ (Ngày mai).
      - Chứa `"NAY"` hay rỗng $\rightarrow$ $\Delta d = 0$ (Hôm nay).
  - **Thuật toán Hoàn thiện Thời gian Thiếu cấp (Hierarchical Date Completion):**
    - Chuẩn hóa các dấu phân cách (`-`, `.`) sang `/` và kiểm tra cấp độ thời gian bị thiếu:
      - Khi chỉ có số Ngày $D$ (VD: `"15"`) $\rightarrow$ Tự động ghép Tháng hiện tại $M_{\text{now}}$ và Năm hiện tại $Y_{\text{now}} \rightarrow D/M_{\text{now}}/Y_{\text{now}}$.
      - Khi có Ngày $D$ và Tháng $M$ (VD: `"15/08"`) $\rightarrow$ Tự động ghép Năm hiện tại $Y_{\text{now}} \rightarrow D/M/Y_{\text{now}}$.
      - Khi đủ Ngày, Tháng, Năm $\rightarrow$ Chuẩn hóa năm 2 chữ số ($Y < 100 \rightarrow Y + 2000$) và xuất chuẩn `DD/MM/YYYY`.
  - **Thuật toán Ngữ pháp Tiếng Việt (CFG Grammar & State Machine - `dates.py`, `core/`, `rules/`):**
    - Khi người dùng đọc ngày tháng bằng chữ (VD: *"ngày mười lăm tháng tám"*), bộ Tokenizer ánh xạ từ vựng tiếng Việt sang token (`PREFIX_DAY`, `DIGIT`, `PREFIX_MONTH`), bộ máy trạng thái giảm số (Number Reducer) ghép `"mười" + "lăm"` thành `15` và xuất `"15/08"`, sau đó được tự động gắn thêm năm hiện tại.
- **Thuật toán Chuẩn hóa Đơn vị Nông nghiệp (`normalize_unit`):**
  - Ánh xạ các biến thể phát âm / từ viết tắt tiếng Việt về ký hiệu nông nghiệp chuẩn (`kí, cân, kilogam` $\rightarrow$ `KG`; `l, lít` $\rightarrow$ `LÍT`; `túi, bịch, gói` $\rightarrow$ `GÓI`; `bao tải` $\rightarrow$ `BAO`; `ha, hecta` $\rightarrow$ `HA`...).
- **Thuật toán Chuẩn hóa Số lượng (`Số lượng/Quantity`):**
  - Chuyển đổi an toàn chuỗi số sang kiểu số thực/nguyên (`number`), trả về `null` nếu không có dữ liệu.

### Bước 4: Định Dạng & Trình Bày Phản Hồi Telegram Bot (Presentation Stage)
- **Quy trình dữ liệu:**
  1. Mảng danh sách hoạt động canh tác (`list[dict]`) sau khi chuẩn hóa được trình bày thành các bảng biểu minh bạch với các biểu tượng nông nghiệp sinh động (🌱, 🌾, 📦, 🗓️, 📝).
  2. **Thuật toán Kiểm soát Độ dài Phản hồi:** Nếu độ dài thông điệp $L \le 4096$ ký tự $\rightarrow$ gửi tin nhắn Telegram trực tiếp. Nếu $L > 4096$ ký tự $\rightarrow$ tự động xuất thành tệp `.txt` và gửi dạng tệp đính kèm (attachment).

---

## Các Thành Phần Cốt Lõi

### 1. STT Engine (`services/stt_engine.py`)
- **Sherpa-ONNX:** Nhận dạng giọng nói tiếng Việt với độ chính xác cao, chạy hoàn toàn offline.
- **Silero VAD (Voice Activity Detection):** Tự động phát hiện tiếng nói, chia cắt các file âm thanh dài thành từng đoạn nhỏ và loại bỏ khoảng lặng. Tránh tối đa tình trạng tràn bộ nhớ RAM khi xử lý ghi âm dài.
- **Hàng đợi xử lý (`asyncio.Queue`):** Xử lý tuần tự các request âm thanh, đảm bảo độ ổn định cho server.

### 2. LLM Engine (`services/llm_engine.py`)
- Giao tiếp với model LLM qua endpoint tương thích OpenAI (`/v1/chat/completions`) của `llama-server`.
- **System Prompt tối giản:** LLM chỉ chịu trách nhiệm **phân loại và bóc tách** thông tin từ văn bản vào đúng các trường JSON (`Hoạt động/Activity`, `Cây trồng/Crop`, `Thửa ruộng/Field`, `Vật tư/Material`, `Số lượng/Quantity`, `Đơn vị/Unit`, `Ngày/Date`, `Ghi chú/Note`), giữ nguyên văn từ ngữ để tốc độ suy luận nhanh nhất và tiết kiệm token.
- **Queue Worker & Retry Logic:** 
  - Hàng đợi `asyncio.Queue` tuần tự hóa các yêu cầu gọi LLM.
  - Tự động thử lại 3 lần (exponential backoff: 2s, 4s, 6s) khi gặp sự cố HTTP, Timeout hoặc lỗi phân tích JSON.

### 3. Bộ Chuẩn Hóa Chuyên Sâu (`services/normalizer/`)
Được tách biệt hoàn toàn khỏi prompt của LLM để đảm bảo tính chính xác và nhất quán cho dữ liệu đầu ra:
- **Chuẩn hóa chữ hoa (UPPERCASE):** Toàn bộ giá trị chuỗi văn bản đều được chuyển sang chữ in hoa.
- **Quy đổi Thời gian Thông minh (`Ngày/Date`):**
  - Nhận diện linh hoạt từ khóa thời gian tương đối (*nay, qua, mai, hôm kia, ngày kia, mốt*) để quy đổi theo ngày hiện tại của hệ thống.
  - **Tự động hoàn thiện cấp thời gian bị thiếu:** Nếu dữ liệu chỉ có ngày (VD: `"15"`) $\rightarrow$ tự động điền tháng và năm hiện tại (`15/MM/YYYY`); nếu có ngày/tháng (VD: `"15/08"`) $\rightarrow$ tự điền năm hiện tại (`15/08/YYYY`).
  - Tích hợp bộ **Grammar Parser & Tokenizer tiếng Việt (`dates.py`, `core/`, `rules/`)** để xử lý các chuỗi ngày tháng đọc bằng chữ phức tạp.
- **Chuẩn hóa Đơn vị (`Đơn vị/Unit`):** Chuẩn hóa các biến thể cách gọi trong nông nghiệp về ký hiệu chuẩn:
  - **Khối lượng:** `KG`, `G`, `TẤN`, `TẠ`, `YẾN`
  - **Thể tích:** `LÍT`, `ML`, `CC`
  - **Bao bì / Đóng gói:** `BAO`, `GÓI`, `CHAI`, `CAN`, `THÙNG`, `VIÊN`
  - **Diện tích:** `HA`, `M2`, `SÀO`, `CÔNG`, `MẪU`
- **Chuẩn hóa Số lượng (`Số lượng/Quantity`):** Đảm bảo đúng định dạng số thực/số nguyên (`number`).

### 4. Telegram Bot (`main.py` & `handlers/voice_handler.py`)
- Tiếp nhận tin nhắn thoại, file âm thanh hoặc tin nhắn văn bản từ nông dân/cán bộ nông nghiệp.
- Định dạng kết quả JSON đầu ra thành bảng biểu dễ đọc ngay trong khung chat Telegram.
- Tự động đính kèm file `.txt` trả về nếu nội dung trích xuất vượt quá giới hạn 4096 ký tự của Telegram.

---

## Cấu Trúc Dữ Liệu Đầu Ra (JSON Schema)

Hệ thống trả về mảng các hoạt động canh tác (`activities`), hỗ trợ bóc tách nhiều hoạt động liên tiếp trong cùng một văn bản hoặc lời nói:

```json
[
  {
    "loai_hoat_dong": "phun_thuoc",
    "ngay_thuc_hien": "29/07/2026",
    "mo_ta": "Phun thuốc Regent 50ml cho lô A2 bưởi da xanh",
    "thoi_tiet": "nắng",
    "ma_lo": "A2",
    "giong_buoi": "da xanh",
    "ten_vat_tu": "Regent",
    "loai_vat_tu": "thuoc_bvtv",
    "lieu_luong": 50,
    "don_vi": "ml"
  },
  {
    "loai_hoat_dong": "bon_phan",
    "ngay_thuc_hien": "29/07/2026",
    "mo_ta": "Bón 3 kg phân hữu cơ cho lô B1",
    "thoi_tiet": null,
    "ma_lo": "B1",
    "giong_buoi": null,
    "ten_vat_tu": "phân hữu cơ",
    "loai_vat_tu": "phan_bon",
    "lieu_luong": 3,
    "don_vi": "kg"
  }
]
```

---

## Cấu Trúc Thư Mục (Project Structure)

```text
telegram-stt-bot/
├── main.py                 # Điểm khởi chạy chính của Telegram Bot
├── config.py               # Cấu hình hệ thống (Token, Paths, URL Llama-server, Retry logic)
├── requirements.txt        # Các thư viện Python cần thiết
├── telegram-stt-bot.service# File cấu hình chạy systemd service trên Linux
├── models/                 # Thư mục chứa các tệp Model AI (STT Sherpa-ONNX, VAD Silero)
├── handlers/               # Bộ xử lý sự kiện Telegram
│   └── voice_handler.py    # Tiếp nhận, xử lý audio/text và phản hồi kết quả JSON cho user
└── services/               # Các module xử lý lõi (Core Processing Services)
    ├── audio_converter.py  # Xử lý chuyển đổi, định dạng lại tần số âm thanh bằng FFmpeg
    ├── stt_engine.py       # Engine nhận dạng giọng nói Sherpa-ONNX & VAD Silero (Queue Worker)
    ├── llm_engine.py       # Engine Llama.cpp bóc tách JSON (Queue Worker & Retry Logic)
    └── normalizer/         # Bộ chuẩn hóa dữ liệu chuyên sâu (hậu xử lý sau LLM)
        ├── __init__.py     # Cổng export các module chuẩn hóa
        ├── activity_normalizer.py  # Chuẩn hóa UPPERCASE, Ngày tương đối, Đơn vị, Số lượng
        ├── dates.py        # Tokenizer & Grammar Parser tiếng Việt cho ngày tháng
        ├── core/           # Bộ Parser, Tokenizer và Validator nội bộ cho ngữ pháp ngày tháng
        └── rules/          # Từ điển từ vựng tiếng Việt (vocab.py)
```

---

## Yêu Cầu Hệ Thống (Prerequisites)

- **Python 3.10+**
- **FFmpeg:** Cần cài đặt và thêm vào biến môi trường (`PATH`) để phục vụ `audio_converter.py`.
- **Llama Server:** Chạy local model Llama (mặc định cấu hình kết nối tại `http://127.0.0.1:8082/v1/chat/completions`).
- **Các file mô hình AI tại thư mục `models/`:**
  - **Sherpa-ONNX files:** `tokens.txt`, `encoder.int8.onnx`, `decoder.onnx`, `joiner.int8.onnx`
  - **Silero VAD model:** `silero_vad.onnx`

---

## Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt Môi trường
Tạo virtual environment và cài đặt các thư viện cần thiết:
```bash
python -m venv .venv
source .venv/bin/activate  # (Với Windows: .venv\Scripts\activate)
pip install -r requirements.txt
```

### 2. Thiết lập Cấu hình (`.env`)
Sao chép file cấu hình mẫu:
```bash
cp .env.example .env
```
Mở `.env` và cấu hình các thông số:
- `TELEGRAM_BOT_TOKEN`: Token nhận từ `@BotFather` trên Telegram
- `LLM_API_URL`: Base URL của Llama-server (Mặc định: `http://127.0.0.1:8082/v1/chat/completions`)
- `LLM_MAX_RETRIES`: Số lần thử lại khi lỗi LLM (Mặc định: `3`)

### 3. Khởi chạy Telegram Bot
Chạy trực tiếp trên terminal:
```bash
python main.py
```
Hoặc cấu hình chạy ngầm qua `systemd` sử dụng file `telegram-stt-bot.service` có sẵn trong dự án.
