import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserSetting {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({type: "jsonb", nullable: true})
    value: any
    @Column()
    name: string;
    @CreateDateColumn({type: "timestamp with time zone"})
    created_at: Date;
    @Column()
    creator_id: number;
}
