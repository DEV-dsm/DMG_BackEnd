import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Chatting } from "./chatting.entity";

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    groupID: number;

    @Column()
    name: string;

    @Column()
    profile: string;

    @ManyToMany(
        () => Chatting,
        chatting => chatting.thisGroup
    )
    chattingGroup: Chatting;
}