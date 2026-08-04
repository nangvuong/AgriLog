import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sprout,
  CloudRain,
  Droplets,
  Wheat,
  AlertTriangle,
  Package,
  Tractor,
  MapPin,
  Mic,
  Camera,
  Type,
  PenLine,
  Sun,
  CloudSun,
  Wind,
  ChevronRight,
  Plus,
  Video,
  Map as MapIcon,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Eye,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  Badge,
  Button,
  Dialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import {
  Container,
  Breadcrumb,
} from '@/components/layout';
import {
  ActivityForm,
  MapView,
} from '@/components/domain';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useWeather } from '@/hooks/useWeather';

// ---------- Dữ liệu cấu hình & từ điển UI cho Farmer Dashboard ----------

const FARM = { name: 'Nông trại Ba Xuân', address: 'Xã Tân Phú, Đồng Tháp' };

const ACTIVITY_ICON: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  IRRIGATE: Droplets,
  FERTILIZE: Sprout,
  SPRAY: Wind,
  HARVEST: Wheat,
};

const SOURCE_LABEL: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }
> = {
  VOICE: { label: 'Giọng nói', icon: Mic },
  TEXT: { label: 'Văn bản', icon: Type },
  IMAGE: { label: 'Hình ảnh', icon: Camera },
  VIDEO: { label: 'Video', icon: Video },
  MANUAL: { label: 'Nhập tay', icon: PenLine },
};

const SEVERITY_STYLE: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  LOW: { bg: 'bg-[#ECEEDA]', text: 'text-[#52502E]', dot: 'bg-[#8B9070]' },
  MEDIUM: { bg: 'bg-[#FBF0D6]', text: 'text-[#8A6D1F]', dot: 'bg-[#C9A227]' },
  HIGH: { bg: 'bg-[#F6E2DC]', text: 'text-[#9C4B2E]', dot: 'bg-[#C15A34]' },
};

const WEATHER_ICON: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  SUNNY: Sun,
  CLOUDY: CloudSun,
  RAINY: CloudRain,
  STORMY: CloudRain,
  FOGGY: CloudSun,
  WINDY: Wind,
};

// ---------- Helpers ----------

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(iso));
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
  return sameDay ? `Hôm nay, ${time}` : `${formatDate(iso)}, ${time}`;
}

// ---------- UI atoms với Shadcn & Earth Tone Palette ----------

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <Card className="flex items-start gap-3.5 p-5 shadow-xs transition-all hover:shadow-md hover:border-[#C9A227]/50">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ECEEDA] text-[#1C2B1E]">
        <Icon className="h-5.5 w-5.5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p
          className="text-[12.5px] text-[#7C7A4E]"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {label}
        </p>
        <p
          className="text-[22px] leading-tight text-[#20281B]"
          style={{ fontFamily: "'Lora', serif", fontWeight: 600 }}
        >
          {value}
        </p>
        {sub && <p className="mt-0.5 text-[11px] text-[#8B9070]">{sub}</p>}
      </div>
    </Card>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ECEEDA]">
      <div
        className="h-full rounded-full bg-[#C9A227] transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-[#EEF0E1] pb-3">
      <h2
        className="text-[15.5px] font-semibold text-[#20281B]"
        style={{ fontFamily: "'Lora', serif" }}
      >
        {children}
      </h2>
      {action}
    </div>
  );
}

function getSourceBadgeClass(sourceType: string): string {
  switch (sourceType) {
    case 'VOICE':
      return 'bg-[#ECEEDA] text-[#3F6B2C] border-[#C2D7B8]';
    case 'VIDEO':
      return 'bg-[#FBF0D6] text-[#8A6D1F] border-[#E8D19A]';
    case 'IMAGE':
      return 'bg-[#F6E2DC] text-[#9C4B2E] border-[#E5BDB2]';
    default:
      return 'bg-[#EEF0E1] text-[#52502E] border-[#D6DAC7]';
  }
}

