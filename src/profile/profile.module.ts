import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { Student } from 'src/user/entities/student.entity';
import { Teacher } from 'src/user/entities/teacher.entity';
import { Question } from 'src/user/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Teacher, Question]),
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
  providers: [ProfileService, UserService],
  controllers: [ProfileController]
})
export class ProfileModule {}
