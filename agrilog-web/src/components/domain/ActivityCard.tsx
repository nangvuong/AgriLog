import React, { useState } from 'react';
import {
  Sprout,
  Droplets,
  Wind,
  Wheat,
  Clock,
  Mic,
  Type,
  Image as ImageIcon,
  Video,
  PenLine,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Wrench,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ActivityMaterialItem {
  id?: number;
  name?: string;
  material_name?: string;
  quantity?: number | string;
  unit?: string;
  material_default_unit?: string;
}

export interface ActivityAssetItem {
  id?: number;
  asset_name?: string;
  asset_type?: string;
  usage_duration?: number;
}

export interface ActivityAiExtractionItem {
  model_name?: string;
  confidence?: number;
  processing_time_ms?: number;
}

export type ActivitySourceType = 'VOICE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'MANUAL' | string;
export type AIStatusType =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'FAILED'
  | string;

/**
 * ActivityData khớp hoàn toàn với DTO IActivityDto từ Backend endpoint /activities
 * đồng thời tương thích ngược với các trường demo hiện tại.
 */
export interface ActivityData {
  id?: number | string;
  type?: 'IRRIGATE' | 'FERTILIZE' | 'SPRAY' | 'HARVEST' | string;
  activity_type_code?: string;
  type_name?: string;
  activity_type_name?: string;
  plot_code?: string;
  season_name?: string;
  farmer?: string;
  farmer_name?: string;
  start_time: string | Date;
  end_time?: string | Date | null;
  source_type?: ActivitySourceType;
  ai_status?: AIStatusType | null;
  description?: string;
  note?: string;
  materials?: ActivityMaterialItem[];
  assets?: ActivityAssetItem[];
  ai_extraction?: ActivityAiExtractionItem;
  mediaCount?: number;
}

export interface ActivityCardProps {
  activity: ActivityData;
  onDetailClick?: () => void;
  className?: string;
}

const ACTIVITY_ICON: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  IRRIGATE: Droplets,
  FERTILIZE: Sprout,
  SPRAY: Wind,
  HARVEST: Wheat,
  OBSERVE: Clock,
};

const SOURCE_META: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }
> = {
  VOICE: { label: 'Giọng nói', icon: Mic },
  TEXT: { label: 'Văn bản', icon: Type },
  IMAGE: { label: 'Hình ảnh', icon: ImageIcon },
  VIDEO: { label: 'Video', icon: Video },
  MANUAL: { label: 'Nhập tay', icon: PenLine },
};

const AI_STATUS_META: Record<
  string,
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

function formatActivityTime(
  start?: string | Date,
  end?: string | Date | null,
): string {
  try {
    if (!start) return 'Chưa rõ thời gian';
    const dateObj = new Date(start);
    if (isNaN(dateObj.getTime())) return 'Thời gian không hợp lệ';

    const fmt = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const startStr = fmt.format(dateObj);
    if (!end) return startStr;

    const endDateObj = new Date(end);
    if (isNaN(endDateObj.getTime())) return startStr;

    const endStr = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(endDateObj);

    return `${startStr} - ${endStr}`;
  } catch {
    return 'Thời gian hoạt động';
  }
}

