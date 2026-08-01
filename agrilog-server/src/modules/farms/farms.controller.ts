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
import { FarmsService } from './farms.service';
import { CreateFarmDto, FarmResponseDto, UpdateFarmDto } from './dto';
import {
  JwtAuthGuard,
  PaginationQueryDto,
  Roles,
  RolesGuard,
} from '../../common';
import { IPaginatedResponse, UserRole } from 'agrilog-shared';
import {
  InventoriesService,
  InventoryResponseDto,
} from '../inventories';

@ApiTags('Farms — Quản lý Trang trại')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('farms')
export class FarmsController {
  constructor(
    private readonly farmsService: FarmsService,
    private readonly inventoriesService: InventoriesService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Tạo trang trại mới',
    description:
      'Chỉ dành cho ADMIN hoặc MANAGER. Đăng ký thông tin trang trại mới vào hệ thống AgriLog.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo trang trại thành công',
    type: FarmResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token không hợp lệ',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền thực hiện (chỉ ADMIN, MANAGER)',
  })
  async create(@Body() dto: CreateFarmDto): Promise<FarmResponseDto> {
    return this.farmsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách trang trại (có phân trang)',
    description:
      'Truy xuất danh sách trang trại có hỗ trợ phân trang (page, limit). Bật summary=true để hiển thị tổng số lô và tổng diện tích.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách trang trại phân trang',
  })
  async findAll(
    @Query('summary') summary?: string,
    @Query() query?: PaginationQueryDto,
  ): Promise<IPaginatedResponse<any>> {
    const isSummary = summary === 'true' || summary === '1';
    return this.farmsService.findAll(
      isSummary,
      query?.page || 1,
      query?.limit || 10,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết trang trại theo ID',
    description:
      'Lấy thông tin cụ thể của trang trại. Hỗ trợ query ?includePlots=true để đính kèm danh sách lô đất (plots) thuộc trang trại.',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết trang trại',
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
    summary: 'Danh sách các lô/vườn thuộc trang trại (phân trang)',
    description:
      'Truy xuất danh sách các lô/vườn đất canh tác trực thuộc trang trại có hỗ trợ phân trang (page, limit)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các lô/vườn canh tác phân trang',
  })
  @ApiResponse({
    status: 404,
    description: 'Trang trại không tồn tại',
  })
  async getPlotsByFarm(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
  ): Promise<IPaginatedResponse<any>> {
    return this.farmsService.findPlotsByFarm(id, query.page, query.limit);
  }

  @Get(':id/assets')
  @ApiOperation({
    summary: 'Danh sách tài sản / thiết bị thuộc trang trại (phân trang)',
    description:
      'Truy xuất danh sách toàn bộ máy móc, tài sản, thiết bị cơ giới trực thuộc trang trại có hỗ trợ phân trang (page, limit)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tài sản / máy móc phân trang',
  })
  @ApiResponse({
    status: 404,
    description: 'Trang trại không tồn tại',
  })
  async getAssetsByFarm(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
  ): Promise<IPaginatedResponse<any>> {
    return this.farmsService.findAssetsByFarm(id, query.page, query.limit);
  }

  @Get(':id/inventories')
  @ApiOperation({
    summary: 'Danh sách vật tư tồn kho thuộc trang trại',
    description:
      'Truy xuất danh sách toàn bộ vật tư trong kho của trang trại kèm số lượng, đơn vị và phân loại vật tư.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tồn kho vật tư của trang trại',
    type: [InventoryResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Trang trại không tồn tại',
  })
  async getInventoriesByFarm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InventoryResponseDto[]> {
    return this.inventoriesService.findByFarm(id);
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
