import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn} from "typeorm";

@Entity()
export class SubscriptionEventEntity {
    @PrimaryColumn()
    id: number;

    @CreateDateColumn({type: "timestamp"})
    current_period_end: Date;

    @CreateDateColumn({type: "timestamp"})
    current_period_start: Date;
}
