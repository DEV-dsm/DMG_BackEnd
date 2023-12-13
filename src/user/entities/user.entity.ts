import { Chatting } from "src/chat/entity/chatting.entity";
import { GroupMapping } from "src/chat/entity/groupMapping.entity";
import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./question.entity";
import { Student } from "./student.entity";
import { Teacher } from "./teacher.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userID: number;

    @Column({ unique: true })
    identify: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column()
    profile: string;

    @Column()
    background: string;

    @Column()
    isStudent: boolean;

    @OneToOne(
        () => Student,
        student => student.user
    )
    student: Student;

    @OneToOne(
        () => Teacher,
        teacher => teacher.user
    )
    teacher: Teacher;

    @OneToMany(
        () => Question,
        question => question.user
    )
    question: Question[];

    @ManyToMany(
        () => Chatting,
        chatting => chatting.thisUser
    )
    chattingUser: Chatting;

    @OneToOne(
        () => GroupMapping,
        groupMapping => groupMapping.user
    )
    mappingUser: GroupMapping;
}