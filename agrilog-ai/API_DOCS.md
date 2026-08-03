# AgriLog AI — Tài Liệu API & Đặc Tả Kỹ Thuật (REST API Specification)

Tài liệu này cung cấp chi tiết đặc tả kỹ thuật, cấu trúc endpoint, định dạng dữ liệu đầu vào/đầu ra, cấu trúc chuẩn hóa tài nguyên nông nghiệp (Nested Resources Schema) và thông tin metadata hệ thống của dịch vụ **AgriLog AI (`agrilog-ai`)**.

---

## 1. Thông Tin Tổng Quan (Service Overview)

* **Base URL:** `http://localhost:8000` (hoặc domain triển khai)
* **OpenAPI / Swagger UI:** `http://localhost:8000/docs`
* **ReDoc Documentation:** `http://localhost:8000/redoc`
* **Giao diện vận hành:** Hỗ trợ đồng thời 2 luồng:
  1. **REST API (FastAPI - `api.py`)**: Phục vụ WebApp React (`agrilog-web`) và Mobile App.
  2. **Telegram Bot (`main.py`)**: Phục vụ người nông dân và cán bộ nông nghiệp qua tin nhắn thoại/văn bản Telegram.

---

## 2. Chuẩn Dữ Liệu Phản Hồi (`STTResponse` Schema)

Mọi yêu cầu nhận dạng giọng nói (STT) hoặc xử lý bóc tách văn bản qua API đều trả về định dạng chuẩn hóa **`STTResponse`** chứa đầy đủ kết quả trích xuất và thông tin giám sát hoạt động AI (AI Metadata):

```json
{
  "status": "success",
  "raw_text": "Hôm nay tôi xịt 50ml thuốc Regent và bón 2 bao phân NPK cho lô A1 bưởi da xanh. Phát hiện sâu vẽ bùa nhẹ.",
  "input": "Hôm nay tôi xịt 50ml thuốc Regent và bón 2 bao phân NPK cho lô A1 bưởi da xanh. Phát hiện sâu vẽ bùa nhẹ.",
  "output": [
    {
      "loai_hoat_dong": "phun_thuoc",
      "ngay_thuc_hien": "03/08/2026",
      "mo_ta": "Phun 50ml thuốc Regent cho lô A1 bưởi da xanh",
      "thoi_tiet": null,
      "ma_lo": "A1",
      "cay_trong": "bưởi",
      "giong_buoi": "da xanh",
      "materials": [
        {
          "ten_vat_tu": "Regent",
          "loai_vat_tu": "thuoc_bvtv",
          "lieu_luong": 50,
          "don_vi": "ml"
        },
        {
          "ten_vat_tu": "NPK",
          "loai_vat_tu": "phan_bon",
          "lieu_luong": 2,
          "don_vi": "bao"
        }
      ],
      "assets": [],
      "observations": [
        {
          "ten_sau_benh": "sâu vẽ bùa",
          "muc_do": "nhẹ",
          "trieu_chung": null,
          "hinh_anh": null
        }
      ],
      "harvests": []
    }
  ],
  "model": "gemini-2.5-pro",
  "model_name": "gemini-2.5-pro",
  "processing_time": 1.452,
  "processing_time_ms": 1452,
  "llm_output_text": "..."
}
```

### Bảng Mô tả Thuộc tính `STTResponse`

| Thuộc tính | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| **`status`** | `string` | Trạng thái xử lý (`"success"` hoặc `"error"`). |
| **`raw_text`** | `string` | Văn bản thô nhận diện được từ giọng nói (STT) hoặc văn bản đầu vào. |
| **`input`** | `string` | Văn bản đầu vào gửi cho LLM bóc tách thông tin nông nghiệp. |
| **`output`** | `list[dict]` | Danh sách hoạt động canh tác (`activities`) được bóc tách và chuẩn hóa theo schema DB (alias với `parsed_data`). |
| **`parsed_data`** | `list[dict]` | Alias tương đương với `output`, duy trì tương thích ngược. |
| **`model`** | `string` | Tên mô hình AI đã thực hiện xử lý (VD: `"gemini-2.5-pro"`, `"llama-3-8b"`). |
| **`model_name`** | `string` | Alias của `model`, dùng để ánh xạ trực tiếp vào Entity DB `activity_ai_extraction`. |
| **`processing_time`** | `float` | Thời gian thực thi toàn bộ luồng AI tính bằng **giây** (độ chính xác mili-giây). |
| **`processing_time_ms`** | `integer` | Thời gian thực thi làm tròn tính bằng **mili-giây** (phục vụ giám sát hiệu năng & lưu DB). |
| **`llm_output_text`** | `string` | Chuỗi JSON thô nguyên bản trả về từ LLM trước khi qua bộ Normalizer. |
| **`error`** | `string \| null`| Thông điệp lỗi chi tiết (nếu `status == "error"`). |

