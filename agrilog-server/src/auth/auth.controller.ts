import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication - Người Dùng')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản mới trong chuỗi cung ứng bưởi',
    description:
      'Đăng ký tài khoản nông dân, quản lý, kỹ thuật, kiểm định hoặc xuất khẩu',
  })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công, trả về access_token và thông tin user',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Số điện thoại hoặc Email đã tồn tại trong hệ thống',
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập vào hệ thống',
    description: 'Đăng nhập bằng số điện thoại hoặc email kèm mật khẩu',
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về access_token và thông tin user',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Số điện thoại/Email hoặc Mật khẩu không hợp lệ',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy thông tin tài khoản đang đăng nhập',
    description: 'Yêu cầu Header Authorization: Bearer <access_token>',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin hồ sơ người dùng hiện tại',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token không hợp lệ',
  })
  async getProfile(@Request() req: any): Promise<UserProfileDto> {
    // req.user được gán từ JwtStrategy.validate()
    return this.authService.getProfile(req.user.id);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Đổi mật khẩu người dùng',
    description: 'Yêu cầu Header Authorization: Bearer <access_token>',
  })
  @ApiResponse({
    status: 200,
    description: 'Đổi mật khẩu thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Mật khẩu cũ không chính xác',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token không hợp lệ',
  })
  async changePassword(
    @Request() req: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(req.user.id, dto);
  }
}
