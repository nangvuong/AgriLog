import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetEntity } from './asset.entity';
import { CreateAssetDto, UpdateAssetDto, AssetQueryDto } from './dto';
import { FarmsService } from '../farms/farms.service';
import { AssetStatus, IPaginatedResponse } from 'agrilog-shared';
import { paginateResponse } from '../../common';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    private readonly farmsService: FarmsService,
  ) {}

  async create(dto: CreateAssetDto): Promise<any> {
    const farm = await this.farmsService.findOne(dto.farm_id);

    if (dto.serial_number) {
      const existingSerial = await this.assetRepository.findOne({
        where: { serial_number: dto.serial_number },
      });
      if (existingSerial) {
        throw new ConflictException(
          `Tài sản với số sê-ri '${dto.serial_number}' đã tồn tại trong hệ thống`,
        );
      }
    }

    const asset = this.assetRepository.create(dto);
    const saved = await this.assetRepository.save(asset);
    return {
      ...saved,
      farm_name: farm.name,
    };
  }

  async findAll(query: AssetQueryDto = {}): Promise<IPaginatedResponse<any>> {
    const { farmId, status, page = 1, limit = 10 } = query;
    const whereCondition: any = {};
    if (farmId) whereCondition.farm_id = Number(farmId);
    if (status) whereCondition.status = status;

    const [assets, totalItems] = await this.assetRepository.findAndCount({
      where: whereCondition,
      relations: ['farm'],
      order: { name: 'ASC' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const enriched = assets.map((a) => ({
      ...a,
      farm_name: a.farm?.name,
    }));

    return paginateResponse(enriched, totalItems, page, limit);
  }

  async findOne(id: number): Promise<any> {
    const asset = await this.assetRepository.findOne({
      where: { id: Number(id) },
      relations: ['farm'],
    });
    if (!asset) {
      throw new NotFoundException(`Tài sản / thiết bị với ID '${id}' không tồn tại`);
    }
    return {
      ...asset,
      farm_name: asset.farm?.name,
    };
  }

  async update(id: number, dto: UpdateAssetDto): Promise<any> {
    const asset = await this.findOne(id);

    if (dto.serial_number && dto.serial_number !== asset.serial_number) {
      const existingSerial = await this.assetRepository.findOne({
        where: { serial_number: dto.serial_number },
      });
      if (existingSerial) {
        throw new ConflictException(
          `Tài sản với số sê-ri '${dto.serial_number}' đã tồn tại trong hệ thống`,
        );
      }
    }

    Object.assign(asset, dto);
    const updated = await this.assetRepository.save(asset);
    return {
      ...updated,
      farm_name: asset.farm_name,
    };
  }

  async remove(id: number): Promise<void> {
    const asset = await this.findOne(id);
    await this.assetRepository.remove(asset);
  }
}
