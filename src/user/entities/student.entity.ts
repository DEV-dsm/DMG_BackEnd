import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('students')
export class Student {
    @PrimaryColumn()
    userID: number;

    @Column({ nullable: true })
    major: string;

    @Column({ nullable: true })
    github: string;

    @Column({ nullable: true })
    number: number;

    @OneToOne(
        () => User,
        user => user.student
    )
    @JoinColumn({ name: 'userID' })
    user: User;
}