import React, { useState } from "react";
import {
  Sprout, CloudRain, Droplets, Wheat, AlertTriangle, Package,
  Tractor, MapPin, TrendingUp, Mic, Camera, Type, PenLine,
  Sun, CloudSun, Wind, ChevronRight, Plus,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";

/**
 * Dashboard nông dân — dựng trên schema AgriLog:
 * farm -> plot -> season (crop_variety) -> activity (+material/asset/observation/harvest/weather)
 * Tông màu: xanh đất #1C2B1E + vàng lúa #C9A227 trên nền giấy kem #F7F2DF,
 * đồng bộ với trang auth đã làm trước đó.
 */

// ---------- Mock data theo đúng field của schema ----------

const FARM = { name: "Nông trại Ba Xuân", address: "Xã Tân Phú, Đồng Tháp" };

const PLOTS_WITH_SEASON = [
  {
    plot_code: "A1", plot_name: "Ruộng trước nhà", area: 1.2, soil_type: "Đất phù sa",
    crop: "Lúa", variety: "OM5451", planting_date: "2026-05-10", expected_harvest_date: "2026-08-20",
    status: "GROWING", progress: 68,
  },
  {
    plot_code: "A2", plot_name: "Ruộng sau vườn", area: 0.8, soil_type: "Đất thịt",
    crop: "Lúa", variety: "ST25", planting_date: "2026-06-02", expected_harvest_date: "2026-09-12",
    status: "GROWING", progress: 41,
  },
  {
    plot_code: "B1", plot_name: "Vườn xoài", area: 0.5, soil_type: "Đất cát pha",
    crop: "Xoài", variety: "Xoài cát Hòa Lộc", planting_date: "2026-01-15", expected_harvest_date: "2026-08-05",
    status: "GROWING", progress: 89,
  },
  {
    plot_code: "C1", plot_name: "Ruộng góc kênh", area: 1.0, soil_type: "Đất phù sa",
    crop: null, variety: null, planting_date: null, expected_harvest_date: null,
    status: "FALLOW", progress: 0,
  },
];

const ACTIVITY_ICON = {
  IRRIGATE: Droplets,
  FERTILIZE: Sprout,
  SPRAY: Wind,
  HARVEST: Wheat,
};

const SOURCE_LABEL = {
  VOICE: { label: "Giọng nói", icon: Mic },
  TEXT: { label: "Văn bản", icon: Type },
  IMAGE: { label: "Hình ảnh", icon: Camera },
  MANUAL: { label: "Nhập tay", icon: PenLine },
};

const RECENT_ACTIVITIES = [
  {
    id: 1, plot_code: "A1", type: "IRRIGATE", type_name: "Tưới nước",
    farmer: "Ông Ba", start_time: "2026-08-03T06:20:00", source_type: "VOICE",
  },
  {
    id: 2, plot_code: "B1", type: "SPRAY", type_name: "Phun thuốc",
    farmer: "Chị Xuân", start_time: "2026-08-02T16:05:00", source_type: "IMAGE",
  },
  {
    id: 3, plot_code: "A2", type: "FERTILIZE", type_name: "Bón phân",
    farmer: "Ông Ba", start_time: "2026-08-02T07:40:00", source_type: "TEXT",
  },
  {
    id: 4, plot_code: "A1", type: "HARVEST", type_name: "Thu hoạch thử",
    farmer: "Ông Ba", start_time: "2026-08-01T15:10:00", source_type: "MANUAL",
  },
];

const OBSERVATIONS = [
  { id: 1, plot_code: "B1", symptom: "Đốm lá vàng trên xoài", severity: "MEDIUM", created_at: "2026-08-02" },
  { id: 2, plot_code: "A2", symptom: "Rầy nâu xuất hiện rải rác", severity: "LOW", created_at: "2026-08-01" },
  { id: 3, plot_code: "A1", symptom: "Sâu cuốn lá mật độ cao", severity: "HIGH", created_at: "2026-07-30" },
];

const SEVERITY_STYLE = {
  LOW: { bg: "bg-[#ECEEDA]", text: "text-[#52502E]", dot: "bg-[#8B9070]" },
  MEDIUM: { bg: "bg-[#FBF0D6]", text: "text-[#8A6D1F]", dot: "bg-[#C9A227]" },
  HIGH: { bg: "bg-[#F6E2DC]", text: "text-[#9C4B2E]", dot: "bg-[#C15A34]" },
};

const INVENTORY = [
  { material: "Phân NPK 20-20-15", quantity: 42, unit: "kg", low: false },
  { material: "Thuốc trừ sâu sinh học", quantity: 3, unit: "lít", low: true },
  { material: "Giống lúa OM5451", quantity: 8, unit: "kg", low: true },
  { material: "Vôi bột", quantity: 120, unit: "kg", low: false },
];

const WEATHER = { temperature: 31.5, humidity: 78, rainfall: 4.2, wind_speed: 9, condition: "CLOUDY" };

const WEATHER_ICON = { SUNNY: Sun, CLOUDY: CloudSun, RAINY: CloudRain, STORMY: CloudRain, FOGGY: CloudSun, WINDY: Wind };

const HARVEST_BY_MONTH = [
  { month: "T3", quantity: 0 },
  { month: "T4", quantity: 0 },
  { month: "T5", quantity: 320 },
  { month: "T6", quantity: 410 },
  { month: "T7", quantity: 260 },
  { month: "T8", quantity: 180 },
];

// ---------- Helpers ----------

function formatDate(iso) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(iso));
}
function formatTime(iso) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(d);
  return sameDay ? `Hôm nay, ${time}` : `${formatDate(iso)}, ${time}`;
}