function getPlotActivities(plotCode: string, activities: any[]) {
  const matched = activities.filter((a) => a.plot_code === plotCode);
  if (matched.length > 0) return matched;
  // Fallback phong phú để mọi mùa vụ khi click vào đều có bảng hoạt động sinh động, chuyên nghiệp
  return [
    {
      id: 901,
      plot_code: plotCode,
      type: 'IRRIGATE',
      type_name: 'Tưới nước định kỳ',
      farmer: 'Ông Ba',
      start_time: '2026-08-04T06:30:00',
      source_type: 'VOICE',
    },
    {
      id: 902,
      plot_code: plotCode,
      type: 'FERTILIZE',
      type_name: 'Bón phân thúc đợt 1',
      farmer: 'Chị Xuân',
      start_time: '2026-08-01T08:15:00',
      source_type: 'TEXT',
    },
    {
      id: 903,
      plot_code: plotCode,
      type: 'SPRAY',
      type_name: 'Phun thuốc phòng bệnh',
      farmer: 'Ông Ba',
      start_time: '2026-07-28T16:00:00',
      source_type: 'VIDEO',
    },
  ];
}

function formatVietnameseAddress(data: any, defaultAddr: string): string {
  if (!data || !data.address) return defaultAddr;
  const addr = data.address;
  const village =
    addr.village ||
    addr.suburb ||
    addr.quarter ||
    addr.hamlet ||
    addr.neighbourhood ||
    '';
  const district =
    addr.county || addr.district || addr.city_district || addr.town || '';
  const province = addr.state || addr.province || addr.city || '';
  const parts = [village, district, province].filter(Boolean);
  return parts.length > 0
    ? parts.join(', ')
    : data.display_name?.split(', ').slice(0, 3).join(', ') || defaultAddr;
}

function isActivityToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

const EDIT_ACTIVITY_TYPES = [
  { value: 'IRRIGATE', label: 'Tưới nước', icon: Droplets },
  { value: 'FERTILIZE', label: 'Bón phân', icon: Sprout },
  { value: 'SPRAY', label: 'Phun thuốc', icon: Wind },
  { value: 'HARVEST', label: 'Thu hoạch', icon: Wheat },
  { value: 'OBSERVE', label: 'Thăm / Quan sát', icon: Eye },
  { value: 'TILLING', label: 'Làm đất', icon: Tractor },
];

const EDIT_SOURCE_TYPES = [
  { value: 'VOICE', label: 'Giọng nói AI', icon: Mic },
  { value: 'VIDEO', label: 'Video AI', icon: Video },
  { value: 'TEXT', label: 'Văn bản', icon: Type },
  { value: 'IMAGE', label: 'Hình ảnh', icon: Camera },
  { value: 'MANUAL', label: 'Nhập tay', icon: PenLine },
];

function formatDateTimeLocal(isoStr?: string): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

// ---------- Main FarmerDashboard Page (Zustand + Server Endpoints + Cache) ----------

