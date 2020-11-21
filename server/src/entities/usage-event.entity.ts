import {Column, Entity, Index, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "./user.entity";
import {JsonValueTransformer} from "../util/JsonValueTransformer";

type KeyValue = { [key: string]: any };

@Entity()
export class UsageEventEntity {
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
    @ManyToOne(() => UserEntity, user => user.id)
    public userId: number | undefined;
}
