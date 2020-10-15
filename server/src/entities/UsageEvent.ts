import {Column, Entity, Index, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class UsageEvent {
    @PrimaryGeneratedColumn()
    public id: number | undefined;
    @Column()
    public label: string;
    @Column("text")
    public description: {[key: string]: any};
    @Column("int")
    public cost: number;
    @ManyToOne(() => User, user => user.usageEvents)
    public userId: number;
}