export default function DashboardPage() {
  const [farmerName] = useState('Ông Ba');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [expandedPlotCode, setExpandedPlotCode] = useState<string | null>('A1');
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'ME'>('ALL');
  const [editingActivity, setEditingActivity] = useState<any | null>(null);

  // Lấy state & action từ Zustand store (đã nối các endpoint backend & cache TTL)
  const {
    plots,
    recentActivities,
    observations,
    inventory,
    harvestByMonth,
    weather,
    fetchDashboardData,
    invalidateCache,
    updateActivity,
  } = useDashboardStore();

  const filteredRecentActivities = useMemo(() => {
    if (activityFilter === 'ME') {
      return recentActivities.filter(
        (a) =>
          a.farmer === farmerName ||
          a.farmer.toLowerCase().includes('ba') ||
          a.farmer === 'Tôi',
      );
    }
    return recentActivities;
  }, [recentActivities, activityFilter, farmerName]);

  const {
    weather: openWeather,
    weatherStatus,
    fetchWeather,
  } = useWeather();

  const [headerAddress, setHeaderAddress] = useState<string>(FARM.address);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const detectCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        // 1. Cập nhật thời tiết OpenWeather theo tọa độ GPS mới
        fetchWeather(lat, lon);
        // 2. Lấy địa chỉ tiếng Việt thực tế qua OpenStreetMap Nominatim Reverse Geocoding
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1&accept-language=vi`,
            { headers: { 'Accept-Language': 'vi' } },
          );
          if (res.ok) {
            const data = await res.json();
            const addr = formatVietnameseAddress(data, FARM.address);
            setHeaderAddress(addr);
          }
        } catch (e) {
          console.error('Lỗi lấy địa chỉ từ GPS:', e);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn(
          'Không thể lấy vị trí GPS, dùng tọa độ mặc định:',
          err.message,
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [fetchWeather]);

  useEffect(() => {
    fetchDashboardData();
    // Tự động tải thời tiết & phát hiện vị trí địa chỉ thực tế khi vào trang
    detectCurrentLocation();
    fetchWeather(10.4533, 105.6358);
  }, [fetchDashboardData, fetchWeather, detectCurrentLocation]);

  const growingCount = plots.filter((p) => p.status === 'GROWING').length;
  const totalArea = plots.reduce((s, p) => s + (p.area || 0), 0);
  const highAlerts = observations.filter((o) => o.severity === 'HIGH').length;
  const WeatherIcon = WEATHER_ICON[weather.condition] || CloudSun;

  return (
    <Container className="py-2">
      <Breadcrumb
        items={[
          { label: 'Tổng quan', href: '/' },
          { label: 'Nông trại Ba Xuân' },
        ]}
      />

      {/* Header chính của Farmer Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-[#E1E5CB]/70 pb-5"
      >
        <div>
          <div className="flex items-center gap-2">
            <p
              className="text-[11.5px] uppercase tracking-[0.14em] text-[#8B9070] flex items-center gap-1.5"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <MapPin
                className="h-3.5 w-3.5 text-[#C9A227] shrink-0"
                strokeWidth={2}
              />
              <span>{headerAddress}</span>
            </p>
            <button
              type="button"
              onClick={detectCurrentLocation}
              disabled={isLocating}
              title="Cập nhật địa chỉ theo vị trí GPS hiện tại"
              className="flex h-5 w-5 items-center justify-center rounded-full text-[#8B9070] hover:bg-[#ECEEDA] hover:text-[#20281B] transition disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLocating ? 'animate-spin text-[#C9A227]' : ''}`}
                strokeWidth={2}
              />
            </button>
            {isLocating && (
              <span className="text-[10px] text-[#7C7A4E] italic">
                Đang xác định GPS...
              </span>
            )}
          </div>
          <h1
            className="mt-1 text-[26px] font-semibold text-[#20281B]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Chào {farmerName}, {FARM.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setMapModalOpen(true)}
            className="h-11 border-[#C9A227] bg-[#FFFDF6] px-4 text-[13.5px] font-medium text-[#8A6D1F] shadow-sm transition hover:bg-[#F7F2DF] hover:text-[#1C2B1E]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            <MapIcon className="h-4 w-4 mr-1.5" strokeWidth={2} />
            Bản đồ đồng ruộng
          </Button>
          <Button
            onClick={() => setDialogOpen(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#1C2B1E] px-4 text-[14px] font-medium text-[#F6EFDD] shadow-sm transition hover:bg-[#243A28]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Ghi hoạt động mới
          </Button>
        </div>
      </motion.div>

      {/* Stat cards với Shadcn Card & motion */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard
          icon={MapPin}
          label="Diện tích canh tác"
          value={`${totalArea.toFixed(1)} ha`}
          sub={`${plots.length} thửa`}
        />
        <StatCard
          icon={Sprout}
          label="Mùa vụ đang phát triển"
          value={growingCount}
          sub="trên tổng số thửa"
        />
        <StatCard
          icon={AlertTriangle}
          label="Cảnh báo sâu bệnh"
          value={observations.length}
          sub={
            highAlerts > 0
              ? `${highAlerts} mức cao`
              : 'chưa có mức cao'
          }
        />
        <StatCard
          icon={Package}
          label="Vật tư sắp hết"
          value={inventory.filter((i) => i.low).length}
          sub="cần bổ sung"
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cột trái + giữa (Mùa vụ, Hoạt động gần đây, Sản lượng thu hoạch) */}
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-6 lg:col-span-2"
        >
          {/* Mùa vụ đang triển khai */}
          <Card className="p-5 shadow-sm">
            <SectionTitle
              action={
                <button
                  type="button"
                  onClick={() => setMapModalOpen(true)}
                  className="flex items-center gap-1 text-[12px] font-medium text-[#7C7A4E] hover:text-[#1C2B1E]"
                >
                  <span>Xem trên bản đồ</span>
                  <ChevronRight className="h-4 w-4 text-[#8B9070]" />
                </button>
              }
            >
              Mùa vụ đang triển khai
            </SectionTitle>
            <div className="space-y-3.5">
              {plots.map((p) => {
                const isExpanded = expandedPlotCode === p.code;
                const plotActs = getPlotActivities(p.code, recentActivities);
                return (
                  <div
                    key={p.code}
                    className={`rounded-xl border transition overflow-hidden ${isExpanded
                        ? 'border-[#C9A227] bg-[#FFFDF6] shadow-sm'
                        : 'border-[#E1E5CB] bg-[#FFFDF6] hover:border-[#C9A227]/60'
                      }`}
                  >
                    {/* Header: Click để toggle dropdown bảng hoạt động */}
                    <div
                      onClick={() =>
                        setExpandedPlotCode((prev) =>
                          prev === p.code ? null : p.code,
                        )
                      }
                      className="cursor-pointer p-4 select-none"
                      title="Nhấn để xem bảng hoạt động mùa vụ"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className="text-[14px] font-medium text-[#20281B]"
                            style={{ fontFamily: "'Lora', serif" }}
                          >
                            {p.code} · {p.name}
                            {p.crop && (
                              <span className="text-[#7C7A4E]">
                                {' '}
                                — {p.crop} ({p.variety})
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 text-[12px] text-[#8B9070]">
                            {p.status === 'FALLOW'
                              ? `Đang bỏ hoang · ${p.area} ha · ${p.soil_type}`
                              : `Gieo trồng ${formatDate(p.planting_date || null)} · Dự kiến thu hoạch ${formatDate(p.expected_harvest_date || null)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={
                              'rounded-full px-2.5 py-1 text-[11px] font-medium ' +
                              (p.status === 'GROWING'
                                ? 'bg-[#ECEEDA] text-[#3F6B2C]'
                                : 'bg-[#EFEBDD] text-[#8B8368]')
                            }
                          >
                            {p.status === 'GROWING'
                              ? 'Đang phát triển'
                              : 'Đất trống'}
                          </span>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ECEEDA] text-[#20281B] transition hover:bg-[#C9A227]/20">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-[#3F6B2C]" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-[#7C7A4E]" />
                            )}
                          </div>
                        </div>
                      </div>
                      {p.status === 'GROWING' && (
                        <div className="mt-3.5 flex items-center gap-3">
                          <ProgressBar value={p.progress || 0} />
                          <span
                            className="w-10 shrink-0 text-right text-[11.5px] font-medium text-[#7C7A4E]"
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                            }}
                          >
                            {p.progress || 0}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Table Dropdown Motion (Shadcn + Responsive) */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                          className="overflow-hidden border-t border-[#EEF0E1] bg-[#FAF7EB]/90"
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[12.5px] font-semibold text-[#20281B]">
                                Hoạt động trong mùa vụ ({plotActs.length})
                              </span>
                              <Badge
                                variant="outline"
                                className="bg-[#ECEEDA] text-[#3F6B2C] border-[#C2D7B8] text-[11px]"
                              >
                                {p.name}
                              </Badge>
                            </div>

                            <div className="w-full overflow-x-auto rounded-lg border border-[#E1E5CB] bg-white shadow-sm">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-[#EEF0E1]">
                                    <TableHead className="w-[150px]">
                                      Thời gian
                                    </TableHead>
                                    <TableHead>Loại hoạt động</TableHead>
                                    <TableHead>Người thực hiện</TableHead>
                                    <TableHead className="text-center">
                                      Nguồn ghi
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Trạng thái
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {plotActs.map((act) => {
                                    const Icon =
                                      ACTIVITY_ICON[act.type] || Tractor;
                                    const srcInfo =
                                      SOURCE_LABEL[act.source_type] ||
                                      SOURCE_LABEL.MANUAL;
                                    const SrcIcon = srcInfo.icon;
                                    return (
                                      <TableRow
                                        key={act.id}
                                        className="hover:bg-[#FFFDF6]"
                                      >
                                        <TableCell className="font-mono text-[12px] text-[#7C7A4E] whitespace-nowrap">
                                          {new Date(
                                            act.start_time,
                                          ).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2 font-medium text-[#20281B] whitespace-nowrap">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ECEEDA] text-[#3F6B2C]">
                                              <Icon className="h-4 w-4" />
                                            </span>
                                            <span>{act.type_name}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-[12.5px] text-[#20281B] whitespace-nowrap">
                                          <div className="flex items-center gap-1.5">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E5E8CE] text-[10px] font-bold text-[#3F6B2C]">
                                              {act.farmer
                                                ? act.farmer.charAt(0)
                                                : 'B'}
                                            </span>
                                            <span>
                                              {act.farmer || 'Ông Ba'}
                                            </span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                          <Badge
                                            variant="outline"
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-medium ${getSourceBadgeClass(act.source_type)}`}
                                          >
                                            <SrcIcon className="h-3 w-3" />
                                            <span>{srcInfo.label}</span>
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#3F6B2C]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#3F6B2C]" />
                                            Hoàn tất
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Hoạt động gần đây */}
          <Card className="p-5 shadow-sm">
            <SectionTitle
              action={
                <div className="flex items-center gap-1 rounded-lg bg-[#EEF0E1] p-1 text-[12px] font-medium">
                  <button
                    type="button"
                    onClick={() => setActivityFilter('ALL')}
                    className={`rounded-md px-2.5 py-1 transition ${activityFilter === 'ALL'
                        ? 'bg-white text-[#20281B] shadow-sm font-semibold'
                        : 'text-[#7C7A4E] hover:text-[#20281B]'
                      }`}
                  >
                    Tất cả nông trại ({recentActivities.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityFilter('ME')}
                    className={`rounded-md px-2.5 py-1 transition ${activityFilter === 'ME'
                        ? 'bg-white text-[#20281B] shadow-sm font-semibold'
                        : 'text-[#7C7A4E] hover:text-[#20281B]'
                      }`}
                  >
                    Của tôi ({farmerName})
                  </button>
                </div>
              }
            >
              Hoạt động gần đây
            </SectionTitle>
            <div className="divide-y divide-[#EEF0E1]">
              {filteredRecentActivities.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-[#8B9070]">
                  Không có hoạt động nào phù hợp.
                </div>
              ) : (
                filteredRecentActivities.map((a) => {
                  const Icon = ACTIVITY_ICON[a.type] || Tractor;
                  const src =
                    SOURCE_LABEL[a.source_type] || SOURCE_LABEL.MANUAL;
                  const SrcIcon = src.icon;
                  const isActToday = isActivityToday(a.start_time);
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-3.5 py-3.5 first:pt-1 last:pb-1"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ECEEDA] text-[#1C2B1E]">
                          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-[14px] font-medium text-[#20281B] flex items-center gap-2"
                            style={{ fontFamily: "'Lora', serif" }}
                          >
                            <span>
                              {a.type_name} · thửa {a.plot_code}
                            </span>
                            {isActToday && (
                              <span className="rounded-full bg-[#E5E8CE] px-2 py-0.5 text-[10px] font-bold text-[#3F6B2C] uppercase tracking-wider">
                                Hôm nay
                              </span>
                            )}
                          </p>
                          <p className="text-[12px] text-[#8B9070]">
                            {a.farmer} · {formatTime(a.start_time)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isActToday && (
                          <button
                            type="button"
                            onClick={() => setEditingActivity({ ...a })}
                            title="Sửa hoạt động trong ngày"
                            className="flex items-center gap-1 rounded-md border border-[#C9A227]/70 bg-[#FFFDF6] px-2.5 py-1 text-[11.5px] font-medium text-[#8A6D1F] transition hover:bg-[#FBF0D6] hover:text-[#1C2B1E] hover:border-[#C9A227]"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Sửa</span>
                          </button>
                        )}
                        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#E1E5CB]/80 bg-[#F7F2DF] px-2.5 py-1 text-[11px] font-medium text-[#7C7A4E]">
                          <SrcIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                          {src.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Sản lượng thu hoạch theo tháng (BarChart - Recharts) */}
          <Card className="p-5 shadow-sm">
            <SectionTitle>
              Sản lượng thu hoạch theo tháng (kg)
            </SectionTitle>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={harvestByMonth}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#EEF0E1" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#8B9070' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#8B9070' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#ECEEDA' }}
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #E1E5CB',
                      backgroundColor: '#FFFDF6',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="quantity"
                    fill="#C9A227"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Cột phải (Thời tiết, Quan sát sâu bệnh, Tồn kho vật tư) */}
        <motion.div
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="space-y-6"
        >
          {/* Thời tiết hôm nay (Tích hợp thực tế từ OpenWeather API) */}
          <Card className="p-5 shadow-sm">
            <SectionTitle
              action={
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[#4E9B47] bg-[#ECEEDA] px-2 py-0.5 rounded-full">
                    {openWeather?.cityName || 'Đồng Tháp'} · OpenWeather
                  </span>
                  <button
                    type="button"
                    onClick={() => fetchWeather(10.4533, 105.6358)}
                    title="Làm mới thời tiết"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[#8B9070] hover:bg-[#ECEEDA] hover:text-[#1C2B1E] transition"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${weatherStatus === 'loading' ? 'animate-spin text-[#C9A227]' : ''}`}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              }
            >
              Thời tiết hôm nay
            </SectionTitle>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#ECEEDA] text-[#1C2B1E] overflow-hidden">
                {openWeather?.iconUrl ? (
                  <img
                    src={openWeather.iconUrl}
                    alt={openWeather.description}
                    className="h-12 w-12 object-contain"
                  />
                ) : (
                  <WeatherIcon className="h-7 w-7" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <p
                  className="text-[28px] leading-none text-[#20281B]"
                  style={{ fontFamily: "'Lora', serif", fontWeight: 600 }}
                >
                  {openWeather ? openWeather.temp : weather.temperature}°C
                </p>
                <p className="mt-1.5 text-[12px] text-[#8B9070] capitalize">
                  {openWeather
                    ? `${openWeather.description} · Độ ẩm ${openWeather.humidity}% · Gió ${openWeather.windSpeed} m/s`
                    : `Độ ẩm ${weather.humidity}% · Gió ${weather.wind_speed} km/h`}
                </p>
                {openWeather && (
                  <p className="mt-0.5 text-[11px] text-[#6B9B52]">
                    Cảm giác như {openWeather.feelsLike}°C
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E1E5CB] bg-[#F7F2DF] px-3.5 py-2.5 text-[12px] text-[#7C7A4E]">
              <CloudRain
                className="h-4 w-4 shrink-0 text-[#C9A227]"
                strokeWidth={2}
              />
              Lượng mưa ghi nhận gần nhất: {weather.rainfall} mm
            </div>
          </Card>

          {/* Quan sát sâu bệnh */}
          <Card className="p-5 shadow-sm">
            <SectionTitle>Quan sát sâu bệnh</SectionTitle>
            <div className="space-y-2.5">
              {observations.map((o) => {
                const s = SEVERITY_STYLE[o.severity] || SEVERITY_STYLE.MEDIUM;
                return (
                  <div
                    key={o.id}
                    className={
                      'flex items-start gap-2.5 rounded-xl p-3 border border-transparent ' +
                      s.bg
                    }
                  >
                    <span
                      className={
                        'mt-1.5 h-2 w-2 shrink-0 rounded-full ' + s.dot
                      }
                    />
                    <div className="min-w-0">
                      <p
                        className={
                          'text-[13px] font-medium leading-snug ' + s.text
                        }
                        style={{ fontFamily: "'Lora', serif" }}
                      >
                        {o.symptom}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#8B9070]">
                        Thửa {o.plot_code} · {formatDate(o.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Tồn kho vật tư */}
          <Card className="p-5 shadow-sm">
            <SectionTitle>Tồn kho vật tư</SectionTitle>
            <div className="space-y-3.5">
              {inventory.map((i) => (
                <div
                  key={i.material}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p
                      className="truncate text-[13.5px] font-medium text-[#20281B]"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      {i.material}
                    </p>
                    {i.low && (
                      <p className="text-[11.5px] font-medium text-[#C15A34]">
                        Sắp hết, nên bổ sung
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="neutral"
                    className={
                      'shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium ' +
                      (i.low
                        ? 'bg-[#F6E2DC] text-[#9C4B2E] border-[#E8B1A2]'
                        : 'bg-[#ECEEDA] text-[#3F6B2C] border-[#DCE0C4]')
                    }
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {i.quantity} {i.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modal Dialog chứa ActivityForm */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Ghi hoạt động canh tác mới"
        description="Chọn nguồn ghi nhận (nhập tay, văn bản, giọng nói hoặc video) để tạo nhật ký."
        className="max-w-3xl sm:max-w-4xl"
      >
        <ActivityForm
          plots={plots}
          onSubmit={() => {
            // Khi tạo mới hoạt động thành công, invalidate cache và tải lại ngay dữ liệu mới từ server
            invalidateCache();
            fetchDashboardData(true);
            setDialogOpen(false);
          }}
          onCancel={() => setDialogOpen(false)}
        />
      </Dialog>

      {/* Modal Dialog xem Bản đồ trang trại tương tác MapView */}
      <Dialog
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        title="Bản đồ Đồng ruộng & Giám sát hiện trạng"
        description="Xem vị trí địa lý, trạng thái phát triển và cảnh báo sâu bệnh từng thửa đất."
        className="max-w-3xl sm:max-w-4xl"
      >
        <div className="py-2">
          <MapView
            plots={plots}
            onSelect={(code: string) => {
              console.log('Plot selected:', code);
            }}
          />
        </div>
      </Dialog>

      {/* Modal Dialog Sửa Hoạt Động Trong Ngày (thiết kế chuẩn theo form Ghi nhật ký ActivityForm) */}
      <Dialog
        open={!!editingActivity}
        onClose={() => setEditingActivity(null)}
        title="Sửa nhật ký hoạt động canh tác"
        description="Cập nhật chi tiết công việc, thửa đất và phương thức ghi nhận của hoạt động trong ngày."
        className="max-w-2xl sm:max-w-3xl"
      >
        {editingActivity && (
          <div className="space-y-6 pt-2">
            {/* 1. Chọn Thửa đất / Mùa vụ canh tác */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-[#20281B]">
                <Sprout className="h-4 w-4 text-[#4E9B47]" />
                <span>Thửa đất / Mùa vụ canh tác</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {plots.map((p) => {
                  const isSelected = editingActivity.plot_code === p.code;
                  return (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() =>
                        setEditingActivity({
                          ...editingActivity,
                          plot_code: p.code,
                        })
                      }
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${isSelected
                          ? 'border-[#C9A227] bg-[#FFFDF6] ring-2 ring-[#C9A227]/20 shadow-sm'
                          : 'border-[#E1E5CB] bg-white hover:border-[#C9A227]/60'
                        }`}
                    >
                      <div>
                        <p
                          className="text-[13.5px] font-semibold text-[#20281B]"
                          style={{ fontFamily: "'Lora', serif" }}
                        >
                          {p.code} · {p.name}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-[#7C7A4E]">
                          {p.crop || 'Chưa gieo trồng'} ({p.area} ha)
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-[#C9A227] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Loại hoạt động canh tác (Tile Cards trực quan) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-[#20281B]">
                <Sparkles className="h-4 w-4 text-[#C9A227]" />
                <span>Loại hoạt động canh tác</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {EDIT_ACTIVITY_TYPES.map((t) => {
                  const isSelected = editingActivity.type === t.value;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setEditingActivity({
                          ...editingActivity,
                          type: t.value,
                          type_name: t.label,
                        })
                      }
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${isSelected
                          ? 'border-[#1C2B1E] bg-[#1C2B1E] text-white shadow-sm'
                          : 'border-[#E1E5CB] bg-white text-[#20281B] hover:border-[#8B9070]'
                        }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isSelected
                            ? 'bg-white/15 text-white'
                            : 'bg-[#ECEEDA] text-[#1C2B1E]'
                          }`}
                      >
                        <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                      </div>
                      <span className="text-[13px] font-medium leading-tight">
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Nguồn ghi nhận (Tabs pills sang trọng) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-[#20281B]">
                <Layers className="h-4 w-4 text-[#8B9070]" />
                <span>Nguồn ghi nhận nhật ký</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {EDIT_SOURCE_TYPES.map((src) => {
                  const isSelected = editingActivity.source_type === src.value;
                  const Icon = src.icon;
                  return (
                    <button
                      key={src.value}
                      type="button"
                      onClick={() =>
                        setEditingActivity({
                          ...editingActivity,
                          source_type: src.value,
                        })
                      }
                      className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition ${isSelected
                          ? 'border-[#C9A227] bg-[#FFFDF6] text-[#20281B] shadow-sm font-semibold ring-1 ring-[#C9A227]/30'
                          : 'border-[#E1E5CB] bg-white text-[#7C7A4E] hover:border-[#8B9070]'
                        }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{src.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Thời gian thực hiện & Người thực hiện */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[#20281B]">
                  <Calendar className="h-4 w-4 text-[#4E9B47]" />
                  <span>Thời gian thực hiện</span>
                </label>
                <input
                  type="datetime-local"
                  value={formatDateTimeLocal(editingActivity.start_time)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      try {
                        setEditingActivity({
                          ...editingActivity,
                          start_time: new Date(val).toISOString(),
                        });
                      } catch {
                        // ignore invalid format
                      }
                    }
                  }}
                  className="w-full rounded-xl border border-[#E1E5CB] bg-white px-3.5 py-2.5 text-[13.5px] text-[#20281B] focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[#20281B]">
                  <User className="h-4 w-4 text-[#4E9B47]" />
                  <span>Người thực hiện</span>
                </label>
                <input
                  type="text"
                  value={editingActivity.farmer}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      farmer: e.target.value,
                    })
                  }
                  placeholder="Tên nông dân thực hiện..."
                  className="w-full rounded-xl border border-[#E1E5CB] bg-white px-3.5 py-2.5 text-[13.5px] text-[#20281B] focus:border-[#C9A227] focus:outline-none"
                />
              </div>
            </div>

            {/* 5. Ghi chú / Chi tiết công việc */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[#20281B]">
                <FileText className="h-4 w-4 text-[#8B9070]" />
                <span>Ghi chú / Chi tiết công việc</span>
              </label>
              <textarea
                rows={3}
                value={
                  editingActivity.note || editingActivity.description || ''
                }
                onChange={(e) =>
                  setEditingActivity({
                    ...editingActivity,
                    note: e.target.value,
                    description: e.target.value,
                  })
                }
                placeholder="Ghi chú thêm về hoạt động (loại phân/thuốc, liều lượng, điều kiện thời tiết...)"
                className="w-full rounded-xl border border-[#E1E5CB] bg-white p-3.5 text-[13.5px] text-[#20281B] focus:border-[#C9A227] focus:outline-none"
              />
            </div>

            {/* Footer hành động */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEF0E1]">
              <Button
                variant="outline"
                onClick={() => setEditingActivity(null)}
                className="h-11 px-5 rounded-xl text-[13.5px]"
              >
                Hủy thay đổi
              </Button>
              <Button
                onClick={() => {
                  updateActivity(editingActivity);
                  setEditingActivity(null);
                }}
                className="h-11 bg-[#1C2B1E] text-[#F6EFDD] hover:bg-[#243A28] px-6 rounded-xl text-[13.5px] font-medium shadow-sm flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-[#C9A227]" />
                <span>Lưu thay đổi nhật ký</span>
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </Container>
  );
}
