import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginRequestDto,
  RegisterRequestDto,
  RefreshTokenRequestDto,
  AuthResponseDto,
  UserProfileDto,
} from './dto';
import {
  CurrentUser,
  Roles,
  JwtAuthGuard,
  JwtRefreshGuard,
  RolesGuard,
} from '../../common';
import { UserRole } from 'agrilog-shared';

@ApiTags('Auth & Authorization')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản người dùng nông nghiệp mới',
    description: 'Tạo tài khoản và cấp cặp token JWT (Access + Refresh Token)',
  })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Tên đăng nhập hoặc Email đã tồn tại',
  })
  async register(@Body() dto: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập vào hệ thống',
    description: 'Xác thực tài khoản và trả về cặp JWT Token',
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Tên đăng nhập hoặc mật khẩu không chính xác',
  })
  async login(@Body() dto: LoginRequestDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cấp mới JWT Access Token từ Refresh Token (Token Rotation)',
    description:
      'Gửi Refresh Token để nhận cặp Access Token & Refresh Token mới, thu hồi token cũ',
  })
  @ApiResponse({
    status: 200,
    description: 'Làm mới Token thành công',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh Token không hợp lệ hoặc đã hết hạn',
  })
  async refresh(
    @CurrentUser('sub') userId: number,
    @Body() dto: RefreshTokenRequestDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(userId, dto.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Đăng xuất khỏi hệ thống & thu hồi Refresh Token trong Redis',
    description: 'Xóa refresh token hash trong Redis Cache để thu hồi token, chấm dứt quyền tái tạo Access Token',
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng xuất thành công, Refresh Token đã bị thu hồi khỏi Redis Cache',
  })
  async logout(@CurrentUser('id') userId: number): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: 'Logged out successfully, Refresh Token revoked from Redis Cache' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy thông tin tài khoản hiện tại (Me)',
    description: 'Yêu cầu JWT Access Token hợp lệ trong Authorization Header',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công',
    type: UserProfileDto,
  })
  async getProfile(@CurrentUser('id') userId: number): Promise<UserProfileDto> {
    return this.authService.getProfile(userId);
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kiểm tra phân quyền (RBAC) - Chỉ dành cho Quản trị viên (ADMIN)',
    description:
      'Endpoint kiểm thử Role-based Authorization: Chỉ ADMIN mới được phép truy cập',
  })
  @ApiResponse({
    status: 200,
    description: 'Truy cập hợp lệ với quyền ADMIN',
  })
  @ApiResponse({
    status: 403,
    description: 'Không đủ quyền truy cập (Forbidden)',
  })
  async getAdminOnlyData(@CurrentUser() user: any) {
    return {
      message: 'Hello Admin! You have access to this restricted agricultural area.',
      user,
    };
  }

  @Get('manager-or-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kiểm tra phân quyền (RBAC) - Dành cho ADMIN & MANAGER',
    description:
      'Endpoint kiểm thử Role-based Authorization cho nhiều vai trò quản lý trang trại',
  })
  async getManagerOrAdminData(@CurrentUser() user: any) {
    return {
      message: 'Access granted to agricultural management personnel.',
      user,
    };
  }
}
