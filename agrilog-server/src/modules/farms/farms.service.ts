import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FarmEntity } from './farm.entity';
import { CreateFarmDto, UpdateFarmDto, FarmSummaryResponseDto } from './dto';

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(FarmEntity)
    private readonly farmRepository: Repository<FarmEntity>,
  ) {}

  async create(dto: CreateFarmDto): Promise<FarmEntity> {
    const farm = this.farmRepository.create(dto);
    return this.farmRepository.save(farm);
  }

  async findAll(summary: boolean = false): Promise<any[]> {
    if (summary) {
      const farmsWithPlots = await this.farmRepository.find({
        relations: ['plots'],
        order: { created_at: 'DESC' },
      });

      return farmsWithPlots.map((farm) => {
        const plots = farm.plots || [];
        const plot_count = plots.length;
        const total_area = plots.reduce((sum, plot) => {
          const areaNum =
            typeof plot.area === 'number' ? plot.area : parseFloat(String(plot.area) || '0');
          return sum + (isNaN(areaNum) ? 0 : areaNum);
        }, 0);

        const { plots: _, ...farmData } = farm;
        return {
          ...farmData,
          plot_count,
          total_area: Math.round(total_area * 100) / 100,
        };
      });
    }

    return this.farmRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, includePlots: boolean = false): Promise<FarmEntity> {
    const farm = await this.farmRepository.findOne({
      where: { id: Number(id) },
      relations: includePlots ? ['plots'] : [],
    });
    if (!farm) {
      throw new NotFoundException(`Trang trại với ID '${id}' không tồn tại`);
    }
    return farm;
  }

  async findPlotsByFarm(id: number): Promise<any[]> {
    const farm = await this.farmRepository.findOne({
      where: { id: Number(id) },
      relations: ['plots'],
    });
    if (!farm) {
      throw new NotFoundException(`Trang trại với ID '${id}' không tồn tại`);
    }
    return (farm.plots || []).sort((a, b) => a.code.localeCompare(b.code));
  }

  async findAssetsByFarm(id: number): Promise<any[]> {
    const farm = await this.farmRepository.findOne({
      where: { id: Number(id) },
      relations: ['assets'],
    });
    if (!farm) {
      throw new NotFoundException(`Trang trại với ID '${id}' không tồn tại`);
    }
    return (farm.assets || []).sort((a, b) => a.name.localeCompare(b.name));
  }

  async update(id: number, dto: UpdateFarmDto): Promise<FarmEntity> {
    const farm = await this.findOne(id);
    Object.assign(farm, dto);
    return this.farmRepository.save(farm);
  }

  async remove(id: number): Promise<void> {
    const farm = await this.findOne(id);
    await this.farmRepository.remove(farm);
  }
}
