import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserProfileDto } from '../auth/dto/auth-response.dto';
import { UsersService } from './users.service';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto, UpdateUserStatusDto } from './dto/update-user.dto';
import { UserListResponseDto } from './dto/user-list-response.dto';

@ApiTags('Users - Quản Lý Người Dùng')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách người dùng trong hệ thống (có lọc, tìm kiếm và phân trang)',
    description:
      'Hỗ trợ tìm kiếm theo từ khóa họ tên/sđt/email, lọc theo vai trò (nong_dan, quan_ly, ky_thuat...), vùng trồng và trạng thái',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách người dùng phân trang thành công',
    type: UserListResponseDto,
  })
  async findAll(@Query() query: UserQueryDto): Promise<UserListResponseDto> {
    return this.usersService.findAll(query);
  }

  @Get('role/:role')
  @ApiOperation({
    summary: 'Lấy danh sách người dùng đang hoạt động theo vai trò',
    description: 'Ví dụ: /users/role/nong_dan hoặc /users/role/ky_thuat',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách người dùng có vai trò tương ứng',
    type: [UserProfileDto],
  })
  async findByRole(@Param('role') role: string): Promise<UserProfileDto[]> {
    return this.usersService.findByRole(role);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết hồ sơ người dùng theo ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin chi tiết người dùng',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy người dùng',
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserProfileDto> {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Cập nhật toàn bộ thông tin người dùng',
    description: 'Cập nhật họ tên, số điện thoại, email, vai trò, vùng trồng quản lý',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật người dùng thành công',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Số điện thoại hoặc email bị trùng với người dùng khác',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    return this.usersService.update(id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật một phần thông tin người dùng (PATCH)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật người dùng thành công',
    type: UserProfileDto,
  })
  async patchUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Khóa / Kích hoạt tài khoản người dùng',
    description: 'Đổi trạng thái trang_thai = true (mở khóa) hoặc false (khóa)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái tài khoản thành công',
    type: UserProfileDto,
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateStatus(id, dto.trang_thai);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Vô hiệu hóa (xóa mềm) tài khoản người dùng',
    description: 'Chuyển trạng thái trang_thai = false để giữ lịch sử canh tác chuẩn GlobalGAP',
  })
  @ApiResponse({
    status: 200,
    description: 'Vô hiệu hóa tài khoản thành công',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.usersService.remove(id);
  }
}
