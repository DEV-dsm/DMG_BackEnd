import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Unique } from "typeorm";
import { User } from "./user.entity";

@Entity('students')
@Unique(['github', 'number'])
export class Student {
    @Column()
    major: string;

    @Column()
    github: string;

    @Column()
    number: number;

    @OneToOne(
        () => User
    )
    @JoinColumn({ name: 'userID' })
    @PrimaryColumn()
    userID: number;
}