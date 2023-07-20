import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Group } from "./group.entity";

@Entity()
export class Chatting {
    @PrimaryGeneratedColumn()
    chatID: number;

    @Column()
    userID: number;

    @ManyToMany(() => User, user => user.userID)
    thisUser: User;

    @Column()
    groupID: number;

    @ManyToOne(() => Group, group => group.groupID)
    thisGroup: Group;

    @Column()
    body: string;
}