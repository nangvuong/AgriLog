import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Tooltip,
  Popup,
  useMap,
  FeatureGroup,
} from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { PlotData } from './PlotCard';
import {
  polygonCentroid,
  polygonToLeafletPositions,
  polygonBounds,
  parsePolygon,
  type LatLon,
} from '@/utils/geoUtils';
import {
  MapPin,
  Layers,
  Navigation,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

// ---------- Màu sắc theo trạng thái lô ----------
const STATUS_META: Record<string, {
  fillColor: string;
  color: string;
  dot: string;
  badge: string;
  bg: string;
  text: string;
}> = {
  GROWING: {
    fillColor: '#C4D9A8',
    color: '#6B8F4E',
    dot: 'bg-[#6B8F4E]',
    badge: 'Đang canh tác',
    bg: 'bg-[#ECEEDA]',
    text: 'text-[#3F6B2C]',
  },
  FALLOW: {
    fillColor: '#E7E2CC',
    color: '#B3AB92',
    dot: 'bg-[#B3AB92]',
    badge: 'Đất trống',
    bg: 'bg-[#EFEBDD]',
    text: 'text-[#8B8368]',
  },
  ALERT: {
    fillColor: '#F0C9A9',
    color: '#C9793E',
    dot: 'bg-[#C9793E]',
    badge: 'Có cảnh báo',
    bg: 'bg-[#F6E2DC]',
    text: 'text-[#9C4B2E]',
  },
};

// ---------- SVG Fallback (không có polygon data) ----------
const SVG_FILL: Record<string, string> = {
  GROWING: '#C4D9A8', FALLOW: '#E7E2CC', ALERT: '#F0C9A9',
};
const SVG_STROKE: Record<string, string> = {
  GROWING: '#6B8F4E', FALLOW: '#B3AB92', ALERT: '#C9793E',
};

function SvgFallback({ plots, onSelect, selectedCode }: {
  plots: PlotData[];
  onSelect?: (code: string) => void;
  selectedCode: string | null;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <svg viewBox="0 0 320 220" className="w-full rounded-xl" style={{ background: '#F7F2DF' }}>
      {plots.map((p) => {
        const status = p.mapStatus || p.status || 'FALLOW';
        const isSelected = selectedCode === p.code;
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
              fill={SVG_FILL[status] || '#E7E2CC'}
              stroke={isSelected ? '#C9A227' : hovered === p.code ? '#1C2B1E' : SVG_STROKE[status] || '#B3AB92'}
              strokeWidth={isSelected ? 2.5 : hovered === p.code ? 2 : 1.2}
              opacity={hovered && hovered !== p.code && !isSelected ? 0.6 : 1}
              className="transition-all duration-150"
            />
            <text
              x={p.labelX || 60} y={p.labelY || 60}
              textAnchor="middle" fontSize="11"
              fontWeight={isSelected ? '700' : '400'}
              fill="#20281B"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {p.code}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Sub-component: FitBounds ----------
function MapFitter({ positions }: { positions: LatLon[][] }) {
  const map = useMap();
  useEffect(() => {
    const allPoints = positions.flat();
    if (allPoints.length === 0) return;
    const bounds = L.latLngBounds(allPoints);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 18 });
    }
  }, [JSON.stringify(positions)]);
  return null;
}

// ---------- Lấy centroid làm tọa độ chỉ đường ----------
function getGoogleMapsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps?q=${lat},${lon}&z=17`;
}

export interface MapViewProps {
  plots: PlotData[];
  onSelect?: (code: string) => void;
  centerLat?: number;
  centerLon?: number;
  zoom?: number;
  height?: number;
}

export function MapView({
  plots,
  onSelect,
  centerLat = 10.3667,
  centerLon = 105.3833,
  zoom = 14,
  height = 360,
}: MapViewProps) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  // Resolve polygon data cho từng plot
  const plotGeoData = plots.map((p) => {
    const geom = parsePolygon(p.polygon);
    const positions = geom ? polygonToLeafletPositions(geom) : null;
    const centroid = geom ? polygonCentroid(geom) : null;
    return { plot: p, positions, centroid };
  });

  // Plots có polygon data hợp lệ
  const plotsWithPolygon = plotGeoData.filter(
    (x) => x.positions && x.positions.length >= 3,
  );
  const hasPolygonData = plotsWithPolygon.length > 0;

  // Tọa độ trung tâm bản đồ
  const allCentroids = plotsWithPolygon
    .map((x) => x.centroid)
    .filter(Boolean) as LatLon[];
  const mapCenter: LatLon = allCentroids.length > 0
    ? [
        allCentroids.reduce((s, c) => s + c[0], 0) / allCentroids.length,
        allCentroids.reduce((s, c) => s + c[1], 0) / allCentroids.length,
      ]
    : [centerLat, centerLon];

  const selectedPlot = plots.find((p) => p.code === selectedCode);

  function handleSelect(code: string) {
    setSelectedCode((prev) => (prev === code ? null : code));
    onSelect?.(code);
  }

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* ===== Bản đồ ===== */}
        <div style={{ height }} className="relative w-full">
          {hasPolygonData ? (
            <MapContainer
              center={mapCenter}
              zoom={zoom}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
              scrollWheelZoom={true}
              attributionControl={true}
            >
              {/* OpenStreetMap tile */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              {/* Fit bounds theo tất cả polygon */}
              <MapFitter positions={plotsWithPolygon.map((x) => x.positions!)} />

              {/* Render từng polygon lô */}
              {plotGeoData.map(({ plot, positions, centroid }) => {
                if (!positions || positions.length < 3) return null;
                const status = plot.mapStatus || plot.status || 'FALLOW';
                const meta = STATUS_META[status] || STATUS_META.FALLOW;
                const isSelected = selectedCode === plot.code;
                const isHovered = hoveredCode === plot.code;

                return (
                  <Polygon
                    key={plot.code}
                    positions={positions}
                    pathOptions={{
                      fillColor: meta.fillColor,
                      fillOpacity: isSelected ? 0.85 : isHovered ? 0.75 : 0.55,
                      color: isSelected ? '#C9A227' : isHovered ? '#1C2B1E' : meta.color,
                      weight: isSelected ? 3 : isHovered ? 2.5 : 1.5,
                    }}
                    eventHandlers={{
                      click: () => handleSelect(plot.code),
                      mouseover: () => setHoveredCode(plot.code),
                      mouseout: () => setHoveredCode(null),
                    }}
                  >
                    {/* Tooltip tên lô (hiện khi hover) */}
                    <Tooltip
                      permanent={false}
                      sticky={false}
                      direction="center"
                      className="leaflet-agrilog-tooltip"
                    >
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#20281B',
                        }}
                      >
                        {plot.code}
                        {plot.name ? ` · ${plot.name}` : ''}
                      </span>
                    </Tooltip>

                    {/* Popup chi tiết khi click */}
                    <Popup minWidth={220} maxWidth={280} closeButton={false}>
                      <div
                        className="p-3"
                        style={{ fontFamily: "'Lora', serif", color: '#20281B' }}
                      >
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <p className="text-[13px] font-semibold">
                            {plot.code} · {plot.name}
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${meta.bg} ${meta.text}`}
                          >
                            {meta.badge}
                          </span>
                        </div>
                        {plot.crop && (
                          <p className="text-[12px] text-[#7C7A4E]">
                            {plot.crop}{plot.variety ? ` — ${plot.variety}` : ''}
                          </p>
                        )}
                        <p className="mt-0.5 text-[11.5px] text-[#8B9070]">
                          {plot.area} ha · {plot.soil_type}
                        </p>
                        {plot.status === 'GROWING' && plot.progress !== undefined && (
                          <div className="mt-2">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ECEEDA]">
                              <div
                                className="h-full rounded-full bg-[#C9A227]"
                                style={{ width: `${plot.progress}%` }}
                              />
                            </div>
                            <p className="mt-0.5 text-right text-[10.5px] text-[#7C7A4E]">
                              {plot.progress}% tiến độ
                            </p>
                          </div>
                        )}
                        {centroid && (
                          <a
                            href={getGoogleMapsUrl(centroid[0], centroid[1])}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2.5 flex items-center justify-center gap-1 rounded-lg border border-[#DCE0C4] bg-[#FFFDF6] px-3 py-1.5 text-[11.5px] font-medium text-[#1C2B1E] hover:bg-[#F7F2DF] transition"
                          >
                            <Navigation className="h-3.5 w-3.5 text-[#C9A227]" />
                            Chỉ đường Google Maps
                            <ExternalLink className="h-3 w-3 text-[#8B9070]" />
                          </a>
                        )}
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}
            </MapContainer>
          ) : (
            /* SVG Fallback */
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11.5px] text-blue-700">
                <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                <span>
                  Các thửa đất chưa có dữ liệu geometry (polygon).
                  Hiển thị sơ đồ SVG. Thêm polygon vào dữ liệu lô để kích hoạt Leaflet.
                </span>
              </div>
              <SvgFallback
                plots={plots}
                onSelect={handleSelect}
                selectedCode={selectedCode}
              />
            </div>
          )}

          {/* Badge số lô overlay */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 rounded-full border border-[#DCE0C4] bg-white/90 px-2.5 py-1 text-[11.5px] font-medium text-[#1C2B1E] shadow-sm backdrop-blur-sm">
              <Layers className="h-3.5 w-3.5 text-[#C9A227]" strokeWidth={2} />
              {plots.filter((p) => p.status === 'GROWING').length}/{plots.length} lô đang canh tác
            </div>
          </div>
        </div>

        {/* ===== Chú giải + danh sách lô ===== */}
        <div className="border-t border-[#EEF0E1] p-4">
          {/* Chú giải */}
          <div className="mb-3 flex flex-wrap items-center gap-3 text-[11.5px] text-[#7C7A4E]">
            {Object.entries(STATUS_META).map(([status, meta]) => (
              <span key={status} className="flex items-center gap-1.5">
                <span
                  className="h-3 w-5 rounded-sm border"
                  style={{ background: meta.fillColor, borderColor: meta.color }}
                />
                {meta.badge}
              </span>
            ))}
            {hasPolygonData && (
              <span className="ml-auto text-[10.5px] text-[#A8AC86]">
                Powered by Leaflet + OpenStreetMap
              </span>
            )}
          </div>

          {/* Danh sách lô */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {plotGeoData.map(({ plot, centroid }) => {
              const status = (plot.mapStatus || plot.status || 'FALLOW') as string;
              const meta = STATUS_META[status] || STATUS_META.FALLOW;
              const isSelected = selectedCode === plot.code;

              return (
                <button
                  key={plot.code}
                  type="button"
                  onClick={() => handleSelect(plot.code)}
                  className={
                    'group flex w-full items-start gap-2.5 rounded-xl border p-3 text-left transition ' +
                    (isSelected
                      ? 'border-[#C9A227] bg-[#FFFBE8] shadow-sm'
                      : 'border-[#E1E5CB] bg-[#FFFDF6] hover:border-[#C9A227]/60 hover:bg-[#FFFBE8]/50')
                  }
                >
                  <span
                    className="mt-1 h-3 w-5 shrink-0 rounded-sm border"
                    style={{ background: meta.fillColor, borderColor: meta.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-[12.5px] font-medium text-[#20281B]"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      {plot.code} · {plot.name}
                    </p>
                    <p className="truncate text-[11px] text-[#8B9070]">
                      {plot.area} ha · {plot.soil_type}
                      {plot.crop ? ` · ${plot.crop}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.bg} ${meta.text}`}>
                      {meta.badge}
                    </span>
                    {centroid && (
                      <a
                        href={getGoogleMapsUrl(centroid[0], centroid[1])}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Chỉ đường Google Maps"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[#8B9070] hover:bg-[#ECEEDA] hover:text-[#1C2B1E] transition"
                      >
                        <Navigation className="h-3.5 w-3.5" strokeWidth={2} />
                      </a>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chi tiết lô đang chọn */}
          {selectedPlot && (() => {
            const geom = parsePolygon(selectedPlot.polygon);
            const centroid = geom ? polygonCentroid(geom) : null;
            const status = selectedPlot.mapStatus || selectedPlot.status || 'FALLOW';
            const meta = STATUS_META[status] || STATUS_META.FALLOW;
            return (
              <div className="mt-3 rounded-xl border border-[#C9A227]/40 bg-[#FFFBE8] p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className="text-[13px] font-semibold text-[#20281B]"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      {selectedPlot.code} · {selectedPlot.name}
                    </p>
                    {selectedPlot.crop && (
                      <p className="text-[12px] text-[#7C7A4E]">
                        {selectedPlot.crop}
                        {selectedPlot.variety ? ` — ${selectedPlot.variety}` : ''}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11.5px] text-[#8B9070]">
                      {selectedPlot.area} ha · {selectedPlot.soil_type}
                    </p>
                  </div>
                  {selectedPlot.status === 'GROWING' && selectedPlot.progress !== undefined && (
                    <div className="shrink-0 text-right">
                      <p
                        className="text-[15px] font-bold text-[#C9A227]"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {selectedPlot.progress}%
                      </p>
                      <p className="text-[10.5px] text-[#8B9070]">tiến độ</p>
                    </div>
                  )}
                </div>
                {selectedPlot.status === 'GROWING' && selectedPlot.progress !== undefined && (
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#ECEEDA]">
                    <div
                      className="h-full rounded-full bg-[#C9A227] transition-all duration-500"
                      style={{ width: `${selectedPlot.progress}%` }}
                    />
                  </div>
                )}
                {centroid && (
                  <a
                    href={getGoogleMapsUrl(centroid[0], centroid[1])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#C9A227]/40 bg-white/70 px-3 py-2 text-[12px] font-medium text-[#1C2B1E] hover:bg-white transition"
                  >
                    <Navigation className="h-4 w-4 text-[#C9A227]" strokeWidth={2} />
                    Chỉ đường đến {selectedPlot.code} · {selectedPlot.name}
                    <ExternalLink className="h-3 w-3 text-[#8B9070]" />
                  </a>
                )}
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}

export default MapView;
