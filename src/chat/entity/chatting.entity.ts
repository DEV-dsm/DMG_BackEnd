import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

    @Column({
        default: false
    })
    isNotice: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToMany(
        () => User,
        user => user.chattingUser, {
            cascade: ["remove"]
        }
    )
    @JoinColumn({ name: 'userID'})
    thisUser: User;

    @ManyToOne(
        () => Group,
        group => group.chattingGroup, {
            cascade: ["remove"]
        }
    )
    @JoinColumn({ name: 'groupID' })
    thisGroup: Group;
}