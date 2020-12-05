import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import typeormStore from 'typeorm-store';

@Entity()
export class session extends BaseEntity implements typeormStore.SessionEntity {
    @PrimaryColumn()
    id: string;

    @Column({name: 'expires_at'})
    expiresAt: number;

    @Column()
    data: string;

    @Column({default: null, name: 'user_id'})
    userId: number;
}
