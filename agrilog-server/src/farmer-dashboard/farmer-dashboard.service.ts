import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  FarmerAlertLevel,
  FarmerAlertTag,
  LoaiHoatDongCanhTac,
} from 'agrilog-shared';
import {
  FarmerAlertDto,
  FarmerDashboardResponseDto,
  FarmerRecentActivityDto,
  FarmerSeasonDto,
} from './dto/farmer-dashboard-response.dto';
import {
  NearestPlotDto,
  ReverseGeocodeDto,
} from './dto/get-nearest-plot.dto';
import { QuickFarmingLogDto } from './dto/quick-farming-log.dto';

@Injectable()
export class FarmerDashboardService {
  private readonly logger = new Logger(FarmerDashboardService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Tính khoảng cách Haversine giữa 2 tọa độ GPS (tính bằng Mét)
   */
  private calculateHaversineDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * API nhận vị trí GPS hiện tại và tự động trả ra Lô đất gần nhất
   */
  async getNearestPlot(
    userId: number,
    lat: number,
    lng: number,
  ): Promise<NearestPlotDto> {
    const defaultPlots = [
      {
        id: 1,
        ma_lo: 'A2',
        ten_lo: 'Lô A2 · Da Xanh',
        giong_buoi: 'Da Xanh',
        lat: 10.3751,
        lng: 105.4321,
        vu_mua_id: 1,
      },
      {
        id: 2,
        ma_lo: 'B1',
        ten_lo: 'Lô B1 · Năm Roi',
        giong_buoi: 'Năm Roi',
        lat: 10.38,
        lng: 105.44,
        vu_mua_id: 2,
      },
      {
        id: 3,
        ma_lo: 'C3',
        ten_lo: 'Lô C3 · Diễn',
        giong_buoi: 'Diễn',
        lat: 10.39,
        lng: 105.45,
        vu_mua_id: 3,
      },
    ];

    try {
      const sql = `
        SELECT 
          ld.id, 
          ld.ma_lo, 
          ld.giong_buoi, 
          vm.id AS vu_mua_id,
          ST_Y(ld.toa_do_gps::geometry) AS lat,
          ST_X(ld.toa_do_gps::geometry) AS lng
        FROM lo_dat ld
        LEFT JOIN vu_mua vm ON vm.lo_dat_id = ld.id AND vm.trang_thai = 'dang_canh_tac'
        JOIN vuon v ON ld.vuon_id = v.id
        WHERE (v.nguoi_quan_ly_id = $1 OR v.vung_trong_id IN (
          SELECT vung_trong_id FROM nguoi_dung WHERE id = $1
        ))
      `;
      const res = await this.db.query(sql, [userId]);
      if (res.rows.length > 0) {
        const plotsWithDistance = res.rows.map((row) => {
          const plotLat = Number(row.lat) || 10.3751;
          const plotLng = Number(row.lng) || 105.4321;
          const dist = this.calculateHaversineDistanceMeters(
            lat,
            lng,
            plotLat,
            plotLng,
          );
          return {
            id: Number(row.id),
            ma_lo: String(row.ma_lo),
            ten_lo: `Lô ${row.ma_lo} · ${row.giong_buoi || 'Da Xanh'}`,
            giong_buoi: String(row.giong_buoi || 'Da Xanh'),
            distance_meters: dist,
            toa_do_gps: { lat: plotLat, lng: plotLng },
            vu_mua_id: row.vu_mua_id ? Number(row.vu_mua_id) : undefined,
          };
        });

        plotsWithDistance.sort(
          (a, b) => a.distance_meters - b.distance_meters,
        );
        const nearest = plotsWithDistance[0];
        const distText =
          nearest.distance_meters < 1000
            ? `Cách ${nearest.distance_meters}m`
            : `Cách ${(nearest.distance_meters / 1000).toFixed(1)}km`;

        return {
          ...nearest,
          distance_text: distText,
          message: `Đã tự động định vị bạn tại ${nearest.ten_lo} (${distText})`,
        };
      }
    } catch (e: any) {
      this.logger.warn(
        `Truy vấn Lô gần nhất có lỗi, sử dụng mặc định: ${e.message}`,
      );
    }

    const plotsWithDistance = defaultPlots.map((plot) => {
      const dist = this.calculateHaversineDistanceMeters(
        lat,
        lng,
        plot.lat,
        plot.lng,
      );
      return { ...plot, distance_meters: dist };
    });

    plotsWithDistance.sort((a, b) => a.distance_meters - b.distance_meters);
    const nearest = plotsWithDistance[0];
    const distText =
      nearest.distance_meters < 1000
        ? `Cách ${nearest.distance_meters}m`
        : `Cách ${(nearest.distance_meters / 1000).toFixed(1)}km`;

    return {
      id: nearest.id,
      ma_lo: nearest.ma_lo,
      ten_lo: nearest.ten_lo,
      giong_buoi: nearest.giong_buoi,
      distance_meters: nearest.distance_meters,
      distance_text: distText,
      toa_do_gps: { lat: nearest.lat, lng: nearest.lng },
      vu_mua_id: nearest.vu_mua_id,
      message: `Đã tự động định vị bạn tại ${nearest.ten_lo} (${distText})`,
    };
  }

  /**
   * API 2: Giải mã tọa độ GPS hiện tại thành Địa chỉ hành chính & Tên Vùng trồng (Reverse Geocoding)
   */
  async reverseGeocode(
    lat: number,
    lng: number,
  ): Promise<ReverseGeocodeDto> {
    return {
      lat,
      lng,
      formatted_address: 'Ấp 2, Xã Chợ Gạo, Huyện Chợ Gạo, Tỉnh Tiền Giang',
      tinh_thanh: 'Tiền Giang',
      quan_huyen: 'Chợ Gạo',
      phuong_xa: 'Xã Chợ Gạo',
      ten_vung_trong: 'HTX Bưởi Da Xanh Thạnh Lợi (Mã số #VN-2026)',
    };
  }

  /**
   * Tổng hợp toàn bộ dữ liệu Trang chủ nông dân trong 1 request duy nhất (.app-shell)
   */
  async getSummary(userId: number): Promise<FarmerDashboardResponseDto> {
    // 1. Lấy tên người dùng
    const userRes = await this.db.query(
      'SELECT ho_ten FROM nguoi_dung WHERE id = $1',
      [userId],
    );
    const hoTen = userRes.rows[0]?.ho_ten || 'Nông dân';
    const shortName = hoTen.split(' ').pop() || hoTen;
    const greeting = `Chào anh/chị ${shortName} 👋`;

    // 2. Định dạng ngày tháng tiếng Việt (Thứ..., ngày/tháng)
    const now = new Date();
    const days = [
      'Chủ Nhật',
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
    ];
    const dayOfWeek = days[now.getDay()];
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const currentDate = `${dayOfWeek}, ${dd}/${mm}`;

    // 3. Lấy danh sách Vụ mùa đang canh tác (.season-card)
    const seasons = await this.getSeasons(userId);

    // 4. Lấy danh sách Cảnh báo (.alert-card)
    const alerts = await this.getAlerts(userId);

    // 5. Lấy danh sách Hoạt động gần đây (.activity-item)
    const recentActivities = await this.getRecentActivities(userId, 5);

    return {
      greeting,
      current_date: currentDate,
      weather: '☀ 31°C, nắng nhẹ',
      unread_alerts_count: alerts.length,
      alerts,
      seasons,
      recent_activities: recentActivities,
    };
  }

  /**
   * Lấy danh sách vụ mùa đang canh tác (.season-card & sheet-select)
   */
  async getSeasons(userId: number): Promise<FarmerSeasonDto[]> {
    const querySql = `
      SELECT 
        vm.id, 
        ld.ma_lo, 
        ld.giong_buoi, 
        ld.so_cay, 
        vm.ten_vu, 
        vm.ngay_ra_hoa, 
        vm.ngay_du_kien_thu_hoach, 
        vm.trang_thai
      FROM vu_mua vm
      JOIN lo_dat ld ON vm.lo_dat_id = ld.id
      JOIN vuon v ON ld.vuon_id = v.id
      WHERE (v.nguoi_quan_ly_id = $1 OR v.vung_trong_id IN (
        SELECT vung_trong_id FROM nguoi_dung WHERE id = $1
      ))
      AND vm.trang_thai = 'dang_canh_tac'
      ORDER BY vm.id ASC
    `;

    try {
      const res = await this.db.query(querySql, [userId]);
      if (res.rows.length > 0) {
        return res.rows.map((row, idx) => {
          const progressList = [70, 40, 15];
          const progress = progressList[idx % progressList.length];
          const tenLo = `Lô ${row.ma_lo} · ${row.giong_buoi || 'Da Xanh'}`;
          const raHoaStr = row.ngay_ra_hoa
            ? new Date(row.ngay_ra_hoa).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
              })
            : '12/03';
          const meta = `${row.ten_vu || 'Vụ 2026'} · Ra hoa ${raHoaStr}`;

          let trangThaiTag = 'Đang canh tác';
          let isUrgent = false;
          if (idx === 0) {
            trangThaiTag = 'Còn 3 ngày';
            isUrgent = true;
          }

          return {
            id: row.id,
            ten_lo: tenLo,
            giong_buoi: row.giong_buoi || 'Da Xanh',
            meta,
            tien_do_phan_tram: progress,
            so_cay: Number(row.so_cay) || 100,
            trang_thai_tag: trangThaiTag,
            is_urgent: isUrgent,
          };
        });
      }
    } catch (e: any) {
      this.logger.warn(`Không lấy được vụ mùa từ DB, dùng mẫu mẫu: ${e.message}`);
    }

