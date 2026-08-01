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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SeasonsService } from './seasons.service';
import {
  CreateSeasonDto,
  UpdateSeasonDto,
  SeasonQueryDto,
  SeasonResponseDto,
} from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { IPaginatedResponse, UserRole } from 'agrilog-shared';

@ApiTags('Seasons — Quản lý Mùa vụ Canh tác')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Tạo mùa vụ canh tác mới',
    description:
      'Chỉ dành cho ADMIN hoặc MANAGER. Đăng ký một mùa vụ mới cho lô đất cụ thể với một giống cây trồng, quy định ngày xuống giống và ngày thu hoạch dự kiến.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo mùa vụ thành công',
    type: SeasonResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ngày thu hoạch không hợp lệ (nhỏ hơn ngày xuống giống)',
  })
  async create(@Body() dto: CreateSeasonDto): Promise<SeasonResponseDto> {
    return this.seasonsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách mùa vụ (có hỗ trợ phân trang & bộ lọc)',
    description:
      'Truy xuất danh sách mùa vụ với hỗ trợ phân trang chuẩn (page, limit) và lọc theo lô đất (plotId), giống cây (cropVarietyId), hoặc trạng thái (status).',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách mùa vụ phân trang',
  })
  async findAll(
    @Query() query: SeasonQueryDto,
  ): Promise<IPaginatedResponse<SeasonResponseDto>> {
    return this.seasonsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết mùa vụ theo ID',
    description:
      'Truy xuất thông tin chi tiết mùa vụ, bao gồm thông tin lô đất, giống cây và tiến độ thu hoạch.',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết mùa vụ',
    type: SeasonResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Mùa vụ không tồn tại',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SeasonResponseDto> {
    return this.seasonsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Cập nhật thông tin mùa vụ',
    description:
      'Cập nhật trạng thái (PLANNED, GROWING, HARVESTED, CANCELLED), ngày thu hoạch thực tế hoặc ghi chú mùa vụ.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: SeasonResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSeasonDto,
  ): Promise<SeasonResponseDto> {
    return this.seasonsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa mùa vụ canh tác',
    description: 'Xóa mùa vụ khỏi hệ thống',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.seasonsService.remove(id);
  }
}
