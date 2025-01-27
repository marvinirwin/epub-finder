import {
    ViewColumn,
    ViewEntity,
} from "typeorm";
import { GroupwiseMax } from "./user-setting-view.entity";


@ViewEntity({
    expression: GroupwiseMax({
        table: "card",
        groupingColumns: ["learning_language", "language_code"]
    }),
})
export class CardView {
    @ViewColumn()
    id: string
    @ViewColumn()
    learning_language: string
    @ViewColumn()
    language_code: string
    @ViewColumn()
    photos: string[]
    @ViewColumn()
    sounds: string[]
    @ViewColumn()
    created_at: Date;
    @ViewColumn()
    creator_id: number;
    @ViewColumn()
    known_language: string[]
}
