import {Column, Entity, Index, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
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
    @ManyToOne(() => User, user => user.id)
    public userId: number | undefined;
}