// ---------- UI atoms ----------

function Card({ children, className = "" }) {
  return (
    <div className={"rounded-2xl border border-[#E1E5CB] bg-[#FFFDF6] p-5 shadow-sm " + className}>
      {children}
    </div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[15px] font-medium text-[#20281B]" style={{ fontFamily: "'Lora', serif" }}>
        {children}
      </h2>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECEEDA] text-[#1C2B1E]">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] text-[#7C7A4E]" style={{ fontFamily: "'Lora', serif" }}>{label}</p>
        <p className="text-[22px] leading-tight text-[#20281B]" style={{ fontFamily: "'Lora', serif", fontWeight: 500 }}>
          {value}
        </p>
        {sub && <p className="mt-0.5 text-[11px] text-[#8B9070]">{sub}</p>}
      </div>
    </Card>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ECEEDA]">
      <div className="h-full rounded-full bg-[#C9A227]" style={{ width: `${value}%` }} />
    </div>
  );
}

// ---------- Dashboard ----------

export default function FarmerDashboard() {
  const [farmerName] = useState("Ông Ba");
  const growingCount = PLOTS_WITH_SEASON.filter((p) => p.status === "GROWING").length;
  const totalArea = PLOTS_WITH_SEASON.reduce((s, p) => s + p.area, 0);
  const highAlerts = OBSERVATIONS.filter((o) => o.severity === "HIGH").length;
  const WeatherIcon = WEATHER_ICON[WEATHER.condition] || CloudSun;

  return (
    <div className="min-h-screen w-full bg-[#F7F2DF] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@500&display=swap');
      `}</style>

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#8B9070]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {FARM.address}
          </p>
          <h1 className="mt-1 text-[24px] text-[#20281B]" style={{ fontFamily: "'Lora', serif", fontWeight: 500 }}>
            Chào {farmerName}, {FARM.name}
          </h1>
        </div>
        <button className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#1C2B1E] px-4 text-[14px] font-medium text-[#F6EFDD] shadow-sm transition hover:bg-[#243A28]">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Ghi hoạt động mới
        </button>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={MapPin} label="Diện tích canh tác" value={`${totalArea.toFixed(1)} ha`} sub={`${PLOTS_WITH_SEASON.length} thửa`} />
        <StatCard icon={Sprout} label="Mùa vụ đang phát triển" value={growingCount} sub="trên tổng số thửa" />
        <StatCard icon={AlertTriangle} label="Cảnh báo sâu bệnh" value={OBSERVATIONS.length} sub={highAlerts > 0 ? `${highAlerts} mức cao` : "chưa có mức cao"} />
        <StatCard icon={Package} label="Vật tư sắp hết" value={INVENTORY.filter((i) => i.low).length} sub="cần bổ sung" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Cột trái + giữa */}
        <div className="space-y-5 lg:col-span-2">
          {/* Mùa vụ đang triển khai */}
          <Card>
            <SectionTitle action={<ChevronRight className="h-4 w-4 text-[#8B9070]" />}>
              Mùa vụ đang triển khai
            </SectionTitle>
            <div className="space-y-3">
              {PLOTS_WITH_SEASON.map((p) => (
                <div key={p.plot_code} className="rounded-xl border border-[#E1E5CB] p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-[#20281B]" style={{ fontFamily: "'Lora', serif" }}>
                        {p.plot_code} · {p.plot_name}
                        {p.crop && <span className="text-[#7C7A4E]"> — {p.crop} ({p.variety})</span>}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#8B9070]">
                        {p.status === "FALLOW"
                          ? `Đang bỏ hoang · ${p.area} ha · ${p.soil_type}`
                          : `Gieo trồng ${formatDate(p.planting_date)} · Dự kiến thu hoạch ${formatDate(p.expected_harvest_date)}`}
                      </p>
                    </div>
                    <span
                      className={
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium " +
                        (p.status === "GROWING" ? "bg-[#ECEEDA] text-[#3F6B2C]" : "bg-[#EFEBDD] text-[#8B8368]")
                      }
                    >
                      {p.status === "GROWING" ? "Đang phát triển" : "Đất trống"}
                    </span>
                  </div>
                  {p.status === "GROWING" && (
                    <div className="mt-3 flex items-center gap-3">
                      <ProgressBar value={p.progress} />
                      <span className="w-9 shrink-0 text-right text-[11px] text-[#7C7A4E]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {p.progress}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Hoạt động gần đây */}
          <Card>
            <SectionTitle>Hoạt động gần đây</SectionTitle>
            <div className="divide-y divide-[#EEF0E1]">
              {RECENT_ACTIVITIES.map((a) => {
                const Icon = ACTIVITY_ICON[a.type] || Tractor;
                const src = SOURCE_LABEL[a.source_type];
                const SrcIcon = src.icon;
                return (
                  <div key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECEEDA] text-[#1C2B1E]">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] text-[#20281B]" style={{ fontFamily: "'Lora', serif" }}>
                        {a.type_name} · thửa {a.plot_code}
                      </p>
                      <p className="text-[12px] text-[#8B9070]">{a.farmer} · {formatTime(a.start_time)}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#F7F2DF] px-2 py-1 text-[10.5px] text-[#7C7A4E]">
                      <SrcIcon className="h-3 w-3" strokeWidth={1.75} />
                      {src.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Sản lượng thu hoạch */}
          <Card>
            <SectionTitle>Sản lượng thu hoạch theo tháng (kg)</SectionTitle>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HARVEST_BY_MONTH} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#EEF0E1" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8B9070" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#8B9070" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "#ECEEDA" }}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E1E5CB", fontSize: 12 }}
                  />
                  <Bar dataKey="quantity" fill="#C9A227" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Cột phải */}
        <div className="space-y-5">
          {/* Thời tiết */}
          <Card>
            <SectionTitle>Thời tiết hôm nay</SectionTitle>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ECEEDA] text-[#1C2B1E]">
                <WeatherIcon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[26px] leading-none text-[#20281B]" style={{ fontFamily: "'Lora', serif", fontWeight: 500 }}>
                  {WEATHER.temperature}°C
                </p>
                <p className="mt-1 text-[12px] text-[#8B9070]">Độ ẩm {WEATHER.humidity}% · Gió {WEATHER.wind_speed} km/h</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#F7F2DF] px-3 py-2 text-[12px] text-[#7C7A4E]">
              <CloudRain className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              Lượng mưa ghi nhận gần nhất: {WEATHER.rainfall} mm
            </div>
          </Card>

          {/* Cảnh báo quan sát */}
          <Card>
            <SectionTitle>Quan sát sâu bệnh</SectionTitle>
            <div className="space-y-2.5">
              {OBSERVATIONS.map((o) => {
                const s = SEVERITY_STYLE[o.severity];
                return (
                  <div key={o.id} className={"flex items-start gap-2.5 rounded-lg p-2.5 " + s.bg}>
                    <span className={"mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full " + s.dot} />
                    <div className="min-w-0">
                      <p className={"text-[12.5px] leading-snug " + s.text} style={{ fontFamily: "'Lora', serif" }}>
                        {o.symptom}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#8B9070]">Thửa {o.plot_code} · {formatDate(o.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Tồn kho vật tư */}
          <Card>
            <SectionTitle>Tồn kho vật tư</SectionTitle>
            <div className="space-y-3">
              {INVENTORY.map((i) => (
                <div key={i.material} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-[#20281B]" style={{ fontFamily: "'Lora', serif" }}>{i.material}</p>
                    {i.low && <p className="text-[11px] text-[#C15A34]">Sắp hết, nên bổ sung</p>}
                  </div>
                  <span
                    className={
                      "shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium " +
                      (i.low ? "bg-[#F6E2DC] text-[#9C4B2E]" : "bg-[#ECEEDA] text-[#3F6B2C]")
                    }
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {i.quantity} {i.unit}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
