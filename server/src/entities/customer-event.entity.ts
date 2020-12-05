import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class CustomerEvent {
    @PrimaryColumn()
    id: number;
}
