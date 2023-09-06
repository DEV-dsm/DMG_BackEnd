import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Chatting } from "./chatting.entity";
import { GroupMapping } from "./groupMapping.entity";

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    groupID: number;

    @Column({ nullable: true })
    name: string;

    @Column({ default: "채팅방 기본 프로필 사진" })
    profile: string;

    @OneToMany(
        () => Chatting,
        chatting => chatting.thisGroup
    )
    chattingGroup: Chatting;

    @OneToMany(
        () => GroupMapping,
        groupMapping => groupMapping.group
    )
    mappingGroup: GroupMapping;
}