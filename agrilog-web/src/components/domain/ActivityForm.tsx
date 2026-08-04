import React, { useState, useEffect } from 'react';
import {
  Mic,
  Type,
  Image as ImageIcon,
  Video,
  PenLine,
  Plus,
  Trash2,
  Sprout,
  Droplets,
  Wind,
  Wheat,
  Eye,
  Wrench,
  PackageCheck,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  CheckCircle2,
  MapPin,
  Sparkles,
  Loader2,
  AlertCircle,
  Calendar,
  Send,
  Cloud,
  Thermometer,
  Navigation,
  LocateFixed,
  WifiOff,
} from 'lucide-react';
import {
  aiExtractionService,
  STTResponse,
  getExtractedActivities,
  ExtractedActivityItem,
} from '@/services/api/ai-extraction.service';
import { activitiesService } from '@/services/api/activities.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PlotData } from './PlotCard';
import { ActivitySourceType } from './ActivityCard';
import { AudioRecorder } from './AudioRecorder';
import { ImageUploader, UploadedImage } from './ImageUploader';
import { VideoRecorder } from './VideoRecorder';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeather } from '@/hooks/useWeather';

/**
 * Danh sách các loại hoạt động theo chuẩn AgriLog Backend DTOs
 */
export const ACTIVITY_TYPE_OPTIONS = [
  { value: 'IRRIGATE', label: 'Tưới nước', icon: Droplets },
  { value: 'FERTILIZE', label: 'Bón phân', icon: Sprout },
  { value: 'SPRAY', label: 'Phun thuốc', icon: Wind },
  { value: 'HARVEST', label: 'Thu hoạch', icon: Wheat },
  { value: 'OBSERVE', label: 'Thăm đồng / Quan sát', icon: Eye },
];

const SOURCE_TABS: ActivitySourceType[] = [
  'MANUAL',
  'TEXT',
  'VOICE',
  'VIDEO',
];

const SOURCE_META: Record<
  ActivitySourceType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }
> = {
  MANUAL: { label: 'Nhập tay', icon: PenLine },
  TEXT: { label: 'Văn bản', icon: Type },
  VOICE: { label: 'Giọng nói', icon: Mic },
  VIDEO: { label: 'Video', icon: Video },
};

export type SectionTabType =
  | 'MATERIALS'
  | 'ASSETS'
  | 'HARVESTS'
  | 'OBSERVATIONS';

export interface MaterialFormItem {
  material_name: string;
  quantity: string;
  unit: string;
}

export interface AssetFormItem {
  asset_name: string;
  usage_duration: string;
  asset_type?: string;
}

export interface HarvestFormItem {
  quantity: string;
  unit: string;
  quality: string;
  buyer: string;
  selling_price: string;
}

