import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException, UseFilters } from '@nestjs/common';
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
import { LoginUserDto } from './dto/login-user.dto';

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
        const { identify, name, password, email, isStudent, profile, background } = userDto;

        // 아이디 중복 확인
        const havingThisUserByID = await this.userEntity.findOneBy({ identify });
        if (havingThisUserByID) throw new ConflictException('아이디 중복');

        // 이메일 중복 확인
        const havingThisUserByEmail = await this.userEntity.findOneBy({ email });
        if (havingThisUserByEmail) throw new ConflictException('이메일 중복');

        const hashedPW = await bcrypt.hash(password, 10);

        await this.userEntity.save({
            identify,
            name,
            password: hashedPW,
            email,
            isStudent,
            profile,
            background
        })

        // 학생, 교사 테이블에 userID 값을 넣기위한 코드
        const findUser = await this.userEntity.findOneBy({ identify });

        // 학생일 경우
        if (isStudent) {
            const { major, github, number } = userDto;

            const student = await this.studentEntity.save({
                userID: findUser.userID,
                user: findUser,
                major,
                github,
                number
            })

            return {
                student
            }
        }
        
        // 교사일 경우
        const { location, subject, duty } = userDto;

        const teacher = await this.teacherEntity.save({
            userID: findUser.userID,
            user: findUser,
            location,
            subject,
            duty
        })

        return {
            teacher
        }
    }

    /**
     * 
     * @param userDto 
     * @returns UserAccount
     * 
     * 로그인
     */
    async login(userDto: LoginUserDto): Promise<object> {
        const { identify, password } = userDto;

        const user = await this.userEntity.findOneBy({ identify });

        if (!user) throw new NotFoundException('존재하지 않는 유저');

        // 비밀번호 비교
        const isMatching = await bcrypt.compare(password, user.password);
        if (!isMatching) throw new ConflictException('비밀번호 불일치');

        const payload = {
            userID: user.userID,
            identify
        }

        const access = await this.generateAccess(payload);
        const refresh = await this.generateRefresh(payload);

        return {
            access,
            refresh
        }
    }
    
    /**
     * 
     * @param userDto 
     * @returns AccessToken: string
     * 
     * 액세스 토큰 발급
     */
    async generateAccess(userDto: userPayloadDto): Promise<string> {
        const accessToken = await this.jwt.sign(userDto, {
            secret: process.env.JWT_SECRET_ACCESS
        })

        return `Bearer ${accessToken}`;
    }

    /**
     * 
     * @param userDto 
     * @returns RefreshToken: string
     * 
     * 리프레시 토큰 발급
     */
    async generateRefresh(userDto: userPayloadDto): Promise<string> {
        // 리프레시 토큰 만료시간 : 48시간
        const refreshToken = await this.jwt.sign(userDto, {
            secret: process.env.JWT_SECRET_REFRESH,
            expiresIn: '48h'
        })

        return `Bearer ${refreshToken}`;
    }

    /**
     * 
     * @param tokenDto 
     * @returns { userID: number, identify: string, iat: number, exp: number }
     * 
     * 토큰 검증
     */
    async validateAccess(accesstoken: string): Promise<userPayloadDto> {
        // Bearer Token에서 순수 jwt값만 분리
        const accessToken = accesstoken.split(' ')[1];

        // 액세스 토큰 검증
        const access = await this.jwt.verify(accessToken, {
            secret: process.env.JWT_SECRET_ACCESS
        })
            
        // 검증되지 않은 액세스 토큰
        if (!access) throw new UnauthorizedException("리프레시 토큰 검증 필요");

        return access;
    }

    async validateRefresh(refreshtoken: string): Promise<userPayloadDto>{
        // Bearer Token에서 순수 jwt값만 분리
        const refreshToken = refreshtoken.split(' ')[1];

        // 리프레시 토큰 검증
        const refresh = await this.jwt.verify(refreshToken, {
            secret: process.env.JWT_SECRET_REFRESH
        })

        // 검증되지 않은 리프레시 토큰
        if (!refresh) throw new UnauthorizedException("재로그인 필요");

        return refresh;
    }

	/**
     * 
     * @param tokenDto 
     * @param pwSet 
     * @returns UserAccount
     * 
     * 비밀번호 수정
     */
    async patchPW(accesstoken: string, pwSet: passwordDto): Promise<object> {
        const { userID } = await this.validateAccess(accesstoken);

        const thisUser = await this.userEntity.findOneBy({ userID });

        if (!thisUser) throw new NotFoundException();

        // 비밀번호 비교
        if (!await bcrypt.compare(pwSet.password, thisUser.password)) throw new ConflictException('비밀번호 불일치');
        if (pwSet.password == pwSet.newPassword) throw new ConflictException('기존 비밀번호와 새 비밀번호 일치');
        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pwSet.newPassword)) throw new ConflictException('비밀번호 규칙 미반영')

        // 새로운 비밀번호 해싱
        const newHashedPW = await bcrypt.hash(pwSet.newPassword, 10)

        // 유저 엔티티 업데이트
        const patchedUser = await this.userEntity.update({
            userID,
        }, {
            password: newHashedPW,
        })

        return patchedUser;
    }
}