import {
    Column, CreateDateColumn,
    OneToOne,
    PrimaryColumn, PrimaryGeneratedColumn,
    ViewColumn,
    ViewEntity,
} from 'typeorm'
import { User } from './user.entity'

@ViewEntity({
    expression: `
    SELECT 
        s.id,
        s.value,
        s.name,
        s.created_at,
        s.creator_id
    FROM user_setting s
    LEFT JOIN user_setting setting_max 
        ON setting_max.created_at > s.created_at
        AND setting_max.name = s.name AND setting_max.creator_id = s.creator_id
    WHERE setting_max.id IS NULL
`,
})
export class UserSettingView {
    @ViewColumn()
    id: string
    @ViewColumn()
    value: any
    @Column()
    name: string;
    @ViewColumn()
    created_at: Date;
    @ViewColumn()
    creator_id: number;
}
