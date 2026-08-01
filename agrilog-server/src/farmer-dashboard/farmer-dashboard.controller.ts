import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  FarmerAlertDto,
  FarmerDashboardResponseDto,
  FarmerRecentActivityDto,
  FarmerSeasonDto,
} from './dto/farmer-dashboard-response.dto';
import {
  GetNearestPlotQueryDto,
  NearestPlotDto,
  ReverseGeocodeDto,
} from './dto/get-nearest-plot.dto';
import { QuickFarmingLogDto } from './dto/quick-farming-log.dto';
import { FarmerDashboardService } from './farmer-dashboard.service';

@ApiTags('Farmer Dashboard - Trang Chủ Nông Dân')
@Controller('farmer-dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FarmerDashboardController {
  constructor(private readonly service: FarmerDashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary:
      'Lấy toàn bộ dữ liệu tổng hợp cho Trang chủ nông dân trong 1 API (App Shell)',
    description:
      'Trả về thông tin lời chào, ngày tháng, thời tiết, số lượng cảnh báo, các vụ mùa đang canh tác (.season-card) và hoạt động gần đây (.activity-item)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tải thành công dữ liệu tổng hợp Trang chủ',
    type: FarmerDashboardResponseDto,
  })
  async getSummary(@Request() req: any): Promise<FarmerDashboardResponseDto> {
    return this.service.getSummary(req.user.id);
  }

  @Get('seasons')
  @ApiOperation({
    summary:
      'Lấy danh sách các Vụ mùa đang canh tác (.season-card & #sheet selector)',
    description: 'Hiển thị tiến độ %, số cây và thời gian thu hoạch dự kiến',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách vụ mùa đang canh tác',
    type: [FarmerSeasonDto],
  })
  async getSeasons(@Request() req: any): Promise<FarmerSeasonDto[]> {
    return this.service.getSeasons(req.user.id);
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Lấy danh sách các Cảnh báo cách ly & canh tác (.alert-card)',
    description:
      'Cảnh báo vật tư chưa hết thời gian cách ly (PHI) và lịch tưới/chăm sóc sắp tới',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách cảnh báo GlobalGAP',
    type: [FarmerAlertDto],
  })
  async getAlerts(@Request() req: any): Promise<FarmerAlertDto[]> {
    return this.service.getAlerts(req.user.id);
  }

  @Get('recent-activities')
  @ApiOperation({
    summary: 'Lấy danh sách Hoạt động gần đây (.activity-item)',
    description:
      'Hiển thị các hoạt động phun thuốc, tưới nước, bón phân vừa thực hiện',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách hoạt động canh tác gần đây',
    type: [FarmerRecentActivityDto],
  })
  async getRecentActivities(
    @Request() req: any,
  ): Promise<FarmerRecentActivityDto[]> {
    return this.service.getRecentActivities(req.user.id);
  }

  @Get('nearest-plot')
  @ApiOperation({
    summary: 'Nhận vị trí GPS hiện tại (lat, lng) và tự động tìm Lô gần nhất',
    description:
      'Tính khoảng cách Haversine từ vị trí nông dân đang đứng tới các lô bưởi trong vườn để tự động chọn đúng Lô A2, B1, C3...',
  })
  @ApiResponse({
    status: 200,
    description: 'Tìm thành công Lô gần nhất',
    type: NearestPlotDto,
  })
  async getNearestPlotGet(
    @Request() req: any,
    @Query() query: GetNearestPlotQueryDto,
  ): Promise<NearestPlotDto> {
    const lat = Number(query.lat) || 10.3751;
    const lng = Number(query.lng) || 105.4321;
    return this.service.getNearestPlot(req.user.id, lat, lng);
  }

  @Get('reverse-geocode')
  @ApiOperation({
    summary: 'API 2: Giải mã tọa độ GPS (lat, lng) thành Địa chỉ hành chính đầy đủ',
    description: 'Trả về Tên ấp/xã/huyện/tỉnh và tên Hợp tác xã / Vùng trồng bưởi',
  })
  @ApiResponse({
    status: 200,
    description: 'Giải mã địa chỉ thành công',
    type: ReverseGeocodeDto,
  })
  async reverseGeocodeGet(
    @Query() query: GetNearestPlotQueryDto,
  ): Promise<ReverseGeocodeDto> {
    const lat = Number(query.lat) || 10.3751;
    const lng = Number(query.lng) || 105.4321;
    return this.service.reverseGeocode(lat, lng);
  }

  @Post('quick-log')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ghi nhật ký nhanh từ Bottom Sheet (#sheet - Ghi nhật ký nhanh)',
    description:
      'Ghi nhận nhanh hoạt động: Phun thuốc, Bón phân, Tưới nước, Làm cỏ...',
  })
  @ApiResponse({
    status: 201,
    description: 'Lưu nhật ký thành công',
  })
  async createQuickLog(
    @Request() req: any,
    @Body() dto: QuickFarmingLogDto,
  ): Promise<{ message: string; log_id: number }> {
    return this.service.createQuickLog(req.user.id, dto);
  }
}
