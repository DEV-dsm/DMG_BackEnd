import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { ChatModule } from './chat/chat.module';
import { SlackModule } from 'nestjs-slack-webhook';
import slackConfig from './config/slack.config';
import { configDotenv } from 'dotenv';

configDotenv()

@Module({
	imports: [
		ConfigModule.forRoot({
    	  // Slack
		envFilePath: `${process.cwd()}/.${process.env.NODE_ENV}.env`,
      	cache: true, // 캐싱
      	isGlobal: true, // 전역
		load: [slackConfig],
		}),
		SlackModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (config: ConfigService) => ({
				url: config.get<string>('SLACK'),
				
			}),
		}),
		TypeOrmModule.forRoot({
			// TypeORM
			type: 'mysql',
			host: process.env.DB_HOST, // 로컬 접속 호스트
			port: 3306, // 포트
			username: process.env.DB_USERNAME, // DB 접속 계정의 이름
			password: process.env.DB_PASSWORD, // DB 접속 계정의 비밀번호
			database: process.env.DB_NAME, // DB 테이블 이름
			entities: [__dirname + '/**/entity/*.js'],
			synchronize: true, // false로 설정 안 하면 실행할 때마다 DB 날라감
			logging: false, // 로그찍기
			migrations: [__dirname + '/**/migrations/*.js'],
			migrationsTableName: 'migrations',
			autoLoadEntities: true,
			timezone: 'Asia/Seoul',
		}),
		RedisModule.forRoot({
			// 레디스
			readyLog: true,
			config: {
				host: process.env.REDIS_HOST,
				port: Number(process.env.REDIS_PORT),
				password: process.env.REDIS_PW,
			},
		}),
		UserModule,
		ProfileModule,
		ChatModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
