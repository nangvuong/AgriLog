import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { HarvestEntity } from './harvest.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import {
  CreateHarvestDto,
  HarvestQueryDto,
  HarvestResponseDto,
  UpdateHarvestDto,
} from './dto';
import { IPaginatedResponse } from 'agrilog-shared';
import { paginateResponse } from '../../common';

@Injectable()
export class HarvestsService {
  constructor(
    @InjectRepository(HarvestEntity)
    private readonly harvestRepository: Repository<HarvestEntity>,
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
  ) {}

  async create(dto: CreateHarvestDto): Promise<HarvestResponseDto> {
    if (!dto.activity_id) {
      throw new BadRequestException(
        'ID nhật ký hoạt động (activity_id) là bắt buộc',
      );
    }
    const activity = await this.activityRepository.findOne({
      where: { id: Number(dto.activity_id) },
      relations: ['season', 'farmer'],
    });
    if (!activity) {
      throw new NotFoundException(
        `Nhật ký hoạt động với ID '${dto.activity_id}' không tồn tại trong hệ thống`,
      );
    }
    const harvest = this.harvestRepository.create({
      ...dto,
      activity_id: Number(dto.activity_id),
    });
    const saved = await this.harvestRepository.save(harvest);
    saved.activity = activity;
    return this.enrichHarvest(saved);
  }

  async findAll(
    query: HarvestQueryDto,
  ): Promise<IPaginatedResponse<HarvestResponseDto>> {
    const { activityId, seasonId, quality, buyer, search, page, limit } = query;
    const qb = this.harvestRepository
      .createQueryBuilder('harvest')
      .leftJoinAndSelect('harvest.activity', 'activity')
      .leftJoinAndSelect('activity.season', 'season')
      .leftJoinAndSelect('activity.farmer', 'farmer');

    if (activityId) {
      qb.andWhere('harvest.activity_id = :activityId', {
        activityId: Number(activityId),
      });
    }

    if (seasonId) {
      qb.andWhere('activity.season_id = :seasonId', {
        seasonId: Number(seasonId),
      });
    }

    if (quality) {
      qb.andWhere('harvest.quality ILIKE :quality', {
        quality: `%${quality}%`,
      });
    }

    if (buyer) {
      qb.andWhere('harvest.buyer ILIKE :buyer', { buyer: `%${buyer}%` });
    }

    if (search) {
      qb.andWhere(
        '(harvest.buyer ILIKE :search OR harvest.quality ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('harvest.created_at', 'DESC');

    const currentPage = Math.max(Number(page) || 1, 1);
    const itemsPerPage = Math.max(Number(limit) || 10, 1);
    qb.skip((currentPage - 1) * itemsPerPage).take(itemsPerPage);

    const [items, totalItems] = await qb.getManyAndCount();
    const enrichedList = items.map((item) => this.enrichHarvest(item));

    return paginateResponse(enrichedList, totalItems, page, limit);
  }

  async findOne(id: number): Promise<HarvestResponseDto> {
    const harvest = await this.harvestRepository.findOne({
      where: { id: Number(id) },
      relations: ['activity', 'activity.season', 'activity.farmer'],
    });
    if (!harvest) {
      throw new NotFoundException(
        `Bản ghi thu hoạch với ID '${id}' không tồn tại`,
      );
    }
    return this.enrichHarvest(harvest);
  }

  async update(
    id: number,
    dto: UpdateHarvestDto,
  ): Promise<HarvestResponseDto> {
    const harvest = await this.harvestRepository.findOne({
      where: { id: Number(id) },
      relations: ['activity', 'activity.season', 'activity.farmer'],
    });
    if (!harvest) {
      throw new NotFoundException(
        `Bản ghi thu hoạch với ID '${id}' không tồn tại`,
      );
    }

    if (
      dto.activity_id &&
      Number(dto.activity_id) !== Number(harvest.activity_id)
    ) {
      const activity = await this.activityRepository.findOne({
        where: { id: Number(dto.activity_id) },
        relations: ['season', 'farmer'],
      });
      if (!activity) {
        throw new NotFoundException(
          `Nhật ký hoạt động với ID '${dto.activity_id}' không tồn tại`,
        );
      }
      harvest.activity_id = Number(dto.activity_id);
      harvest.activity = activity;
    }

    if (dto.quantity !== undefined) harvest.quantity = dto.quantity;
    if (dto.unit !== undefined) harvest.unit = dto.unit;
    if (dto.quality !== undefined) harvest.quality = dto.quality;
    if (dto.buyer !== undefined) harvest.buyer = dto.buyer;
    if (dto.selling_price !== undefined)
      harvest.selling_price = dto.selling_price;

    const saved = await this.harvestRepository.save(harvest);
    return this.enrichHarvest(saved);
  }

  async remove(id: number): Promise<void> {
    const harvest = await this.harvestRepository.findOne({
      where: { id: Number(id) },
    });
    if (!harvest) {
      throw new NotFoundException(
        `Bản ghi thu hoạch với ID '${id}' không tồn tại`,
      );
    }
    await this.harvestRepository.remove(harvest);
  }

  async findByActivity(activityId: number): Promise<HarvestResponseDto[]> {
    const activity = await this.activityRepository.findOne({
      where: { id: Number(activityId) },
    });
    if (!activity) {
      throw new NotFoundException(
        `Nhật ký hoạt động với ID '${activityId}' không tồn tại`,
      );
    }
    const harvests = await this.harvestRepository.find({
      where: { activity_id: Number(activityId) },
      relations: ['activity', 'activity.season', 'activity.farmer'],
      order: { id: 'ASC' },
    });
    return harvests.map((item) => this.enrichHarvest(item));
  }

  private enrichHarvest(harvest: HarvestEntity): HarvestResponseDto {
    const { activity: _act, ...raw } = harvest;
    const act = harvest.activity;
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
      activity_description: act?.description || act?.note,
      season_id: act?.season_id,
      season_name: act?.season
        ? act.season.note || `Vụ #${act.season.id}`
        : undefined,
      farmer_name: act?.farmer?.full_name,
      total_revenue,
    };
  }
}
