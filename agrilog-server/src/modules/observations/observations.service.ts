import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ObservationEntity } from './observation.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import {
  CreateObservationDto,
  ObservationQueryDto,
  ObservationResponseDto,
  UpdateObservationDto,
} from './dto';
import { IPaginatedResponse } from 'agrilog-shared';
import { paginateResponse } from '../../common';

@Injectable()
export class ObservationsService {
  constructor(
    @InjectRepository(ObservationEntity)
    private readonly observationRepository: Repository<ObservationEntity>,
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
  ) {}

  async create(dto: CreateObservationDto): Promise<ObservationResponseDto> {
    if (!dto.activity_id) {
      throw new NotFoundException(
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
    const observation = this.observationRepository.create(dto);
    const saved = await this.observationRepository.save(observation);
    saved.activity = activity;

    return this.enrichObservation(saved);
  }

  async findAll(
    query: ObservationQueryDto = {},
  ): Promise<IPaginatedResponse<ObservationResponseDto>> {
    const {
      activityId,
      seasonId,
      severity,
      search,
      page = 1,
      limit = 10,
    } = query;

    const whereCondition: any = {};
    if (activityId) whereCondition.activity_id = Number(activityId);
    if (severity) whereCondition.severity = severity;
    if (seasonId) {
      whereCondition.activity = {
        season_id: Number(seasonId),
      };
    }
    if (search) {
      whereCondition.symptom = ILike(`%${search}%`);
    }

    const [observations, totalItems] =
      await this.observationRepository.findAndCount({
        where: whereCondition,
        relations: ['activity', 'activity.season', 'activity.farmer'],
        order: { id: 'DESC' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });

    const enrichedList = observations.map((item) =>
      this.enrichObservation(item),
    );

    return paginateResponse(enrichedList, totalItems, page, limit);
  }

  async findOne(id: number): Promise<ObservationResponseDto> {
    const observation = await this.observationRepository.findOne({
      where: { id: Number(id) },
      relations: ['activity', 'activity.season', 'activity.farmer'],
    });
    if (!observation) {
      throw new NotFoundException(
        `Quan sát biểu hiện với ID '${id}' không tồn tại`,
      );
    }
    return this.enrichObservation(observation);
  }

  async update(
    id: number,
    dto: UpdateObservationDto,
  ): Promise<ObservationResponseDto> {
    const observation = await this.observationRepository.findOne({
      where: { id: Number(id) },
      relations: ['activity', 'activity.season', 'activity.farmer'],
    });
    if (!observation) {
      throw new NotFoundException(
        `Quan sát biểu hiện với ID '${id}' không tồn tại`,
      );
    }

    if (
      dto.activity_id &&
      Number(dto.activity_id) !== Number(observation.activity_id)
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
      observation.activity_id = Number(dto.activity_id);
      observation.activity = activity;
    }

    if (dto.symptom !== undefined) observation.symptom = dto.symptom;
    if (dto.severity !== undefined) observation.severity = dto.severity;
    if (dto.description !== undefined)
      observation.description = dto.description;

    const saved = await this.observationRepository.save(observation);
    return this.enrichObservation(saved);
  }

  async remove(id: number): Promise<void> {
    const observation = await this.observationRepository.findOne({
      where: { id: Number(id) },
    });
    if (!observation) {
      throw new NotFoundException(
        `Quan sát biểu hiện với ID '${id}' không tồn tại`,
      );
    }
    await this.observationRepository.remove(observation);
  }

  async findByActivity(activityId: number): Promise<ObservationResponseDto[]> {
    const activity = await this.activityRepository.findOne({
      where: { id: Number(activityId) },
    });
    if (!activity) {
      throw new NotFoundException(
        `Nhật ký hoạt động với ID '${activityId}' không tồn tại`,
      );
    }
    const observations = await this.observationRepository.find({
      where: { activity_id: Number(activityId) },
      relations: ['activity', 'activity.season', 'activity.farmer'],
      order: { id: 'ASC' },
    });
    return observations.map((item) => this.enrichObservation(item));
  }

  private enrichObservation(
    observation: ObservationEntity,
  ): ObservationResponseDto {
    const { activity: _act, ...raw } = observation;
    const act = observation.activity;
    return {
      ...raw,
      activity_description: act?.description || act?.note,
      season_name: act?.season ? act.season.note || `Vụ #${act.season.id}` : undefined,
      farmer_name: act?.farmer?.full_name,
    };
  }
}
