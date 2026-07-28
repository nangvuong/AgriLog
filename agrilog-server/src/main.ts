import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Kích hoạt CORS
  app.enableCors();

  // 2. Thiết lập Global Prefix cho API
  app.setGlobalPrefix('api/v1');

  // 3. Kích hoạt Global ValidationPipe để kiểm tra DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 4. Cấu hình Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('API Nhật Ký Bưởi Xuất Khẩu (AgriLog Server)')
    .setDescription(
      'Tài liệu API hệ thống Nhật ký điện tử cho người trồng bưởi xuất khẩu, truy xuất nguồn gốc, quản lý vườn trồng và xuất khẩu.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT token theo định dạng: Bearer <token>',
        in: 'header',
      },
      'bearer', // tên security scheme
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
    },
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  logger.log(`Server đang chạy tại: http://localhost:${port}/api/v1`);
  logger.log(
    `Swagger API Docs có sẵn tại: http://localhost:${port}/api/docs`,
  );
}

void bootstrap();