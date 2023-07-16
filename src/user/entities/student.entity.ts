import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('students')
export class Student {
    @PrimaryColumn()
    userID: number;

    @Column({ nullable: true, default: '미정' })
    major: string;

    @Column({ nullable: true, default: '없음' })
    github: string;

    @Column({
        unique: true
    })
    number: number;

    @OneToOne(
        () => User,
        user => user.student, {
            cascade: ["insert", "update", "remove"]
        }
    )
    @JoinColumn({ name: 'userID' })
    user: User;
}