import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/user/entities/question.entity';
import { Student } from 'src/user/entities/student.entity';
import { Teacher } from 'src/user/entities/teacher.entity';
import { User } from 'src/user/entities/user.entity';
import { Group } from './entity/group.entity';
import { GroupMapping } from './entity/groupMapping.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserService } from 'src/user/user.service';
import { Chatting } from './entity/chatting.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Student, Teacher, Question, Group, GroupMapping, Chatting]),
		JwtModule.register({
		secret: process.env.SECRETORPRIVATE,
		signOptions: {
			expiresIn: '4h',
		},
		verifyOptions: {
			complete: false
		}
		})
	],
	providers: [ChatGateway, ChatService, UserService],
	controllers: [ChatController]
})
export class ChatModule {}
