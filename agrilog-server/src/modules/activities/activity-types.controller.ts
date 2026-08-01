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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import {
  ActivityTypeResponseDto,
  CreateActivityTypeDto,
  UpdateActivityTypeDto,
} from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { UserRole } from 'agrilog-shared';

@ApiTags('Activity Types — Danh mục Loại hoạt động canh tác')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activity-types')
export class ActivityTypesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Tạo loại hoạt động canh tác mới',
    description:
      'Chỉ dành cho ADMIN hoặc MANAGER. Thêm mới mã và tên loại hoạt động vào danh mục (ví dụ: FERTILIZE, IRRIGATE, SPRAY...).',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo loại hoạt động thành công',
    type: ActivityTypeResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Mã loại hoạt động (code) đã tồn tại',
  })
  async create(@Body() dto: CreateActivityTypeDto): Promise<ActivityTypeResponseDto> {
    return this.activitiesService.createType(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách loại hoạt động canh tác',
    description:
      'Lấy toàn bộ danh mục các loại hoạt động canh tác trong hệ thống',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các loại hoạt động',
    type: [ActivityTypeResponseDto],
  })
  async findAll(): Promise<ActivityTypeResponseDto[]> {
    return this.activitiesService.findAllTypes();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết loại hoạt động canh tác theo ID',
    description: 'Lấy thông tin chi tiết một loại hoạt động',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin loại hoạt động',
    type: ActivityTypeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Loại hoạt động không tồn tại',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ActivityTypeResponseDto> {
    return this.activitiesService.findOneType(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Cập nhật loại hoạt động canh tác',
    description: 'Cập nhật mã, tên hoặc mô tả của loại hoạt động',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: ActivityTypeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Loại hoạt động không tồn tại',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActivityTypeDto,
  ): Promise<ActivityTypeResponseDto> {
    return this.activitiesService.updateType(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa loại hoạt động canh tác',
    description:
      'Chỉ dành cho ADMIN. Xóa một loại hoạt động khỏi hệ thống (yêu cầu không có nhật ký canh tác nào đang sử dụng)',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Đang có nhật ký canh tác sử dụng loại hoạt động này',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.activitiesService.removeType(id);
  }
}
