import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('teachers')
export class Teacher {
    @PrimaryColumn()
    userID: number;

    @Column()
    location: string;

    @Column({ nullable: true, default: '없음' })
    subject: string;

    @Column()
    duty: string;

    @OneToOne(
        () => User,
        user => user.teacher
    )
    @JoinColumn({ name: 'userID' })
    user: User;
}