import { Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpExceptionFilter } from 'src/filter/httpException.filter';
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
        @InjectRepository(User) private userEntify: Repository<User>,
        @InjectRepository(Student) private studentEntity: Repository<Student>,
        @InjectRepository(Teacher) private teacherEntity: Repository<Teacher>,
    ) { }
    
    async getStudentProfile(accesstoken: string, userID: number): Promise<object> {
        const thisUserID = (await this.userService.validateAccess(accesstoken)).userID;

        const thisUser = await this.userEntify.findOneBy({ userID });
        const thisStudent = await this.studentEntity.findOneBy({ userID });

        if (!thisUser || !thisStudent) throw new NotFoundException();

        return Object.assign(thisUser, thisStudent);
    }
}