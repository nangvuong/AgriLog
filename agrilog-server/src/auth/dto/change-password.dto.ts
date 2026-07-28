import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Mật khẩu hiện tại',
    example: 'matkhau123',
  })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @IsString()
  mat_khau_cu!: string;

  @ApiProperty({
    description: 'Mật khẩu mới (ít nhất 6 ký tự)',
    example: 'matkhaumoi123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(6, { message: 'Mật khẩu mới phải có từ 6 ký tự trở lên' })
  mat_khau_moi!: string;
}
