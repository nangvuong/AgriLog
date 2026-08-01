import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlotEntity } from './plot.entity';
import { CreatePlotDto, UpdatePlotDto } from './dto';
import { FarmsService } from '../farms/farms.service';

@Injectable()
export class PlotsService {
  constructor(
    @InjectRepository(PlotEntity)
    private readonly plotRepository: Repository<PlotEntity>,
    private readonly farmsService: FarmsService,
  ) {}

  async create(dto: CreatePlotDto): Promise<PlotEntity> {
    // Kiểm tra trang trại tồn tại
    await this.farmsService.findOne(dto.farm_id);

    // Kiểm tra trùng mã lô trong cùng trang trại
    const existingPlot = await this.plotRepository.findOne({
      where: {
        farm_id: Number(dto.farm_id),
        code: dto.code,
      },
    });
    if (existingPlot) {
      throw new ConflictException(
        `Mã lô/vườn '${dto.code}' đã tồn tại trong trang trại ID '${dto.farm_id}'`,
      );
    }

    const plot = this.plotRepository.create(dto);
    return this.plotRepository.save(plot);
  }

  async findAll(farmId?: number): Promise<PlotEntity[]> {
    const whereCondition = farmId ? { farm_id: Number(farmId) } : {};
    return this.plotRepository.find({
      where: whereCondition,
      order: { code: 'ASC' },
    });
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