---

## 3. Cấu Trúc Dữ Liệu Hoạt Động & Tài Nguyên Nông Nghiệp (Activity Nested Schema)

Mỗi phần tử trong danh sách **`output` (`activities`)** tuân theo cấu trúc đối tượng nhật ký canh tác chuẩn hóa, yêu cầu bắt buộc có 4 mảng tài nguyên con (**`materials`**, **`assets`**, **`observations`**, **`harvests`**):

### 3.1. Cấu Trúc Đối Tượng Hoạt Động (`Activity`)
* **`loai_hoat_dong`** (`string`): Mã loại hoạt động (`bon_phan`, `phun_thuoc`, `tuoi_nuoc`, `lam_co`, `thu_hoach`, `gieo_trong`, ...).
* **`ngay_thuc_hien`** (`string`): Ngày thực hiện định dạng chuẩn `DD/MM/YYYY`. Tự động quy đổi từ khóa tương đối (*hôm nay, hôm qua, mai, mốt*...).
* **`mo_ta`** (`string`): Mô tả chi tiết hoạt động canh tác.
* **`ma_lo` / `thua_ruong`** (`string`): Mã lô/thửa ruộng canh tác (`A1`, `Lô B2`, `Vườn số 3`...).
* **`cay_trong` / `giong_buoi`** (`string`): Tên cây trồng hoặc giống (`bưởi da xanh`, `sầu riêng`, `lúa`...).
* **`thoi_tiet`** (`string`): Thông tin thời tiết (`nắng`, `mưa`, `râm mát`...).

### 3.2. Mảng Vật Tư Sử Dụng (`materials` - Bắt buộc)
Danh sách các loại phân bón, thuốc bảo vệ thực vật, hạt giống hoặc phụ gia sử dụng trong hoạt động:
```json
"materials": [
  {
    "ten_vat_tu": "NPK 20-20-15",
    "loai_vat_tu": "phan_bon",
    "lieu_luong": 5.5,
    "don_vi": "KG"
  },
  {
    "ten_vat_tu": "Regent 800WG",
    "loai_vat_tu": "thuoc_bvtv",
    "lieu_luong": 50,
    "don_vi": "ML"
  }
]
```
* **`ten_vat_tu`** (`string`): Tên thương mại / tên gọi vật tư.
* **`loai_vat_tu`** (`string`): Phân loại (`phan_bon`, `thuoc_bvtv`, `hat_giong`, `khac`).
* **`lieu_luong`** (`number`): Số lượng/liều lượng sử dụng (kiểu số thực/nguyên).
* **`don_vi`** (`string`): Đơn vị tính được chuẩn hóa viết hoa (`KG`, `G`, `LÍT`, `ML`, `BAO`, `GÓI`, `CHAI`, `CAN`, ...).

### 3.3. Mảng Máy Móc / Thiết Bị Sử Dụng (`assets` - Bắt buộc)
Danh sách công cụ, máy móc, hệ thống tưới hoặc tài sản được huy động trong hoạt động:
```json
"assets": [
  {
    "ten_tai_san": "Máy phun thuốc đeo lưng Kubota",
    "loai_tai_san": "may_moc",
    "thoi_gian_su_dung": 2.5
  }
]
```
* **`ten_tai_san`** (`string`): Tên máy móc / thiết bị / tài sản.
* **`loai_tai_san`** (`string`): Phân loại (`may_moc`, `thiet_bi`, `cong_cu`, `khac`).
* **`thoi_gian_su_dung`** (`number`): Số giờ hoặc đơn vị thời gian sử dụng (`number`).

