import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép Private Network Access (PNA) từ Chrome/Safari khi gọi từ HTTPS (ngrok) xuống HTTP (local server)
  app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Private-Network', 'true');
    next();
  });

  // Kích hoạt CORS cho ứng dụng Web Frontend (cho phép tất cả origin bao gồm ngrok, localhost, LAN IP)
  app.enableCors({
    origin: (
      requestOrigin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders:
      'Content-Type, Accept, Authorization, X-Requested-With, ngrok-skip-browser-warning, Access-Control-Request-Private-Network',
  });

  // Thiết lập tiền tố /api cho tất cả endpoints
  app.setGlobalPrefix('api');

  // Kiểm tra & xác thực dữ liệu đầu vào tự động bằng Class Validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Cấu hình tài liệu Swagger API
  const config = new DocumentBuilder()
    .setTitle('AgriLog API — Nhật ký Canh tác Nông nghiệp Thông minh')
    .setDescription(
      'Hệ thống RESTful API cho quản lý trang trại, cây trồng và nhật ký canh tác điện tử đa năng.\n\n' +
        '**Kiến trúc Bảo mật & Phân quyền:**\n' +
        '- **Authentication:** Sử dụng chuẩn JWT Access Token + Refresh Token Rotation.\n' +
        '- **Refresh Token Storage:** Không lưu trong CSDL PostgreSQL, toàn bộ Refresh Token được mã hóa (`bcryptjs`) và lưu trữ bảo mật trên **Redis Cache** với TTL 7 ngày.\n' +
        '- **Revocation & Logout:** Endpoint `POST /api/auth/logout` xóa token ngay lập tức khỏi Redis.\n' +
        '- **Authorization (RBAC):** Kiểm soát quyền hạn truy cập đa vai trò (`ADMIN`, `FARMER`, `MANAGER`, `VIEWER`).',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT Access Token hợp lệ vào đây',
        in: 'header',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`🚀 AgriLog Server is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger documentation is available at: http://localhost:${port}/api/docs`);
}

void bootstrap();