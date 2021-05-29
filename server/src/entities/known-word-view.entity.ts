import { Column, CreateDateColumn, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from 'typeorm'
import { GroupwiseMax } from './user-setting-view.entity'

@ViewEntity({
    expression: GroupwiseMax({
        table: 'known_word',
        groupingColumns: [
            'creator_id',
            'language_code',
            'word',
        ]
    }),
})
export class KnownWordView {
    @ViewColumn()
    id: string
    @ViewColumn()
    language_code: string
    @ViewColumn()
    word: string;
    @ViewColumn()
    created_at: Date;
    @ViewColumn()
    is_known: boolean;
    @ViewColumn()
    creator_id: number;
}
