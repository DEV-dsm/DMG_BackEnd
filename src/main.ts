import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

const port = process.env.PORT || 8000

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('DMG') // 문서 제목
    .setDescription('DMG : ') // 문서 설명 (README)
    .setVersion('1.0.0') // 버전
    .addTag('DMG') // 태그
    .build(); // 생성 함수
  const doc = SwaggerModule.createDocument(app, config) // 자동화 문서 생성

  SwaggerModule.setup('', app, doc); // document 주소

  app.enableCors();
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(port);
}
bootstrap();