import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeasonEntity } from './season.entity';
import { CreateSeasonDto, UpdateSeasonDto, SeasonQueryDto } from './dto';
import { PlotsService } from '../plots/plots.service';
import { CropVarietiesService } from '../crop-varieties/crop-varieties.service';
import { IPaginatedResponse } from 'agrilog-shared';
import { paginateResponse } from '../../common';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(SeasonEntity)
    private readonly seasonRepository: Repository<SeasonEntity>,
    private readonly plotsService: PlotsService,
    private readonly cropVarietiesService: CropVarietiesService,
  ) {}

  private validateDates(
    plantingDateStr: string | Date,
    expectedDateStr?: string | Date | null,
    actualDateStr?: string | Date | null,
  ): void {
    const planting = new Date(plantingDateStr);

    if (expectedDateStr) {
      const expected = new Date(expectedDateStr);
      if (expected < planting) {
        throw new BadRequestException(
          'Ngày thu hoạch dự kiến (expected_harvest_date) không được nhỏ hơn ngày xuống giống (planting_date)',
        );
      }
    }

    if (actualDateStr) {
      const actual = new Date(actualDateStr);
      if (actual < planting) {
        throw new BadRequestException(
          'Ngày thu hoạch thực tế (actual_harvest_date) không được nhỏ hơn ngày xuống giống (planting_date)',
        );
      }
    }
  }

  async create(dto: CreateSeasonDto): Promise<any> {
    // 1. Kiểm tra lô/vườn tồn tại
    const plot = await this.plotsService.findOne(dto.plot_id);

    // 2. Kiểm tra giống cây trồng tồn tại
    const variety = await this.cropVarietiesService.findOne(dto.crop_variety_id);

    // 3. Kiểm tra ràng buộc hợp lệ ngày tháng
    this.validateDates(
      dto.planting_date,
      dto.expected_harvest_date,
      dto.actual_harvest_date,
    );

    const season = this.seasonRepository.create(dto);
    const saved = await this.seasonRepository.save(season);

    return {
      ...saved,
      plot_code: plot.code,
      plot_name: plot.name,
      crop_name: variety.crop_name,
      crop_variety_name: variety.name,
    };
  }

  async findAll(query: SeasonQueryDto = {}): Promise<IPaginatedResponse<any>> {
    const { page = 1, limit = 10, plotId, cropVarietyId, status } = query;
    const whereCondition: any = {};

    if (plotId) whereCondition.plot_id = Number(plotId);
    if (cropVarietyId) whereCondition.crop_variety_id = Number(cropVarietyId);
    if (status) whereCondition.status = status;

    const [seasons, totalItems] = await this.seasonRepository.findAndCount({
      where: whereCondition,
      relations: ['plot', 'crop_variety', 'crop_variety.crop'],
      order: { planting_date: 'DESC' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const enriched = seasons.map((s) => ({
      ...s,
      plot_code: s.plot?.code,
      plot_name: s.plot?.name,
      crop_name: s.crop_variety?.crop?.name,
      crop_variety_name: s.crop_variety?.name,
    }));

    return paginateResponse(enriched, totalItems, page, limit);
  }

  async findOne(id: number): Promise<any> {
    const season = await this.seasonRepository.findOne({
      where: { id: Number(id) },
      relations: ['plot', 'crop_variety', 'crop_variety.crop'],
    });
    if (!season) {
      throw new NotFoundException(`Mùa vụ với ID '${id}' không tồn tại`);
    }

    return {
      ...season,
      plot_code: season.plot?.code,
      plot_name: season.plot?.name,
      crop_name: season.crop_variety?.crop?.name,
      crop_variety_name: season.crop_variety?.name,
    };
  }

  async update(id: number, dto: UpdateSeasonDto): Promise<any> {
    const season = await this.findOne(id);

    const targetPlantingDate = dto.planting_date || season.planting_date;
    const targetExpectedDate =
      dto.expected_harvest_date !== undefined
        ? dto.expected_harvest_date
        : season.expected_harvest_date;
    const targetActualDate =
      dto.actual_harvest_date !== undefined
        ? dto.actual_harvest_date
        : season.actual_harvest_date;

    this.validateDates(
      targetPlantingDate,
      targetExpectedDate,
      targetActualDate,
    );

    Object.assign(season, dto);
    const updated = await this.seasonRepository.save(season);

    return {
      ...updated,
      plot_code: season.plot_code,
      plot_name: season.plot_name,
      crop_name: season.crop_name,
      crop_variety_name: season.crop_variety_name,
    };
  }

  async remove(id: number): Promise<void> {
    const season = await this.findOne(id);
    await this.seasonRepository.remove(season);
  }
}
