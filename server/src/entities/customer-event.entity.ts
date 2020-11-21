import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class CustomerEventEntity {
    @PrimaryColumn()
    id: number;
}
