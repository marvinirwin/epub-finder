import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import {UnPersistedEntity} from "../shared/UnPersistedEntity";

@Entity()
export class IgnoredWord {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    language_code: string
    @Column()
    word: string;
    @CreateDateColumn({type: "timestamp with time zone"})
    created_at: Date;
    @Column({default: true})
    is_ignored: boolean;
    @Column()
    creator_id: number;
}
export type PersistedIgnoredWord = UnPersistedEntity<IgnoredWord>;