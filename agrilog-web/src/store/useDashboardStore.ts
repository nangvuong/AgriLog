import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/services/api/axios.client';
import { PlotData } from '@/components/domain';

export interface DashboardActivityItem {
  id: number;
  plot_code: string;
  type: string;
  type_name: string;
  farmer: string;
  start_time: string;
  source_type: string;
}

export interface DashboardObservationItem {
  id: number;
  plot_code: string;
  symptom: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: string;
}

export interface DashboardInventoryItem {
  material: string;
  quantity: number;
  unit: string;
  low: boolean;
}

export interface HarvestMonthItem {
  month: string;
  quantity: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  condition: string;
}

// ---------- Default Fallback Mock Data (theo đúng farmer-dashboard.jsx) ----------

export const DEFAULT_PLOTS: PlotData[] = [
  {
    code: 'A1',
    name: 'Ruộng trước nhà',
    area: 1.2,
    soil_type: 'Đất phù sa',
    crop: 'Lúa',
    variety: 'OM5451',
    planting_date: '2026-05-10',
    expected_harvest_date: '2026-08-20',
    status: 'GROWING',
    progress: 68,
    mapStatus: 'ALERT',
    points: '20,20 140,20 150,90 10,90',
    labelX: 80,
    labelY: 58,
  },
  {
    code: 'A2',
    name: 'Ruộng sau vườn',
    area: 0.8,
    soil_type: 'Đất thịt',
    crop: 'Lúa',
    variety: 'ST25',
    planting_date: '2026-06-02',
    expected_harvest_date: '2026-09-12',
    status: 'GROWING',
    progress: 41,
    mapStatus: 'GROWING',
    points: '160,20 300,20 300,90 170,90',
    labelX: 230,
    labelY: 58,
  },
  {
    code: 'B1',
    name: 'Vườn xoài',
    area: 0.5,
    soil_type: 'Đất cát pha',
    crop: 'Xoài',
    variety: 'Xoài cát Hòa Lộc',
    planting_date: '2026-01-15',
    expected_harvest_date: '2026-08-05',
    status: 'GROWING',
    progress: 89,
    mapStatus: 'GROWING',
    points: '20,110 150,110 140,190 10,190',
    labelX: 80,
    labelY: 152,
  },
  {
    code: 'C1',
    name: 'Ruộng góc kênh',
    area: 1.0,
    soil_type: 'Đất phù sa',
    status: 'FALLOW',
    progress: 0,
    mapStatus: 'FALLOW',
    points: '160,110 300,110 300,190 170,190',
    labelX: 230,
    labelY: 152,
  },
];

