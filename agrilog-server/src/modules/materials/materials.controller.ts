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
import { MaterialsService } from './materials.service';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  MaterialResponseDto,
  MaterialQueryDto,
} from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { IPaginatedResponse, UserRole } from 'agrilog-shared';

@ApiTags('Materials — Quản lý Vật tư Nông nghiệp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Tạo vật tư nông nghiệp mới',
    description:
      'Chỉ dành cho ADMIN hoặc MANAGER. Đăng ký thông tin vật tư nông nghiệp (Phân bón, Thuốc trừ sâu, Hạt giống, Công cụ...).',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo vật tư thành công',
    type: MaterialResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Tên vật tư nông nghiệp đã tồn tại',
  })
  async create(@Body() dto: CreateMaterialDto): Promise<MaterialResponseDto> {
    return this.materialsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách vật tư nông nghiệp (phân trang & bộ lọc)',
    description:
      'Truy xuất danh sách vật tư có hỗ trợ phân trang (page, limit) và lọc theo danh mục phân loại (category).',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách vật tư phân trang',
  })
  async findAll(
    @Query() query: MaterialQueryDto,
  ): Promise<IPaginatedResponse<MaterialResponseDto>> {
    return this.materialsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết vật tư theo ID',
    description: 'Truy xuất thông tin nhà sản xuất, đơn vị tính mặc định và hướng dẫn sử dụng của vật tư',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết vật tư nông nghiệp',
    type: MaterialResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vật tư không tồn tại',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MaterialResponseDto> {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Cập nhật thông tin vật tư',
    description: 'Cập nhật tên, danh mục, nhà sản xuất, đơn vị tính hoặc mô tả vật tư',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: MaterialResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaterialDto,
  ): Promise<MaterialResponseDto> {
    return this.materialsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa vật tư nông nghiệp',
    description: 'Chỉ dành cho ADMIN. Xóa vật tư khỏi danh mục hệ thống.',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.materialsService.remove(id);
  }
}
