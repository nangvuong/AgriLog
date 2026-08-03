import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface PlotData {
  code: string;
  name: string;
  area: number;
  soil_type: string;
  status: 'GROWING' | 'FALLOW' | string;
  crop?: string;
  variety?: string;
  progress?: number;
  mapStatus?: 'GROWING' | 'FALLOW' | 'ALERT' | string;
  points?: string;
  labelX?: number;
  labelY?: number;
}

export interface PlotCardProps {
  plot: PlotData;
  onOpen?: () => void;
}

export function PlotCard({ plot, onOpen }: PlotCardProps) {
  const isGrowing = plot.status === 'GROWING';

  return (
    <Card className="overflow-hidden shadow-sm transition hover:border-[#C9A227]/60">
      <div className="flex h-20 items-center justify-center bg-[#ECEEDA]">
        <MapPin className="h-6 w-6 text-[#1C2B1E]/50" strokeWidth={1.5} />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p
            className="text-[13.5px] font-medium text-[#20281B]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {plot.code} · {plot.name}
          </p>
          <Badge variant={isGrowing ? 'default' : 'neutral'}>
            {isGrowing ? 'Đang canh tác' : 'Đất trống'}
          </Badge>
        </div>
        <p className="mt-1 text-[12px] text-[#8B9070]">
          {plot.area} ha · {plot.soil_type}
        </p>

        {isGrowing ? (
          <>
            <p
              className="mt-2 text-[12.5px] text-[#33361F]"
              style={{ fontFamily: "'Lora', serif" }}
            >
              {plot.crop} — {plot.variety}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ECEEDA]">
                <div
                  className="h-full rounded-full bg-[#C9A227] transition-all duration-300"
                  style={{ width: `${plot.progress || 0}%` }}
                />
              </div>
              <span
                className="text-[11px] text-[#7C7A4E]"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {plot.progress || 0}%
              </span>
            </div>
          </>
        ) : (
          <p
            className="mt-2 text-[12px] text-[#A8AC86]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Chưa có mùa vụ nào đang triển khai
          </p>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onOpen}
          className="mt-3 w-full justify-center text-[12.5px]"
        >
          Xem mùa vụ{' '}
          <ChevronRight className="ml-1 h-3.5 w-3.5" strokeWidth={1.75} />
        </Button>
      </CardContent>
    </Card>
  );
}

export default PlotCard;
