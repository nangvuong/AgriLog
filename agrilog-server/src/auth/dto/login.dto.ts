import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Số điện thoại hoặc Email đăng nhập',
    example: '0901234567',
  })
  @IsNotEmpty({ message: 'Số điện thoại hoặc Email không được để trống' })
  @IsString()
  so_dien_thoai_hoac_email!: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: 'matkhau123',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  mat_khau!: string;
}
