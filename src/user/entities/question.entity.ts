import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Question {
    @PrimaryGeneratedColumn({ type: "integer" })
    questionID: number;

    @Column({ type: "integer" })
    userID: number;

    @Column({ type: "text" })
    title: string;

    @Column({ type: "text" })
    content: string;

    @ManyToOne(() => User, user => user.userID)
    @JoinColumn({ name: 'userID' })
    user: User;
}