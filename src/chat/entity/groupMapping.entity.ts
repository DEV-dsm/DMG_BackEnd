import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GroupMapping {
    @PrimaryColumn()
    userID: number;

    @PrimaryColumn()
    groupID: number;

    @Column()
    isManager: boolean;
}