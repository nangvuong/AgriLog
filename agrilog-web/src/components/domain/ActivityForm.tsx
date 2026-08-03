import React, { useState } from 'react';
import {
  Mic,
  Type,
  Image as ImageIcon,
  PenLine,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlotData } from './PlotCard';
import { ActivitySourceType } from './ActivityCard';
import AudioRecorder from './AudioRecorder';
import ImageUploader from './ImageUploader';

const ACTIVITY_TYPES = [
  { value: 'IRRIGATE', label: 'Tưới nước' },
  { value: 'FERTILIZE', label: 'Bón phân' },
  { value: 'SPRAY', label: 'Phun thuốc' },
  { value: 'HARVEST', label: 'Thu hoạch' },
];

const SOURCE_TABS: ActivitySourceType[] = [
  'MANUAL',
  'TEXT',
  'VOICE',
  'IMAGE',
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
  IMAGE: { label: 'Hình ảnh', icon: ImageIcon },
};

export interface MaterialItem {
  name: string;
  quantity: string;
  unit: string;
}

export interface ActivityFormProps {
  plots?: PlotData[];
  onSubmit?: (data: {
    source: ActivitySourceType;
    plot_code: string;
    activity_type: string;
    start_time: string;
    description: string;
    materials: MaterialItem[];
  }) => void;
  onCancel?: () => void;
}

export function ActivityForm({
  plots = [],
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const [source, setSource] = useState<ActivitySourceType>('MANUAL');
  const [plotCode, setPlotCode] = useState<string>(
    plots[0]?.code || 'A1',
  );
  const [activityType, setActivityType] = useState<string>('IRRIGATE');
  const [startTime, setStartTime] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [materials, setMaterials] = useState<MaterialItem[]>([
    { name: '', quantity: '', unit: '' },
  ]);

  function addMaterialRow() {
    setMaterials([...materials, { name: '', quantity: '', unit: '' }]);
  }

  function updateMaterial(
    i: number,
    field: keyof MaterialItem,
    value: string,
  ) {
    const next = [...materials];
    next[i][field] = value;
    setMaterials(next);
  }

  function removeMaterial(i: number) {
    setMaterials(materials.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.({
      source,
      plot_code: plotCode,
      activity_type: activityType,
      start_time: startTime,
      description,
      materials,
    });
  }

  const plotOptions = plots.map((p) => ({
    value: p.code,
    label: `${p.code} · ${p.name}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label
          className="mb-1.5 block text-[13px] font-medium text-[#3A3527]"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Nguồn ghi nhận
        </Label>
        <Tabs
          value={source}
          onValueChange={(val) => setSource(val as ActivitySourceType)}
        >
          <TabsList className="w-full">
            {SOURCE_TABS.map((s) => {
              const meta = SOURCE_META[s];
              const Icon = meta.icon;
              return (
                <TabsTrigger key={s} value={s} className="flex-1 gap-1.5">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {meta.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {source === 'VOICE' && <AudioRecorder />}
      {source === 'IMAGE' && <ImageUploader />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Thửa"
          value={plotCode}
          onChange={(e) => setPlotCode(e.target.value)}
          options={plotOptions}
        />
        <Select
          label="Loại hoạt động"
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          options={ACTIVITY_TYPES}
        />
      </div>

      <div>
        <Input
          label="Thời gian bắt đầu"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div>
        <Textarea
          label="Mô tả / ghi chú"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ví dụ: tưới nước buổi sáng, mực nước ổn định..."
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label
            className="text-[13px] font-medium text-[#3A3527]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Vật tư sử dụng
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addMaterialRow}
            className="h-7 px-2 text-[12px] font-medium text-[#8A6D1F] hover:text-[#1C2B1E]"
          >
            <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={2} /> Thêm dòng
          </Button>
        </div>
        <div className="space-y-2">
          {materials.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Tên vật tư"
                value={m.name}
                onChange={(e) => updateMaterial(i, 'name', e.target.value)}
                className="h-9"
              />
              <Input
                placeholder="SL"
                value={m.quantity}
                onChange={(e) =>
                  updateMaterial(i, 'quantity', e.target.value)
                }
                className="h-9 w-20"
              />
              <Input
                placeholder="ĐV"
                value={m.unit}
                onChange={(e) => updateMaterial(i, 'unit', e.target.value)}
                className="h-9 w-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeMaterial(i)}
                className="h-9 w-9 shrink-0 text-[#8B9070] hover:bg-[#F6E2DC] hover:text-[#9C4B2E]"
                aria-label="Xoá dòng"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
        >
          Huỷ
        </Button>
        <Button variant="primary" type="submit">
          Lưu hoạt động
        </Button>
      </div>
    </form>
  );
}

export default ActivityForm;