export interface ObservationFormItem {
  symptom: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface ActivityMediaFormItem {
  media_type: 'IMAGE' | 'AUDIO' | 'VIDEO' | string;
  file_name?: string;
  file_url: string;
}

export interface ActivityFormSubmitData {
  source_type: ActivitySourceType;
  plot_code: string;
  activity_type_code: string;
  start_time: string;
  end_time?: string;
  description: string;
  note?: string;
  materials?: MaterialFormItem[];
  assets?: AssetFormItem[];
  harvests?: HarvestFormItem[];
  observations?: ObservationFormItem[];
  media?: ActivityMediaFormItem[];
}

interface ActivityItemState {
  id: string;
  plotCode: string;
  activityType: string;
  startTime: string;
  endTime: string;
  description: string;
  note: string;
  showNoteField: boolean;
  activeSectionTab: SectionTabType;
  materials: MaterialFormItem[];
  assets: AssetFormItem[];
  harvests: HarvestFormItem[];
  observations: ObservationFormItem[];
  media: ActivityMediaFormItem[];
}

export interface ActivityFormProps {
  plots?: PlotData[];
  initialType?: string;
  onSubmit?: (
    data: ActivityFormSubmitData | ActivityFormSubmitData[],
  ) => void;
  onCancel?: () => void;
}

function mapAiActivityType(loai: string): string {
  const lower = (loai || '').toLowerCase();
  if (
    lower.includes('bon_phan') ||
    lower.includes('bón') ||
    lower.includes('phân')
  )
    return 'FERTILIZE';
  if (
    lower.includes('phun_thuoc') ||
    lower.includes('xịt') ||
    lower.includes('thuốc')
  )
    return 'SPRAY';
  if (
    lower.includes('tuoi_nuoc') ||
    lower.includes('tưới') ||
    lower.includes('nước')
  )
    return 'IRRIGATE';
  if (
    lower.includes('thu_hoach') ||
    lower.includes('thu') ||
    lower.includes('gặt') ||
    lower.includes('hái')
  )
    return 'HARVEST';
  if (
    lower.includes('kiem_tra') ||
    lower.includes('quan_sat') ||
    lower.includes('sâu') ||
    lower.includes('bệnh')
  )
    return 'OBSERVE';
  return 'FERTILIZE';
}

function getRecommendedSectionTab(activityType: string): SectionTabType {
  const t = activityType.toUpperCase();
  if (t === 'HARVEST') return 'HARVESTS';
  if (t === 'OBSERVE') return 'OBSERVATIONS';
  if (t === 'IRRIGATE') return 'ASSETS';
  return 'MATERIALS';
}

function createDefaultActivity(
  index: number,
  plots: PlotData[],
  initialType = 'IRRIGATE',
): ActivityItemState {
  const defaultTypes = ['IRRIGATE', 'FERTILIZE', 'SPRAY', 'HARVEST'];
  const chosenType =
    index === 0
      ? initialType.toUpperCase()
      : defaultTypes[index % defaultTypes.length];

  // Ưu tiên các lô đang GROWING
  const growingPlots = plots.filter(
    (p) => p.status === 'GROWING' || (p as any).mapStatus === 'GROWING',
  );
  const availablePlots = growingPlots.length > 0 ? growingPlots : plots;
  const chosenPlot =
    availablePlots[index % availablePlots.length]?.code ||
    availablePlots[0]?.code ||
    'A1';

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const startStr = now.toISOString().slice(0, 16);

  return {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    plotCode: chosenPlot,
    activityType: chosenType,
    startTime: startStr,
    endTime: '',
    description: '',
    note: '',
    showNoteField: false,
    activeSectionTab: getRecommendedSectionTab(chosenType),
    materials: [],
    assets: [],
    harvests: [],
    observations: [],
    media: [],
  };
}


export function ActivityForm({
  plots = [],
  initialType = 'IRRIGATE',
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  // Nguồn ghi nhận (Manual / Text / Voice / Image) chung ở trên cùng
  const [source, setSource] = useState<ActivitySourceType>('MANUAL');

  // Danh sách các hoạt động được thêm (tối đa 3) hiển thị bên dưới nguồn ghi nhận
  const [activities, setActivities] = useState<ActivityItemState[]>(() => [
    createDefaultActivity(0, plots, initialType),
  ]);
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);

  // An toàn bounds
  const currentIdx = Math.min(
    Math.max(0, activeTabIdx),
    Math.max(0, activities.length - 1),
  );
  const current =
    activities[currentIdx] || createDefaultActivity(0, plots, initialType);

  const [isExtractingText, setIsExtractingText] = useState<boolean>(false);
  const [freeInputText, setFreeInputText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ===== ĐỊNH VỊ GPS + THỜI TIẾT =====
  const { status: geoStatus, error: geoError, nearestPlot, locate } = useGeolocation();
  const { weather, weatherStatus, weatherError, fetchWeather } = useWeather();

  /**
   * Xử lý khi click nút định vị:
   * 1. Lấy tọa độ GPS hiện tại
   * 2. Tìm lô canh tác gần nhất
   * 3. Tự động chọn lô đó trong form
   * 4. Lấy thời tiết tại vị trí đó
   */
  async function handleLocate() {
    const pos = await locate(plots);
    if (!pos) return; // lỗi đã set trong hook

    // fetch thời tiết song song với việc cập nhật lô
    fetchWeather(pos.latitude, pos.longitude);
  }

  // Khi nearestPlot thay đổi (sau khi locate thành công), tự động điền vào form
  useEffect(() => {
    if (nearestPlot) {
      updateCurrentField('plotCode', nearestPlot.plot.code);
    }
  }, [nearestPlot]);

  function handleAiExtractedResult(res: STTResponse) {
    const items = getExtractedActivities(res);
    if (!items || items.length === 0) return;

    setActivities((prev) => {
      const updated: ActivityItemState[] = [];
      const count = Math.min(items.length, 5);

      for (let idx = 0; idx < count; idx++) {
        const item = items[idx];
        const baseAct =
          prev[idx] || createDefaultActivity(idx, plots, initialType);

        const descText = item.mo_ta || res.raw_text || baseAct.description;
        const mappedType = mapAiActivityType(item.loai_hoat_dong);

        let nextPlotCode = baseAct.plotCode;
        if (item.ma_lo && plots.length > 0) {
          const matchPlot = plots.find(
            (p) =>
              p.code?.toLowerCase() === item.ma_lo?.toLowerCase() ||
              p.code?.toLowerCase().includes(item.ma_lo?.toLowerCase() || ''),
          );
          if (matchPlot) {
            nextPlotCode = matchPlot.code;
          }
        }

        const newMaterials = (item.materials || []).map((m: any) => ({
          material_name: m.ten_vat_tu || '',
          quantity: String(m.lieu_luong || '1'),
          unit: m.don_vi || 'KG',
        }));

        const newAssets = (item.assets || []).map((a: any) => ({
          asset_name: a.ten_cong_cu || a.ten_tai_san || '',
          usage_duration: String(a.thoi_gian_su_dung || '1'),
          asset_type: a.loai_tai_san || 'may_moc',
        }));

        const newObservations = (item.observations || []).map((o: any) => ({
          symptom: o.trieu_chung || o.ten_sau_benh || '',
          severity: (o.muc_do === 'HIGH' || o.muc_do === 'nặng'
            ? 'HIGH'
            : o.muc_do === 'MEDIUM' || o.muc_do === 'trung_binh'
              ? 'MEDIUM'
              : 'LOW') as any,
          description: o.mo_ta_sau_benh || o.mo_ta || o.trieu_chung || '',
        }));

        const newHarvests = (item.harvests || []).map((h: any) => ({
          quantity: String(h.san_luong_thu_hoach || ''),
          unit: h.don_vi_thu_hoach || 'KG',
          quality: h.pham_cap || 'loai_1',
          buyer: h.thuong_lai || '',
          selling_price: String(h.gia_ban || ''),
        }));

        const resMedia = (res as any).media || [];
        const newMedia = resMedia.map((m: any) => ({
          media_type: (m.media_type || 'AUDIO') as 'IMAGE' | 'VIDEO' | 'AUDIO',
          file_url: m.file_url || '',
          file_name: m.file_name || 'media_file',
        }));

        updated.push({
          ...baseAct,
          description: descText,
          activityType: mappedType as any,
          plotCode: nextPlotCode,
          materials:
            newMaterials.length > 0 ? newMaterials : baseAct.materials,
          assets: newAssets.length > 0 ? newAssets : baseAct.assets,
          observations:
            newObservations.length > 0 ? newObservations : baseAct.observations,
          harvests: newHarvests.length > 0 ? newHarvests : baseAct.harvests,
          media:
            newMedia.length > 0
              ? [...(baseAct.media || []), ...newMedia]
              : baseAct.media,
          activeSectionTab: getRecommendedSectionTab(mappedType),
        });
      }

      for (let idx = count; idx < prev.length; idx++) {
        updated.push(prev[idx]);
      }

      return updated;
    });

    setActiveTabIdx(0);

  }

  async function handleExtractText() {
    const textToExtract = freeInputText.trim() || current.description.trim();
    if (!textToExtract) return;
    setIsExtractingText(true);
    try {
      const res = await aiExtractionService.extractFromText(
        textToExtract,
      );
      handleAiExtractedResult(res);
    } catch (err) {
      console.error('Error extracting text:', err);
    } finally {
      setIsExtractingText(false);
    }
  }

  function handleAddActivity() {
    if (activities.length >= 5) return;
    const newAct = createDefaultActivity(
      activities.length,
      plots,
      initialType,
    );
    setActivities((prev) => [...prev, newAct]);
    setActiveTabIdx(activities.length);
  }

  function handleRemoveActivity(e: React.MouseEvent, indexToRemove: number) {
    e.stopPropagation();
    if (activities.length <= 1) return;
    const next = activities.filter((_, idx) => idx !== indexToRemove);
    setActivities(next);
    if (activeTabIdx >= next.length) {
      setActiveTabIdx(next.length - 1);
    } else if (activeTabIdx === indexToRemove && activeTabIdx > 0) {
      setActiveTabIdx(activeTabIdx - 1);
    }
  }

  function updateCurrentField<K extends keyof ActivityItemState>(
    field: K,
    value: ActivityItemState[K],
  ) {
    setActivities((prev) =>
      prev.map((act, idx) =>
        idx === currentIdx ? { ...act, [field]: value } : act,
      ),
    );
  }

  // Khi thay đổi Loại hoạt động (activityType), tự động chuyển sang Tab phù hợp
  useEffect(() => {
    const recommendedTab = getRecommendedSectionTab(current.activityType);
    let updatedMaterials = current.materials;

    if (current.activityType === 'FERTILIZE') {
      updatedMaterials = current.materials.map((m) => ({
        ...m,
        unit: m.unit || 'kg',
      }));
    } else if (current.activityType === 'SPRAY') {
      updatedMaterials = current.materials.map((m) => ({
        ...m,
        unit: m.unit || 'lít',
      }));
    }

    setActivities((prev) =>
      prev.map((act, idx) =>
        idx === currentIdx
          ? {
            ...act,
            materials: updatedMaterials,
            activeSectionTab: recommendedTab,
          }
          : act,
      ),
    );
  }, [current.activityType]);

  // Quản lý dòng Vật tư
  function addMaterialRow() {
    updateCurrentField('materials', [
      ...current.materials,
      { material_name: '', quantity: '', unit: 'kg' },
    ]);
  }
  function updateMaterial(
    i: number,
    field: keyof MaterialFormItem,
    value: string,
  ) {
    const next = [...current.materials];
    next[i][field] = value;
    updateCurrentField('materials', next);
  }
  function removeMaterial(i: number) {
    updateCurrentField(
      'materials',
      current.materials.filter((_, idx) => idx !== i),
    );
  }

  // Quản lý dòng Thiết bị
  function addAssetRow() {
    updateCurrentField('assets', [
      ...current.assets,
      { asset_name: '', usage_duration: '', asset_type: 'MACHINE' },
    ]);
  }
  function updateAsset(i: number, field: keyof AssetFormItem, value: string) {
    const next = [...current.assets];
    next[i][field] = value;
    updateCurrentField('assets', next);
  }
  function removeAsset(i: number) {
    updateCurrentField(
      'assets',
      current.assets.filter((_, idx) => idx !== i),
    );
  }

  // Quản lý dòng Thu hoạch
  function addHarvestRow() {
    updateCurrentField('harvests', [
      ...current.harvests,
      {
        quantity: '',
        unit: 'tấn',
        quality: 'VietGAP - Loại 1',
        buyer: '',
        selling_price: '',
      },
    ]);
  }
  function updateHarvest(
    i: number,
    field: keyof HarvestFormItem,
    value: string,
  ) {
    const next = [...current.harvests];
    next[i][field] = value;
    updateCurrentField('harvests', next);
  }
  function removeHarvest(i: number) {
    updateCurrentField(
      'harvests',
      current.harvests.filter((_, idx) => idx !== i),
    );
  }

  // Quản lý dòng Quan sát
  function addObservationRow() {
    updateCurrentField('observations', [
      ...current.observations,
      { symptom: '', severity: 'LOW', description: '' },
    ]);
  }
  function updateObservation(
    i: number,
    field: keyof ObservationFormItem,
    value: string,
  ) {
    const next = [...current.observations];
    next[i][field] = value as any;
    updateCurrentField('observations', next);
  }
  function removeObservation(i: number) {
    updateCurrentField(
      'observations',
      current.observations.filter((_, idx) => idx !== i),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const payloads: ActivityFormSubmitData[] = activities.map((act) => {
      const cleanMaterials = act.materials.filter(
        (m) => m.material_name.trim() !== '' || m.quantity.trim() !== '',
      );
      const cleanAssets = act.assets.filter(
        (a) => a.asset_name.trim() !== '' || a.usage_duration.trim() !== '',
      );
      const cleanHarvests = act.harvests.filter(
        (h) => h.quantity.trim() !== '' || h.buyer.trim() !== '',
      );
      const cleanObservations = act.observations.filter(
        (o) => o.symptom.trim() !== '' || o.description.trim() !== '',
      );

      const isIr = act.activityType === 'IRRIGATE';
      const isFertOrSpray =
        act.activityType === 'FERTILIZE' || act.activityType === 'SPRAY';
      const isHarv = act.activityType === 'HARVEST';
      const isObs = act.activityType === 'OBSERVE';

      return {
        source_type: source,
        plot_code: act.plotCode,
        activity_type_code: act.activityType,
        start_time: act.startTime,
        end_time: act.endTime || undefined,
        description: act.description,
        note: act.note || undefined,
        materials:
          isFertOrSpray || cleanMaterials.length > 0
            ? cleanMaterials
            : undefined,
        assets: isIr || cleanAssets.length > 0 ? cleanAssets : undefined,
        harvests:
          isHarv || cleanHarvests.length > 0 ? cleanHarvests : undefined,
        observations:
          isObs || cleanObservations.length > 0
            ? cleanObservations
            : undefined,
        media: act.media.length > 0 ? act.media : undefined,
      };
    });

    const submitData = payloads.length === 1 ? payloads[0] : payloads;
    try {
      // Gọi endpoint POST /activities để lưu nhật ký vào CSDL
      await activitiesService.createActivity(submitData as any);
      onSubmit?.(submitData);
    } catch (err) {
      console.error('Lỗi khi ghi nhận hoạt động canh tác:', err);
      onSubmit?.(submitData);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Chỉ hiển thị các lô đang GROWING trong form ghi hoạt động
  const growingPlots = plots.filter(
    (p) => p.status === 'GROWING' || (p as any).mapStatus === 'GROWING',
  );
  const plotsForForm = growingPlots.length > 0 ? growingPlots : plots;

  const plotOptions = plotsForForm.map((p) => ({
    value: p.code,
    label: `${p.code} · ${p.name}${p.crop ? ` (${p.crop})` : ''}`,
  }));

  const activityOptions = ACTIVITY_TYPE_OPTIONS.map((t) => ({
    value: t.value,
    label: t.label,
  }));


  const isIrrigate = current.activityType === 'IRRIGATE';
  const isFertilizeOrSpray =
    current.activityType === 'FERTILIZE' || current.activityType === 'SPRAY';
  const isHarvest = current.activityType === 'HARVEST';
  const isObserve = current.activityType === 'OBSERVE';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 1. NGUỒN GHI NHẬN (MANUAL / TEXT / VOICE / IMAGE) - CHỌN CÁCH NHẬP Ở TRÊN CÙNG */}
      <div>
        <Label
          className="mb-1 block text-[12.5px] font-medium text-[#3A3527]"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Nguồn ghi nhận
        </Label>
        <Tabs
          value={source}
          onValueChange={(val) => setSource(val as ActivitySourceType)}
        >
          <TabsList className="w-full h-9">
            {SOURCE_TABS.map((s) => {
              const meta = SOURCE_META[s];
              const Icon = meta.icon;
              return (
                <TabsTrigger key={s} value={s} className="flex-1 gap-1.5 py-1">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="hidden sm:inline text-[12px]">
                    {meta.label}
                  </span>
                  <span className="sm:hidden text-[11px]">
                    {meta.label.split(' ')[0]}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {source === 'VOICE' && (
        <AudioRecorder onExtracted={handleAiExtractedResult} />
      )}
      {source === 'VIDEO' && (
        <VideoRecorder onExtracted={handleAiExtractedResult} />
      )}
      {source === 'TEXT' && (
        <div className="rounded-xl border border-[#DCE0C4] bg-[#FFFDF6] p-3 shadow-2xs">
          <div className="mb-2 flex items-center justify-between">
            <span
              className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#1C2B1E]"
              style={{ fontFamily: "'Lora', serif" }}
            >
              <Type className="h-4 w-4 text-[#C9A227]" strokeWidth={2} />
              Nhập nội dung văn bản tự do / Nhật ký nhanh
            </span>
          </div>
          <div className="relative rounded-xl border border-[#E1E5CB] bg-white/90 p-2 shadow-xs focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]">
            <Textarea
              rows={3}
              value={freeInputText}
              onChange={(e) => setFreeInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleExtractText();
                }
              }}
              placeholder="Ví dụ: Sáng 7h tưới ruộng A1 2 tiếng, sau đó bón 15kg phân NPK cho lúa bắp, phát hiện sâu cuốn lá nhẹ..."
              className="border-0 bg-transparent p-1 text-[13px] shadow-none focus-visible:ring-0 resize-none"
            />
            <div className="flex items-center justify-between pt-2 border-t border-[#F2F4E6]">
              <span className="text-[11.5px] text-[#7C7A4E]">
                Nhấn <kbd className="rounded border border-[#DCE0C4] bg-[#F7F2DF] px-1 font-mono text-[10.5px]">Enter ↵</kbd> để gửi
              </span>
              <Button
                type="button"
                onClick={handleExtractText}
                disabled={
                  isExtractingText ||
                  (!freeInputText.trim() && !current.description.trim())
                }
                size="icon"
                className="h-9 w-9 rounded-full bg-[#1C2B1E] text-[#C9A227] shadow-sm hover:bg-[#2C3F2E] transition disabled:opacity-40"
                aria-label="Gửi văn bản cho AI"
                title="Gửi cho AI (Enter)"
              >
                {isExtractingText ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" strokeWidth={2} />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB HIỂN THỊ CÁC HOẠT ĐỘNG ĐƯỢC THÊM BÊN DƯỚI PHẦN CHỌN CÁCH NHẬP */}
      <div className="rounded-xl border border-[#DCE0C4] bg-[#FFFDF6] p-2.5 shadow-2xs">
        <div className="mb-2 flex items-center justify-between">
          <span
            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#1C2B1E]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            <Layers className="h-4 w-4 text-[#C9A227]" strokeWidth={2} />
            Các hoạt động được thêm ({activities.length}/5)
          </span>
          {activities.length < 5 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddActivity}
              className="h-7 border-[#C9A227]/50 bg-white px-2.5 text-[11.5px] font-semibold text-[#1C2B1E] hover:bg-[#F7F2DF]"
            >
              <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
              Thêm hoạt động
            </Button>
          ) : (
            <Badge variant="gold" className="text-[10px]">
              Tối đa 5 hoạt động
            </Badge>
          )}
        </div>

        {/* Danh sách tab chuyển đổi giữa các hoạt động đã tạo */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {activities.map((act, idx) => {
            const isActive = idx === currentIdx;
            const option = ACTIVITY_TYPE_OPTIONS.find(
              (t) => t.value === act.activityType,
            );
            const label = option?.label || act.activityType;

            return (
              <div
                key={act.id}
                onClick={() => setActiveTabIdx(idx)}
                className={
                  'group relative flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all ' +
                  (isActive
                    ? 'border-[#C9A227] bg-[#1C2B1E] text-white shadow-sm'
                    : 'border-[#E1E5CB] bg-[#ECEEDA]/60 text-[#33361F] hover:bg-[#ECEEDA]')
                }
              >
                <span
                  className={
                    'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ' +
                    (isActive
                      ? 'bg-[#C9A227] text-[#1C2B1E]'
                      : 'bg-[#DCE0C4] text-[#33361F]')
                  }
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {idx + 1}
                </span>
                <span className="max-w-[130px] truncate sm:max-w-[160px]">
                  {label} · {act.plotCode}
                </span>

                {activities.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveActivity(e, idx)}
                    className={
                      'ml-1 flex h-4.5 w-4.5 items-center justify-center rounded-full transition ' +
                      (isActive
                        ? 'text-white/70 hover:bg-white/20 hover:text-white'
                        : 'text-[#8B9070] hover:bg-[#F6E2DC] hover:text-[#C15A34]')
                    }
                    aria-label="Xoá tab hoạt động này"
                  >
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. NỘI DUNG FORM NHẬP CHO HOẠT ĐỘNG ĐANG CHỌN (current) */}
      <div className="space-y-3.5">
        <div>
          <Label
            className="mb-1.5 block text-[13px] font-medium text-[#3A3527]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Thửa đất / Mùa vụ
            <span className="ml-1.5 text-[11px] font-normal text-[#6B9B52]">
              (chỉ lô đang phát triển)
            </span>
          </Label>
          {growingPlots.length === 0 && plots.length > 0 && (
            <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11.5px] text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>Hiện không có lô nào đang canh tác. Hiển thị toàn bộ lô để chọn.</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <Select
                value={current.plotCode}
                onChange={(e) => updateCurrentField('plotCode', e.target.value)}
                options={plotOptions}
              />
            </div>
            {/* Nút GPS định vị thực */}
            <button
              type="button"
              onClick={handleLocate}
              disabled={geoStatus === 'locating'}
              title={geoStatus === 'locating' ? 'Đang định vị...' : 'Định vị GPS — tự động tìm lô gần nhất & thời tiết'}
              className={
                'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border shadow-sm transition ' +
                (geoStatus === 'locating'
                  ? 'border-[#C9A227] bg-[#1C2B1E] text-[#C9A227] opacity-80 cursor-wait'
                  : geoStatus === 'success'
                    ? 'border-[#3F6B2C] bg-[#ECEEDA] text-[#3F6B2C] hover:bg-[#d4e8c0]'
                    : geoStatus === 'error'
                      ? 'border-red-300 bg-red-50 text-red-500 hover:bg-red-100'
                      : 'border-[#C9A227] bg-[#FFFDF6] text-[#8A6D1F] hover:bg-[#F7F2DF] hover:text-[#1C2B1E]')
              }
            >
              {geoStatus === 'locating' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : geoStatus === 'success' ? (
                <LocateFixed className="h-4 w-4" strokeWidth={2} />
              ) : geoStatus === 'error' ? (
                <WifiOff className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Navigation className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Thông báo lỗi định vị */}
          {geoStatus === 'error' && geoError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] text-red-600"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>{geoError}</span>
            </motion.div>
          )}

          {/* Kết quả định vị thành công */}
          {geoStatus === 'success' && nearestPlot && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-[#B8D4A0] bg-[#F0F8E8] px-3 py-2 text-[11.5px] text-[#3F6B2C]"
            >
              <LocateFixed className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>
                Đã tìm thấy lô gần nhất: <strong>{nearestPlot.plot.code} · {nearestPlot.plot.name}</strong>
                {nearestPlot.distance >= 0 && (
                  <span className="ml-1 text-[#6B9B52]">
                    (~{nearestPlot.distance < 1000
                      ? `${Math.round(nearestPlot.distance)}m`
                      : `${(nearestPlot.distance / 1000).toFixed(1)}km`})
                  </span>
                )}
              </span>
            </motion.div>
          )}

          {/* Thẻ thời tiết từ OpenWeather */}
          <AnimatePresence>
            {(weatherStatus === 'loading' || weatherStatus === 'success' || weatherStatus === 'error') && (
              <motion.div
                key="weather-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-2 overflow-hidden"
              >
                {weatherStatus === 'loading' && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#E1E5CB] bg-[#FFFDF6] px-3 py-2.5 text-[12px] text-[#8B9070]">
                    <Loader2 className="h-4 w-4 animate-spin text-[#C9A227]" />
                    <span>Đang tải dữ liệu thời tiết...</span>
                  </div>
                )}

                {weatherStatus === 'error' && weatherError && (
                  <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-[11.5px] text-orange-600">
                    <Cloud className="h-3.5 w-3.5 shrink-0" />
                    <span>Không lấy được thời tiết: {weatherError}</span>
                  </div>
                )}

                {weatherStatus === 'success' && weather && (
                  <div className="rounded-xl border border-[#C9E0B0] bg-gradient-to-br from-[#F4FAF0] to-[#EDF5E3] px-3.5 py-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1C2B1E]"
                        style={{ fontFamily: "'Lora', serif" }}
                      >
                        <Cloud className="h-3.5 w-3.5 text-[#4E9B47]" strokeWidth={2} />
                        Thời tiết hiện tại
                        {weather.cityName && (
                          <span className="font-normal text-[#8B9070]"> · {weather.cityName}</span>
                        )}
                      </span>
                      <span
                        className="rounded-full border border-[#B8D4A0] bg-white/70 px-2 py-0.5 text-[10.5px] capitalize text-[#3F6B2C]"
                      >
                        {weather.description}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-white/60 px-2 py-2">
                        <Thermometer className="mx-auto mb-0.5 h-4 w-4 text-[#E07B39]" strokeWidth={1.75} />
                        <p className="text-[14px] font-bold text-[#1C2B1E]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {weather.temp}°C
                        </p>
                        <p className="text-[10px] text-[#8B9070]">Nhiệt độ</p>
                      </div>
                      <div className="rounded-lg bg-white/60 px-2 py-2">
                        <Droplets className="mx-auto mb-0.5 h-4 w-4 text-[#3A8FC8]" strokeWidth={1.75} />
                        <p className="text-[14px] font-bold text-[#1C2B1E]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {weather.humidity}%
                        </p>
                        <p className="text-[10px] text-[#8B9070]">Độ ẩm</p>
                      </div>
                      <div className="rounded-lg bg-white/60 px-2 py-2">
                        <Wind className="mx-auto mb-0.5 h-4 w-4 text-[#6B8E5A]" strokeWidth={1.75} />
                        <p className="text-[14px] font-bold text-[#1C2B1E]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {weather.windSpeed}m/s
                        </p>
                        <p className="text-[10px] text-[#8B9070]">Gió</p>
                      </div>
                    </div>
                    <p className="mt-1.5 text-center text-[10.5px] text-[#A8AC86]">
                      Cảm giác như {weather.feelsLike}°C · Powered by OpenWeather
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thông tin mùa vụ của thửa đất đang chọn */}
          {(() => {
            const selectedPlotInfo = plots.find(
              (p) => p.code === current.plotCode,
            );
            if (!selectedPlotInfo) return null;

            const formatSeasonDate = (dateStr?: string | null) => {
              if (!dateStr) return '—';
              try {
                return new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(dateStr));
              } catch {
                return dateStr;
              }
            };

            return (
              <div className="mt-2.5 rounded-xl border border-[#E1E5CB] bg-[#FFFDF6] p-3.5 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF0E1] pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ECEEDA] text-[#1C2B1E] font-semibold text-[11.5px]">
                      {selectedPlotInfo.code}
                    </span>
                    <span
                      className="text-[13.5px] font-semibold text-[#20281B]"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      {selectedPlotInfo.name}
                    </span>
                  </div>
                  <span
                    className={
                      'rounded-full px-2.5 py-0.5 text-[11px] font-medium ' +
                      (selectedPlotInfo.status === 'GROWING'
                        ? 'bg-[#ECEEDA] text-[#3F6B2C]'
                        : 'bg-[#EFEBDD] text-[#8B8368]')
                    }
                  >
                    {selectedPlotInfo.status === 'GROWING'
                      ? 'Đang phát triển'
                      : 'Đất trống'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[12px]">
                  <div>
                    <span className="text-[#8B9070] block text-[11px]">
                      Cây trồng / Giống:
                    </span>
                    <span className="font-medium text-[#20281B]">
                      {selectedPlotInfo.crop || 'Chưa gieo'}
                      {selectedPlotInfo.variety
                        ? ` (${selectedPlotInfo.variety})`
                        : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8B9070] block text-[11px]">
                      Diện tích & Đất:
                    </span>
                    <span className="font-medium text-[#20281B]">
                      {selectedPlotInfo.area} ha · {selectedPlotInfo.soil_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8B9070] block text-[11px]">
                      Ngày xuống giống:
                    </span>
                    <span className="font-medium text-[#20281B]">
                      {formatSeasonDate(selectedPlotInfo.planting_date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8B9070] block text-[11px]">
                      Dự kiến thu hoạch:
                    </span>
                    <span className="font-medium text-[#20281B]">
                      {formatSeasonDate(selectedPlotInfo.expected_harvest_date)}
                    </span>
                  </div>
                </div>
                {selectedPlotInfo.status === 'GROWING' &&
                  selectedPlotInfo.progress !== undefined && (
                    <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-[#EEF0E1]/80">
                      <span className="text-[11px] text-[#8B9070] shrink-0">
                        Tiến độ mùa vụ:
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ECEEDA]">
                        <div
                          className="h-full rounded-full bg-[#C9A227] transition-all duration-300"
                          style={{ width: `${selectedPlotInfo.progress}%` }}
                        />
                      </div>
                      <span
                        className="text-[11px] font-medium text-[#7C7A4E] shrink-0"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {selectedPlotInfo.progress}%
                      </span>
                    </div>
                  )}
              </div>
            );
          })()}
        </div>
        <div>
          <Select
            label="Loại hoạt động canh tác"
            value={current.activityType}
            onChange={(e) => updateCurrentField('activityType', e.target.value)}
            options={activityOptions}
          />
        </div>
      </div>

      {/* Khoảng thời gian bắt đầu - kết thúc */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Input
            label="Thời gian bắt đầu"
            type="datetime-local"
            value={current.startTime}
            onChange={(e) => updateCurrentField('startTime', e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            label="Thời gian hoàn tất (chọn nếu đã xong)"
            type="datetime-local"
            value={current.endTime}
            onChange={(e) => updateCurrentField('endTime', e.target.value)}
          />
        </div>
      </div>

      {/* Mô tả hoạt động (Bỏ ở tab Văn bản, Giọng nói, Video) */}
      {source !== 'TEXT' && source !== 'VOICE' && source !== 'VIDEO' && (
        <div>
          <Textarea
            label={`Mô tả công việc thực hiện (Hoạt động #${currentIdx + 1})`}
            rows={2}
            value={current.description}
            onChange={(e) => updateCurrentField('description', e.target.value)}
            placeholder={
              isIrrigate
                ? 'Ví dụ: Tưới rãnh buổi sáng, mực nước đều 5cm...'
                : isFertilizeOrSpray
                  ? 'Ví dụ: Phun thuốc đúng liều lượng chỉ dẫn, thời tiết nắng ráo...'
                  : isHarvest
                    ? 'Ví dụ: Gặt lúa ruộng A1, lúa vàng đều độ ẩm 20%...'
                    : 'Ví dụ: Thăm ruộng buổi sáng, phát hiện bướm rầy...'
            }
          />
        </div>
      )}

      {/* Nút bật/tắt trường Ghi chú thêm (note) */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            updateCurrentField('showNoteField', !current.showNoteField)
          }
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7C7A4E] hover:text-[#1C2B1E]"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>
            {current.showNoteField
              ? 'Ẩn ghi chú kỹ thuật'
              : 'Thêm ghi chú kỹ thuật / nhật ký phụ'}
          </span>
          {current.showNoteField ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {current.showNoteField && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Textarea
              label="Ghi chú kỹ thuật (cống tưới, thời tiết, lưu ý sau thu hoạch...)"
              rows={2}
              value={current.note}
              onChange={(e) => updateCurrentField('note', e.target.value)}
              placeholder="Nhập ghi chú phụ trợ cho DTO note..."
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ẢNH MÔ TẢ CHO HOẠT ĐỘNG (MEDIA / IMAGE UPLOADER) */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-[#E1E5CB] bg-[#FFFDF6] p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#1C2B1E]">
            <ImageIcon className="h-4 w-4 text-[#C9A227]" />
            Ảnh & Tệp đính kèm cho hoạt động #{currentIdx + 1}
          </span>
          <Badge variant="neutral" className="text-[10px] px-2 py-0.5">
            {current.media?.length || 0} tệp
          </Badge>
        </div>
        <p className="text-[11px] text-[#1C2B1E]/60">
          Đính kèm hình ảnh mô tả hiện trạng cây trồng, sâu bệnh, bao bì vật tư hoặc kết quả thu hoạch.
        </p>

        {/* Hiển thị tệp Voice / Video đã được lưu vào Supabase từ quá trình ghi âm / quay video */}
        {(current.media || []).filter(
          (m) => m.media_type === 'AUDIO' || m.media_type === 'VIDEO',
        ).length > 0 && (
          <div className="space-y-1.5 pb-2 border-b border-[#E1E5CB]">
            <span className="text-[11.5px] font-medium text-[#7C7A4E] block">
              Tệp âm thanh / video đã lưu vào Supabase Storage:
            </span>
            <div className="flex flex-wrap gap-2">
              {(current.media || [])
                .filter(
                  (m) => m.media_type === 'AUDIO' || m.media_type === 'VIDEO',
                )
                .map((mediaItem, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-[#C9A227]/40 bg-[#1C2B1E] px-3 py-1.5 text-xs text-white shadow-sm"
                  >
                    {mediaItem.media_type === 'VIDEO' ? (
                      <Video className="h-3.5 w-3.5 text-[#C9A227]" />
                    ) : (
                      <Mic className="h-3.5 w-3.5 text-[#C9A227]" />
                    )}
                    <a
                      href={mediaItem.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-[#F7F2DF] truncate max-w-[200px]"
                      title="Mở tệp trên Supabase Storage"
                    >
                      {mediaItem.file_name ||
                        (mediaItem.media_type === 'VIDEO'
                          ? 'video_recording.webm'
                          : 'audio_recording.webm')}
                    </a>
                    <span className="text-[10px] text-[#C9A227] font-mono">
                      [{mediaItem.media_type}]
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <ImageUploader
          onFilesChange={(images) => {
            const imageMediaList = images.map((img) => ({
              media_type: 'IMAGE' as const,
              file_name: img.name,
              file_url: img.url,
            }));
            const nonImageMedia = (current.media || []).filter(
              (m) => m.media_type !== 'IMAGE',
            );
            updateCurrentField('media', [...nonImageMedia, ...imageMediaList]);
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* SECTION TABS: ĐIỀU HƯỚNG MATERIAL, ASSET, HARVEST, OBSERVATION BẰNG TAB */}
      {/* ========================================================================= */}

      <div className="rounded-xl border border-[#E1E5CB] bg-[#FFFDF6] p-2.5 shadow-2xs">
        <Tabs
          value={current.activeSectionTab}
          onValueChange={(val) =>
            updateCurrentField('activeSectionTab', val as SectionTabType)
          }
        >
          {/* Thanh Tabs chuyển đổi 4 mục nghiệp vụ gọn gàng trên mobile */}
          <TabsList className="w-full h-auto flex-wrap sm:flex-nowrap gap-1 bg-[#ECEEDA]/70 p-1">
            <TabsTrigger
              value="MATERIALS"
              className="flex-1 min-w-[120px] gap-1.5 py-1 text-[12px]"
            >
              <Sprout className="h-3.5 w-3.5 shrink-0 text-[#6B8F4E]" />
              <span>Vật tư</span>
              <Badge
                variant="neutral"
                className="ml-0.5 h-4 px-1.5 text-[10px]"
              >
                {current.materials.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="ASSETS"
              className="flex-1 min-w-[120px] gap-1.5 py-1 text-[12px]"
            >
              <Wrench className="h-3.5 w-3.5 shrink-0 text-[#7C7A4E]" />
              <span>Thiết bị</span>
              <Badge
                variant="neutral"
                className="ml-0.5 h-4 px-1.5 text-[10px]"
              >
                {current.assets.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="HARVESTS"
              className="flex-1 min-w-[120px] gap-1.5 py-1 text-[12px]"
            >
              <PackageCheck className="h-3.5 w-3.5 shrink-0 text-[#C9A227]" />
              <span>Thu hoạch</span>
              <Badge
                variant="neutral"
                className="ml-0.5 h-4 px-1.5 text-[10px]"
              >
                {current.harvests.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="OBSERVATIONS"
              className="flex-1 min-w-[120px] gap-1.5 py-1 text-[12px]"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#C15A34]" />
              <span>Quan sát</span>
              <Badge
                variant="neutral"
                className="ml-0.5 h-4 px-1.5 text-[10px]"
              >
                {current.observations.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* NỘI DUNG TAB 1: VẬT TƯ SỬ DỤNG (MATERIALS) */}
          <TabsContent value="MATERIALS" className="mt-2.5">
            {current.materials.length === 0 ? (
              <div className="flex items-center justify-center py-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMaterialRow}
                  className="h-8.5 border-dashed border-[#C9A227] bg-[#FFFDF6] px-4 text-[12.5px] font-semibold text-[#8A6D1F] hover:bg-[#F7F2DF] hover:text-[#1C2B1E]"
                >
                  <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} /> Thêm vật tư sử dụng
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label
                    className="text-[12.5px] font-semibold text-[#20281B]"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    Danh sách Vật tư ({current.materials.length})
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addMaterialRow}
                    className="h-7 px-2 text-[11.5px] font-medium text-[#8A6D1F] hover:text-[#1C2B1E]"
                  >
                    <Plus className="mr-1 h-3 w-3" strokeWidth={2} /> Thêm vật tư
                  </Button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {current.materials.map((m, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col gap-2 rounded-lg bg-[#F7F2DF]/50 p-2 sm:flex-row sm:items-center"
                      >
                        <div className="flex-1">
                          <Input
                            placeholder="Tên phân bón / thuốc / giống..."
                            value={m.material_name}
                            onChange={(e) =>
                              updateMaterial(i, 'material_name', e.target.value)
                            }
                            className="h-8.5 w-full text-[13px]"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Input
                            placeholder="Số lượng"
                            value={m.quantity}
                            onChange={(e) =>
                              updateMaterial(i, 'quantity', e.target.value)
                            }
                            className="h-8.5 w-24 sm:w-20 text-[13px]"
                          />
                          <Input
                            placeholder="Đơn vị"
                            value={m.unit}
                            onChange={(e) =>
                              updateMaterial(i, 'unit', e.target.value)
                            }
                            className="h-8.5 w-24 sm:w-20 text-[13px]"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMaterial(i)}
                            className="h-8.5 w-8.5 shrink-0 text-[#8B9070] hover:bg-[#F6E2DC] hover:text-[#9C4B2E]"
                            aria-label="Xoá dòng"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </TabsContent>

          {/* NỘI DUNG TAB 2: THIẾT BỊ / MÁY MÓC (ASSETS) */}
          <TabsContent value="ASSETS" className="mt-2.5">
            {current.assets.length === 0 ? (
              <div className="flex items-center justify-center py-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAssetRow}
                  className="h-8.5 border-dashed border-[#C9A227] bg-[#FFFDF6] px-4 text-[12.5px] font-semibold text-[#8A6D1F] hover:bg-[#F7F2DF] hover:text-[#1C2B1E]"
                >
                  <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} /> Thêm thiết bị & máy móc
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label
                    className="text-[12.5px] font-semibold text-[#20281B]"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    Thiết bị & Máy móc ({current.assets.length})
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addAssetRow}
                    className="h-7 px-2 text-[11.5px] font-medium text-[#8A6D1F] hover:text-[#1C2B1E]"
                  >
                    <Plus className="mr-1 h-3 w-3" strokeWidth={2} /> Thêm máy móc
                  </Button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {current.assets.map((a, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col gap-2 rounded-lg bg-[#F7F2DF]/50 p-2 sm:flex-row sm:items-center"
                      >
                        <div className="flex-1">
                          <Input
                            placeholder="Tên máy bơm / bình xịt / máy gặt..."
                            value={a.asset_name}
                            onChange={(e) =>
                              updateAsset(i, 'asset_name', e.target.value)
                            }
                            className="h-8.5 w-full text-[13px]"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Input
                            placeholder="Số giờ (h)"
                            value={a.usage_duration}
                            onChange={(e) =>
                              updateAsset(i, 'usage_duration', e.target.value)
                            }
                            className="h-8.5 w-28 text-[13px]"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAsset(i)}
                            className="h-8.5 w-8.5 shrink-0 text-[#8B9070] hover:bg-[#F6E2DC] hover:text-[#9C4B2E]"
                            aria-label="Xoá thiết bị"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </TabsContent>

          {/* NỘI DUNG TAB 3: GHI NHẬN THU HOẠCH (HARVESTS: ICreateHarvestDto) */}
          <TabsContent value="HARVESTS" className="mt-2.5">
            {current.harvests.length === 0 ? (
              <div className="flex items-center justify-center py-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addHarvestRow}
                  className="h-8.5 border-dashed border-[#C9A227] bg-[#FFFDF6] px-4 text-[12.5px] font-semibold text-[#8A6D1F] hover:bg-[#F7F2DF] hover:text-[#1C2B1E]"
                >
                  <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} /> Thêm lô hàng thu hoạch
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label
                    className="text-[12.5px] font-semibold text-[#20281B]"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    Sản lượng Thu hoạch ({current.harvests.length})
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addHarvestRow}
                    className="h-7 px-2 text-[11.5px] font-medium text-[#8A6D1F] hover:text-[#1C2B1E]"
                  >
                    <Plus className="mr-1 h-3 w-3" strokeWidth={2} /> Thêm lô hàng
                  </Button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {current.harvests.map((h, i) => {
                      const qtyNum = parseFloat(h.quantity) || 0;
                      const priceNum = parseFloat(h.selling_price) || 0;
                      const revNum = qtyNum * priceNum;
                      return (
                        <motion.div
                          key={i}
                          layout
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-2 rounded-lg bg-[#F7F2DF]/70 p-2.5"
                        >
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <Input
                              label="Sản lượng"
                              placeholder="Số lượng..."
                              value={h.quantity}
                              onChange={(e) =>
                                updateHarvest(i, 'quantity', e.target.value)
                              }
                              className="h-8.5 text-[13px]"
                            />
                            <Input
                              label="Đơn vị"
                              placeholder="tấn / kg / tạ"
                              value={h.unit}
                              onChange={(e) =>
                                updateHarvest(i, 'unit', e.target.value)
                              }
                              className="h-8.5 text-[13px]"
                            />
                            <Input
                              label="Phẩm cấp / Chất lượng"
                              placeholder="VietGAP / Loại 1..."
                              value={h.quality}
                              onChange={(e) =>
                                updateHarvest(i, 'quality', e.target.value)
                              }
                              className="h-8.5 text-[13px]"
                            />
                          </div>
                          <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-3">
                            <Input
                              label="Thương lái / Điểm mua"
                              placeholder="Tên thương lái..."
                              value={h.buyer}
                              onChange={(e) =>
                                updateHarvest(i, 'buyer', e.target.value)
                              }
                              className="h-8.5 text-[13px]"
                            />
                            <Input
                              label="Đơn giá bán (VNĐ)"
                              placeholder="12000000..."
                              value={h.selling_price}
                              onChange={(e) =>
                                updateHarvest(i, 'selling_price', e.target.value)
                              }
                              className="h-8.5 text-[13px]"
                            />
                            <div className="flex items-center justify-between rounded-md border border-[#DCE0C4] bg-white px-2.5 py-1">
                              <span className="text-[11px] text-[#7C7A4E]">
                                Ước tính thu:
                              </span>
                              <span
                                className="text-[12.5px] font-bold text-[#1C2B1E]"
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                              >
                                {revNum > 0
                                  ? revNum.toLocaleString('vi-VN') + ' đ'
                                  : '0 đ'}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeHarvest(i)}
                                className="h-7 w-7 text-[#8B9070] hover:text-[#C15A34]"
                                aria-label="Xoá lô thu hoạch"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </TabsContent>

          {/* NỘI DUNG TAB 4: QUAN SÁT SÂU BỆNH (OBSERVATIONS) */}
          <TabsContent value="OBSERVATIONS" className="mt-2.5">
            {current.observations.length === 0 ? (
              <div className="flex items-center justify-center py-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addObservationRow}
                  className="h-8.5 border-dashed border-[#C9A227] bg-[#FFFDF6] px-4 text-[12.5px] font-semibold text-[#8A6D1F] hover:bg-[#F7F2DF] hover:text-[#1C2B1E]"
                >
                  <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} /> Thêm quan sát dịch hại
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label
                    className="text-[12.5px] font-semibold text-[#20281B]"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    Quan sát dịch hại & Triệu chứng ({current.observations.length})
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addObservationRow}
                    className="h-7 px-2 text-[11.5px] font-medium text-[#8A6D1F] hover:text-[#1C2B1E]"
                  >
                    <Plus className="mr-1 h-3 w-3" strokeWidth={2} /> Thêm quan sát
                  </Button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {current.observations.map((o, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-1 gap-2 rounded-lg bg-[#F7F2DF]/50 p-2 sm:grid-cols-4 sm:items-center"
                      >
                        <Input
                          placeholder="Tên bệnh / Sâu hại (ví dụ: Rầy nâu)..."
                          value={o.symptom}
                          onChange={(e) =>
                            updateObservation(i, 'symptom', e.target.value)
                          }
                          className="h-8.5 text-[13px] sm:col-span-1"
                        />
                        <Select
                          value={o.severity}
                          onChange={(e) =>
                            updateObservation(i, 'severity', e.target.value)
                          }
                          options={[
                            { value: 'LOW', label: 'Nguy hại Nhẹ (LOW)' },
                            { value: 'MEDIUM', label: 'Trung bình (MEDIUM)' },
                            { value: 'HIGH', label: 'Nặng / Báo động (HIGH)' },
                          ]}
                        />
                        <div className="flex items-center gap-1 sm:col-span-2">
                          <Input
                            placeholder="Mô tả tình trạng chi tiết..."
                            value={o.description}
                            onChange={(e) =>
                              updateObservation(i, 'description', e.target.value)
                            }
                            className="h-8.5 flex-1 text-[13px]"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeObservation(i)}
                            className="h-8.5 w-8.5 shrink-0 text-[#8B9070] hover:bg-[#F6E2DC] hover:text-[#9C4B2E]"
                            aria-label="Xoá quan sát"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* NÚT LƯU HOẠT ĐỘNG CANH TÁC */}
      {/* ========================================================================= */}
      <div className="mt-4 flex items-center justify-end border-t border-[#E1E5CB] pt-3">
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto font-semibold shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              <span>Đang lưu nhật ký...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-1.5 h-4 w-4" strokeWidth={2} />
              <span>
                {activities.length === 1
                  ? 'Lưu 1 hoạt động canh tác'
                  : `Lưu tất cả (${activities.length}) hoạt động canh tác`}
              </span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default ActivityForm;
