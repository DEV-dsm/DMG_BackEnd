import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Student } from "./student.entity";
import { Teacher } from "./teacher.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    userID: number;

    @Column()
    identify: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    profile: string;

    @Column({ nullable: true })
    background: string;

    @Column({ default: true })
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
}