import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { VaiTroNguoiDung } from 'agrilog-shared';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Đăng ký tài khoản người dùng mới
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // 1. Kiểm tra xem số điện thoại hoặc email đã tồn tại chưa
    if (dto.so_dien_thoai) {
      const checkPhone = await this.db.query(
        'SELECT id FROM nguoi_dung WHERE so_dien_thoai = $1',
        [dto.so_dien_thoai],
      );
      if (checkPhone.rows.length > 0) {
        throw new ConflictException('Số điện thoại này đã được sử dụng');
      }
    }

    if (dto.email) {
      const checkEmail = await this.db.query(
        'SELECT id FROM nguoi_dung WHERE email = $1',
        [dto.email],
      );
      if (checkEmail.rows.length > 0) {
        throw new ConflictException('Email này đã được sử dụng');
      }
    }

    // 2. Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const matKhauHash = await bcrypt.hash(dto.mat_khau, salt);

    // 3. Chèn vào DB
    const insertQuery = `
      INSERT INTO nguoi_dung (
        ho_ten, so_dien_thoai, email, mat_khau_hash, vai_tro, vung_trong_id, trang_thai
      ) VALUES ($1, $2, $3, $4, $5, $6, TRUE)
      RETURNING id, ho_ten, so_dien_thoai, email, vai_tro, vung_trong_id, trang_thai, ngay_tao
    `;
    const vaiTro = dto.vai_tro || VaiTroNguoiDung.NONG_DAN;
    const params = [
      dto.ho_ten,
      dto.so_dien_thoai || null,
      dto.email || null,
      matKhauHash,
      vaiTro,
      dto.vung_trong_id || null,
    ];

    const result = await this.db.query(insertQuery, params);
    const user: UserProfileDto = result.rows[0];

    // 4. Tạo JWT Token
    const payload: JwtPayload = {
      sub: user.id,
      so_dien_thoai: user.so_dien_thoai,
      email: user.email,
      vai_tro: user.vai_tro,
      vung_trong_id: user.vung_trong_id,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user,
    };
  }

  /**
   * Đăng nhập vào hệ thống bằng số điện thoại hoặc email
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const findQuery = `
      SELECT id, ho_ten, so_dien_thoai, email, mat_khau_hash, vai_tro, vung_trong_id, trang_thai, ngay_tao
      FROM nguoi_dung
      WHERE so_dien_thoai = $1 OR email = $1
    `;
    const result = await this.db.query(findQuery, [dto.so_dien_thoai_hoac_email]);
    const user = result.rows[0];

    if (!user) {
      throw new UnauthorizedException(
        'Số điện thoại/Email hoặc Mật khẩu không chính xác',
      );
    }

    if (!user.trang_thai) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.mat_khau,
      user.mat_khau_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Số điện thoại/Email hoặc Mật khẩu không chính xác',
      );
    }

    // Xóa trường mật khẩu hash trước khi trả về
    delete user.mat_khau_hash;

    const payload: JwtPayload = {
      sub: user.id,
      so_dien_thoai: user.so_dien_thoai,
      email: user.email,
      vai_tro: user.vai_tro,
      vung_trong_id: user.vung_trong_id,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user,
    };
  }

  /**
   * Lấy thông tin tài khoản hiện tại
   */
  async getProfile(userId: number): Promise<UserProfileDto> {
    const query = `
      SELECT id, ho_ten, so_dien_thoai, email, vai_tro, vung_trong_id, trang_thai, ngay_tao
      FROM nguoi_dung
      WHERE id = $1
    `;
    const result = await this.db.query(query, [userId]);
    const user = result.rows[0];

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
    }

    return user;
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
    const query = `
      SELECT id, mat_khau_hash
      FROM nguoi_dung
      WHERE id = $1
    `;
    const result = await this.db.query(query, [userId]);
    const user = result.rows[0];

    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    const isOldPasswordValid = await bcrypt.compare(
      dto.mat_khau_cu,
      user.mat_khau_hash,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(dto.mat_khau_moi, salt);

    await this.db.query(
      'UPDATE nguoi_dung SET mat_khau_hash = $1 WHERE id = $2',
      [newHash, userId],
    );

    return { message: 'Đổi mật khẩu thành công' };
  }
}
