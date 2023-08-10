import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Student {
    @PrimaryColumn()
    userID: number;

    @Column({ default: '미정' })
    major: string;

    @Column({ default: '없음' })
    github: string;

    @Column({ unique: true })
    number: string;

    @OneToOne(
        () => User,
        user => user.student, {
            cascade: ["insert", "update", "remove"]
        }
    )
    @JoinColumn({ name: 'userID' })
    user: User;
}