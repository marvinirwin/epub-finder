import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from "typeorm";

@Entity()
export class VisitorLog {
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column()
    ip: string = '';

    @Column({type: "datetime", default: () => "CURRENT_TIMESTAMP"})
    timestamp: Date = new Date();
}

