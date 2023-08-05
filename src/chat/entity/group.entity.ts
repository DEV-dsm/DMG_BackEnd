import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Chatting } from "./chatting.entity";
import { GroupMapping } from "./groupMapping.entity";

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    groupID: number;

    @Column({ nullable: true })
    name: string;

    @Column()
    profile: string;

    @ManyToMany(
        () => Chatting,
        chatting => chatting.thisGroup
    )
    chattingGroup: Chatting;

    @OneToMany(
        () => GroupMapping,
        groupMapping => groupMapping.thisGroup
    )
    mappingGroup: GroupMapping;
}