### 3.4. Mảng Quan Sát & Sâu Bệnh (`observations` - Bắt buộc)
Danh sách ghi nhận về sâu bệnh hại, tình trạng dinh dưỡng hoặc hiện tượng bất thường:
```json
"observations": [
  {
    "ten_sau_benh": "Sâu vẽ bùa",
    "muc_do": "nhẹ",
    "trieu_chung": "Lá non bị xoắn, có đường hầm màu trắng mảnh",
    "hinh_anh": null
  }
]
```
* **`ten_sau_benh`** (`string`): Tên loài sâu bệnh hoặc hiện tượng ghi nhận.
* **`muc_do`** (`string`): Mức độ ảnh hưởng (`nhẹ`, `trung_binh`, `nặng`).
* **`trieu_chung`** (`string`): Mô tả chi tiết triệu chứng biểu hiện trên cây.
* **`hinh_anh`** (`string | null`): URL hoặc mã nhận dạng hình ảnh chụp đính kèm.

### 3.5. Mảng Thu Hoạch Nông Sản (`harvests` - Bắt buộc)
Danh sách kết quả thu hoạch nông sản trong buổi làm việc:
```json
"harvests": [
  {
    "san_luong_thu_hoach": 1200,
    "don_vi_thu_hoach": "KG",
    "pham_cap": "loai_1",
    "thuong_lai": "Vựa trái cây Thanh Bình",
    "gia_ban": 35000
  }
]
```
* **`san_luong_thu_hoach`** (`number`): Khối lượng / sản lượng nông sản thu được.
* **`don_vi_thu_hoach`** (`string`): Đơn vị chuẩn hóa (`KG`, `TẤN`, `TẠ`, `YẾN`, ...).
* **`pham_cap`** (`string`): Phân loại phẩm cấp sản phẩm (`loai_1`, `loai_2`, `loai_3`, `xuat_khau`).
* **`thuong_lai`** (`string`): Tên thương lái, vựa thu mua hoặc hợp tác xã.
* **`gia_ban`** (`number`): Giá bán đơn vị tính bằng VNĐ.

---

## 4. Chi Tiết Các Endpoints REST API

### 4.1. Chuyển Đổi Âm Thanh & Bóc Tách Nhật Ký (`POST /api/v1/stt/transcribe`)

* **Mô tả:** Nhận tệp âm thanh giọng nói tiếng Việt từ WebApp/Mobile App, chạy nhận dạng giọng nói ngoại tuyến qua **Sherpa-ONNX + Silero VAD**, sau đó bóc tách thành chuỗi JSON nhật ký canh tác bằng LLM.
* **Headers:** `Content-Type: multipart/form-data`
* **Tham số Request Body (Form-Data):**
  * `file` (`UploadFile`, bắt buộc): Tệp ghi âm (`.webm`, `.wav`, `.mp3`, `.m4a`, `.ogg`).
  * `process_llm` (`boolean`, tùy chọn, mặc định: `true`): Nếu `true`, chuyển tiếp văn bản sang LLM Engine để bóc tách JSON và chuẩn hóa; nếu `false`, chỉ trả về kết quả STT raw_text.

#### Ví Dụ Call API (cURL):
```bash
curl -X POST "http://localhost:8000/api/v1/stt/transcribe" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/nhat_ky_nong_dan.webm;type=audio/webm" \
  -F "process_llm=true"
```

#### Phản Hồi Thành Công (`200 OK`):
Trả về đối tượng JSON theo schema `STTResponse` mô tả tại mục 2.

---

### 4.2. Bóc Tách Nhật Ký Từ Văn Bản (`POST /api/v1/stt/process-text`)

* **Mô tả:** Nhận chuỗi văn bản gõ trực tiếp (không qua STT), bóc tách và chuẩn hóa thành danh sách hoạt động canh tác với cấu trúc `materials`, `assets`, `observations`, `harvests`.
* **Headers:** `Content-Type: application/json`
* **Request Body (JSON):**
  ```json
  {
    "text": "Sáng nay bón 3 bao phân lân và xịt 50ml Regent cho vườn bưởi lô A2. Có hiện tượng nhện đỏ xuất hiện rải rác."
  }
  ```

