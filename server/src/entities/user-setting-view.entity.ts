import { Column, ViewColumn, ViewEntity } from 'typeorm'

export const GroupwiseMax = ({
                                 table,
                                 groupingColumns,

                             }: {
                                 table: string,
                                 groupingColumns: string[]
                             },
) => `
SELECT 
    s.*
FROM ${table} s
LEFT JOIN ${table} max_table 
    ON ${table}.created_at > s.created_at
    AND ${groupingColumns
    .map(groupingColumn => `max_table.${groupingColumn} = s.${groupingColumn}`)
.join(' AND ')}
     AND max_table.creator_id = s.creator_id
WHERE setting_max.id IS NULL
`

@ViewEntity({
    expression: GroupwiseMax({ table: 'user_setting', groupingColumn: 'name' }),
})
export class UserSettingView {
    @ViewColumn()
    id: string
    @ViewColumn()
    value: any
    @Column()
    name: string
    @ViewColumn()
    created_at: Date
    @ViewColumn()
    creator_id: number
}
