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
import { PlotsService } from './plots.service';
import { CreatePlotDto, UpdatePlotDto, PlotResponseDto, PlotQueryDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { IPaginatedResponse, UserRole } from 'agrilog-shared';

@ApiTags('Plots — Quản lý Lô/Vườn Đất Canh tác')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('plots')
export class PlotsController {
  constructor(private readonly plotsService: PlotsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Tạo lô/vườn canh tác mới',
    description:
      'Chỉ dành cho ADMIN hoặc MANAGER. Đăng ký lô/vườn mới thuộc trang trại trong AgriLog.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo lô/vườn thành công',
    type: PlotResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Mã lô/vườn đã tồn tại trong trang trại này',
  })
  async create(@Body() dto: CreatePlotDto): Promise<PlotResponseDto> {
    return this.plotsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách lô/vườn đất canh tác (phân trang & bộ lọc)',
    description:
      'Truy xuất danh sách lô/vườn có hỗ trợ phân trang (page, limit) và lọc theo trang trại (farmId) hoặc trạng thái (status).',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lô/vườn phân trang',
  })
  async findAll(
    @Query() query: PlotQueryDto,
  ): Promise<IPaginatedResponse<PlotResponseDto>> {
    return this.plotsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết lô/vườn theo ID',
    description: 'Truy xuất thông tin diện tích, loại đất, trạng thái và tọa độ GeoJSON của lô',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết lô/vườn',
    type: PlotResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lô/vườn không tồn tại',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PlotResponseDto> {
    return this.plotsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Cập nhật thông tin lô/vườn',
    description: 'Cập nhật mã lô, diện tích, trạng thái canh tác hoặc ranh giới không gian GeoJSON',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: PlotResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlotDto,
  ): Promise<PlotResponseDto> {
    return this.plotsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa lô/vườn canh tác',
    description: 'Xóa lô/vườn khỏi hệ thống',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.plotsService.remove(id);
  }
}
