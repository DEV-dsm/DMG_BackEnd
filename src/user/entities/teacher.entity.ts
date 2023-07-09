import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('teachers')
export class Teacher {
    @PrimaryColumn()
    userID: number;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    subject: string;

    @Column({ nullable: true })
    duty: string;

    @OneToOne(
        () => User,
        user => user.teacher
    )
    @JoinColumn({ name: 'userID' })
    user: User;
}