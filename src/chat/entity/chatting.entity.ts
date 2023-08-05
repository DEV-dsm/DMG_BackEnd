import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Group } from "./group.entity";

@Entity()
export class Chatting {
    @PrimaryGeneratedColumn()
    chatID: number;

    @Column()
    userID: number;

    @Column()
    groupID: number;

    @Column()
    body: string;

    @ManyToMany(() => User, user => user.chattingUser)
    @JoinColumn({ name: 'userID'})
    thisUser: User;

    @ManyToOne(() => Group, group => group.chattingGroup)
    @JoinColumn({ name: 'groupID' })
    thisGroup: Group;
}