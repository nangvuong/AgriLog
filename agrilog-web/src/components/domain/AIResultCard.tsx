import React from 'react';
import { Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AIStatusType, ActivitySourceType } from './ActivityCard';

export interface AIResultData {
  model_name: string;
  source_type: ActivitySourceType;
  ai_status: AIStatusType;
  confidence: number;
  transcript?: string;
  extracted?: Record<string, string | number>;
}

export interface AIResultCardProps {
  result: AIResultData;
  onConfirm?: () => void;
  onEdit?: () => void;
}

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

export function AIResultCard({
  result,
  onConfirm,
  onEdit,
}: AIResultCardProps) {
  const status =
    AI_STATUS_META[result.ai_status || 'PENDING'] || AI_STATUS_META.PENDING;
  const isBusy =
    result.ai_status === 'PENDING' || result.ai_status === 'PROCESSING';

  return (
    <Card className="border-[#DCE0C4] bg-gradient-to-b from-[#FBF7EA] to-[#FFFDF6] shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C2B1E] text-[#E7C766]">
              <Bot className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <p
                className="text-[13px] font-medium text-[#20281B]"
                style={{ fontFamily: "'Lora', serif" }}
              >
                {result.model_name}
              </p>
              <p className="text-[11px] text-[#8B9070]">
                Trích xuất tự động từ{' '}
                {result.source_type === 'VOICE' ? 'giọng nói' : 'hình ảnh'}
              </p>
            </div>
          </div>
          <Badge variant={status.variant}>
            {isBusy && <Spinner size="sm" className="mr-1 text-current" />}
            {status.label}
          </Badge>
        </div>

        {result.transcript && (
          <p
            className="mt-3 rounded-lg bg-[#F7F2DF] p-2.5 text-[12.5px] italic text-[#52502E]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            “{result.transcript}”
          </p>
        )}

        {!isBusy && result.extracted && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {Object.entries(result.extracted).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-[#ECEEDA] px-2.5 py-2">
                <p
                  className="text-[10px] uppercase tracking-wide text-[#7C9068]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {key}
                </p>
                <p
                  className="text-[12.5px] text-[#20281B]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {String(value)}
                </p>
              </div>
            ))}
          </div>
        )}

        {!isBusy && (
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-[#8B9070]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} /> Độ tin cậy{' '}
              {Math.round((result.confidence || 0) * 100)}%
            </span>
            {result.ai_status === 'COMPLETED' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={onEdit}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  type="button"
                  onClick={onConfirm}
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />{' '}
                  Xác nhận
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIResultCard;
