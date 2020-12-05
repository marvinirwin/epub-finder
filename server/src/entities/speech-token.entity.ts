import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class SpeechToken {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    exp: number;
    @Column()
    token: string;
}
