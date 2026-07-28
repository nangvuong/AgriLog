import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../database/database.service';

export interface JwtPayload {
  sub: number;
  so_dien_thoai?: string;
  email?: string;
  vai_tro: string;
  vung_trong_id?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly db: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'agrilog-secret-key-2026',
    });
  }

  async validate(payload: JwtPayload) {
    const query = `
      SELECT id, ho_ten, so_dien_thoai, email, vai_tro, vung_trong_id, trang_thai, ngay_tao
      FROM nguoi_dung
      WHERE id = $1
    `;
    const result = await this.db.query(query, [payload.sub]);
    const user = result.rows[0];

    if (!user || !user.trang_thai) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa');
    }

    return user;
  }
}
