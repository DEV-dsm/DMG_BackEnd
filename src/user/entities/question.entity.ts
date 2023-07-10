import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class QuestionEntity {
    @PrimaryGeneratedColumn({
        type: "integer",
    })
    questionID: number;

    @Column({
        type: "integer",
        nullable: false
    })
    userID: number;

    @ManyToOne(() => User, user => user.userID)
    @JoinColumn({ name: 'userID' })
    user: User;

    @Column({
        type: "text",
        nullable: false
    })
    title: string;

    @Column({
        type: "text",
        nullable: false
    })
    content: string;
}