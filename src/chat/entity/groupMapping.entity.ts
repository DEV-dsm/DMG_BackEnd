import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Group } from "./group.entity";

@Entity()
export class GroupMapping {
    @PrimaryColumn()
    userID: number;

    @PrimaryColumn()
    groupID: number;

    @Column({ default: false })
    isManager: boolean;

    @OneToOne(
        () => User,
        user => user.mappingUser
    )
    @JoinColumn({ name: 'userID' })
    user: User;

    @ManyToOne(
        () => Group,
        group => group.mappingGroup
    )
    @JoinColumn({ name: 'groupID' })
    thisGroup: Group;
}