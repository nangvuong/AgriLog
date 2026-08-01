import { ApiProperty } from '@nestjs/swagger';
import type { IUserListResponse } from 'agrilog-shared';
import { UserProfileDto } from '../../auth/dto/auth-response.dto';

export class UserListResponseDto implements IUserListResponse {
  @ApiProperty({
    type: [UserProfileDto],
    description: 'Danh sách hồ sơ người dùng trong hệ thống',
  })
  data!: UserProfileDto[];

  @ApiProperty({
    example: 10,
    description: 'Tổng số người dùng thỏa mãn điều kiện lọc',
  })
  total!: number;

  @ApiProperty({
    example: 1,
    description: 'Trang hiện tại',
  })
  page!: number;

  @ApiProperty({
    example: 20,
    description: 'Số lượng kết quả hiển thị mỗi trang',
  })
  limit!: number;
}
