import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    groupID: number;

    @Column()
    name: string;

    @Column()
    profile: string;
}