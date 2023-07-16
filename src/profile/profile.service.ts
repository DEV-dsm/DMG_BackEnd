import { ConflictException, Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
import { StudentProfileDto } from 'src/user/dto/studentProfile.dto';
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
     * 학생 프로필 조회
     */
    async getStudentProfile(accesstoken: string, userID: number): Promise<object> {
        const thisUserID = (await this.userService.validateAccess(accesstoken)).userID;

        const thisUser = await this.userEntity.findOneBy({ userID });
        const thisStudent = await this.studentEntity.findOneBy({ userID });

        if (!thisUser || !thisStudent) throw new NotFoundException();

        return Object.assign(thisUser, thisStudent);
    }

    async getStudentProfileList(accesstoken: string): Promise<object>{
        const { userID } = await this.userService.validateAccess(accesstoken);

        const userList = await this.userEntity.find({
            where: { isStudent: true },
            select: ['userID', 'name', 'profile', 'background', ]
        })

        let studentList = []

        for (let i = 0; i < userList.length; i++){
            const student = await this.studentEntity.findOne({
                where: { userID: userList[i].userID },
                select: ['number']
            })

            studentList.push(Object.assign(userList[i], student));
        }

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
        
        if(!thisUser.isStudent) throw new ConflictException('이 API는 학생 전용입니다.')

        const { identify, name, email, major, github, profile, background, number } = studentProfileDto;

        if (await this.userEntity.findOneBy({ identify })) throw new ConflictException('아이디 중복');
        if (await this.userEntity.findOneBy({ email })) throw new ConflictException('이메일 중복');

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
}