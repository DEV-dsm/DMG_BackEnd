import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { Repository } from 'typeorm';
import { passwordDto } from './dto/password.dto';
import { tokenDto } from './dto/token.dto';
import { Student } from './entities/student.entity';
import { Teacher } from './entities/teacher.entity';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { userPayloadDto } from './dto/userPayload.dto';
import * as bcrypt from 'bcrypt';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { createAccDevDto } from './dto/createAcc.dev.dto';

@UseFilters(new HttpExceptionFilter())
@Injectable()
export class UserService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
        @InjectRepository(Student) private studentEntity: Repository<Student>,
        @InjectRepository(Teacher) private teacherEntity: Repository<Teacher>,
        @InjectRepository(User) private userEntity: Repository<User>,
        private jwt: JwtService,
    ) {
        this.redis = redis;
    }
    /**
     * 
     * @param userDto 
     * @returns UserAccount
     * 
     * 회원가입
     */

    async createAcc(userDto: createAccDevDto) {
        const { identify, name, password, email, isStudent } = userDto;

        // 아이디 중복 제거
        const havingThisUserByID = await this.userEntity.findOneBy({ identify });
        if (havingThisUserByID) throw new ConflictException('아이디 중복');

        // 이메일 중복 제거
        const havingThisUserByEmail = await this.userEntity.findOneBy({ email });
        if (havingThisUserByEmail) throw new ConflictException('이메일 중복');

        const hashedPW = await bcrypt.hash(password, 10);

        // 학생일 경우
        if (isStudent) {
            const { major, github, number } = userDto;

            const thisUser = await this.userEntity.save({
                identify,
                name,
                password: hashedPW,
                email,
                isStudent: true,
                major,
                github,
                number
            })

            return thisUser;
        }
        
        // 교사일 경우
        const { location, subject, duty } = userDto;

        const thisUser = await this.userEntity.save({
            identify,
            name,
            password: hashedPW,
            email,
            isStudent: false,
            location,
            subject,
            duty
        })

        return thisUser;
    }
 }
