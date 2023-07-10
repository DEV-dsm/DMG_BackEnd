import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Student } from './entities/student.entity';
import { Teacher } from './entities/teacher.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { QuestionEntity } from './entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Teacher, QuestionEntity]),
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
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
