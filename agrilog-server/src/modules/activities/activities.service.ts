import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  ActivityEntity,
  ActivityTypeEntity,
  FarmerEntity,
  ActivityMaterialEntity,
  ActivityAssetEntity,
  ActivityAiExtractionEntity,
} from './entities';
import {
  CreateActivityDto,
  CreateActivityTypeDto,
  ActivityQueryDto,
  UpdateActivityDto,
  UpdateActivityTypeDto,
  ActivityResponseDto,
  ActivityTypeResponseDto,
  CreateActivityMaterialDto,
  ActivityMaterialResponseDto,
  CreateActivityAssetDto,
  ActivityAssetResponseDto,
} from './dto';
import { SeasonEntity } from '../seasons/season.entity';
import { MaterialEntity } from '../materials/material.entity';
import { AssetEntity } from '../assets/asset.entity';
import {
  ObservationEntity,
  ObservationsService,
  ObservationResponseDto,
} from '../observations';
import {
  HarvestEntity,
  HarvestsService,
  HarvestResponseDto,
} from '../harvests';
import { IPaginatedResponse } from 'agrilog-shared';
import { paginateResponse } from '../../common';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(ActivityTypeEntity)
    private readonly activityTypeRepository: Repository<ActivityTypeEntity>,
    @InjectRepository(FarmerEntity)
    private readonly farmerRepository: Repository<FarmerEntity>,
    @InjectRepository(SeasonEntity)
    private readonly seasonRepository: Repository<SeasonEntity>,
    @InjectRepository(ActivityMaterialEntity)
    private readonly activityMaterialRepository: Repository<ActivityMaterialEntity>,
    @InjectRepository(ActivityAssetEntity)
    private readonly activityAssetRepository: Repository<ActivityAssetEntity>,
    @InjectRepository(ActivityAiExtractionEntity)
    private readonly activityAiExtractionRepository: Repository<ActivityAiExtractionEntity>,
    @InjectRepository(MaterialEntity)
    private readonly materialRepository: Repository<MaterialEntity>,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @InjectRepository(ObservationEntity)
    private readonly observationRepository: Repository<ObservationEntity>,
    @InjectRepository(HarvestEntity)
    private readonly harvestRepository: Repository<HarvestEntity>,
    private readonly observationsService: ObservationsService,
    private readonly harvestsService: HarvestsService,
  ) {}

  // ==========================================
  // ACTIVITY TYPES MANAGEMENT
  // ==========================================

  async createType(dto: CreateActivityTypeDto): Promise<ActivityTypeResponseDto> {
    const existing = await this.activityTypeRepository.findOne({
      where: { code: dto.code.toUpperCase() },
    });
    if (existing) {
      throw new ConflictException(
        `Loại hoạt động canh tác với mã '${dto.code}' đã tồn tại`,
      );
    }
    const type = this.activityTypeRepository.create({
      ...dto,
      code: dto.code.toUpperCase(),
    });
    return this.activityTypeRepository.save(type);
  }

  async findAllTypes(): Promise<ActivityTypeResponseDto[]> {
    return this.activityTypeRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOneType(id: number): Promise<ActivityTypeResponseDto> {
    const type = await this.activityTypeRepository.findOne({
      where: { id: Number(id) },
    });
    if (!type) {
      throw new NotFoundException(
        `Loại hoạt động canh tác với ID '${id}' không tồn tại`,
      );
    }
    return type;
  }

  async updateType(
    id: number,
    dto: UpdateActivityTypeDto,
  ): Promise<ActivityTypeResponseDto> {
    const type = await this.findOneType(id);
    if (dto.code && dto.code.toUpperCase() !== type.code) {
      const existing = await this.activityTypeRepository.findOne({
        where: { code: dto.code.toUpperCase() },
      });
      if (existing) {
        throw new ConflictException(
          `Loại hoạt động canh tác với mã '${dto.code}' đã tồn tại`,
        );
      }
      type.code = dto.code.toUpperCase();
    }
    if (dto.name !== undefined) type.name = dto.name;
    if (dto.description !== undefined) type.description = dto.description;

    return this.activityTypeRepository.save(type);
  }

  async removeType(id: number): Promise<void> {
    const type = await this.findOneType(id);
    const countUsed = await this.activityRepository.count({
      where: { activity_type_id: Number(id) },
    });
    if (countUsed > 0) {
      throw new BadRequestException(
        `Không thể xóa loại hoạt động đang có ${countUsed} nhật ký canh tác sử dụng`,
      );
    }
    await this.activityTypeRepository.remove(type as ActivityTypeEntity);
  }

  // ==========================================
  // ACTIVITIES (NHẬT KÝ CANH TÁC) MANAGEMENT
  // ==========================================

  async createActivity(dto: CreateActivityDto): Promise<ActivityResponseDto> {
    if (dto.end_time && new Date(dto.end_time) < new Date(dto.start_time)) {
      throw new BadRequestException(
        'Thời gian kết thúc (end_time) phải lớn hơn hoặc bằng thời gian bắt đầu (start_time)',
      );
    }

    const season = await this.seasonRepository.findOne({
      where: { id: Number(dto.season_id) },
    });
    if (!season) {
      throw new NotFoundException(
        `Vụ mùa với ID '${dto.season_id}' không tồn tại trong hệ thống`,
      );
    }

    const farmer = await this.farmerRepository.findOne({
      where: { id: Number(dto.farmer_id) },
    });
    if (!farmer) {
      throw new NotFoundException(
        `Người nông dân với ID '${dto.farmer_id}' không tồn tại trong hệ thống`,
      );
    }

    const activityType = await this.activityTypeRepository.findOne({
      where: { id: Number(dto.activity_type_id) },
    });
    if (!activityType) {
      throw new NotFoundException(
        `Loại hoạt động canh tác với ID '${dto.activity_type_id}' không tồn tại trong hệ thống`,
      );
    }

    const { materials, assets, observations, harvests, ai_extraction, ...activityData } = dto;
    const activity = this.activityRepository.create(activityData);
    const saved = await this.activityRepository.save(activity);

    if (materials && materials.length > 0) {
      for (const mat of materials) {
        await this.insertActivityMaterial(saved.id, mat);
      }
    }

    if (assets && assets.length > 0) {
      for (const ast of assets) {
        await this.insertActivityAsset(saved.id, ast);
      }
    }

    if (observations && observations.length > 0) {
      for (const obs of observations) {
        await this.observationsService.create({
          ...obs,
          activity_id: saved.id,
        });
      }
    }

    if (harvests && harvests.length > 0) {
      for (const harv of harvests) {
        await this.harvestsService.create({
          ...harv,
          activity_id: saved.id,
        });
      }
    }

    if (ai_extraction) {
      await this.activityAiExtractionRepository.save({
        activity_id: saved.id,
        model_name: ai_extraction.model_name || ai_extraction.model || 'unknown',
        prompt_version: ai_extraction.prompt_version,
        input_text: ai_extraction.input_text || ai_extraction.input,
        output_json: ai_extraction.output_json || ai_extraction.output,
        confidence: ai_extraction.confidence,
        processing_time_ms:
          ai_extraction.processing_time_ms ??
          (ai_extraction.processing_time
            ? Math.round(ai_extraction.processing_time * 1000)
            : undefined),
      });
    }

    return this.findOneActivity(saved.id);
  }

  async findAllActivities(
    query: ActivityQueryDto = {},
  ): Promise<IPaginatedResponse<ActivityResponseDto>> {
    const {
      seasonId,
      farmerId,
      activityTypeId,
      sourceType,
      aiStatus,
      page = 1,
      limit = 10,
    } = query;

    const whereCondition: any = {};
    if (seasonId) whereCondition.season_id = Number(seasonId);
    if (farmerId) whereCondition.farmer_id = Number(farmerId);
    if (activityTypeId)
      whereCondition.activity_type_id = Number(activityTypeId);
    if (sourceType) whereCondition.source_type = sourceType;
    if (aiStatus) whereCondition.ai_status = aiStatus;

    const [activities, totalItems] = await this.activityRepository.findAndCount(
      {
        where: whereCondition,
        relations: ['season', 'farmer', 'activity_type'],
        order: { start_time: 'DESC', created_at: 'DESC' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      },
    );

    // Load materials and assets for these activities
    const activityIds = activities.map((a) => a.id);
    let allMaterials: ActivityMaterialEntity[] = [];
    let allAssets: ActivityAssetEntity[] = [];
    let allObservations: ObservationEntity[] = [];
    let allHarvests: HarvestEntity[] = [];
    let allAiExtractions: ActivityAiExtractionEntity[] = [];

    if (activityIds.length > 0) {
      allMaterials = await this.activityMaterialRepository.find({
        where: { activity_id: In(activityIds) },
        relations: ['material'],
      });
      allAssets = await this.activityAssetRepository.find({
        where: { activity_id: In(activityIds) },
        relations: ['asset'],
      });
      allObservations = await this.observationRepository.find({
        where: { activity_id: In(activityIds) },
        order: { id: 'ASC' },
      });
      allHarvests = await this.harvestRepository.find({
        where: { activity_id: In(activityIds) },
        order: { id: 'ASC' },
      });
      allAiExtractions = await this.activityAiExtractionRepository.find({
        where: { activity_id: In(activityIds) },
      });
    }

    const enrichedList = activities.map((item) => {
      const mats = allMaterials.filter(
        (m) => Number(m.activity_id) === Number(item.id),
      );
      const asts = allAssets.filter(
        (a) => Number(a.activity_id) === Number(item.id),
      );
      const obs = allObservations.filter(
        (o) => Number(o.activity_id) === Number(item.id),
      );
      const harvs = allHarvests.filter(
        (h) => Number(h.activity_id) === Number(item.id),
      );
      const aiExt = allAiExtractions.find(
        (e) => Number(e.activity_id) === Number(item.id),
      );
      return this.enrichActivity(
        item,
        item.season,
        item.farmer,
        item.activity_type,
        mats,
        asts,
        obs,
        harvs,
        aiExt,
      );
    });

    return paginateResponse(enrichedList, totalItems, page, limit);
  }

  async findOneActivity(id: number): Promise<ActivityResponseDto> {
    const activity = await this.activityRepository.findOne({
      where: { id: Number(id) },
      relations: ['season', 'farmer', 'activity_type'],
    });
    if (!activity) {
      throw new NotFoundException(
        `Nhật ký hoạt động canh tác với ID '${id}' không tồn tại`,
      );
    }

    const mats = await this.activityMaterialRepository.find({
      where: { activity_id: Number(id) },
      relations: ['material'],
    });
    const asts = await this.activityAssetRepository.find({
      where: { activity_id: Number(id) },
      relations: ['asset'],
    });
    const obs = await this.observationRepository.find({
      where: { activity_id: Number(id) },
      order: { id: 'ASC' },
    });
    const harvs = await this.harvestRepository.find({
      where: { activity_id: Number(id) },
      order: { id: 'ASC' },
    });
    const aiExt = await this.activityAiExtractionRepository.findOne({
      where: { activity_id: Number(id) },
    });

    return this.enrichActivity(
      activity,
      activity.season,
      activity.farmer,
      activity.activity_type,
      mats,
      asts,
      obs,
      harvs,
      aiExt || undefined,
    );
  }

  async updateActivity(
    id: number,
    dto: UpdateActivityDto,
  ): Promise<ActivityResponseDto> {
    const activity = await this.activityRepository.findOne({
      where: { id: Number(id) },
      relations: ['season', 'farmer', 'activity_type'],
    });
    if (!activity) {
      throw new NotFoundException(
        `Nhật ký hoạt động canh tác với ID '${id}' không tồn tại`,
      );
    }

    const startTime = dto.start_time
      ? new Date(dto.start_time)
      : new Date(activity.start_time);
    const endTime = dto.end_time
      ? new Date(dto.end_time)
      : activity.end_time
      ? new Date(activity.end_time)
      : null;

    if (endTime && endTime < startTime) {
      throw new BadRequestException(
        'Thời gian kết thúc (end_time) phải lớn hơn hoặc bằng thời gian bắt đầu (start_time)',
      );
    }

    if (dto.season_id && Number(dto.season_id) !== Number(activity.season_id)) {
      const season = await this.seasonRepository.findOne({
        where: { id: Number(dto.season_id) },
      });
      if (!season) {
        throw new NotFoundException(
          `Vụ mùa với ID '${dto.season_id}' không tồn tại`,
        );
      }
      activity.season_id = Number(dto.season_id);
      activity.season = season;
    }

    if (dto.farmer_id && Number(dto.farmer_id) !== Number(activity.farmer_id)) {
      const farmer = await this.farmerRepository.findOne({
        where: { id: Number(dto.farmer_id) },
      });
      if (!farmer) {
        throw new NotFoundException(
          `Người nông dân với ID '${dto.farmer_id}' không tồn tại`,
        );
      }
      activity.farmer_id = Number(dto.farmer_id);
      activity.farmer = farmer;
    }

    if (
      dto.activity_type_id &&
      Number(dto.activity_type_id) !== Number(activity.activity_type_id)
    ) {
      const activityType = await this.activityTypeRepository.findOne({
        where: { id: Number(dto.activity_type_id) },
      });
      if (!activityType) {
        throw new NotFoundException(
          `Loại hoạt động với ID '${dto.activity_type_id}' không tồn tại`,
        );
      }
      activity.activity_type_id = Number(dto.activity_type_id);
      activity.activity_type = activityType;
    }

    if (dto.description !== undefined) activity.description = dto.description;
    if (dto.note !== undefined) activity.note = dto.note;
    if (dto.start_time !== undefined)
      activity.start_time = new Date(dto.start_time);
    if (dto.end_time !== undefined)
      activity.end_time = dto.end_time ? new Date(dto.end_time) : null;
    if (dto.latitude !== undefined) activity.latitude = dto.latitude;
    if (dto.longitude !== undefined) activity.longitude = dto.longitude;
    if (dto.source_type !== undefined) activity.source_type = dto.source_type;
    if (dto.ai_status !== undefined) activity.ai_status = dto.ai_status;

    await this.activityRepository.save(activity);

    if (dto.materials !== undefined) {
      const existingMats = await this.activityMaterialRepository.find({
        where: { activity_id: Number(id) },
      });
      if (existingMats.length > 0) {
        await this.activityMaterialRepository.remove(existingMats);
      }
      for (const mat of dto.materials) {
        await this.insertActivityMaterial(id, mat);
      }
    }

    if (dto.assets !== undefined) {
      const existingAsts = await this.activityAssetRepository.find({
        where: { activity_id: Number(id) },
      });
      if (existingAsts.length > 0) {
        await this.activityAssetRepository.remove(existingAsts);
      }
      for (const ast of dto.assets) {
        await this.insertActivityAsset(id, ast);
      }
    }

    if (dto.observations !== undefined) {
      const existingObs = await this.observationRepository.find({
        where: { activity_id: Number(id) },
      });
      if (existingObs.length > 0) {
        await this.observationRepository.remove(existingObs);
      }
      for (const obs of dto.observations) {
        await this.observationsService.create({
          ...obs,
          activity_id: Number(id),
        });
      }
    }

    if (dto.harvests !== undefined) {
      const existingHarvs = await this.harvestRepository.find({
        where: { activity_id: Number(id) },
      });
      if (existingHarvs.length > 0) {
        await this.harvestRepository.remove(existingHarvs);
      }
      for (const harv of dto.harvests) {
        await this.harvestsService.create({
          ...harv,
          activity_id: Number(id),
        });
      }
    }

    return this.findOneActivity(id);
  }

  async removeActivity(id: number): Promise<void> {
    const activity = await this.activityRepository.findOne({
      where: { id: Number(id) },
    });
    if (!activity) {
      throw new NotFoundException(
        `Nhật ký hoạt động canh tác với ID '${id}' không tồn tại`,
      );
    }
    await this.activityRepository.remove(activity);
  }

  // ==========================================
  // ACTIVITY MATERIALS (SUB-RESOURCE)
  // ==========================================

  async getMaterialsByActivity(
    activityId: number,
  ): Promise<ActivityMaterialResponseDto[]> {
    const activity = await this.activityRepository.findOne({
      where: { id: Number(activityId) },
    });
    if (!activity) {
      throw new NotFoundException(
        `Nhật ký hoạt động với ID '${activityId}' không tồn tại`,
      );
    }
    const mats = await this.activityMaterialRepository.find({
      where: { activity_id: Number(activityId) },
      relations: ['material'],
      order: { id: 'ASC' },
    });
    return mats.map((m) => this.mapActivityMaterial(m));
  }

  async addMaterialToActivity(
    activityId: number,
    dto: CreateActivityMaterialDto,
  ): Promise<ActivityMaterialResponseDto> {
    const activity = await this.activityRepository.findOne({
      where: { id: Number(activityId) },
    });
    if (!activity) {
      throw new NotFoundException(
        `Nhật ký hoạt động với ID '${activityId}' không tồn tại`,
      );
    }
    const existing = await this.activityMaterialRepository.findOne({
      where: {
        activity_id: Number(activityId),
        material_id: Number(dto.material_id),
      },
    });
    if (existing) {
      throw new ConflictException(
        `Vật tư với ID '${dto.material_id}' đã được gán vào hoạt động này`,
      );
    }
    const inserted = await this.insertActivityMaterial(activityId, dto);
    return this.mapActivityMaterial(inserted);
  }

  async removeMaterialFromActivity(
    activityId: number,
    materialId: number,
  ): Promise<void> {
    const row = await this.activityMaterialRepository.findOne({
      where: {
        activity_id: Number(activityId),
        material_id: Number(materialId),
      },
    });
    if (!row) {
      throw new NotFoundException(
        `Vật tư ID '${materialId}' không tồn tại trong hoạt động ID '${activityId}'`,
      );
    }
    await this.activityMaterialRepository.remove(row);
  }

  // ==========================================
  // ACTIVITY ASSETS (SUB-RESOURCE)
  // ==========================================

  async getAssetsByActivity(
    activityId: number,
  ): Promise<ActivityAssetResponseDto[]> {
    const activity = await this.activityRepository.findOne({
      where: { id: Number(activityId) },
    });
    if (!activity) {
      throw new NotFoundException(
        `Nhật ký hoạt động với ID '${activityId}' không tồn tại`,
      );
    }
    const asts = await this.activityAssetRepository.find({
      where: { activity_id: Number(activityId) },
      relations: ['asset'],
      order: { id: 'ASC' },
    });
    return asts.map((a) => this.mapActivityAsset(a));
  }

  async addAssetToActivity(
    activityId: number,
    dto: CreateActivityAssetDto,
  ): Promise<ActivityAssetResponseDto> {
    const activity = await this.activityRepository.findOne({
      where: { id: Number(activityId) },
    });
    if (!activity) {
      throw new NotFoundException(
        `Nhật ký hoạt động với ID '${activityId}' không tồn tại`,
      );
    }
    const existing = await this.activityAssetRepository.findOne({
      where: {
        activity_id: Number(activityId),
        asset_id: Number(dto.asset_id),
      },
    });
    if (existing) {
      throw new ConflictException(
        `Máy móc/tài sản với ID '${dto.asset_id}' đã được gán vào hoạt động này`,
      );
    }
    const inserted = await this.insertActivityAsset(activityId, dto);
    return this.mapActivityAsset(inserted);
  }

  async removeAssetFromActivity(
    activityId: number,
    assetId: number,
  ): Promise<void> {
    const row = await this.activityAssetRepository.findOne({
      where: {
        activity_id: Number(activityId),
        asset_id: Number(assetId),
      },
    });
    if (!row) {
      throw new NotFoundException(
        `Máy móc ID '${assetId}' không tồn tại trong hoạt động ID '${activityId}'`,
      );
    }
    await this.activityAssetRepository.remove(row);
  }

  // ==========================================
  // PRIVATE HELPER FUNCTIONS
  // ==========================================

  private async insertActivityMaterial(
    activityId: number,
    dto: CreateActivityMaterialDto,
  ): Promise<ActivityMaterialEntity> {
    const material = await this.materialRepository.findOne({
      where: { id: Number(dto.material_id) },
    });
    if (!material) {
      throw new NotFoundException(
        `Vật tư nông nghiệp với ID '${dto.material_id}' không tồn tại`,
      );
    }
    const entity = this.activityMaterialRepository.create({
      activity_id: Number(activityId),
      material_id: Number(dto.material_id),
      quantity: dto.quantity,
      unit: dto.unit || material.default_unit,
    });
    const saved = await this.activityMaterialRepository.save(entity);
    saved.material = material;
    return saved;
  }

  private async insertActivityAsset(
    activityId: number,
    dto: CreateActivityAssetDto,
  ): Promise<ActivityAssetEntity> {
    const asset = await this.assetRepository.findOne({
      where: { id: Number(dto.asset_id) },
    });
    if (!asset) {
      throw new NotFoundException(
        `Máy móc/tài sản với ID '${dto.asset_id}' không tồn tại`,
      );
    }
    const entity = this.activityAssetRepository.create({
      activity_id: Number(activityId),
      asset_id: Number(dto.asset_id),
      usage_duration: dto.usage_duration,
    });
    const saved = await this.activityAssetRepository.save(entity);
    saved.asset = asset;
    return saved;
  }

  private mapActivityMaterial(
    entity: ActivityMaterialEntity,
  ): ActivityMaterialResponseDto {
    return {
      id: entity.id,
      activity_id: entity.activity_id,
      material_id: entity.material_id,
      quantity: Number(entity.quantity),
      unit: entity.unit,
      material_name: entity.material?.name,
      material_default_unit: entity.material?.default_unit,
    };
  }

  private mapActivityAsset(
    entity: ActivityAssetEntity,
  ): ActivityAssetResponseDto {
    return {
      id: entity.id,
      activity_id: entity.activity_id,
      asset_id: entity.asset_id,
      usage_duration: entity.usage_duration
        ? Number(entity.usage_duration)
        : undefined,
      asset_name: entity.asset?.name,
      asset_type: entity.asset?.type,
    };
  }

  private mapObservation(
    entity: ObservationEntity,
    activityDescription?: string,
    seasonName?: string,
    farmerName?: string,
  ): ObservationResponseDto {
    const { activity: _act, ...raw } = entity;
    const act = entity.activity;
    return {
      ...raw,
      activity_description:
        act?.description || act?.note || activityDescription,
      season_name:
        act?.season
          ? act.season.note || `Vụ #${act.season.id}`
          : seasonName,
      farmer_name: act?.farmer?.full_name || farmerName,
    };
  }

  private mapHarvest(
    entity: HarvestEntity,
    activityDescription?: string,
    seasonId?: number,
    seasonName?: string,
    farmerName?: string,
  ): HarvestResponseDto {
    const { activity: _act, ...raw } = entity;
    const act = entity.activity;
    const qty = Number(raw.quantity) || 0;
    const price =
      raw.selling_price !== undefined && raw.selling_price !== null
        ? Number(raw.selling_price)
        : undefined;
    const total_revenue =
      price !== undefined ? Math.round(qty * price * 100) / 100 : undefined;

    return {
      ...raw,
      quantity: qty,
      selling_price: price,
      activity_description:
        act?.description || act?.note || activityDescription,
      season_id: act?.season_id || seasonId,
      season_name:
        act?.season
          ? act.season.note || `Vụ #${act.season.id}`
          : seasonName,
      farmer_name: act?.farmer?.full_name || farmerName,
      total_revenue,
    };
  }

  private enrichActivity(
    activity: ActivityEntity,
    season?: SeasonEntity,
    farmer?: FarmerEntity,
    activityType?: ActivityTypeEntity,
    materials: ActivityMaterialEntity[] = [],
    assets: ActivityAssetEntity[] = [],
    observations: ObservationEntity[] = [],
    harvests: HarvestEntity[] = [],
    aiExtraction?: ActivityAiExtractionEntity,
  ): ActivityResponseDto {
    const {
      season: _s,
      farmer: _f,
      activity_type: _at,
      ...raw
    } = activity;

    const sName = season ? season.note || `Vụ #${season.id}` : undefined;
    const fName = farmer?.full_name;

    return {
      ...raw,
      season_name: sName,
      farmer_name: fName,
      activity_type_code: activityType?.code,
      activity_type_name: activityType?.name,
      materials: materials.map((m) => this.mapActivityMaterial(m)),
      assets: assets.map((a) => this.mapActivityAsset(a)),
      observations: observations.map((o) =>
        this.mapObservation(o, raw.description, sName, fName),
      ),
      harvests: harvests.map((h) =>
        this.mapHarvest(h, raw.description, season?.id, sName, fName),
      ),
      ai_extraction: aiExtraction
        ? {
            id: Number(aiExtraction.id),
            activity_id: Number(aiExtraction.activity_id),
            model_name: aiExtraction.model_name,
            prompt_version: aiExtraction.prompt_version,
            input_text: aiExtraction.input_text,
            output_json: aiExtraction.output_json,
            confidence: aiExtraction.confidence
              ? Number(aiExtraction.confidence)
              : undefined,
            processing_time_ms: aiExtraction.processing_time_ms,
            created_at: aiExtraction.created_at,
          }
        : undefined,
    };
  }
}
