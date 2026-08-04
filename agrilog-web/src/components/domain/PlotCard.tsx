import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, ChevronRight, Navigation, ExternalLink, Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GeoJsonPolygon, polygonCentroid, parsePolygon } from '@/utils/geoUtils';

export interface PlotData {
  code: string;
  name: string;
  area: number;
  soil_type: string;
  status: 'GROWING' | 'FALLOW' | string;
  crop?: string;
  variety?: string;
  planting_date?: string | null;
  expected_harvest_date?: string | null;
  progress?: number;
  mapStatus?: 'GROWING' | 'FALLOW' | 'ALERT' | string;
  /** SVG sơ đồ fallback */
  points?: string;
  labelX?: number;
  labelY?: number;
  /** Geometry PostGIS — GeoJSON Polygon SRID 4326 */
  polygon?: GeoJsonPolygon | null;
  /** Tọa độ GPS trực tiếp (fallback nếu không có polygon) */
  latitude?: number | string;
  longitude?: number | string;
  lat?: number | string;
  lon?: number | string;
}


export interface PlotCardProps {
  plot: PlotData;
  onOpen?: () => void;
}

// Màu icon marker theo trạng thái
function createMiniIcon(status: string) {
  const colors: Record<string, string> = {
    GROWING: '#1C2B1E',
    FALLOW: '#8B8368',
    ALERT: '#C15A34',
  };
  const bg = colors[status] || colors.FALLOW;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <circle cx="11" cy="11" r="9" fill="${bg}" stroke="#fff" stroke-width="2"/>
    <circle cx="11" cy="11" r="4" fill="#C9A227"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function getPlotCoords(plot: PlotData): [number, number] | null {
  // Ưu tiên 1: tính centroid từ polygon GeoJSON
  const geom = parsePolygon(plot.polygon);
  if (geom) {
    const c = polygonCentroid(geom);
    if (c) return c;
  }

  // Ưu tiên 2: lat/lon trực tiếp
  const lat = parseFloat(String(plot.latitude ?? plot.lat ?? ''));
  const lon = parseFloat(String(plot.longitude ?? plot.lon ?? ''));
  if (!isNaN(lat) && !isNaN(lon)) return [lat, lon];

  return null;
}


function getGoogleMapsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps?q=${lat},${lon}&z=17`;
}

// Mini-map Leaflet nhúng trong PlotCard
function MiniMap({ coords, status }: { coords: [number, number]; status: string }) {
  return (
    <MapContainer
      center={coords}
      zoom={16}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <Marker position={coords} icon={createMiniIcon(status)} />
    </MapContainer>
  );
}

export function PlotCard({ plot, onOpen }: PlotCardProps) {
  const isGrowing = plot.status === 'GROWING';
  const coords = getPlotCoords(plot);
  const status = plot.mapStatus || plot.status || 'FALLOW';

  return (
    <Card className="overflow-hidden shadow-sm transition hover:border-[#C9A227]/60">
      {/* Thumbnail: mini-map Leaflet hoặc placeholder */}
      <div className="relative h-28 overflow-hidden bg-[#ECEEDA]">
        {coords ? (
          /* Mini Leaflet map */
          <div className="pointer-events-none h-full w-full">
            <MiniMap coords={coords} status={status} />
          </div>
        ) : (
          /* Placeholder SVG đẹp */
          <div className="flex h-full flex-col items-center justify-center gap-1.5">
            <Map className="h-7 w-7 text-[#1C2B1E]/25" strokeWidth={1.5} />
            <span className="text-[10.5px] text-[#8B9070]">Chưa có tọa độ GPS</span>
          </div>
        )}

        {/* Overlay gradient nhẹ */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />

        {/* Badge trạng thái */}
        <div className="absolute top-2 left-2 z-10">
          <span
            className={
              'rounded-full px-2 py-0.5 text-[10.5px] font-medium shadow-sm ' +
              (isGrowing ? 'bg-[#3F6B2C]/90 text-white' : 'bg-white/85 text-[#8B8368]')
            }
          >
            {isGrowing ? '🌱 Đang canh tác' : '⬜ Đất trống'}
          </span>
        </div>

        {/* Nút điều hướng Google Maps (chỉ khi có tọa độ) */}
        {coords && (
          <a
            href={getGoogleMapsUrl(coords[0], coords[1])}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Xem trên Google Maps"
            className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-[#1C2B1E] shadow-sm hover:bg-white transition backdrop-blur-sm"
          >
            <Navigation className="h-3.5 w-3.5" strokeWidth={2} />
          </a>
        )}
      </div>

      <CardContent className="p-4">
        <p
          className="text-[13.5px] font-medium text-[#20281B]"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {plot.code} · {plot.name}
        </p>
        <p className="mt-0.5 text-[12px] text-[#8B9070]">
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

        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpen}
            className="flex-1 justify-center text-[12.5px]"
          >
            Xem mùa vụ
            <ChevronRight className="ml-1 h-3.5 w-3.5" strokeWidth={1.75} />
          </Button>
          {coords && (
            <a
              href={getGoogleMapsUrl(coords[0], coords[1])}
              target="_blank"
              rel="noopener noreferrer"
              title="Mở Google Maps"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E1E5CB] bg-[#FFFDF6] text-[#8B9070] transition hover:border-[#C9A227] hover:bg-[#F7F2DF] hover:text-[#1C2B1E]"
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PlotCard;
