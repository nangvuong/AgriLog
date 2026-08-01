import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CropEntity } from './crop.entity';
import { CreateCropDto, UpdateCropDto } from './dto';

@Injectable()
export class CropsService {
  constructor(
    @InjectRepository(CropEntity)
    private readonly cropRepository: Repository<CropEntity>,
  ) {}

  async create(dto: CreateCropDto): Promise<CropEntity> {
    const existing = await this.cropRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Loại cây trồng '${dto.name}' đã tồn tại`);
    }

    const crop = this.cropRepository.create(dto);
    return this.cropRepository.save(crop);
  }

  async findAll(summary: boolean = false): Promise<any[]> {
    if (summary) {
      const cropsWithVarieties = await this.cropRepository.find({
        relations: ['varieties'],
        order: { name: 'ASC' },
      });

      return cropsWithVarieties.map((crop) => {
        const variety_count = (crop.varieties || []).length;
        const { varieties: _, ...cropData } = crop;
        return {
          ...cropData,
          variety_count,
        };
      });
    }

    return this.cropRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, includeVarieties: boolean = false): Promise<CropEntity> {
    const crop = await this.cropRepository.findOne({
      where: { id: Number(id) },
      relations: includeVarieties ? ['varieties'] : [],
    });
    if (!crop) {
      throw new NotFoundException(`Loại cây trồng với ID '${id}' không tồn tại`);
    }
    return crop;
  }

  async findVarietiesByCrop(id: number): Promise<any[]> {
    const crop = await this.cropRepository.findOne({
      where: { id: Number(id) },
      relations: ['varieties'],
    });
    if (!crop) {
      throw new NotFoundException(`Loại cây trồng với ID '${id}' không tồn tại`);
    }
    return (crop.varieties || []).map((variety) => ({
      ...variety,
      crop_name: crop.name,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  async update(id: number, dto: UpdateCropDto): Promise<CropEntity> {
    const crop = await this.findOne(id);

    if (dto.name && dto.name !== crop.name) {
      const existing = await this.cropRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(`Loại cây trồng '${dto.name}' đã tồn tại`);
      }
    }

    Object.assign(crop, dto);
    return this.cropRepository.save(crop);
  }

  async remove(id: number): Promise<void> {
    const crop = await this.findOne(id);
    await this.cropRepository.remove(crop);
  }
}
