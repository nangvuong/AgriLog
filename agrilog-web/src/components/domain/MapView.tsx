import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlotData } from './PlotCard';

const STATUS_FILL: Record<string, string> = {
  GROWING: '#C4D9A8',
  FALLOW: '#E7E2CC',
  ALERT: '#F0C9A9',
};

const STATUS_STROKE: Record<string, string> = {
  GROWING: '#6B8F4E',
  FALLOW: '#B3AB92',
  ALERT: '#C9793E',
};

export interface MapViewProps {
  plots: PlotData[];
  onSelect?: (code: string) => void;
}

export function MapView({ plots, onSelect }: MapViewProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <svg
          viewBox="0 0 320 220"
          className="w-full rounded-lg"
          style={{ background: '#F7F2DF' }}
        >
          {plots.map((p) => {
            const fill = STATUS_FILL[p.mapStatus || 'FALLOW'] || '#E7E2CC';
            const stroke =
              hovered === p.code
                ? '#1C2B1E'
                : STATUS_STROKE[p.mapStatus || 'FALLOW'] || '#B3AB92';

            return (
              <g
                key={p.code}
                onMouseEnter={() => setHovered(p.code)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect?.(p.code)}
                className="cursor-pointer"
              >
                <polygon
                  points={p.points || '20,20 100,20 100,100 20,100'}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={hovered === p.code ? 2 : 1.2}
                  opacity={hovered && hovered !== p.code ? 0.6 : 1}
                  className="transition-all duration-150"
                />
                <text
                  x={p.labelX || 60}
                  y={p.labelY || 60}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#20281B"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {p.code}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11.5px] text-[#7C7A4E]">
          <span className="flex items-center gap-1.5">
            <i
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: STATUS_FILL.GROWING, display: 'inline-block' }}
            />{' '}
            Đang canh tác
          </span>
          <span className="flex items-center gap-1.5">
            <i
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: STATUS_FILL.FALLOW, display: 'inline-block' }}
            />{' '}
            Đất trống
          </span>
          <span className="flex items-center gap-1.5">
            <i
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: STATUS_FILL.ALERT, display: 'inline-block' }}
            />{' '}
            Có cảnh báo
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default MapView;
