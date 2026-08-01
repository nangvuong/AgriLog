import { ApiProperty } from '@nestjs/swagger';
import {
  FarmerAlertLevel,
  FarmerAlertTag,
  LoaiHoatDongCanhTac,
  type IFarmerAlertDto,
  type IFarmerDashboardResponse,
  type IFarmerRecentActivityDto,
  type IFarmerSeasonDto,
} from 'agrilog-shared';

export class FarmerAlertDto implements IFarmerAlertDto {
  @ApiProperty({ example: 1, description: 'ID cảnh báo' })
  id!: number;

  @ApiProperty({
    example: FarmerAlertTag.CAN_CHU_Y,
    enum: FarmerAlertTag,
    description: 'Thẻ tag phân loại cảnh báo',
  })
  tag!: FarmerAlertTag | string;

  @ApiProperty({
    example: FarmerAlertLevel.DANGER,
    enum: FarmerAlertLevel,
  })
  level!: FarmerAlertLevel | 'danger' | 'warning' | 'info';

  @ApiProperty({
    example:
      'Lô A2 còn 2 vật tư chưa hết thời gian cách ly. Dự kiến thu hoạch trong 3 ngày.',
  })
  message!: string;

  @ApiProperty({ example: 1, required: false })
  lo_id?: number;

  @ApiProperty({ example: 1, required: false })
  vu_mua_id?: number;
}

export class FarmerSeasonDto implements IFarmerSeasonDto {
  @ApiProperty({ example: 1, description: 'ID vụ mùa' })
  id!: number;

  @ApiProperty({
    example: 'Lô A2 · Da Xanh',
    description: 'Tên lô & giống bưởi',
  })
  ten_lo!: string;

  @ApiProperty({ example: 'Da Xanh', required: false })
  giong_buoi?: string;

  @ApiProperty({
    example: 'Vụ 2026 · Ra hoa 12/03',
    description: 'Thông tin bổ sung',
  })
  meta!: string;

  @ApiProperty({ example: 70, description: 'Tiến độ % vụ mùa' })
  tien_do_phan_tram!: number;

  @ApiProperty({ example: 120, description: 'Số cây trong lô' })
  so_cay!: number;

  @ApiProperty({
    example: 'Còn 3 ngày',
    description: 'Trạng thái thu hoạch hoặc canh tác',
  })
  trang_thai_tag!: string;

  @ApiProperty({ example: true, required: false })
  is_urgent?: boolean;
}

export class FarmerRecentActivityDto implements IFarmerRecentActivityDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Phun thuốc trừ sâu — Lô A2' })
  title!: string;

  @ApiProperty({ example: 'Hôm nay, 07:20' })
  time_ago!: string;

  @ApiProperty({ example: LoaiHoatDongCanhTac.PHUN_THUOC })
  icon_type!: LoaiHoatDongCanhTac | string;

  @ApiProperty({ example: LoaiHoatDongCanhTac.PHUN_THUOC })
  loai_hoat_dong!: LoaiHoatDongCanhTac | string;

  @ApiProperty({ example: '2026-07-29' })
  ngay_thuc_hien!: string;
}

export class FarmerDashboardResponseDto implements IFarmerDashboardResponse {
  @ApiProperty({
    example: 'Chào anh Tư 👋',
    description: 'Lời chào người nông dân',
  })
  greeting!: string;

  @ApiProperty({ example: 'Thứ Tư, 29/07', description: 'Ngày tháng hiện tại' })
  current_date!: string;

  @ApiProperty({
    example: '☀ 31°C, nắng nhẹ',
    description: 'Thông tin thời tiết nhanh',
  })
  weather!: string;

  @ApiProperty({ example: 2, description: 'Số cảnh báo chưa đọc' })
  unread_alerts_count!: number;

  @ApiProperty({
    type: [FarmerAlertDto],
    description: 'Danh sách cảnh báo GlobalGAP',
  })
  alerts!: FarmerAlertDto[];

  @ApiProperty({
    type: [FarmerSeasonDto],
    description: 'Danh sách vụ mùa đang canh tác',
  })
  seasons!: FarmerSeasonDto[];

  @ApiProperty({
    type: [FarmerRecentActivityDto],
    description: 'Danh sách hoạt động canh tác gần đây',
  })
  recent_activities!: FarmerRecentActivityDto[];
}