#### Ví Dụ Call API (cURL):
```bash
curl -X POST "http://localhost:8000/api/v1/stt/process-text" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"text": "Sáng nay bón 3 bao phân lân và xịt 50ml Regent cho vườn bưởi lô A2. Có hiện tượng nhện đỏ xuất hiện rải rác."}'
```

#### Phản Hồi Thành Công (`200 OK`):
```json
{
  "status": "success",
  "raw_text": "Sáng nay bón 3 bao phân lân và xịt 50ml Regent cho vườn bưởi lô A2. Có hiện tượng nhện đỏ xuất hiện rải rác.",
  "input": "Sáng nay bón 3 bao phân lân và xịt 50ml Regent cho vườn bưởi lô A2. Có hiện tượng nhện đỏ xuất hiện rải rác.",
  "output": [
    {
      "loai_hoat_dong": "bon_phan",
      "ngay_thuc_hien": "03/08/2026",
      "mo_ta": "Bón 3 bao phân lân và xịt 50ml Regent cho vườn bưởi lô A2",
      "ma_lo": "A2",
      "cay_trong": "bưởi",
      "materials": [
        {
          "ten_vat_tu": "phân lân",
          "loai_vat_tu": "phan_bon",
          "lieu_luong": 3,
          "don_vi": "BAO"
        },
        {
          "ten_vat_tu": "Regent",
          "loai_vat_tu": "thuoc_bvtv",
          "lieu_luong": 50,
          "don_vi": "ML"
        }
      ],
      "assets": [],
      "observations": [
        {
          "ten_sau_benh": "nhện đỏ",
          "muc_do": "nhẹ",
          "trieu_chung": "xuất hiện rải rác",
          "hinh_anh": null
        }
      ],
      "harvests": []
    }
  ],
  "model": "gemini-2.5-pro",
  "model_name": "gemini-2.5-pro",
  "processing_time": 0.834,
  "processing_time_ms": 834
}
```

---

### 4.3. Kiểm Tra Sức Khỏe Hệ Thống (`GET /health`)

* **Mô tả:** Kiểm tra tình trạng hoạt động của API, bộ xử lý giọng nói STT và kết nối mô hình LLM.
* **Phản Hồi (`200 OK`):**
  ```json
  {
    "status": "ok",
    "stt_engine": "loaded",
    "llm_engine": "ready",
    "model_name": "gemini-2.5-pro",
    "timestamp": "2026-08-03T08:37:00Z"
  }
  ```

---

## 5. Ánh Xạ Với Cơ Sở Dữ Liệu Backend (`activity_ai_extraction`)

Khi phía WebApp / Mobile App gửi yêu cầu tạo nhật ký canh tác (`POST /api/v1/activities`) kèm kết quả từ AI tới máy chủ backend **`agrilog-server`**, backend tự động liên kết và lưu thông tin giám sát AI vào bảng **`activity_ai_extraction`** trong cơ sở dữ liệu PostgreSQL.

### Ánh xạ Trường Dữ Liệu (AI Service $\rightarrow$ PostgreSQL)

| Trường từ API `STTResponse` | Cột trong bảng `activity_ai_extraction` | Kiểu SQL | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| **`model_name`** (hoặc **`model`**) | `model_name` | `VARCHAR(100)` | Tên mô hình AI xử lý (`gemini-2.5-pro`, `llama-3-8b`...) |
| **`input`** (hoặc **`raw_text`**) | `input_text` | `TEXT` | Nội dung câu nói hoặc văn bản gốc người nông dân cung cấp |
| **`output`** | `output_json` | `JSONB` | Toàn bộ mảng JSON hoạt động canh tác đã chuẩn hóa |
| **`processing_time_ms`** | `processing_time_ms` | `INTEGER` | Thời gian xử lý từ AI (tính bằng mili-giây) |
| *(Tham số tùy chọn từ client)* | `confidence` | `DECIMAL(4,3)` | Độ tin cậy dự đoán (0.000 đến 1.000) |
| *(Tham số tùy chọn từ client)* | `prompt_version` | `VARCHAR(50)` | Phiên bản prompt bóc tách của hệ thống |
