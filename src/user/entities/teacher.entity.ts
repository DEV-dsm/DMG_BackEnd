import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('teachers')
export class Teacher {
    @Column()
    location: string;

    @Column({ nullable: true })
    subject: string;

    @Column()
    duty: string;

    @OneToOne(
        () => User
    )
    @JoinColumn({ name: 'userID' })
    @PrimaryColumn()
    userID: number;
}