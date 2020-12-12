import {Column, Entity, Index, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";
import {JsonValueTransformer} from "../util/JsonValueTransformer";

type KeyValue = { [key: string]: any };

@Entity()
export class UsageEvent {
    @PrimaryGeneratedColumn()
    public id: number | undefined;
    @Column()
    public label: string;
    @Column({
        type: String,
        transformer: new JsonValueTransformer<KeyValue>()
    })
    public description: KeyValue = {};
    @Column("int")
    public cost: number;

    @Column({default: null})
    @OneToOne(() => User, user => user.id)
    public user_id: number | undefined;
}
