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
import { InventoriesService } from './inventories.service';
import {
  CreateInventoryDto,
  InventoryQueryDto,
  InventoryResponseDto,
  UpdateInventoryDto,
} from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { IPaginatedResponse, UserRole } from 'agrilog-shared';

@ApiTags('Inventories — Quản lý Kho vật tư Nông nghiệp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Tạo mới bản ghi tồn kho ban đầu cho trang trại',
    description:
      'Chỉ dành cho ADMIN hoặc MANAGER. Ghi nhận số lượng tồn kho ban đầu hoặc nhập mới một vật tư cho trang trại.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo bản ghi tồn kho thành công',
    type: InventoryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Vật tư đã có trong kho của trang trại',
  })
  @ApiResponse({
    status: 404,
    description: 'Trang trại hoặc vật tư không tồn tại',
  })
  async create(@Body() dto: CreateInventoryDto): Promise<InventoryResponseDto> {
    return this.inventoriesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách tồn kho vật tư (phân trang & bộ lọc)',
    description:
      'Truy xuất danh sách tồn kho có phân trang (page, limit), hỗ trợ bộ lọc theo trang trại (farmId) và vật tư (materialId).',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tồn kho phân trang',
  })
  async findAll(
    @Query() query: InventoryQueryDto,
  ): Promise<IPaginatedResponse<InventoryResponseDto>> {
    return this.inventoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết bản ghi tồn kho theo ID',
    description: 'Lấy thông tin cụ thể của một bản ghi tồn kho trong hệ thống',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết tồn kho',
    type: InventoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Bản ghi tồn kho không tồn tại',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InventoryResponseDto> {
    return this.inventoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @ApiOperation({
    summary: 'Cập nhật số lượng tồn kho hoặc đơn vị tính',
    description:
      'Cập nhật lại số lượng tồn kho hoặc đơn vị cho một bản ghi kho (ví dụ: sau khi kiểm kê, xuất hoặc nhập kho)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: InventoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Bản ghi tồn kho không tồn tại',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryDto,
  ): Promise<InventoryResponseDto> {
    return this.inventoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa bản ghi tồn kho',
    description: 'Chỉ dành cho ADMIN, MANAGER. Xóa bản ghi tồn kho khỏi hệ thống',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Bản ghi tồn kho không tồn tại',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.inventoriesService.remove(id);
  }
}
