/**
 * Geo utilities cho AgriLog
 * Xử lý dữ liệu geometry PostGIS (GeoJSON Polygon SRID 4326)
 *
 * GeoJSON Polygon coordinate format:
 *   coordinates[0] = exterior ring = [[lon, lat], [lon, lat], ...]
 *   NOTE: GeoJSON dùng [longitude, latitude] (ngược với Leaflet [lat, lon])
 */

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

/** Leaflet sử dụng [lat, lon] — ngược với GeoJSON [lon, lat] */
export type LatLon = [number, number];

/**
 * Chuyển GeoJSON Polygon exterior ring → mảng [lat, lon] cho Leaflet
 */
export function polygonToLeafletPositions(polygon: GeoJsonPolygon): LatLon[] {
  const exterior = polygon.coordinates[0]; // exterior ring
  if (!exterior || exterior.length === 0) return [];
  return exterior.map(([lon, lat]) => [lat, lon] as LatLon);
}

/**
 * Tính centroid (trọng tâm) của exterior ring GeoJSON Polygon
 * Trả về [lat, lon] (Leaflet format)
 */
export function polygonCentroid(polygon: GeoJsonPolygon): LatLon | null {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 3) return null;

  // Bỏ điểm cuối nếu trùng điểm đầu (GeoJSON closed ring)
  const pts =
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring;

  let area = 0;
  let cx = 0;
  let cy = 0;
  const n = pts.length;

  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % n];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }

  area = area / 2;
  if (Math.abs(area) < 1e-10) {
    // Fallback: trung bình đơn giản
    const avgLon = pts.reduce((s, p) => s + p[0], 0) / n;
    const avgLat = pts.reduce((s, p) => s + p[1], 0) / n;
    return [avgLat, avgLon];
  }

  cx = cx / (6 * area);
  cy = cy / (6 * area);

  // cx = lon, cy = lat → trả về [lat, lon] cho Leaflet
  return [cy, cx];
}

/**
 * Parse giá trị polygon từ API response.
 * Backend có thể trả về:
 * - GeoJSON object: { type: 'Polygon', coordinates: [...] }
 * - WKT string: "POLYGON((lon lat, ...))"  (PostGIS ST_AsText)
 * - null / undefined
 */
export function parsePolygon(raw: any): GeoJsonPolygon | null {
  if (!raw) return null;

  // Đã là GeoJSON object
  if (typeof raw === 'object' && raw.type === 'Polygon' && Array.isArray(raw.coordinates)) {
    return raw as GeoJsonPolygon;
  }

  // GeoJSON dạng string
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.type === 'Polygon' && Array.isArray(parsed.coordinates)) {
        return parsed as GeoJsonPolygon;
      }
    } catch {
      // không phải JSON → có thể là WKT, bỏ qua
    }
  }

  return null;
}

/**
 * Tính bounding box của polygon → { minLat, maxLat, minLon, maxLon }
 */
export function polygonBounds(polygon: GeoJsonPolygon) {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length === 0) return null;
  let minLon = ring[0][0], maxLon = ring[0][0];
  let minLat = ring[0][1], maxLat = ring[0][1];
  for (const [lon, lat] of ring) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return { minLat, maxLat, minLon, maxLon };
}
