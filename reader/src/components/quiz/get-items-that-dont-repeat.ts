import {WordRecognitionRow} from "../../lib/schedule/word-recognition-row";
import {FlashCardType} from "../../lib/quiz/hidden-quiz-fields";
import {isRepeatRecord} from "./is-repeat-record";
import {LimitedScheduleRows} from "../../lib/manager/limit-schedule-rows.type";

export const getItemsThatDontRepeat = (
    scheduleRows: LimitedScheduleRows,
    previousRecords: WordRecognitionRow[],
    i: number,
    keyFunction: (r: { word: string, flash_card_type: FlashCardType }) => string) => {
    return scheduleRows.limitedScheduleRows.filter(limitedScheduleRow => {
            return !isRepeatRecord<{ word: string, flash_card_type: FlashCardType }, string>(
                previousRecords.slice(0, i),
                limitedScheduleRow.d,
                keyFunction,
            )
        },
    )
}