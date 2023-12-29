import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { SearchProfileDto } from 'src/profile/dto/searchProfile.dto';
import { Student } from 'src/user/entities/student.entity';
import { Teacher } from 'src/user/entities/teacher.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { UpdateStudentProfileDto } from './dto/updateStudentProfile.dto';
import { UpdateTeacherProfileDto } from './dto/updateTeacherProfile.dto';

@UseFilters(new HttpExceptionFilter())
@Injectable()
export class ProfileService {
    constructor(
        private userService: UserService,
        @InjectRepository(User) private userEntity: Repository<User>,
        @InjectRepository(Student) private studentEntity: Repository<Student>,
        @InjectRepository(Teacher) private teacherEntity: Repository<Teacher>,
        @InjectRedis() private readonly redis: Redis,
    ) { }
    
    /**
     * 
     * @param accesstoken 
     * @param userID 
     * @returns 
     * 
     * 특정 학생 프로필 조회
     */
    async getStudentProfile(accesstoken: string, userID: number): Promise<object> {
        await this.userService.validateAccess(accesstoken);

        const thisUser = await this.userEntity.findOneBy({ userID });
        const thisStudent = await this.studentEntity.findOneBy({ userID });

        let isOnline = false;

        if (!thisUser || !thisStudent) throw new NotFoundException('존재하지 않는 유저');
        if(await this.redis.get(`${userID}AccessToken`)) isOnline = true

        return Object.assign(thisUser, thisStudent, {isOnline});
    }

    /**
     * 
     * @param accesstoken 
     * @returns 
     * 
     * 학생 리스트 조회
     */
    async getStudentProfileList(accesstoken: string): Promise<object>{
        await this.userService.validateAccess(accesstoken);

        const studentList = await this.userEntity
            .createQueryBuilder('qb')
            .innerJoin("qb.student", "student")
            .select(['qb.userID', 'name', 'profile', 'number'])
            .where("qb.isStudent = :isStudent", { isStudent: true })
            .getRawMany();

        return studentList;
    }

    /**
     * 
     * @param accesstoken 
     * @param studentProfileDto
     * @returns 
     * 
     * 학생 프로필 수정
     */
    async patchStudentProfile(accesstoken: string, studentProfileDto: UpdateStudentProfileDto) {
        const { userID } = await this.userService.validateAccess(accesstoken);
        
        const thisUser = await this.userEntity.findOneBy({ userID });
        const thisStudent = await this.studentEntity.findOneBy({ userID });
        
        if(!thisUser.isStudent) throw new ForbiddenException('이 API는 학생 전용입니다.')

        const identify = studentProfileDto.identify ?? thisUser.identify;
        const name = studentProfileDto.name ?? thisUser.name;
        const email = studentProfileDto.email ?? thisUser.email;
        const profile = studentProfileDto.profile ?? thisUser.profile;
        const background = studentProfileDto.background ?? thisUser.background;
        const number = studentProfileDto.number ?? thisStudent.number;
        const github = studentProfileDto.github ?? thisStudent.github;
        const major = studentProfileDto.major ?? thisStudent.major;

        if (await this.userEntity.findOneBy({ identify }) && (identify != thisUser.identify)) throw new ConflictException('아이디 중복');
        if (await this.userEntity.findOneBy({ email }) && (email != thisUser.email)) throw new ConflictException('이메일 중복');

        await this.userEntity.update({
            userID
        }, {
            identify,
            name,
            email,
            profile,
            background
        })

        await this.studentEntity.update({
            userID
        }, {
            major,
            github,
            number
        })
    }

