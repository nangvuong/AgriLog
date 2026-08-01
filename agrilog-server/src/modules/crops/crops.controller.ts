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
import { CropsService } from './crops.service';
import {
  CreateCropDto,
  UpdateCropDto,
  CropResponseDto,
  CropSummaryResponseDto,
  CropQueryDto,
} from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { IPaginatedResponse, UserRole } from 'agrilog-shared';

@ApiTags('Crops — Quản lý Danh mục Cây trồng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Tạo loại cây trồng mới',
    description:
      'Chỉ dành cho ADMIN hoặc MANAGER. Đăng ký thông tin cây trồng (e.g. Bưởi, Sầu riêng, Cam...).',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo loại cây trồng thành công',
    type: CropResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Tên loại cây trồng đã tồn tại',
  })
  async create(@Body() dto: CreateCropDto): Promise<CropResponseDto> {
    return this.cropsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách các loại cây trồng (phân trang & tổng hợp)',
    description:
      'Lấy danh sách các loại cây trồng có hỗ trợ phân trang (page, limit). Có thể bật tham số summary=true để đếm tổng số giống cây (variety_count).',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách cây trồng phân trang',
  })
  async findAll(@Query() query: CropQueryDto): Promise<IPaginatedResponse<any>> {
    const isSummary = query.summary === 'true' || query.summary === '1';
    return this.cropsService.findAll(isSummary, query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết loại cây trồng theo ID',
    description: 'Truy xuất thông tin cụ thể của một loại cây trồng',
  })
  @ApiQuery({
    name: 'includeVarieties',
    required: false,
    type: Boolean,
    description: 'Bật true để lấy kèm danh sách các giống cây thuộc loại này',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết cây trồng',
    type: CropResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cây trồng không tồn tại',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeVarieties') includeVarieties?: string,
  ): Promise<CropResponseDto> {
    const shouldInclude = includeVarieties === 'true' || includeVarieties === '1';
    return this.cropsService.findOne(id, shouldInclude);
  }

  @Get(':id/varieties')
  @ApiOperation({
    summary: 'Danh sách các giống cây thuộc một loại cây trồng',
    description:
      'Truy xuất toàn bộ danh sách các giống cây trực thuộc loại cây trồng có ID được chỉ định (e.g. các giống của Bưởi)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các giống cây trồng',
  })
  @ApiResponse({
    status: 404,
    description: 'Cây trồng không tồn tại',
  })
  async getVarietiesByCrop(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.cropsService.findVarietiesByCrop(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Cập nhật thông tin loại cây trồng',
    description: 'Cập nhật tên, tên khoa học, phân loại hoặc mô tả cây trồng',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: CropResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCropDto,
  ): Promise<CropResponseDto> {
    return this.cropsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa loại cây trồng',
    description:
      'Chỉ dành cho ADMIN. Xóa loại cây trồng và toàn bộ giống cây liên quan (CASCADE).',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.cropsService.remove(id);
  }
}
