import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserProfileDto } from '../auth/dto/auth-response.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListResponseDto } from './dto/user-list-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Lấy danh sách người dùng có lọc, tìm kiếm và phân trang
   */
  async findAll(query: UserQueryDto): Promise<UserListResponseDto> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by keyword search (ho_ten, so_dien_thoai, email)
    if (query.search && query.search.trim() !== '') {
      conditions.push(
        `(ho_ten ILIKE $${paramIndex} OR so_dien_thoai ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`,
      );
      params.push(`%${query.search.trim()}%`);
      paramIndex++;
    }

    // Filter by role
    if (query.vai_tro) {
      conditions.push(`vai_tro = $${paramIndex}`);
      params.push(query.vai_tro);
      paramIndex++;
    }

    // Filter by vung_trong_id
    if (query.vung_trong_id !== undefined) {
      conditions.push(`vung_trong_id = $${paramIndex}`);
      params.push(query.vung_trong_id);
      paramIndex++;
    }

    // Filter by trang_thai (boolean)
    if (query.trang_thai !== undefined) {
      conditions.push(`trang_thai = $${paramIndex}`);
      params.push(query.trang_thai);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total rows
    const countSql = `SELECT COUNT(*) as total FROM nguoi_dung ${whereClause}`;
    const countResult = await this.db.query(countSql, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Pagination
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const offset = (page - 1) * limit;

    const dataSql = `
      SELECT id, ho_ten, so_dien_thoai, email, vai_tro, vung_trong_id, trang_thai, ngay_tao
      FROM nguoi_dung
      ${whereClause}
      ORDER BY id ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataResult = await this.db.query(dataSql, [...params, limit, offset]);

    return {
      data: dataResult.rows,
      total,
      page,
      limit,
    };
  }

  /**
   * Lấy chi tiết thông tin 1 người dùng theo ID
   */
  async findById(id: number): Promise<UserProfileDto> {
    const querySql = `
      SELECT id, ho_ten, so_dien_thoai, email, vai_tro, vung_trong_id, trang_thai, ngay_tao
      FROM nguoi_dung
      WHERE id = $1
    `;
    const result = await this.db.query(querySql, [id]);
    const user = result.rows[0];

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID #${id}`);
    }

    return user;
  }

  /**
   * Lấy danh sách người dùng theo vai trò cụ thể (ví dụ: NONG_DAN, KY_THUAT)
   */
  async findByRole(role: string): Promise<UserProfileDto[]> {
    const querySql = `
      SELECT id, ho_ten, so_dien_thoai, email, vai_tro, vung_trong_id, trang_thai, ngay_tao
      FROM nguoi_dung
      WHERE vai_tro = $1 AND trang_thai = true
      ORDER BY ho_ten ASC
    `;
    const result = await this.db.query(querySql, [role]);
    return result.rows;
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async update(id: number, dto: UpdateUserDto): Promise<UserProfileDto> {
    // 1. Kiểm tra tồn tại
    await this.findById(id);

    // 2. Kiểm tra trùng SĐT nếu có thay đổi
    if (dto.so_dien_thoai) {
      const checkPhone = await this.db.query(
        'SELECT id FROM nguoi_dung WHERE so_dien_thoai = $1 AND id != $2',
        [dto.so_dien_thoai, id],
      );
      if (checkPhone.rows.length > 0) {
        throw new ConflictException('Số điện thoại này đã được sử dụng bởi tài khoản khác');
      }
    }

    // 3. Kiểm tra trùng Email nếu có thay đổi
    if (dto.email) {
      const checkEmail = await this.db.query(
        'SELECT id FROM nguoi_dung WHERE email = $1 AND id != $2',
        [dto.email, id],
      );
      if (checkEmail.rows.length > 0) {
        throw new ConflictException('Email này đã được sử dụng bởi tài khoản khác');
      }
    }

    // 4. Xây dựng truy vấn UPDATE động
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.ho_ten !== undefined) {
      fields.push(`ho_ten = $${idx++}`);
      values.push(dto.ho_ten);
    }
    if (dto.so_dien_thoai !== undefined) {
      fields.push(`so_dien_thoai = $${idx++}`);
      values.push(dto.so_dien_thoai);
    }
    if (dto.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(dto.email);
    }
    if (dto.vai_tro !== undefined) {
      fields.push(`vai_tro = $${idx++}`);
      values.push(dto.vai_tro);
    }
    if (dto.vung_trong_id !== undefined) {
      fields.push(`vung_trong_id = $${idx++}`);
      values.push(dto.vung_trong_id);
    }
    if (dto.trang_thai !== undefined) {
      fields.push(`trang_thai = $${idx++}`);
      values.push(dto.trang_thai);
    }

    if (fields.length === 0) {
      throw new BadRequestException('Không có trường dữ liệu nào cần cập nhật');
    }

    values.push(id);
    const updateSql = `
      UPDATE nguoi_dung
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, ho_ten, so_dien_thoai, email, vai_tro, vung_trong_id, trang_thai, ngay_tao
    `;
    const res = await this.db.query(updateSql, values);
    return res.rows[0];
  }

  /**
   * Khóa / Kích hoạt tài khoản người dùng
   */
  async updateStatus(id: number, trangThai: boolean): Promise<UserProfileDto> {
    await this.findById(id);

    const updateSql = `
      UPDATE nguoi_dung
      SET trang_thai = $1
      WHERE id = $2
      RETURNING id, ho_ten, so_dien_thoai, email, vai_tro, vung_trong_id, trang_thai, ngay_tao
    `;
    const res = await this.db.query(updateSql, [trangThai, id]);
    return res.rows[0];
  }

  /**
   * Vô hiệu hóa (xóa mềm) tài khoản người dùng
   */
  async remove(id: number): Promise<{ message: string }> {
    await this.findById(id);

    // Sử dụng xóa mềm (trang_thai = false) để giữ nguyên lịch sử nhật ký canh tác GlobalGAP
    await this.db.query(
      'UPDATE nguoi_dung SET trang_thai = false WHERE id = $1',
      [id],
    );

    return {
      message: `Đã vô hiệu hóa tài khoản người dùng ID #${id} thành công`,
    };
  }
}
