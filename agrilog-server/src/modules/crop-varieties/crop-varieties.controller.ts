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
import { CropVarietiesService } from './crop-varieties.service';
import {
  CreateCropVarietyDto,
  UpdateCropVarietyDto,
  CropVarietyResponseDto,
} from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { UserRole } from 'agrilog-shared';

@ApiTags('Crop Varieties — Quản lý Giống Cây Trồng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('crop-varieties')
export class CropVarietiesController {
  constructor(private readonly cropVarietiesService: CropVarietiesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Tạo giống cây trồng mới',
    description:
      'Chỉ dành cho ADMIN hoặc MANAGER. Đăng ký giống cây mới (Da Xanh, Năm Roi, Ri6...) thuộc một loại cây trồng.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo giống cây thành công',
    type: CropVarietyResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Tên giống cây đã tồn tại trong loại cây trồng này',
  })
  async create(@Body() dto: CreateCropVarietyDto): Promise<CropVarietyResponseDto> {
    return this.cropVarietiesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách giống cây trồng',
    description:
      'Truy xuất danh sách toàn bộ giống cây trong hệ thống hoặc lọc theo ID loại cây trồng (cropId).',
  })
  @ApiQuery({
    name: 'cropId',
    required: false,
    type: Number,
    description: 'Lọc danh sách các giống cây thuộc một loại cây trồng cụ thể',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách giống cây',
    type: [CropVarietyResponseDto],
  })
  async findAll(@Query('cropId') cropId?: string): Promise<CropVarietyResponseDto[]> {
    const parsedId = cropId ? parseInt(cropId, 10) : undefined;
    return this.cropVarietiesService.findAll(parsedId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết giống cây theo ID',
    description: 'Truy xuất thông tin nhà cung cấp và mô tả của giống cây',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết giống cây',
    type: CropVarietyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Giống cây không tồn tại',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CropVarietyResponseDto> {
    return this.cropVarietiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Cập nhật thông tin giống cây',
    description: 'Cập nhật tên, nhà cung cấp hoặc mô tả giống cây',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: CropVarietyResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCropVarietyDto,
  ): Promise<CropVarietyResponseDto> {
    return this.cropVarietiesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa giống cây trồng',
    description: 'Xóa giống cây khỏi hệ thống',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.cropVarietiesService.remove(id);
  }
}
