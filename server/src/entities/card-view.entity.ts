import {
    Column, CreateDateColumn,
    OneToOne,
    PrimaryColumn, PrimaryGeneratedColumn,
    ViewColumn,
    ViewEntity,
} from 'typeorm'
import { User } from './user.entity'
import { GroupwiseMax } from './user-setting-view.entity'


@ViewEntity({
    expression: GroupwiseMax({
        table: 'card',
        groupingColumns: ['word']
    }),
})
export class CardView {
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
