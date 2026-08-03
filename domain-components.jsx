import React, { useState, useRef, useEffect } from "react";
import {
  Sprout, Droplets, Wind, Wheat, MapPin, Clock, Package, Image as ImageIcon,
  Mic, Square, Play, Pause, Trash2, Upload, Sparkles, CheckCircle2, Bot,
  ChevronRight, X, RotateCcw, Type, PenLine, Plus, Loader2,
} from "lucide-react";

/**
 * Component nghiệp vụ cho AgriLog — dùng lại token màu đã thiết lập:
 * xanh đất #1C2B1E, vàng lúa #C9A227, nền giấy kem #F7F2DF,
 * viền #E1E5CB/#DCE0C4, chữ #20281B/#33361F/#7C7A4E/#8B9070.
 */

const fontBody = { fontFamily: "'Lora', serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };

/* ----- atoms dùng nội bộ (đồng bộ component-kit đã làm trước) ----- */

function Badge({ variant = "default", children }) {
  const map = {
    default: "bg-[#ECEEDA] text-[#3F6B2C]",
    gold: "bg-[#FBF0D6] text-[#8A6D1F]",
    danger: "bg-[#F6E2DC] text-[#9C4B2E]",
    neutral: "bg-[#EFEBDD] text-[#8B8368]",
    outline: "border border-[#DCE0C4] text-[#52502E]",
  };
  return (
    <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium " + map[variant]} style={fontBody}>
      {children}
    </span>
  );
}

function Btn({ variant = "primary", size = "md", className = "", children, ...props }) {
  const variants = {
    primary: "bg-[#1C2B1E] text-[#F6EFDD] hover:bg-[#243A28]",
    gold: "bg-[#C9A227] text-[#1C2B1E] hover:bg-[#B8931F]",
    secondary: "bg-[#ECEEDA] text-[#20281B] hover:bg-[#E1E5CB]",
    outline: "border border-[#DCE0C4] bg-white text-[#33361F] hover:bg-[#F7F2DF]",
    ghost: "text-[#33361F] hover:bg-[#ECEEDA]",
    danger: "bg-[#C15A34] text-white hover:bg-[#A94B2A]",
  };
  const sizes = { sm: "h-8 px-3 text-[12.5px] gap-1.5", md: "h-10 px-4 text-[13.5px] gap-2" };
  return (
    <button
      className={"inline-flex items-center justify-center rounded-md font-medium shadow-sm transition active:scale-[0.98] disabled:opacity-50 " + variants[variant] + " " + sizes[size] + " " + className}
      style={fontBody}
      {...props}
    >
      {children}
    </button>
  );
}

const ACTIVITY_ICON = { IRRIGATE: Droplets, FERTILIZE: Sprout, SPRAY: Wind, HARVEST: Wheat };
const SOURCE_META = {
  VOICE: { label: "Giọng nói", icon: Mic },
  TEXT: { label: "Văn bản", icon: Type },
  IMAGE: { label: "Hình ảnh", icon: ImageIcon },
  MANUAL: { label: "Nhập tay", icon: PenLine },
};
const AI_STATUS_META = {
  PENDING: { label: "Chờ xử lý", variant: "neutral" },
  PROCESSING: { label: "Đang phân tích", variant: "neutral" },
  COMPLETED: { label: "Đã trích xuất", variant: "gold" },
  CONFIRMED: { label: "Đã xác nhận", variant: "default" },
  FAILED: { label: "Xử lý lỗi", variant: "danger" },
};

/* ========================= ActivityCard ========================= */

export function ActivityCard({ activity }) {
  const Icon = ACTIVITY_ICON[activity.type] || Sprout;
  const src = SOURCE_META[activity.source_type] || SOURCE_META.MANUAL;
  const SrcIcon = src.icon;
  const time = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(activity.start_time));

  return (
    <div className="rounded-xl border border-[#E1E5CB] bg-[#FFFDF6] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECEEDA] text-[#1C2B1E]">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13.5px] font-medium text-[#20281B]" style={fontBody}>{activity.type_name}</p>
            <Badge variant="outline">Thửa {activity.plot_code}</Badge>
            {activity.ai_status && <Badge variant={AI_STATUS_META[activity.ai_status].variant}>{AI_STATUS_META[activity.ai_status].label}</Badge>}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#8B9070]">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.75} /> {time} · {activity.farmer}
          </p>
          {activity.description && (
            <p className="mt-2 text-[13px] leading-relaxed text-[#33361F]" style={fontBody}>{activity.description}</p>
          )}
          {activity.materials?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activity.materials.map((m, i) => (
                <span key={i} className="rounded-full bg-[#F7F2DF] px-2 py-0.5 text-[11px] text-[#7C7A4E]" style={fontMono}>
                  {m.name} · {m.quantity}{m.unit}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-[#8B9070]">
              <SrcIcon className="h-3.5 w-3.5" strokeWidth={1.75} /> {src.label}
              {activity.mediaCount > 0 && <span>· {activity.mediaCount} tệp đính kèm</span>}
            </span>
            <button className="flex items-center gap-0.5 text-[12px] font-medium text-[#8A6D1F] hover:text-[#1C2B1E]">
              Chi tiết <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================= PlotCard ========================= */

export function PlotCard({ plot, onOpen }) {
  const isGrowing = plot.status === "GROWING";
  return (
    <div className="overflow-hidden rounded-xl border border-[#E1E5CB] bg-[#FFFDF6]">
      <div className="flex h-20 items-center justify-center bg-[#ECEEDA]">
        <MapPin className="h-6 w-6 text-[#1C2B1E]/50" strokeWidth={1.5} />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13.5px] font-medium text-[#20281B]" style={fontBody}>{plot.code} · {plot.name}</p>
          <Badge variant={isGrowing ? "default" : "neutral"}>{isGrowing ? "Đang canh tác" : "Đất trống"}</Badge>
        </div>
        <p className="mt-1 text-[12px] text-[#8B9070]">{plot.area} ha · {plot.soil_type}</p>

        {isGrowing ? (
          <>
            <p className="mt-2 text-[12.5px] text-[#33361F]" style={fontBody}>{plot.crop} — {plot.variety}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ECEEDA]">
                <div className="h-full rounded-full bg-[#C9A227]" style={{ width: `${plot.progress}%` }} />
              </div>
              <span className="text-[11px] text-[#7C7A4E]" style={fontMono}>{plot.progress}%</span>
            </div>
          </>
        ) : (
          <p className="mt-2 text-[12px] text-[#A8AC86]" style={fontBody}>Chưa có mùa vụ nào đang triển khai</p>
        )}

        <button onClick={onOpen} className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-[#DCE0C4] py-2 text-[12.5px] font-medium text-[#33361F] transition hover:bg-[#F7F2DF]">
          Xem mùa vụ <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

/* ========================= MapView ========================= */

const STATUS_FILL = { GROWING: "#C4D9A8", FALLOW: "#E7E2CC", ALERT: "#F0C9A9" };
const STATUS_STROKE = { GROWING: "#6B8F4E", FALLOW: "#B3AB92", ALERT: "#C9793E" };

export function MapView({ plots, onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="rounded-xl border border-[#E1E5CB] bg-[#FFFDF6] p-4">
      <svg viewBox="0 0 320 220" className="w-full rounded-lg" style={{ background: "#F7F2DF" }}>
        {plots.map((p) => (
          <g
            key={p.code}
            onMouseEnter={() => setHovered(p.code)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect?.(p.code)}
            className="cursor-pointer"
          >
            <polygon
              points={p.points}
              fill={STATUS_FILL[p.mapStatus]}
              stroke={hovered === p.code ? "#1C2B1E" : STATUS_STROKE[p.mapStatus]}
              strokeWidth={hovered === p.code ? 2 : 1.2}
              opacity={hovered && hovered !== p.code ? 0.6 : 1}
            />
            <text x={p.labelX} y={p.labelY} textAnchor="middle" fontSize="11" fill="#20281B" style={fontMono}>
              {p.code}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11.5px] text-[#7C7A4E]">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_FILL.GROWING, display: "inline-block" }} /> Đang canh tác</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_FILL.FALLOW, display: "inline-block" }} /> Đất trống</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_FILL.ALERT, display: "inline-block" }} /> Có cảnh báo</span>
      </div>
    </div>
  );
}

/* ========================= AudioRecorder ========================= */

export function AudioRecorder({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState(null);
  const timerRef = useRef(null);
  const bars = useRef(Array.from({ length: 28 }, () => 20 + Math.random() * 70));

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  function toggleRecord() {
    if (recording) {
      setRecording(false);
      setRecordedDuration(seconds);
      onRecorded?.(seconds);
    } else {
      setSeconds(0);
      setRecordedDuration(null);
      setRecording(true);
    }
  }

  function fmt(s) {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const r = String(s % 60).padStart(2, "0");
    return `${m}:${r}`;
  }

  return (
    <div className="rounded-xl border border-[#E1E5CB] bg-[#FFFDF6] p-4">
      <div className="flex h-14 items-center gap-[3px] overflow-hidden">
        {bars.current.map((h, i) => (
          <span
            key={i}
            className="w-1 shrink-0 rounded-full"
            style={{
              height: `${recording || recordedDuration ? h : 12}%`,
              background: recording ? "#C15A34" : "#C9A227",
              opacity: recording && i % 3 === 0 ? 0.6 : 1,
              transition: "height 0.2s",
            }}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[13px] text-[#52502E]" style={fontMono}>
          {recording ? `Đang ghi · ${fmt(seconds)}` : recordedDuration ? `Đã ghi · ${fmt(recordedDuration)}` : "Chưa có bản ghi"}
        </span>

        <div className="flex items-center gap-2">
          {recordedDuration != null && !recording && (
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCE0C4] text-[#33361F] hover:bg-[#F7F2DF]" aria-label="Nghe lại">
              <Play className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
          <button
            onClick={toggleRecord}
            className={
              "flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm transition " +
              (recording ? "bg-[#C15A34] hover:bg-[#A94B2A]" : "bg-[#1C2B1E] hover:bg-[#243A28]")
            }
            aria-label={recording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
          >
            {recording ? <Square className="h-4 w-4" strokeWidth={2} fill="currentColor" /> : <Mic className="h-5 w-5" strokeWidth={1.75} />}
          </button>
          {recordedDuration != null && !recording && (
            <button onClick={() => { setRecordedDuration(null); setSeconds(0); }} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCE0C4] text-[#33361F] hover:bg-[#F7F2DF]" aria-label="Ghi lại">
              <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================= ImageUploader ========================= */

export function ImageUploader({ onFilesChange }) {
  const [images, setImages] = useState([]);
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const files = Array.from(fileList).slice(0, 6 - images.length);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ id: `${file.name}-${Date.now()}-${Math.random()}`, name: file.name, url: reader.result });
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((newImgs) => {
      const merged = [...images, ...newImgs];
      setImages(merged);
      onFilesChange?.(merged);
    });
  }

  function removeImage(id) {
    const merged = images.filter((i) => i.id !== id);
    setImages(merged);
    onFilesChange?.(merged);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#DCE0C4] bg-[#FFFDF6] py-7 text-center transition hover:border-[#C9A227] hover:bg-[#F7F2DF]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECEEDA] text-[#1C2B1E]">
          <Upload className="h-4.5 w-4.5" strokeWidth={1.75} />
        </div>
        <p className="text-[13px] text-[#33361F]" style={fontBody}>Kéo thả ảnh vào đây hoặc bấm để chọn</p>
        <p className="text-[11px] text-[#A8AC86]">Tối đa 6 ảnh · JPG, PNG</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-[#E1E5CB]">
              <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute right-1 top-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#151F16]/70 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Xoá ảnh"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================= AIResultCard ========================= */

export function AIResultCard({ result, onConfirm, onEdit }) {
  const status = AI_STATUS_META[result.ai_status] || AI_STATUS_META.PENDING;
  const isBusy = result.ai_status === "PENDING" || result.ai_status === "PROCESSING";

  return (
    <div className="rounded-xl border border-[#DCE0C4] bg-gradient-to-b from-[#FBF7EA] to-[#FFFDF6] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C2B1E] text-[#E7C766]">
            <Bot className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#20281B]" style={fontBody}>{result.model_name}</p>
            <p className="text-[11px] text-[#8B9070]">Trích xuất tự động từ {result.source_type === "VOICE" ? "giọng nói" : "hình ảnh"}</p>
          </div>
        </div>
        <Badge variant={status.variant}>
          {isBusy && <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />}
          {status.label}
        </Badge>
      </div>

      {result.transcript && (
        <p className="mt-3 rounded-lg bg-[#F7F2DF] p-2.5 text-[12.5px] italic text-[#52502E]" style={fontBody}>
          “{result.transcript}”
        </p>
      )}

      {!isBusy && result.extracted && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {Object.entries(result.extracted).map(([key, value]) => (
            <div key={key} className="rounded-lg bg-[#ECEEDA] px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-[#7C9068]" style={fontMono}>{key}</p>
              <p className="text-[12.5px] text-[#20281B]" style={fontBody}>{String(value)}</p>
            </div>
          ))}
        </div>
      )}

      {!isBusy && (
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-[#8B9070]">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} /> Độ tin cậy {Math.round(result.confidence * 100)}%
          </span>
          {result.ai_status === "COMPLETED" && (
            <div className="flex items-center gap-2">
              <Btn variant="ghost" size="sm" onClick={onEdit}>Chỉnh sửa</Btn>
              <Btn variant="gold" size="sm" onClick={onConfirm}>
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Xác nhận
              </Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ========================= ActivityForm ========================= */

const ACTIVITY_TYPES = [
  { code: "IRRIGATE", name: "Tưới nước" },
  { code: "FERTILIZE", name: "Bón phân" },
  { code: "SPRAY", name: "Phun thuốc" },
  { code: "HARVEST", name: "Thu hoạch" },
];
const SOURCE_TABS = ["MANUAL", "TEXT", "VOICE", "IMAGE"];

export function ActivityForm({ plots = [], onSubmit, onCancel }) {
  const [source, setSource] = useState("MANUAL");
  const [materials, setMaterials] = useState([{ name: "", quantity: "", unit: "" }]);

  function addMaterialRow() {
    setMaterials([...materials, { name: "", quantity: "", unit: "" }]);
  }
  function updateMaterial(i, field, value) {
    const next = [...materials];
    next[i][field] = value;
    setMaterials(next);
  }
  function removeMaterial(i) {
    setMaterials(materials.filter((_, idx) => idx !== i));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }} className="space-y-4">
      <div>
        <p className="mb-1.5 text-[13px] font-medium text-[#3A3527]" style={fontBody}>Nguồn ghi nhận</p>
        <div className="flex rounded-lg bg-[#ECEEDA] p-1">
          {SOURCE_TABS.map((s) => {
            const meta = SOURCE_META[s];
            const Icon = meta.icon;
            return (
              <button
                type="button"
                key={s}
                onClick={() => setSource(s)}
                className={"flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md text-[12.5px] font-medium transition " + (source === s ? "bg-white text-[#1C2B1E] shadow-sm" : "text-[#8B9070] hover:text-[#33361F]")}
                style={fontBody}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} /> {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {source === "VOICE" && <AudioRecorder />}
      {source === "IMAGE" && <ImageUploader />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#3A3527]" style={fontBody}>Thửa</label>
          <select className="h-10 w-full rounded-md border border-[#DCE0C4] bg-white px-3 text-[13.5px] text-[#262A1E] outline-none focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30" style={fontBody}>
            {plots.map((p) => <option key={p.code} value={p.code}>{p.code} · {p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#3A3527]" style={fontBody}>Loại hoạt động</label>
          <select className="h-10 w-full rounded-md border border-[#DCE0C4] bg-white px-3 text-[13.5px] text-[#262A1E] outline-none focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30" style={fontBody}>
            {ACTIVITY_TYPES.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-[#3A3527]" style={fontBody}>Thời gian bắt đầu</label>
        <input type="datetime-local" className="h-10 w-full rounded-md border border-[#DCE0C4] bg-white px-3 text-[13.5px] text-[#262A1E] outline-none focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30" style={fontBody} />
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-[#3A3527]" style={fontBody}>Mô tả / ghi chú</label>
        <textarea rows={3} placeholder="Ví dụ: tưới nước buổi sáng, mực nước ổn định..." className="w-full resize-none rounded-md border border-[#DCE0C4] bg-white px-3 py-2.5 text-[13.5px] text-[#262A1E] placeholder:text-[#A8AC86] outline-none focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30" style={fontBody} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-[13px] font-medium text-[#3A3527]" style={fontBody}>Vật tư sử dụng</label>
          <button type="button" onClick={addMaterialRow} className="flex items-center gap-1 text-[12px] font-medium text-[#8A6D1F] hover:text-[#1C2B1E]">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Thêm dòng
          </button>
        </div>
        <div className="space-y-2">
          {materials.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input placeholder="Tên vật tư" value={m.name} onChange={(e) => updateMaterial(i, "name", e.target.value)} className="h-9 flex-1 rounded-md border border-[#DCE0C4] bg-white px-3 text-[13px] text-[#262A1E] placeholder:text-[#A8AC86] outline-none focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30" style={fontBody} />
              <input placeholder="SL" value={m.quantity} onChange={(e) => updateMaterial(i, "quantity", e.target.value)} className="h-9 w-16 rounded-md border border-[#DCE0C4] bg-white px-2 text-[13px] text-[#262A1E] placeholder:text-[#A8AC86] outline-none focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30" style={fontBody} />
              <input placeholder="ĐV" value={m.unit} onChange={(e) => updateMaterial(i, "unit", e.target.value)} className="h-9 w-16 rounded-md border border-[#DCE0C4] bg-white px-2 text-[13px] text-[#262A1E] placeholder:text-[#A8AC86] outline-none focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30" style={fontBody} />
              <button type="button" onClick={() => removeMaterial(i)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#8B9070] hover:bg-[#F6E2DC] hover:text-[#9C4B2E]" aria-label="Xoá dòng">
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Btn variant="secondary" type="button" onClick={onCancel}>Huỷ</Btn>
        <Btn variant="primary" type="submit">Lưu hoạt động</Btn>
      </div>
    </form>
  );
}

/* ========================= Demo ========================= */

const DEMO_PLOTS = [
  { code: "A1", name: "Ruộng trước nhà", area: 1.2, soil_type: "Đất phù sa", status: "GROWING", crop: "Lúa", variety: "OM5451", progress: 68, mapStatus: "ALERT", points: "20,20 140,20 150,90 10,90", labelX: 80, labelY: 58 },
  { code: "A2", name: "Ruộng sau vườn", area: 0.8, soil_type: "Đất thịt", status: "GROWING", crop: "Lúa", variety: "ST25", progress: 41, mapStatus: "GROWING", points: "160,20 300,20 300,90 170,90", labelX: 230, labelY: 58 },
  { code: "B1", name: "Vườn xoài", area: 0.5, soil_type: "Đất cát pha", status: "GROWING", crop: "Xoài", variety: "Cát Hòa Lộc", progress: 89, mapStatus: "GROWING", points: "20,110 150,110 140,190 10,190", labelX: 80, labelY: 152 },
  { code: "C1", name: "Ruộng góc kênh", area: 1.0, soil_type: "Đất phù sa", status: "FALLOW", progress: 0, mapStatus: "FALLOW", points: "170,110 300,110 300,190 160,190", labelX: 230, labelY: 152 },
];

const DEMO_ACTIVITY = {
  type: "IRRIGATE", type_name: "Tưới nước", plot_code: "A1", farmer: "Ông Ba",
  start_time: "2026-08-03T06:20:00", source_type: "VOICE", ai_status: "CONFIRMED",
  description: "Tưới nước buổi sáng, mực nước ruộng ổn định khoảng 5cm.",
  materials: [{ name: "Nước tưới", quantity: 200, unit: "L" }], mediaCount: 1,
};

const DEMO_AI_RESULT = {
  model_name: "AgriLog Extractor v2", source_type: "VOICE", ai_status: "COMPLETED", confidence: 0.91,
  transcript: "Sáng nay tôi phun thuốc trừ sâu cuốn lá cho ruộng A1, dùng khoảng 2 lít.",
  extracted: { hoat_dong: "Phun thuốc", thua: "A1", vat_tu: "Thuốc trừ sâu", so_luong: "2 lít" },
};

export default function DomainComponentsDemo() {
  const [aiResult, setAiResult] = useState(DEMO_AI_RESULT);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#F7F2DF] p-6 sm:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@500&display=swap');
      `}</style>

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ActivityCard activity={DEMO_ACTIVITY} />
          <AIResultCard result={aiResult} onConfirm={() => setAiResult({ ...aiResult, ai_status: "CONFIRMED" })} onEdit={() => setShowForm(true)} />
        </div>

        <MapView plots={DEMO_PLOTS} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_PLOTS.map((p) => <PlotCard key={p.code} plot={p} onOpen={() => setShowForm(true)} />)}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AudioRecorder />
          <ImageUploader />
        </div>

        <div className="rounded-2xl border border-[#E1E5CB] bg-[#FFFDF6] p-5">
          <p className="mb-4 text-[15px] font-medium text-[#20281B]" style={fontBody}>Ghi hoạt động mới</p>
          <ActivityForm plots={DEMO_PLOTS} onCancel={() => {}} onSubmit={() => {}} />
        </div>
      </div>
    </div>
  );
}
