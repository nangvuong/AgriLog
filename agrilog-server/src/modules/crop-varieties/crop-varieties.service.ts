import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CropVarietyEntity } from './crop-variety.entity';
import { CreateCropVarietyDto, UpdateCropVarietyDto } from './dto';
import { CropsService } from '../crops/crops.service';

@Injectable()
export class CropVarietiesService {
  constructor(
    @InjectRepository(CropVarietyEntity)
    private readonly varietyRepository: Repository<CropVarietyEntity>,
    private readonly cropsService: CropsService,
  ) {}

  async create(dto: CreateCropVarietyDto): Promise<any> {
    // Kiểm tra loại cây trồng tồn tại
    const crop = await this.cropsService.findOne(dto.crop_id);

    // Kiểm tra trùng tên giống cây trong cùng loại cây trồng
    const existing = await this.varietyRepository.findOne({
      where: {
        crop_id: Number(dto.crop_id),
        name: dto.name,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Giống cây '${dto.name}' đã tồn tại trong loại cây trồng '${crop.name}' (ID: ${dto.crop_id})`,
      );
    }

    const variety = this.varietyRepository.create(dto);
    const saved = await this.varietyRepository.save(variety);
    return {
      ...saved,
      crop_name: crop.name,
    };
  }

  async findAll(cropId?: number): Promise<any[]> {
    const whereCondition = cropId ? { crop_id: Number(cropId) } : {};
    const varieties = await this.varietyRepository.find({
      where: whereCondition,
      relations: ['crop'],
      order: { name: 'ASC' },
    });

    return varieties.map((v) => ({
      ...v,
      crop_name: v.crop?.name,
    }));
  }

  async findOne(id: number): Promise<any> {
    const variety = await this.varietyRepository.findOne({
      where: { id: Number(id) },
      relations: ['crop'],
    });
    if (!variety) {
      throw new NotFoundException(`Giống cây với ID '${id}' không tồn tại`);
    }
    return {
      ...variety,
      crop_name: variety.crop?.name,
    };
  }

  async update(id: number, dto: UpdateCropVarietyDto): Promise<any> {
    const variety = await this.findOne(id);

    if (dto.name && dto.name !== variety.name) {
      const existing = await this.varietyRepository.findOne({
        where: {
          crop_id: Number(variety.crop_id),
          name: dto.name,
        },
      });
      if (existing) {
        throw new ConflictException(
          `Giống cây '${dto.name}' đã tồn tại trong loại cây trồng ID '${variety.crop_id}'`,
        );
      }
    }

    Object.assign(variety, dto);
    const updated = await this.varietyRepository.save(variety);
    return {
      ...updated,
      crop_name: variety.crop_name,
    };
  }

  async remove(id: number): Promise<void> {
    const variety = await this.findOne(id);
    await this.varietyRepository.remove(variety);
  }
}
