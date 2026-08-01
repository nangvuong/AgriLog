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
import { AssetsService } from './assets.service';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AssetResponseDto,
  AssetQueryDto,
} from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { AssetStatus, IPaginatedResponse, UserRole } from 'agrilog-shared';

@ApiTags('Assets — Quản lý Tài sản & Máy móc Trang trại')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Đăng ký tài sản / thiết bị cơ giới mới cho trang trại',
    description:
      'Chỉ dành cho ADMIN hoặc MANAGER. Đăng ký thông tin máy móc, hệ thống tưới, drone, nhà màng... cho một trang trại.',
  })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký tài sản thành công',
    type: AssetResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Số sê-ri / mã tài sản đã tồn tại trong hệ thống',
  })
  async create(@Body() dto: CreateAssetDto): Promise<AssetResponseDto> {
    return this.assetsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách tài sản / thiết bị cơ giới (phân trang & bộ lọc)',
    description:
      'Truy xuất danh sách tài sản có hỗ trợ phân trang (page, limit), lọc theo trang trại sở hữu (farmId) hoặc trạng thái (status).',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tài sản phân trang',
  })
  async findAll(
    @Query() query: AssetQueryDto,
  ): Promise<IPaginatedResponse<AssetResponseDto>> {
    return this.assetsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết tài sản / thiết bị theo ID',
    description: 'Truy xuất thông tin cụ thể, số sê-ri, ngày trang bị và trạng thái của tài sản',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết tài sản',
    type: AssetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tài sản không tồn tại',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AssetResponseDto> {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Cập nhật thông tin tài sản / máy móc',
    description:
      'Cập nhật tên, số sê-ri, ngày mua hoặc thay đổi trạng thái hoạt động (sẵn sàng, đang bảo trì, hỏng hóc...)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: AssetResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssetDto,
  ): Promise<AssetResponseDto> {
    return this.assetsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa tài sản / thiết bị',
    description: 'Xóa tài sản khỏi trang trại',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.assetsService.remove(id);
  }
}