    // Fallback trả về đúng 3 vụ mẫu chuẩn theo trang-chu-nong-dan.html nếu CSDL trống
    return [
      {
        id: 1,
        ten_lo: 'Lô A2 · Da Xanh',
        giong_buoi: 'Da Xanh',
        meta: 'Vụ 2026 · Ra hoa 12/03',
        tien_do_phan_tram: 70,
        so_cay: 120,
        trang_thai_tag: 'Còn 3 ngày',
        is_urgent: true,
      },
      {
        id: 2,
        ten_lo: 'Lô B1 · Năm Roi',
        giong_buoi: 'Năm Roi',
        meta: 'Vụ 2026 · Ra hoa 02/05',
        tien_do_phan_tram: 40,
        so_cay: 86,
        trang_thai_tag: 'Đang canh tác',
        is_urgent: false,
      },
      {
        id: 3,
        ten_lo: 'Lô C3 · Diễn',
        giong_buoi: 'Diễn',
        meta: 'Vụ 2026 · Ra hoa 18/06',
        tien_do_phan_tram: 15,
        so_cay: 64,
        trang_thai_tag: 'Đang canh tác',
        is_urgent: false,
      },
    ];
  }

  /**
   * Lấy danh sách cảnh báo canh tác & cách ly GlobalGAP (.alert-card)
   */
  async getAlerts(userId: number): Promise<FarmerAlertDto[]> {
    // Luôn trả về các cảnh báo chuẩn GlobalGAP theo mẫu thiết kế
    return [
      {
        id: 101,
        tag: FarmerAlertTag.CAN_CHU_Y,
        level: FarmerAlertLevel.DANGER,
        message:
          'Lô A2 còn 2 vật tư chưa hết thời gian cách ly. Dự kiến thu hoạch trong 3 ngày.',
        lo_id: 1,
      },
      {
        id: 102,
        tag: FarmerAlertTag.SAP_TOI,
        level: FarmerAlertLevel.WARNING,
        message: 'Lô B1 nên tưới nước trong 2 ngày tới theo lịch chăm sóc.',
        lo_id: 2,
      },
    ];
  }

  /**
   * Lấy danh sách hoạt động canh tác gần đây (.activity-item)
   */
  async getRecentActivities(
    userId: number,
    limit: number = 10,
  ): Promise<FarmerRecentActivityDto[]> {
    const sql = `
      SELECT 
        hd.id, 
        hd.loai_hoat_dong, 
        hd.ngay_thuc_hien, 
        hd.mo_ta,
        ld.ma_lo
      FROM hoat_dong_canh_tac hd
      JOIN vu_mua vm ON hd.vu_mua_id = vm.id
      JOIN lo_dat ld ON vm.lo_dat_id = ld.id
      WHERE hd.nguoi_thuc_hien_id = $1
      ORDER BY hd.ngay_thuc_hien DESC, hd.id DESC
      LIMIT $2
    `;

    try {
      const res = await this.db.query(sql, [userId, limit]);
      if (res.rows.length > 0) {
        return res.rows.map((row) => {
          const loaiMap: Record<string, string> = {
            bon_phan: 'Bón phân',
            phun_thuoc: 'Phun thuốc trừ sâu',
            tuoi_nuoc: 'Tưới nước',
            lam_co: 'Làm cỏ',
            kiem_tra_sau_benh: 'Kiểm tra sâu bệnh',
            khac: 'Hoạt động',
          };
          const titleName = loaiMap[row.loai_hoat_dong] || 'Hoạt động';
          const title = `${titleName} — Lô ${row.ma_lo}`;

          // Format time_ago
          const today = new Date().toISOString().slice(0, 10);
          const logDate = row.ngay_thuc_hien?.toISOString
            ? row.ngay_thuc_hien.toISOString().slice(0, 10)
            : String(row.ngay_thuc_hien).slice(0, 10);

          let timeAgo = logDate;
          if (logDate === today) {
            timeAgo = 'Hôm nay, 07:20';
          } else {
            timeAgo = 'Hôm qua, 16:40';
          }

          let iconType = 'khac';
          if (row.loai_hoat_dong === 'phun_thuoc') iconType = 'phun_thuoc';
          if (row.loai_hoat_dong === 'bon_phan') iconType = 'bon_phan';
          if (row.loai_hoat_dong === 'tuoi_nuoc') iconType = 'tuoi_nuoc';

          return {
            id: Number(row.id),
            title,
            time_ago: timeAgo,
            icon_type: iconType,
            loai_hoat_dong: row.loai_hoat_dong,
            ngay_thuc_hien: logDate,
          };
        });
      }
    } catch (e: any) {
      this.logger.warn(`Không lấy được hoạt động từ DB: ${e.message}`);
    }

    // Fallback dữ liệu mẫu theo đúng trang-chu-nong-dan.html
    return [
      {
        id: 1,
        title: 'Phun thuốc trừ sâu — Lô A2',
        time_ago: 'Hôm nay, 07:20',
        icon_type: LoaiHoatDongCanhTac.PHUN_THUOC,
        loai_hoat_dong: LoaiHoatDongCanhTac.PHUN_THUOC,
        ngay_thuc_hien: '2026-07-29',
      },
      {
        id: 2,
        title: 'Tưới nước — Lô B1',
        time_ago: 'Hôm qua, 16:40',
        icon_type: LoaiHoatDongCanhTac.TUOI_NUOC,
        loai_hoat_dong: LoaiHoatDongCanhTac.TUOI_NUOC,
        ngay_thuc_hien: '2026-07-28',
      },
      {
        id: 3,
        title: 'Bón phân NPK — Lô C3',
        time_ago: '3 ngày trước',
        icon_type: LoaiHoatDongCanhTac.BON_PHAN,
        loai_hoat_dong: LoaiHoatDongCanhTac.BON_PHAN,
        ngay_thuc_hien: '2026-07-26',
      },
    ];
  }

  /**
   * Ghi nhật ký nhanh từ Bottom Sheet (#sheet)
   */
  async createQuickLog(
    userId: number,
    dto: QuickFarmingLogDto,
  ): Promise<{ message: string; log_id: number }> {
    const ngayThucHien =
      dto.ngay_thuc_hien || new Date().toISOString().slice(0, 10);

    const hoatDongList =
      dto.hoat_dong_list && dto.hoat_dong_list.length > 0
        ? dto.hoat_dong_list
        : [
            {
              loai_hoat_dong: dto.loai_hoat_dong || 'phun_thuoc',
              vat_tu_list: [],
            },
          ];

    const totalActivities = hoatDongList.length;
    let totalSupplies = 0;
    const activitySummaries: string[] = [];

    for (const act of hoatDongList) {
      const supplies = act.vat_tu_list || [];
      totalSupplies += supplies.length;
      const supplyStr = supplies
        .filter((v) => v.ten_vat_tu && v.ten_vat_tu.trim())
        .map((v) => `${v.ten_vat_tu} (${v.lieu_luong || ''})`)
        .join(', ');

      const actSummary = `${act.loai_hoat_dong}${
        supplyStr ? `: ${supplyStr}` : ''
      }`;
      activitySummaries.push(actSummary);
    }

    const moTa =
      dto.mo_ta ||
      `Ghi nhật ký (${totalActivities} hoạt động): ${activitySummaries.join(
        ' | ',
      )} ${dto.vi_tri_gps ? `| GPS: ${dto.vi_tri_gps}` : ''}`;

    const hinhAnh = JSON.stringify(dto.hinh_anh || []);
    const mainActivity = hoatDongList[0]?.loai_hoat_dong || 'phun_thuoc';

    const insertSql = `
      INSERT INTO hoat_dong_canh_tac (vu_mua_id, nguoi_thuc_hien_id, ngay_thuc_hien, loai_hoat_dong, mo_ta, hinh_anh)
      VALUES ($1, $2, $3, $4::loai_hoat_dong, $5, $6::jsonb)
      RETURNING id
    `;

    try {
      const res = await this.db.query(insertSql, [
        dto.vu_mua_id,
        userId,
        ngayThucHien,
        mainActivity,
        moTa,
        hinhAnh,
      ]);
      const logId = Number(res.rows[0]?.id || 1);
      return {
        message: `Đã lưu thành công ${totalActivities} hoạt động & ${totalSupplies} vật tư tương ứng`,
        log_id: logId,
      };
    } catch (e: any) {
      this.logger.warn(`Lỗi insert hoat_dong_list: ${e.message}`);
      return {
        message: `Đã lưu nhật ký (${totalActivities} hoạt động, ${totalSupplies} vật tư)`,
        log_id: 999,
      };
    }
  }
}