    /**
     * 
     * @param accesstoken 
     * @param teacherProfileDto 
     * @returns 
     * 
     * 교사 프로필 수정
     */
    async patchTeacherProfile(accesstoken: string, teacherProfileDto: UpdateTeacherProfileDto) {
        const { userID } = await this.userService.validateAccess(accesstoken);

        const thisUser = await this.userEntity.findOneBy({ userID });
        const thisTeacher = await this.teacherEntity.findOneBy({ userID });

        if (thisUser.isStudent) throw new ForbiddenException('이 API는 교사 전용입니다.');

        const identify = teacherProfileDto.identify ?? thisUser.identify;
        const name = teacherProfileDto.name ?? thisUser.name;
        const email = teacherProfileDto.email ?? thisUser.email;
        const profile = teacherProfileDto.profile ?? thisUser.profile;
        const background = teacherProfileDto.background ?? thisUser.background;
        const location = teacherProfileDto.location ?? thisTeacher.location;
        const subject = teacherProfileDto.subject ?? thisTeacher.subject;
        const duty = teacherProfileDto.duty ?? thisTeacher.duty

        if (await this.userEntity.findOneBy({ identify }) && (identify != thisUser.identify)) throw new ConflictException('아이디 중복');
        if (await this.userEntity.findOneBy({ email }) && (email != thisUser.email)) throw new ConflictException('이메일 중복');

        await this.userEntity.update({
            userID
        }, {
            identify,
            name,
            email,
            profile,
            background
        });

        await this.teacherEntity.update({
            userID
        }, {
            location,
            subject,
            duty
        });
    }
    
    /**
     * 
     * @param accesstoken 
     * @param userID 
     * @returns 
     * 
     * 특정 교사 프로필 조회
     */
    async getTeacherProfile(accesstoken: string, userID: number): Promise<object> {
        await this.userService.validateAccess(accesstoken);

        const thisUser = await this.userEntity.findOneBy({ userID });
        const thisTeacher = await this.teacherEntity.findOneBy({ userID });

        let isOnline = false;

        if (!thisUser || !thisTeacher) throw new NotFoundException('존재하지 않는 유저');
        if(await this.redis.get(`${userID}AccessToken`)) isOnline = true

        return Object.assign(thisUser, thisTeacher, {isOnline});
    }

    /**
     * 
     * @param accesstoken 
     * @returns 
     * 
     * 교사 리스트 조회
     */
    async getTeacherProfileList(accesstoken: string) {
        await this.userService.validateAccess(accesstoken);

        // userID, name, profile, isStudent, subject
        const result = await this.userEntity
            .createQueryBuilder("user")
            .innerJoin("user.teacher", "teacher")
            .select(['user.userID', 'name', 'profile', 'subject'])
            .where("user.isStudent = :isStudent", { isStudent: false })
            .getRawMany()

        return result;
    }

    /**
     * 
     * @param accesstoken 
     * @param isStudent 
     * @param searchProfileDto
     * @returns 
     * 
     * 유저 검색
     */
    async searchProfileList(accesstoken: string, isStudent: boolean, searchProfileDto: SearchProfileDto): Promise<object> {
        const { standard, keyword } = searchProfileDto;
        if(standard != 'number' && standard != 'name') throw new BadRequestException('잘못된 요청');
        
        await this.userService.validateAccess(accesstoken);

        // 학생 검색
        if (isStudent) {
            if (standard == 'number') {
                const studentList = await this.userEntity
                    .createQueryBuilder("user")
                    .innerJoin("user.student", "student")
                    .select(["user.userID", "name", "profile", "number"])
                    .where("user.isStudent = :isStudent", { isStudent: true })
                    .andWhere("student.number LIKE :number", { number: `%${keyword}%`})
                    .getRawMany();

                return studentList;
                
            }
            const studentList = await this.userEntity
                .createQueryBuilder("user")
                .innerJoin("user.student", "student")
                .select(["user.userID", "name", "profile", "number"])
                .where("user.isStudent = :isStudent", { isStudent: true })
                .andWhere("user.name LIKE :name", { name: `%${keyword}%`})
                .getRawMany();

            return studentList;
        } else {
            if(standard == 'number') throw new BadRequestException('잘못된 요청');
            // 교사 검색
            const teacherList = await this.userEntity
                .createQueryBuilder("user")
                .innerJoin("user.teacher", "teacher")
                .select(["user.userID", "name", "profile", "subject"])
                .where("user.isStudent = :isStudent", { isStudent: false })
                .andWhere("user.name LIKE :name", { name: `%${keyword}%`})
                .getRawMany();

            return teacherList;
        }
    }
}