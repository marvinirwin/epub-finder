import { Column, ViewColumn, ViewEntity } from 'typeorm'

export const GroupwiseMax = ({
                                 table,
                                 groupingColumns,

                             }: {
                                 table: string,
                                 groupingColumns: string[]
                             },
) => {
    let s = `
    SELECT 
        s.*
    FROM ${table} s
    LEFT JOIN ${table} max_table 
        ON max_table.created_at > s.created_at
        AND ${groupingColumns
        .map(groupingColumn => `max_table.${groupingColumn} = s.${groupingColumn}`)
    .join(' AND ')}
         AND max_table.creator_id = s.creator_id
    WHERE max_table.id IS NULL
    `
    return s
}

@ViewEntity({
    expression: GroupwiseMax({ table: 'user_setting', groupingColumns: ['name'] }),
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
