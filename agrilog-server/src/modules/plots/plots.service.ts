import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlotEntity } from './plot.entity';
import { CreatePlotDto, UpdatePlotDto, PlotQueryDto } from './dto';
import { FarmsService } from '../farms/farms.service';
import { IPaginatedResponse } from 'agrilog-shared';
import { paginateResponse } from '../../common';

@Injectable()
export class PlotsService {
  constructor(
    @InjectRepository(PlotEntity)
    private readonly plotRepository: Repository<PlotEntity>,
    private readonly farmsService: FarmsService,
  ) {}

  async create(dto: CreatePlotDto): Promise<PlotEntity> {
    await this.farmsService.findOne(dto.farm_id);

    const existing = await this.plotRepository.findOne({
      where: {
        farm_id: dto.farm_id,
        code: dto.code,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Lô/vườn với mã '${dto.code}' đã tồn tại trong trang trại ID '${dto.farm_id}'`,
      );
    }

    const plot = this.plotRepository.create(dto);
    return this.plotRepository.save(plot);
  }

  async findAll(query: PlotQueryDto = {}): Promise<IPaginatedResponse<PlotEntity>> {
    const { farmId, status, page = 1, limit = 10 } = query;
    const whereCondition: any = {};
    if (farmId) whereCondition.farm_id = Number(farmId);
    if (status) whereCondition.status = status;

    const [plots, totalItems] = await this.plotRepository.findAndCount({
      where: whereCondition,
      order: { code: 'ASC' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    return paginateResponse(plots, totalItems, page, limit);
  }

  async findOne(id: number): Promise<PlotEntity> {
    const plot = await this.plotRepository.findOne({
      where: { id: Number(id) },
    });
    if (!plot) {
      throw new NotFoundException(`Lô/vườn với ID '${id}' không tồn tại`);
    }
    return plot;
  }

  async update(id: number, dto: UpdatePlotDto): Promise<PlotEntity> {
    const plot = await this.findOne(id);

    if (dto.code && dto.code !== plot.code) {
      const existingCode = await this.plotRepository.findOne({
        where: {
          farm_id: Number(plot.farm_id),
          code: dto.code,
        },
      });
      if (existingCode) {
        throw new ConflictException(
          `Mã lô/vườn '${dto.code}' đã tồn tại trong trang trại ID '${plot.farm_id}'`,
        );
      }
    }

    Object.assign(plot, dto);
    return this.plotRepository.save(plot);
  }

  async remove(id: number): Promise<void> {
    const plot = await this.findOne(id);
    await this.plotRepository.remove(plot);
  }
}
