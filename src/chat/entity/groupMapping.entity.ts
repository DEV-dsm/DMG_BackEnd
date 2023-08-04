import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

@Entity()
export class GroupMapping {
    @PrimaryColumn()
    userID: number;

    @PrimaryColumn()
    groupID: number;

    @Column()
    isManager: boolean;

    @OneToOne(
        () => User,
        user => user.mappingUser
    )
    @JoinColumn({ name: 'userID' })
    user: User;
}