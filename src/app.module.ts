import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true, // 캐싱
      isGlobal: true, // 전역
    }),
    TypeOrmModule.forRoot({ // TypeORM
      type: 'mysql',
      host: process.env.DB_HOST, // 로컬 접속 호스트
      port: 3306, // 포트
      username: process.env.DB_USERNAME, // DB 접속 계정의 이름
      password: process.env.DB_PASSWORD, // DB 접속 계정의 비밀번호
      database: process.env.DB_NAME, // DB 테이블 이름
      entities: [ __dirname + '/**/entity/*.js'],
      synchronize: false, // false로 설정 안 하면 실행할 때마다 DB 날라감
      logging: false, // 로그찍기
      migrations: [__dirname + '/**/migrations/*.js'],
      migrationsTableName: 'migrations',
      autoLoadEntities: true,
    }),
    RedisModule.forRoot({ // 레디스
      readyLog: true,
      config: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PW,
      }
    }),
    UserModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
