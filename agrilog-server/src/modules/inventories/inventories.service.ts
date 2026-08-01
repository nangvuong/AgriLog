import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryEntity } from './inventory.entity';
import { FarmEntity } from '../farms/farm.entity';
import { MaterialEntity } from '../materials/material.entity';
import {
  CreateInventoryDto,
  InventoryQueryDto,
  InventoryResponseDto,
  UpdateInventoryDto,
} from './dto';
import { IPaginatedResponse } from 'agrilog-shared';
import { paginateResponse } from '../../common';

@Injectable()
export class InventoriesService {
  constructor(
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(FarmEntity)
    private readonly farmRepository: Repository<FarmEntity>,
    @InjectRepository(MaterialEntity)
    private readonly materialRepository: Repository<MaterialEntity>,
  ) {}

  async create(dto: CreateInventoryDto): Promise<InventoryResponseDto> {
    const farm = await this.farmRepository.findOne({
      where: { id: Number(dto.farm_id) },
    });
    if (!farm) {
      throw new NotFoundException(
        `Trang trại với ID '${dto.farm_id}' không tồn tại trong hệ thống`,
      );
    }

    const material = await this.materialRepository.findOne({
      where: { id: Number(dto.material_id) },
    });
    if (!material) {
      throw new NotFoundException(
        `Vật tư nông nghiệp với ID '${dto.material_id}' không tồn tại`,
      );
    }

    const existing = await this.inventoryRepository.findOne({
      where: {
        farm_id: Number(dto.farm_id),
        material_id: Number(dto.material_id),
      },
    });
    if (existing) {
      throw new ConflictException(
        `Vật tư ID '${dto.material_id}' đã tồn tại trong kho của trang trại ID '${dto.farm_id}', vui lòng dùng PATCH để cập nhật số lượng`,
      );
    }

    const inventory = this.inventoryRepository.create({
      farm_id: Number(dto.farm_id),
      material_id: Number(dto.material_id),
      quantity: dto.quantity,
      unit: dto.unit || material.default_unit,
    });
    const saved = await this.inventoryRepository.save(inventory);
    saved.farm = farm;
    saved.material = material;

    return this.enrichInventory(saved);
  }

  async findAll(
    query: InventoryQueryDto = {},
  ): Promise<IPaginatedResponse<InventoryResponseDto>> {
    const { farmId, materialId, page = 1, limit = 10 } = query;

    const whereCondition: any = {};
    if (farmId) whereCondition.farm_id = Number(farmId);
    if (materialId) whereCondition.material_id = Number(materialId);

    const [inventories, totalItems] =
      await this.inventoryRepository.findAndCount({
        where: whereCondition,
        relations: ['farm', 'material'],
        order: { id: 'ASC' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });

    const enrichedList = inventories.map((item) =>
      this.enrichInventory(item),
    );

    return paginateResponse(enrichedList, totalItems, page, limit);
  }

  async findOne(id: number): Promise<InventoryResponseDto> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id: Number(id) },
      relations: ['farm', 'material'],
    });
    if (!inventory) {
      throw new NotFoundException(
        `Bản ghi tồn kho với ID '${id}' không tồn tại`,
      );
    }
    return this.enrichInventory(inventory);
  }

  async update(
    id: number,
    dto: UpdateInventoryDto,
  ): Promise<InventoryResponseDto> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id: Number(id) },
      relations: ['farm', 'material'],
    });
    if (!inventory) {
      throw new NotFoundException(
        `Bản ghi tồn kho với ID '${id}' không tồn tại`,
      );
    }

    if (dto.quantity !== undefined) inventory.quantity = dto.quantity;
    if (dto.unit !== undefined) inventory.unit = dto.unit;

    const saved = await this.inventoryRepository.save(inventory);
    return this.enrichInventory(saved);
  }

  async remove(id: number): Promise<void> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id: Number(id) },
    });
    if (!inventory) {
      throw new NotFoundException(
        `Bản ghi tồn kho với ID '${id}' không tồn tại`,
      );
    }
    await this.inventoryRepository.remove(inventory);
  }

  async findByFarm(farmId: number): Promise<InventoryResponseDto[]> {
    const farm = await this.farmRepository.findOne({
      where: { id: Number(farmId) },
    });
    if (!farm) {
      throw new NotFoundException(
        `Trang trại với ID '${farmId}' không tồn tại`,
      );
    }
    const inventories = await this.inventoryRepository.find({
      where: { farm_id: Number(farmId) },
      relations: ['farm', 'material'],
      order: { id: 'ASC' },
    });
    return inventories.map((item) => this.enrichInventory(item));
  }

  private enrichInventory(inventory: InventoryEntity): InventoryResponseDto {
    const { farm: _f, material: _m, ...raw } = inventory;
    const farm = inventory.farm;
    const material = inventory.material;
    return {
      ...raw,
      quantity: Number(raw.quantity),
      farm_name: farm?.name,
      material_name: material?.name,
      material_category: material?.category,
      material_default_unit: material?.default_unit,
    };
  }
}
