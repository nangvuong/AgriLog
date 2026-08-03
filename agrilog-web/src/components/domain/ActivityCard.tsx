import React from 'react';
import {
  Sprout,
  Droplets,
  Wind,
  Wheat,
  Clock,
  Mic,
  Type,
  Image as ImageIcon,
  PenLine,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ActivityMaterial {
  name: string;
  quantity: number | string;
  unit: string;
}

export type ActivitySourceType = 'VOICE' | 'TEXT' | 'IMAGE' | 'MANUAL';
export type AIStatusType =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'FAILED';

export interface ActivityData {
  type: 'IRRIGATE' | 'FERTILIZE' | 'SPRAY' | 'HARVEST' | string;
  type_name: string;
  plot_code: string;
  farmer: string;
  start_time: string;
  source_type?: ActivitySourceType;
  ai_status?: AIStatusType;
  description?: string;
  materials?: ActivityMaterial[];
  mediaCount?: number;
}

export interface ActivityCardProps {
  activity: ActivityData;
  onDetailClick?: () => void;
}

const ACTIVITY_ICON: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  IRRIGATE: Droplets,
  FERTILIZE: Sprout,
  SPRAY: Wind,
  HARVEST: Wheat || Sprout,
};

const SOURCE_META: Record<
  ActivitySourceType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }
> = {
  VOICE: { label: 'Giọng nói', icon: Mic },
  TEXT: { label: 'Văn bản', icon: Type },
  IMAGE: { label: 'Hình ảnh', icon: ImageIcon },
  MANUAL: { label: 'Nhập tay', icon: PenLine },
};

const AI_STATUS_META: Record<
  AIStatusType,
  {
    label: string;
    variant: 'neutral' | 'gold' | 'default' | 'danger' | 'outline';
  }
> = {
  PENDING: { label: 'Chờ xử lý', variant: 'neutral' },
  PROCESSING: { label: 'Đang phân tích', variant: 'neutral' },
  COMPLETED: { label: 'Đã trích xuất', variant: 'gold' },
  CONFIRMED: { label: 'Đã xác nhận', variant: 'default' },
  FAILED: { label: 'Xử lý lỗi', variant: 'danger' },
};

export function ActivityCard({
  activity,
  onDetailClick,
}: ActivityCardProps) {
  const Icon = ACTIVITY_ICON[activity.type] || Sprout;
  const src =
    SOURCE_META[activity.source_type || 'MANUAL'] || SOURCE_META.MANUAL;
  const SrcIcon = src.icon;

  const time = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(activity.start_time || Date.now()));

  return (
    <Card className="shadow-sm transition hover:border-[#C9A227]/60">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECEEDA] text-[#1C2B1E]">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p
                className="text-[13.5px] font-medium text-[#20281B]"
                style={{ fontFamily: "'Lora', serif" }}
              >
                {activity.type_name}
              </p>
              <Badge variant="outline">Thửa {activity.plot_code}</Badge>
              {activity.ai_status && AI_STATUS_META[activity.ai_status] && (
                <Badge variant={AI_STATUS_META[activity.ai_status].variant}>
                  {AI_STATUS_META[activity.ai_status].label}
                </Badge>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#8B9070]">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.75} /> {time} ·{' '}
              {activity.farmer}
            </p>
            {activity.description && (
              <p
                className="mt-2 text-[13px] leading-relaxed text-[#33361F]"
                style={{ fontFamily: "'Lora', serif" }}
              >
                {activity.description}
              </p>
            )}
            {activity.materials && activity.materials.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {activity.materials.map((m, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-[#F7F2DF] px-2 py-0.5 text-[11px] text-[#7C7A4E]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {m.name} · {m.quantity}
                    {m.unit}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] text-[#8B9070]">
                <SrcIcon className="h-3.5 w-3.5" strokeWidth={1.75} />{' '}
                {src.label}
                {activity.mediaCount && activity.mediaCount > 0 ? (
                  <span>· {activity.mediaCount} tệp đính kèm</span>
                ) : null}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDetailClick}
                className="h-7 px-2 text-[12px] font-medium text-[#8A6D1F] hover:text-[#1C2B1E]"
              >
                Chi tiết{' '}
                <ChevronRight className="ml-0.5 h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityCard;
