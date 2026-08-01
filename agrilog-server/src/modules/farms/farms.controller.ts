import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FarmsService } from './farms.service';
import {
  CreateFarmDto,
  UpdateFarmDto,
  FarmResponseDto,
  FarmSummaryResponseDto,
} from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { UserRole } from 'agrilog-shared';

@ApiTags('Farms — Quản lý Trang trại')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Tạo trang trại nông nghiệp mới',
    description:
      'Chỉ dành cho ADMIN hoặc MANAGER. Đăng ký thông tin tọa độ, địa chỉ và chủ trại.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo trang trại thành công',
    type: FarmResponseDto,
  })
  async create(@Body() dto: CreateFarmDto): Promise<FarmResponseDto> {
    return this.farmsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách trang trại',
    description:
      'Lấy toàn bộ trang trại trong hệ thống. Có thể bật tham số summary=true để tính tổng diện tích và tổng số lô canh tác.',
  })
  @ApiQuery({
    name: 'summary',
    required: false,
    type: Boolean,
    description: 'Bật true để trả về thông tin tổng hợp (số lô, tổng diện tích)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách trang trại',
    type: [FarmSummaryResponseDto],
  })
  async findAll(@Query('summary') summary?: string): Promise<any[]> {
    const isSummary = summary === 'true' || summary === '1';
    return this.farmsService.findAll(isSummary);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết trang trại theo ID',
    description: 'Truy xuất thông tin cụ thể của một trang trại',
  })
  @ApiQuery({
    name: 'includePlots',
    required: false,
    type: Boolean,
    description: 'Bật true để lấy kèm danh sách các lô/vườn thuộc trang trại',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết trang trại',
    type: FarmResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Trang trại không tồn tại',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includePlots') includePlots?: string,
  ): Promise<FarmResponseDto> {
    const shouldInclude = includePlots === 'true' || includePlots === '1';
    return this.farmsService.findOne(id, shouldInclude);
  }

  @Get(':id/plots')
  @ApiOperation({
    summary: 'Danh sách các lô/vườn thuộc trang trại',
    description: 'Truy xuất toàn bộ danh sách các lô/vườn đất canh tác trực thuộc trang trại có ID được chỉ định',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các lô/vườn canh tác',
  })
  @ApiResponse({
    status: 404,
    description: 'Trang trại không tồn tại',
  })
  async getPlotsByFarm(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.farmsService.findPlotsByFarm(id);
  }

  @Get(':id/assets')
  @ApiOperation({
    summary: 'Danh sách tài sản / thiết bị thuộc trang trại',
    description:
      'Truy xuất danh sách toàn bộ máy móc, tài sản, thiết bị cơ giới trực thuộc trang trại có ID được chỉ định',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tài sản / máy móc',
  })
  @ApiResponse({
    status: 404,
    description: 'Trang trại không tồn tại',
  })
  async getAssetsByFarm(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.farmsService.findAssetsByFarm(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Cập nhật thông tin trang trại',
    description: 'Cập nhật tên, địa chỉ, tọa độ GPS hoặc mô tả trang trại',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: FarmResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFarmDto,
  ): Promise<FarmResponseDto> {
    return this.farmsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa trang trại',
    description:
      'Chỉ dành cho ADMIN. Xóa trang trại và toàn bộ lô/vườn liên quan (CASCADE).',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.farmsService.remove(id);
  }
}
