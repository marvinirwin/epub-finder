import {Column, ViewColumn, ViewEntity} from "typeorm";

@ViewEntity({
    expression: `
        SELECT 
            SUM(usage_decrement.cost) AS spent,
            SUM(usage_increment.cost) AS budget,
            "user".id as user_id
        FROM "user"
        LEFT JOIN usage_event usage_decrement ON usage_decrement.cost > 0
        LEFT JOIN usage_event usage_increment ON usage_increment.cost < 0
        GROUP BY "user".id
    `
})
export class Usage {
    @ViewColumn()
    usage: number;
    @ViewColumn()
    available: number;
    @ViewColumn()
    user_id: number;
}