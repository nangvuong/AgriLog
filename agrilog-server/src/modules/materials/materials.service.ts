import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialEntity } from './material.entity';
import { CreateMaterialDto, UpdateMaterialDto } from './dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(MaterialEntity)
    private readonly materialRepository: Repository<MaterialEntity>,
  ) {}

  async create(dto: CreateMaterialDto): Promise<MaterialEntity> {
    const existing = await this.materialRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Vật tư nông nghiệp '${dto.name}' đã tồn tại`);
    }

    const material = this.materialRepository.create(dto);
    return this.materialRepository.save(material);
  }

  async findAll(category?: string): Promise<MaterialEntity[]> {
    const whereCondition = category ? { category } : {};
    return this.materialRepository.find({
      where: whereCondition,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<MaterialEntity> {
    const material = await this.materialRepository.findOne({
      where: { id: Number(id) },
    });
    if (!material) {
      throw new NotFoundException(`Vật tư nông nghiệp với ID '${id}' không tồn tại`);
    }
    return material;
  }

  async update(id: number, dto: UpdateMaterialDto): Promise<MaterialEntity> {
    const material = await this.findOne(id);

    if (dto.name && dto.name !== material.name) {
      const existing = await this.materialRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(`Vật tư nông nghiệp '${dto.name}' đã tồn tại`);
      }
    }

    Object.assign(material, dto);
    return this.materialRepository.save(material);
  }

  async remove(id: number): Promise<void> {
    const material = await this.findOne(id);
    await this.materialRepository.remove(material);
  }
}