const getTodayDateString = (hours: number, minutes: number) => {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const DEFAULT_ACTIVITIES: DashboardActivityItem[] = [
  {
    id: 1,
    plot_code: 'A1',
    type: 'IRRIGATE',
    type_name: 'Tưới nước',
    farmer: 'Ông Ba',
    start_time: getTodayDateString(7, 30),
    source_type: 'VOICE',
  },
  {
    id: 2,
    plot_code: 'B1',
    type: 'SPRAY',
    type_name: 'Phun thuốc',
    farmer: 'Chị Xuân',
    start_time: getTodayDateString(9, 15),
    source_type: 'VIDEO',
  },
  {
    id: 3,
    plot_code: 'A2',
    type: 'FERTILIZE',
    type_name: 'Bón phân',
    farmer: 'Ông Ba',
    start_time: '2026-08-02T07:40:00',
    source_type: 'TEXT',
  },
  {
    id: 4,
    plot_code: 'A1',
    type: 'HARVEST',
    type_name: 'Thu hoạch thử',
    farmer: 'Ông Ba',
    start_time: '2026-08-01T15:10:00',
    source_type: 'MANUAL',
  },
];

export const DEFAULT_OBSERVATIONS: DashboardObservationItem[] = [
  {
    id: 1,
    plot_code: 'B1',
    symptom: 'Đốm lá vàng trên xoài',
    severity: 'MEDIUM',
    created_at: '2026-08-02',
  },
  {
    id: 2,
    plot_code: 'A2',
    symptom: 'Rầy nâu xuất hiện rải rác',
    severity: 'LOW',
    created_at: '2026-08-01',
  },
  {
    id: 3,
    plot_code: 'A1',
    symptom: 'Sâu cuốn lá mật độ cao',
    severity: 'HIGH',
    created_at: '2026-07-30',
  },
];

export const DEFAULT_INVENTORY: DashboardInventoryItem[] = [
  { material: 'Phân NPK 20-20-15', quantity: 42, unit: 'kg', low: false },
  { material: 'Thuốc trừ sâu sinh học', quantity: 3, unit: 'lít', low: true },
  { material: 'Giống lúa OM5451', quantity: 8, unit: 'kg', low: true },
  { material: 'Vôi bột', quantity: 120, unit: 'kg', low: false },
];

export const DEFAULT_HARVEST_BY_MONTH: HarvestMonthItem[] = [
  { month: 'T3', quantity: 0 },
  { month: 'T4', quantity: 0 },
  { month: 'T5', quantity: 320 },
  { month: 'T6', quantity: 410 },
  { month: 'T7', quantity: 260 },
  { month: 'T8', quantity: 180 },
];

export const DEFAULT_WEATHER: WeatherData = {
  temperature: 31.5,
  humidity: 78,
  rainfall: 4.2,
  wind_speed: 9,
  condition: 'CLOUDY',
};

const CACHE_TTL_MS = 60_000; // 60 giây cache TTL

export interface DashboardStoreState {
  plots: PlotData[];
  recentActivities: DashboardActivityItem[];
  observations: DashboardObservationItem[];
  inventory: DashboardInventoryItem[];
  harvestByMonth: HarvestMonthItem[];
  weather: WeatherData;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  fetchDashboardData: (force?: boolean) => Promise<void>;
  invalidateCache: () => void;
  updateActivity: (updated: DashboardActivityItem) => void;
}

export const useDashboardStore = create<DashboardStoreState>()(
  persist(
    (set, get) => ({
      plots: DEFAULT_PLOTS,
      recentActivities: DEFAULT_ACTIVITIES,
      observations: DEFAULT_OBSERVATIONS,
      inventory: DEFAULT_INVENTORY,
      harvestByMonth: DEFAULT_HARVEST_BY_MONTH,
      weather: DEFAULT_WEATHER,
      isLoading: false,
      error: null,
      lastFetchedAt: null,

      invalidateCache: () => {
        set({ lastFetchedAt: null });
      },

      updateActivity: (updated) => {
        set((state) => ({
          recentActivities: state.recentActivities.map((a) =>
            a.id === updated.id ? { ...a, ...updated } : a,
          ),
        }));
      },

      fetchDashboardData: async (force = false) => {
        const { lastFetchedAt, isLoading } = get();
        const now = Date.now();

        // Sử dụng Cache: nếu chưa hết TTL và không phải yêu cầu force tải lại -> dùng luôn dữ liệu cache
        if (
          !force &&
          lastFetchedAt &&
          now - lastFetchedAt < CACHE_TTL_MS &&
          !isLoading
        ) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Gọi song song các endpoints ở server để hiển thị dashboard
          const [
            plotsRes,
            seasonsRes,
            activitiesRes,
            observationsRes,
            materialsRes,
            harvestsRes,
          ] = await Promise.allSettled([
            apiClient.get('/plots'),
            apiClient.get('/seasons?limit=50&page=1'),
            apiClient.get('/activities?limit=10&page=1'),
            apiClient.get('/observations?limit=10&page=1'),
            apiClient.get('/materials?limit=20&page=1'),
            apiClient.get('/harvests?limit=50&page=1'),
          ]);

          // Lấy danh sách mùa vụ từ /seasons trước để ánh xạ chính xác vụ đang triển khai
          let activeSeasons: any[] = [];
          if (seasonsRes.status === 'fulfilled') {
            const rawSeasons =
              seasonsRes.value.data?.data || seasonsRes.value.data;
            if (Array.isArray(rawSeasons)) {
              activeSeasons = rawSeasons;
            }
          }

          // 1. Xử lý dữ liệu Thửa đất & Mùa vụ đang triển khai (/plots + /seasons)
          let finalPlots = DEFAULT_PLOTS;
          if (plotsRes.status === 'fulfilled') {
            const raw = plotsRes.value.data?.data || plotsRes.value.data;
            if (Array.isArray(raw) && raw.length > 0) {
              finalPlots = raw.map((p: any, idx: number) => {
                const plotCode = p.code || p.plot_code || `A${idx + 1}`;
                const matchedSeason = activeSeasons.find(
                  (s) =>
                    Number(s.plot_id) === Number(p.id) ||
                    s.plot_code === plotCode,
                );

                const plantingDate =
                  matchedSeason?.planting_date ||
                  p.plantingDate ||
                  p.planting_date ||
                  null;
                const expectedHarvestDate =
                  matchedSeason?.expected_harvest_date ||
                  p.expectedHarvestDate ||
                  p.expected_harvest_date ||
                  null;

                // Tính toán chính xác tiến độ mùa vụ dựa trên ngày xuống giống & ngày thu hoạch dự kiến
                let calculatedProgress = Number(p.progress) || 68;
                if (plantingDate && expectedHarvestDate) {
                  const startTs = new Date(plantingDate).getTime();
                  const endTs = new Date(expectedHarvestDate).getTime();
                  const nowTs = Date.now();
                  if (endTs > startTs) {
                    calculatedProgress = Math.min(
                      100,
                      Math.max(
                        0,
                        Math.round(((nowTs - startTs) / (endTs - startTs)) * 100),
                      ),
                    );
                  }
                }

                const isGrowing =
                  matchedSeason?.status === 'ACTIVE' ||
                  matchedSeason?.status === 'GROWING' ||
                  p.status === 'GROWING';

                // Parse polygon geometry từ PostGIS (GeoJSON format)
                // Backend TypeORM + PostGIS trả về object GeoJSON trực tiếp
                const rawPolygon = p.polygon ?? p.geom ?? p.geometry ?? null;
                let parsedPolygon = null;
                if (rawPolygon) {
                  if (
                    typeof rawPolygon === 'object' &&
                    rawPolygon.type === 'Polygon' &&
                    Array.isArray(rawPolygon.coordinates)
                  ) {
                    parsedPolygon = rawPolygon;
                  } else if (typeof rawPolygon === 'string') {
                    try {
                      const geo = JSON.parse(rawPolygon);
                      if (geo?.type === 'Polygon') parsedPolygon = geo;
                    } catch { /* ignore */ }
                  }
                }

                return {
                  code: plotCode,
                  name: p.name || p.plot_name || `Ruộng ${idx + 1}`,
                  area: Number(p.area) || 1.0,
                  soil_type: p.soilType || p.soil_type || 'Đất phù sa',
                  crop:
                    matchedSeason?.crop_name ||
                    matchedSeason?.cropType ||
                    p.crop ||
                    'Lúa',
                  variety:
                    matchedSeason?.crop_variety_name ||
                    p.variety ||
                    'OM5451',
                  planting_date: plantingDate,
                  expected_harvest_date: expectedHarvestDate,
                  status: (isGrowing ? 'GROWING' : 'FALLOW') as
                    | 'GROWING'
                    | 'FALLOW',
                  progress: isGrowing ? calculatedProgress : 0,
                  mapStatus: isGrowing ? 'GROWING' : 'FALLOW',
                  polygon: parsedPolygon,
                  // SVG sơ đồ fallback (giữ để tương thích)
                  points: p.points || '20,20 140,20 150,90 10,90',
                  labelX: 80,
                  labelY: 58,
                };
              });
            }
          }


          // 2. Xử lý dữ liệu Hoạt động gần đây (/activities)
          let finalActivities = DEFAULT_ACTIVITIES;
          if (activitiesRes.status === 'fulfilled') {
            const raw =
              activitiesRes.value.data?.data || activitiesRes.value.data;
            if (Array.isArray(raw) && raw.length > 0) {
              const typeNameMap: Record<string, string> = {
                IRRIGATE: 'Tưới nước',
                FERTILIZE: 'Bón phân',
                SPRAY: 'Phun thuốc',
                HARVEST: 'Thu hoạch',
                TILLING: 'Cày xới',
                SOWING: 'Gieo sạ',
              };
              finalActivities = raw.slice(0, 10).map((a: any, index: number) => {
                const typeCode = (
                  a.activity_type_code ||
                  a.activityType ||
                  a.activity_type ||
                  'IRRIGATE'
                ).toUpperCase();
                return {
                  id: Number(a.id) || index + 1,
                  plot_code:
                    a.plot_code ||
                    a.plotCode ||
                    a.season?.plot_code ||
                    'A1',
                  type: typeCode,
                  type_name:
                    a.activity_type_name ||
                    a.activityTypeName ||
                    a.title ||
                    typeNameMap[typeCode] ||
                    typeCode,
                  farmer:
                    a.farmer_name ||
                    a.farmerName ||
                    a.farmer?.full_name ||
                    a.farmer?.name ||
                    'Ông Ba',
                  start_time:
                    a.start_time ||
                    a.startTime ||
                    a.activityDate ||
                    a.created_at ||
                    a.createdAt ||
                    new Date().toISOString(),
                  source_type: (
                    a.source_type ||
                    a.sourceType ||
                    'MANUAL'
                  ).toUpperCase(),
                };
              });
            }
          }

          // 3. Xử lý dữ liệu Quan sát sâu bệnh (/observations)
          let finalObservations = DEFAULT_OBSERVATIONS;
          if (observationsRes.status === 'fulfilled') {
            const raw =
              observationsRes.value.data?.data || observationsRes.value.data;
            if (Array.isArray(raw) && raw.length > 0) {
              finalObservations = raw.slice(0, 10).map((o: any, idx: number) => ({
                id: Number(o.id) || idx + 1,
                plot_code: o.plotCode || o.plot_code || 'A1',
                symptom: o.symptom || o.title || 'Quan sát hiện trạng',
                severity: (['LOW', 'MEDIUM', 'HIGH'].includes(
                  (o.severity || '').toUpperCase(),
                )
                  ? o.severity.toUpperCase()
                  : 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
                created_at:
                  o.createdAt || o.created_at || new Date().toISOString(),
              }));
            }
          }

          // 4. Xử lý dữ liệu Tồn kho vật tư (/materials)
          let finalInventory = DEFAULT_INVENTORY;
          if (materialsRes.status === 'fulfilled') {
            const raw =
              materialsRes.value.data?.data || materialsRes.value.data;
            if (Array.isArray(raw) && raw.length > 0) {
              finalInventory = raw.map((m: any) => {
                const qty = Number(m.stockQuantity || m.quantity) || 10;
                return {
                  material: m.name || m.material_name || 'Vật tư',
                  quantity: qty,
                  unit: m.unit || 'kg',
                  low: qty <= 5,
                };
              });
            }
          }

          // 5. Xử lý dữ liệu Sản lượng thu hoạch theo tháng (/harvests)
          let finalHarvests = DEFAULT_HARVEST_BY_MONTH;
          if (harvestsRes.status === 'fulfilled') {
            const raw =
              harvestsRes.value.data?.data || harvestsRes.value.data;
            if (Array.isArray(raw) && raw.length > 0) {
              const monthMap: Record<string, number> = {
                T3: 0,
                T4: 0,
                T5: 0,
                T6: 0,
                T7: 0,
                T8: 0,
              };
              raw.forEach((h: any) => {
                const d = new Date(
                  h.harvestDate || h.createdAt || Date.now(),
                );
                const mKey = `T${d.getMonth() + 1}`;
                if (monthMap[mKey] !== undefined) {
                  monthMap[mKey] += Number(h.quantity || 0);
                }
              });
              finalHarvests = Object.keys(monthMap).map((k) => ({
                month: k,
                quantity: monthMap[k],
              }));
            }
          }

          set({
            plots: finalPlots,
            recentActivities: finalActivities,
            observations: finalObservations,
            inventory: finalInventory,
            harvestByMonth: finalHarvests,
            weather: DEFAULT_WEATHER,
            isLoading: false,
            lastFetchedAt: now,
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error: err?.message || 'Không thể tải dữ liệu từ server',
          });
        }
      },
    }),
    {
      name: 'agrilog-dashboard-store',
      partialize: (state) => ({
        plots: state.plots,
        recentActivities: state.recentActivities,
        observations: state.observations,
        inventory: state.inventory,
        harvestByMonth: state.harvestByMonth,
        weather: state.weather,
        lastFetchedAt: state.lastFetchedAt,
      }),
    },
  ),
);
