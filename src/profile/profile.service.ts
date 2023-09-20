import { BadRequestException, ConflictException, Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { searchProfileDto } from 'src/user/dto/searchProfile.dto';
import { StudentProfileDto } from 'src/user/dto/studentProfile.dto';
import { TeacherProfileDto } from 'src/user/dto/teacherProfile.dto';
import { Student } from 'src/user/entities/student.entity';
import { Teacher } from 'src/user/entities/teacher.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@UseFilters(new HttpExceptionFilter())
@Injectable()
export class ProfileService {
    constructor(
        private userService: UserService,
        @InjectRepository(User) private userEntity: Repository<User>,
        @InjectRepository(Student) private studentEntity: Repository<Student>,
        @InjectRepository(Teacher) private teacherEntity: Repository<Teacher>,
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

        if (!thisUser || !thisStudent) throw new NotFoundException('존재하지 않는 유저');

        return Object.assign(thisUser, thisStudent);
    }

    /**
     * 
     * @param accesstoken 
     * @returns 
     * 
     * 학생 리스트 조회
     */
    async getStudentProfileList(accesstoken: string): Promise<object>{
        const { userID } = await this.userService.validateAccess(accesstoken);

        // const userList = await this.userEntity.find({
        //     where: { isStudent: true },
        //     select: ['userID', 'name', 'profile' ]
        // })

        // let studentList = []

        // for (let i = 0; i < userList.length; i++){
        //     const student = await this.studentEntity.findOne({
        //         where: { userID: userList[i].userID },
        //         select: ['number']
        //     })

        //     studentList.push(Object.assign(userList[i], student));
        // }

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
    async patchStudentProfile(accesstoken: string, studentProfileDto: StudentProfileDto): Promise<object> {
        const { userID } = await this.userService.validateAccess(accesstoken);
        
        const thisUser = await this.userEntity.findOneBy({ userID });
        const thisStudent = await this.studentEntity.findOneBy({ userID });
        
        if(!thisUser.isStudent) throw new ConflictException('이 API는 학생 전용입니다.')

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

        const updatedUser = await this.userEntity.update({
            userID
        }, {
            identify,
            name,
            email,
            profile,
            background
        })

        const updatedStudent = await this.studentEntity.update({
            userID
        }, {
            major,
            github,
            number
        })

        return {
            updatedUser,
            updatedStudent
        }
    }

    /**
     * 
     * @param accesstoken 
     * @param teacherProfileDto 
     * @returns 
     * 
     * 교사 프로필 수정
     */
    async patchTeacherProfile(accesstoken: string, teacherProfileDto: TeacherProfileDto): Promise<object> {
        const { userID } = await this.userService.validateAccess(accesstoken);

        const user = await this.userEntity.findOneBy({ userID });

        if (user.isStudent) throw new ConflictException('이 API는 교사 전용입니다.');

        const { identify, email, profile, background, location, subject, duty } = teacherProfileDto;

        if (await this.userEntity.findOneBy({ identify })) throw new ConflictException('아이디 중복');
        if (await this.userEntity.findOneBy({ email })) throw new ConflictException('이메일 중복');

        const updateUser = await this.userEntity.update({
            userID
        }, {
            identify,
            email,
            profile,
            background
        });

        const updateTeacher = await this.teacherEntity.update({
            userID
        }, {
            location,
            subject,
            duty
        });

        return {
            updateUser,
            updateTeacher
        }
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

        if (!thisUser || !thisTeacher) throw new NotFoundException('존재하지 않는 유저');

        return Object.assign(thisUser, thisTeacher);
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
     async searchProfileList(accesstoken: string, isStudent: boolean, searchProfileDto: searchProfileDto): Promise<object> {
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