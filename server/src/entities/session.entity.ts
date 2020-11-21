import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import typeormStore from 'typeorm-store';

@Entity()
export class SessionEntity extends BaseEntity implements typeormStore.SessionEntity {
    @PrimaryColumn()
    id: string;

    @Column({})
    expiresAt: number;

    @Column()
    data: string;

    @Column({default: null})
    userId: number;
}
