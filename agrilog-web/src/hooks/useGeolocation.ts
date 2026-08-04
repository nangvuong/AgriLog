import { useState, useCallback } from 'react';
import { PlotData } from '@/components/domain';
import { polygonCentroid, parsePolygon } from '@/utils/geoUtils';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type GeoStatus = 'idle' | 'locating' | 'success' | 'error';

export interface NearestPlotResult {
  plot: PlotData;
  distance: number; // metres (haversine estimate)
}

interface UseGeolocationReturn {
  status: GeoStatus;
  position: GeoPosition | null;
  error: string | null;
  nearestPlot: NearestPlotResult | null;
  locate: (plots: PlotData[]) => Promise<GeoPosition | null>;
}

/**
 * Tính khoảng cách Haversine (mét) giữa 2 toạ độ GPS
 */
export function haversineMetres(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6_371_000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Lấy tọa độ GPS từ PlotData:
 * 1. Ưu tiên centroid của polygon geometry (PostGIS)
 * 2. Fallback về trường latitude/longitude trực tiếp
 */
function getPlotLatLon(
  plot: PlotData,
): { lat: number; lon: number } | null {
  // Ưu tiên 1: centroid từ polygon GeoJSON
  const geom = parsePolygon((plot as any).polygon);
  if (geom) {
    const c = polygonCentroid(geom);
    if (c) return { lat: c[0], lon: c[1] };
  }

  // Ưu tiên 2: lat/lon trực tiếp
  const p = plot as any;
  const lat = parseFloat(p.latitude ?? p.lat ?? '');
  const lon = parseFloat(p.longitude ?? p.lon ?? '');
  if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
  return null;
}


export function useGeolocation(): UseGeolocationReturn {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nearestPlot, setNearestPlot] = useState<NearestPlotResult | null>(null);

  const locate = useCallback(async (plots: PlotData[]): Promise<GeoPosition | null> => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị GPS');
      setStatus('error');
      return null;
    }

    setStatus('locating');
    setError(null);
    setNearestPlot(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geoPos: GeoPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setPosition(geoPos);
          setStatus('success');

          // Tìm lô gần nhất nếu plots có tọa độ
          const plotsWithCoords = plots
            .map((p) => ({ plot: p, coords: getPlotLatLon(p) }))
            .filter((x) => x.coords !== null) as {
              plot: PlotData;
              coords: { lat: number; lon: number };
            }[];

          if (plotsWithCoords.length > 0) {
            let nearest = plotsWithCoords[0];
            let minDist = haversineMetres(
              geoPos.latitude, geoPos.longitude,
              nearest.coords.lat, nearest.coords.lon,
            );

            for (const item of plotsWithCoords.slice(1)) {
              const d = haversineMetres(
                geoPos.latitude, geoPos.longitude,
                item.coords.lat, item.coords.lon,
              );
              if (d < minDist) {
                minDist = d;
                nearest = item;
              }
            }

            setNearestPlot({ plot: nearest.plot, distance: minDist });
          } else {
            // Không có tọa độ plots → tự động chọn lô GROWING đầu tiên
            const growingPlot = plots.find((p) => p.status === 'GROWING') || plots[0];
            if (growingPlot) {
              setNearestPlot({ plot: growingPlot, distance: -1 });
            }
          }

          resolve(geoPos);
        },
        (err) => {
          const messages: Record<number, string> = {
            1: 'Quyền định vị bị từ chối. Vui lòng cho phép truy cập vị trí.',
            2: 'Không xác định được vị trí. Hãy thử lại.',
            3: 'Hết thời gian chờ định vị. Hãy thử lại.',
          };
          setError(messages[err.code] || 'Lỗi định vị không xác định.');
          setStatus('error');
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 30_000,
        },
      );
    });
  }, []);

  return { status, position, error, nearestPlot, locate };
}