export function ActivityCard({
  activity,
  onDetailClick,
  className = '',
}: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Chuẩn hóa các trường từ backend (IActivityDto) hoặc props demo
  const typeCode = (
    activity.activity_type_code ||
    activity.type ||
    ''
  ).toUpperCase();
  const typeName =
    activity.activity_type_name ||
    activity.type_name ||
    'Hoạt động canh tác';
  const plotCode = activity.plot_code || activity.season_name || 'N/A';
  const farmerName =
    activity.farmer_name || activity.farmer || 'Nông dân AgriLog';
  const sourceCode = (activity.source_type || 'MANUAL').toUpperCase();
  const aiStatus = activity.ai_status ? activity.ai_status.toUpperCase() : null;

  const Icon = ACTIVITY_ICON[typeCode] || Sprout;
  const src = SOURCE_META[sourceCode] || SOURCE_META.MANUAL;
  const SrcIcon = src.icon;
  const aiMeta = aiStatus ? AI_STATUS_META[aiStatus] : null;

  const timeStr = formatActivityTime(activity.start_time, activity.end_time);

  const hasExtraDetails =
    Boolean(activity.note && activity.note !== activity.description) ||
    Boolean(activity.assets && activity.assets.length > 0) ||
    Boolean(activity.ai_extraction);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{
        y: -3,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      className={className}
    >
      <Card className="overflow-hidden border-[#E1E5CB] bg-[#FFFDF6] shadow-sm transition-all hover:border-[#C9A227]/70 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon loại hoạt động có hiệu ứng motion scale khi hover */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: -3 }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ECEEDA] text-[#1C2B1E] shadow-2xs"
            >
              <Icon className="h-5.5 w-5.5" strokeWidth={1.75} />
            </motion.div>

            <div className="min-w-0 flex-1">
              {/* Header tags: Tên hoạt động, Thửa/Mùa vụ, AI status */}
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className="text-[14px] font-semibold text-[#20281B]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {typeName}
                </p>
                <Badge variant="outline" className="border-[#DCE0C4]">
                  Thửa {plotCode}
                </Badge>
                {aiMeta && (
                  <Badge variant={aiMeta.variant}>
                    {aiMeta.label}
                  </Badge>
                )}
              </div>

              {/* Thời gian & Người thực hiện */}
              <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#8B9070]">
                <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span>{timeStr}</span>
                <span>·</span>
                <span className="font-medium text-[#52502E]">
                  {farmerName}
                </span>
              </p>

              {/* Mô tả hoạt động (description) */}
              {activity.description && (
                <p
                  className="mt-2 text-[13px] leading-relaxed text-[#33361F]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {activity.description}
                </p>
              )}

              {/* Danh sách vật tư (Materials) */}
              {activity.materials && activity.materials.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {activity.materials.map((m, i) => {
                    const name = m.material_name || m.name || 'Vật tư';
                    const unit = m.unit || m.material_default_unit || '';
                    const qty = m.quantity ?? '';
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-[#E1E5CB] bg-[#F7F2DF] px-2.5 py-0.5 text-[11px] font-medium text-[#7C7A4E]"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {name} {qty ? `· ${qty}` : ''}
                        {unit}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Phần mở rộng (AnimatePresence) hiển thị Ghi chú, Tài sản, AI Extraction khi bấm xem chi tiết mở rộng */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2.5 border-t border-[#EEF0E1] pt-3 text-[12.5px]">
                      {/* Ghi chú thêm (note) nếu có */}
                      {activity.note &&
                        activity.note !== activity.description && (
                          <div className="flex items-start gap-2 rounded-lg bg-[#F7F2DF]/80 p-2 text-[#52502E]">
                            <FileText
                              className="mt-0.5 h-4 w-4 shrink-0 text-[#8B9070]"
                              strokeWidth={1.75}
                            />
                            <div>
                              <span className="font-semibold text-[#33361F]">
                                Ghi chú:{' '}
                              </span>
                              <span style={{ fontFamily: "'Lora', serif" }}>
                                {activity.note}
                              </span>
                            </div>
                          </div>
                        )}

                      {/* Tài sản & máy móc sử dụng (Assets) */}
                      {activity.assets && activity.assets.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="flex items-center gap-1 text-[11.5px] font-medium text-[#7C7A4E]">
                            <Wrench
                              className="h-3.5 w-3.5 text-[#8B9070]"
                              strokeWidth={1.75}
                            />
                            Thiết bị:
                          </span>
                          {activity.assets.map((a, i) => (
                            <Badge
                              key={i}
                              variant="neutral"
                              className="text-[11px]"
                            >
                              {a.asset_name || 'Thiết bị'}
                              {a.usage_duration
                                ? ` (${a.usage_duration}h)`
                                : ''}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Thông tin trích xuất AI (ai_extraction) */}
                      {activity.ai_extraction && (
                        <div className="flex flex-wrap items-center justify-between rounded-lg bg-[#ECEEDA]/60 px-2.5 py-1.5 text-[11px] text-[#52502E]">
                          <span className="flex items-center gap-1 font-medium text-[#3F6B2C]">
                            <Sparkles
                              className="h-3.5 w-3.5 text-[#C9A227]"
                              strokeWidth={1.75}
                            />
                            {activity.ai_extraction.model_name ||
                              'AI Extractor'}
                          </span>
                          {activity.ai_extraction.confidence != null && (
                            <span
                              style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                              }}
                            >
                              Độ tin cậy:{' '}
                              {Math.round(
                                activity.ai_extraction.confidence * 100,
                              )}
                              %
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer: Nguồn ghi nhận + Button Chi tiết / Mở rộng */}
              <div className="mt-3 flex items-center justify-between border-t border-[#EEF0E1]/80 pt-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-[#8B9070]">
                    <SrcIcon
                      className="h-3.5 w-3.5 text-[#7C7A4E]"
                      strokeWidth={1.75}
                    />
                    <span>{src.label}</span>
                  </span>
                  {activity.mediaCount && activity.mediaCount > 0 ? (
                    <span className="text-[11px] text-[#A8AC86]">
                      · {activity.mediaCount} tệp đính kèm
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-1">
                  {hasExtraDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setIsExpanded((prev) => !prev)}
                      className="h-7 px-2 text-[12px] font-medium text-[#7C7A4E] hover:bg-[#ECEEDA] hover:text-[#1C2B1E]"
                    >
                      <span>{isExpanded ? 'Thu gọn' : 'Thêm'}</span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </motion.div>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={onDetailClick}
                    className="h-7 px-2 text-[12px] font-medium text-[#8A6D1F] hover:bg-[#FBF0D6]/60 hover:text-[#1C2B1E]"
                  >
                    <span>Chi tiết</span>
                    <motion.div
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronRight
                        className="h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />
                    </motion.div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ActivityCard;
