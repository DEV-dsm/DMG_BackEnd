import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('users')
@Unique(['identify', 'email'])
export class User {
    @PrimaryGeneratedColumn()
    userID: number;

    @Column()
    identify: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    profile: string;

    @Column({ nullable: true })
    background: string;

    @Column({ default: 1 })
    isStudent: boolean;
}