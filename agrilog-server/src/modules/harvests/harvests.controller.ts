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
import { HarvestsService } from './harvests.service';
import {
  CreateHarvestDto,
  HarvestQueryDto,
  HarvestResponseDto,
  UpdateHarvestDto,
} from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { IPaginatedResponse, UserRole } from 'agrilog-shared';

@ApiTags('Harvests — Quản lý Sản lượng / Thu hoạch')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('harvests')
export class HarvestsController {
  constructor(private readonly harvestsService: HarvestsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @ApiOperation({
    summary: 'Ghi nhận sản lượng thu hoạch mới',
    description:
      'Ghi nhận sản lượng thu hoạch nông sản (số lượng, đơn vị, phân loại chất lượng, thương lái, giá bán) liên kết với một nhật ký hoạt động canh tác (activity_id).',
  })
  @ApiResponse({
    status: 201,
    description: 'Ghi nhận thu hoạch thành công',
    type: HarvestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
  })
  @ApiResponse({
    status: 404,
    description: 'Nhật ký canh tác không tồn tại',
  })
  async create(@Body() dto: CreateHarvestDto): Promise<HarvestResponseDto> {
    return this.harvestsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách thu hoạch (có phân trang & bộ lọc)',
    description:
      'Truy xuất danh sách các bản ghi thu hoạch nông sản có hỗ trợ phân trang (page, limit) và lọc theo activityId, seasonId, quality, buyer hoặc tìm kiếm (search).',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách thu hoạch phân trang',
  })
  async findAll(
    @Query() query: HarvestQueryDto,
  ): Promise<IPaginatedResponse<HarvestResponseDto>> {
    return this.harvestsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết thu hoạch theo ID',
    description:
      'Truy xuất thông tin chi tiết một bản ghi thu hoạch kèm thông tin enriched (mô tả hoạt động, mùa vụ, nông dân phụ trách, tổng doanh thu ước tính).',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết thu hoạch',
    type: HarvestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Bản ghi thu hoạch không tồn tại',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HarvestResponseDto> {
    return this.harvestsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @ApiOperation({
    summary: 'Cập nhật thông tin thu hoạch',
    description:
      'Cập nhật sản lượng, đơn vị, chất lượng, thương lái hoặc giá bán của bản ghi thu hoạch.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thu hoạch thành công',
    type: HarvestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Bản ghi thu hoạch không tồn tại',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHarvestDto,
  ): Promise<HarvestResponseDto> {
    return this.harvestsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa bản ghi thu hoạch',
    description:
      'Chỉ dành cho ADMIN hoặc MANAGER. Xóa bản ghi thu hoạch khỏi hệ thống.',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thu hoạch thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Bản ghi thu hoạch không tồn tại',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.harvestsService.remove(id);
  }
}
