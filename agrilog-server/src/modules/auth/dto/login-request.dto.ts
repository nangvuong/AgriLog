import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ILoginRequestDto } from 'agrilog-shared';

export class LoginRequestDto implements ILoginRequestDto {
  @ApiProperty({
    example: 'nongdan_tu',
    description: 'Tên đăng nhập của người dùng',
  })
  @IsNotEmpty()
  @IsString()
  username!: string;

  @ApiProperty({
    example: 'matkhau123',
    description: 'Mật khẩu tài khoản',
  })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
