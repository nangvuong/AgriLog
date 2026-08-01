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
import { ObservationsService } from './observations.service';
import {
  CreateObservationDto,
  ObservationQueryDto,
  ObservationResponseDto,
  UpdateObservationDto,
} from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { IPaginatedResponse, UserRole } from 'agrilog-shared';

@ApiTags('Observations — Ghi nhận Quan sát / Sâu bệnh')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('observations')
export class ObservationsController {
  constructor(private readonly observationsService: ObservationsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @ApiOperation({
    summary: 'Ghi nhận quan sát / biểu hiện sâu bệnh mới',
    description:
      'Ghi nhận một biểu hiện sâu bệnh, phát triển của cây trồng liên kết với một nhật ký hoạt động canh tác (activity_id).',
  })
  @ApiResponse({
    status: 201,
    description: 'Ghi nhận quan sát thành công',
    type: ObservationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Nhật ký hoạt động canh tác không tồn tại',
  })
  async create(
    @Body() dto: CreateObservationDto,
  ): Promise<ObservationResponseDto> {
    return this.observationsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách quan sát biểu hiện (phân trang & bộ lọc)',
    description:
      'Truy xuất danh sách quan sát có phân trang (page, limit), hỗ trợ lọc theo nhật ký (activityId), vụ mùa (seasonId), mức độ nghiêm trọng (severity) và từ khóa tìm kiếm (search).',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách quan sát phân trang',
  })
  async findAll(
    @Query() query: ObservationQueryDto,
  ): Promise<IPaginatedResponse<ObservationResponseDto>> {
    return this.observationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết quan sát biểu hiện theo ID',
    description: 'Lấy thông tin chi tiết một bản ghi quan sát biểu hiện theo ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết quan sát',
    type: ObservationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Bản ghi quan sát không tồn tại',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ObservationResponseDto> {
    return this.observationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @ApiOperation({
    summary: 'Cập nhật quan sát biểu hiện',
    description:
      'Cập nhật triệu chứng, mức độ nghiêm trọng hoặc mô tả của bản ghi quan sát',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: ObservationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Bản ghi quan sát không tồn tại',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateObservationDto,
  ): Promise<ObservationResponseDto> {
    return this.observationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa bản ghi quan sát biểu hiện',
    description: 'Xóa một bản ghi quan sát khỏi hệ thống',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Bản ghi quan sát không tồn tại',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.observationsService.remove(id);
  }
}
