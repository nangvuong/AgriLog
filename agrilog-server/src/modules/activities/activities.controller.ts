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
import { ActivitiesService } from './activities.service';
import {
  ActivityResponseDto,
  CreateActivityDto,
  ActivityQueryDto,
  UpdateActivityDto,
  CreateActivityMaterialDto,
  ActivityMaterialResponseDto,
  CreateActivityAssetDto,
  ActivityAssetResponseDto,
} from './dto';
import {
  CreateObservationDto,
  ObservationResponseDto,
  ObservationsService,
} from '../observations';
import {
  CreateHarvestDto,
  HarvestResponseDto,
  HarvestsService,
} from '../harvests';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common';
import { IPaginatedResponse, UserRole } from 'agrilog-shared';

@ApiTags('Activities — Nhật ký Canh tác nông nghiệp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly observationsService: ObservationsService,
    private readonly harvestsService: HarvestsService,
  ) {}

  // ==========================================
  // ACTIVITIES CRUD
  // ==========================================

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @ApiOperation({
    summary: 'Ghi nhật ký hoạt động canh tác mới (hỗ trợ kèm vật tư & máy móc)',
    description:
      'Ghi nhận một hoạt động canh tác trên vụ mùa (ví dụ: bón phân, tưới nước, phun thuốc...) với thời gian, tọa độ, nguồn ghi nhận (MANUAL, VOICE, TEXT, IMAGE), đồng thời cho phép gán danh sách vật tư sử dụng (materials) và máy móc/thiết bị sử dụng (assets) ngay trong một yêu cầu.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ghi nhận nhật ký thành công',
    type: ActivityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Dữ liệu không hợp lệ (thời gian kết thúc nhỏ hơn thời gian bắt đầu)',
  })
  @ApiResponse({
    status: 404,
    description: 'Vụ mùa, nông dân, loại hoạt động, vật tư hoặc tài sản không tồn tại',
  })
  async create(@Body() dto: CreateActivityDto): Promise<ActivityResponseDto> {
    return this.activitiesService.createActivity(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách nhật ký hoạt động canh tác (phân trang & bộ lọc)',
    description:
      'Truy xuất danh sách nhật ký hoạt động canh tác có hỗ trợ phân trang (page, limit) và bộ lọc theo vụ mùa (seasonId), nông dân (farmerId), loại hoạt động (activityTypeId), nguồn dữ liệu (sourceType) và trạng thái AI (aiStatus).',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách hoạt động phân trang',
  })
  async findAll(
    @Query() query: ActivityQueryDto,
  ): Promise<IPaginatedResponse<ActivityResponseDto>> {
    return this.activitiesService.findAllActivities(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết nhật ký hoạt động canh tác theo ID',
    description:
      'Lấy thông tin cụ thể của một nhật ký hoạt động canh tác kèm danh sách vật tư đã dùng (materials) và máy móc đã dùng (assets).',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết hoạt động',
    type: ActivityResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Nhật ký hoạt động không tồn tại',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.findOneActivity(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @ApiOperation({
    summary: 'Cập nhật nhật ký hoạt động canh tác',
    description:
      'Cập nhật thời gian kết thúc, ghi chú, mô tả, trạng thái AI hoặc danh sách vật tư/tài sản sử dụng cho hoạt động canh tác',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: ActivityResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Nhật ký hoạt động không tồn tại',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActivityDto,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.updateActivity(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa nhật ký hoạt động canh tác',
    description: 'Xóa một nhật ký hoạt động canh tác khỏi hệ thống',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Nhật ký hoạt động không tồn tại',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.activitiesService.removeActivity(id);
  }

  // ==========================================
  // MATERIALS SUB-RESOURCE
  // ==========================================

  @Get(':id/materials')
  @ApiOperation({
    summary: 'Danh sách vật tư sử dụng trong hoạt động canh tác',
    description:
      'Lấy danh sách các vật tư nông nghiệp đã được sử dụng trong hoạt động canh tác kèm số lượng và đơn vị tính.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách vật tư đã dùng',
    type: [ActivityMaterialResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Hoạt động canh tác không tồn tại',
  })
  async getMaterials(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ActivityMaterialResponseDto[]> {
    return this.activitiesService.getMaterialsByActivity(id);
  }

  @Post(':id/materials')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @ApiOperation({
    summary: 'Thêm vật tư vào hoạt động canh tác',
    description: 'Ghi nhận việc sử dụng một vật tư nông nghiệp trong hoạt động',
  })
  @ApiResponse({
    status: 201,
    description: 'Thêm vật tư thành công',
    type: ActivityMaterialResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Hoạt động canh tác hoặc vật tư không tồn tại',
  })
  @ApiResponse({
    status: 409,
    description: 'Vật tư đã được thêm vào hoạt động này trước đó',
  })
  async addMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateActivityMaterialDto,
  ): Promise<ActivityMaterialResponseDto> {
    return this.activitiesService.addMaterialToActivity(id, dto);
  }

  @Delete(':id/materials/:materialId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa vật tư khỏi hoạt động canh tác',
    description: 'Xóa một vật tư nông nghiệp đã sử dụng trong hoạt động canh tác',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa vật tư thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Vật tư không tồn tại trong hoạt động canh tác',
  })
  async removeMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Param('materialId', ParseIntPipe) materialId: number,
  ): Promise<void> {
    await this.activitiesService.removeMaterialFromActivity(id, materialId);
  }

  // ==========================================
  // ASSETS SUB-RESOURCE
  // ==========================================

  @Get(':id/assets')
  @ApiOperation({
    summary: 'Danh sách máy móc / tài sản sử dụng trong hoạt động canh tác',
    description:
      'Lấy danh sách máy móc, thiết bị nông nghiệp đã được sử dụng trong hoạt động canh tác kèm thời gian sử dụng.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách máy móc đã dùng',
    type: [ActivityAssetResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Hoạt động canh tác không tồn tại',
  })
  async getAssets(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ActivityAssetResponseDto[]> {
    return this.activitiesService.getAssetsByActivity(id);
  }

  @Post(':id/assets')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @ApiOperation({
    summary: 'Thêm máy móc / tài sản vào hoạt động canh tác',
    description:
      'Ghi nhận việc sử dụng một máy móc, thiết bị nông nghiệp trong hoạt động canh tác (ví dụ: máy phun thuốc, máy bơm...)',
  })
  @ApiResponse({
    status: 201,
    description: 'Thêm máy móc thành công',
    type: ActivityAssetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Hoạt động canh tác hoặc máy móc không tồn tại',
  })
  @ApiResponse({
    status: 409,
    description: 'Máy móc đã được thêm vào hoạt động này trước đó',
  })
  async addAsset(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateActivityAssetDto,
  ): Promise<ActivityAssetResponseDto> {
    return this.activitiesService.addAssetToActivity(id, dto);
  }

  @Delete(':id/assets/:assetId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa máy móc / tài sản khỏi hoạt động canh tác',
    description:
      'Xóa thông tin sử dụng máy móc, thiết bị trong hoạt động canh tác',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa máy móc thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Máy móc không tồn tại trong hoạt động canh tác',
  })
  async removeAsset(
    @Param('id', ParseIntPipe) id: number,
    @Param('assetId', ParseIntPipe) assetId: number,
  ): Promise<void> {
    await this.activitiesService.removeAssetFromActivity(id, assetId);
  }

  // ==========================================
  // OBSERVATIONS SUB-RESOURCE
  // ==========================================

  @Get(':id/observations')
  @ApiOperation({
    summary: 'Danh sách quan sát biểu hiện sâu bệnh của hoạt động canh tác',
    description:
      'Lấy toàn bộ các ghi nhận quan sát liên kết với nhật ký canh tác này',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách quan sát biểu hiện',
    type: [ObservationResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Hoạt động canh tác không tồn tại',
  })
  async getObservations(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ObservationResponseDto[]> {
    return this.observationsService.findByActivity(id);
  }

  @Post(':id/observations')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @ApiOperation({
    summary: 'Ghi nhận quan sát sâu bệnh cho hoạt động canh tác',
    description:
      'Thêm một biểu hiện quan sát, sâu bệnh gắn liền với nhật ký hoạt động này',
  })
  @ApiResponse({
    status: 201,
    description: 'Ghi nhận quan sát thành công',
    type: ObservationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Hoạt động canh tác không tồn tại',
  })
  async addObservation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateObservationDto,
  ): Promise<ObservationResponseDto> {
    return this.observationsService.create({
      ...dto,
      activity_id: id,
    });
  }

  // ==========================================
  // ACTIVITY - HARVEST SUB-RESOURCES
  // ==========================================

  @Get(':id/harvests')
  @ApiOperation({
    summary: 'Danh sách sản lượng thu hoạch của hoạt động canh tác',
    description:
      'Lấy toàn bộ các bản ghi thu hoạch nông sản liên kết với nhật ký canh tác này',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách thu hoạch nông sản',
    type: [HarvestResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Hoạt động canh tác không tồn tại',
  })
  async getHarvests(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HarvestResponseDto[]> {
    return this.harvestsService.findByActivity(id);
  }

  @Post(':id/harvests')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FARMER)
  @ApiOperation({
    summary: 'Ghi nhận sản lượng thu hoạch cho hoạt động canh tác',
    description:
      'Thêm một bản ghi thu hoạch (sản lượng, đơn vị, chất lượng, thương lái, giá bán) gắn liền với nhật ký hoạt động này',
  })
  @ApiResponse({
    status: 201,
    description: 'Ghi nhận thu hoạch thành công',
    type: HarvestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Hoạt động canh tác không tồn tại',
  })
  async addHarvest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateHarvestDto,
  ): Promise<HarvestResponseDto> {
    return this.harvestsService.create({
      ...dto,
      activity_id: id,
    });
  }
}
