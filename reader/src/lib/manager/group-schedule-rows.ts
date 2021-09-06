import {ScheduleRow, SortQuizData, SpacedSortQuizData} from "../schedule/schedule-row";
import {FlashCardType} from "../quiz/hidden-quiz-fields";
import {Dictionary, flatten, groupBy} from "lodash";
import {isToday} from "date-fns";
import {SpacedScheduleRow} from "./space-schedule-row.type";

export const groupByWord = <listItemType, itemKeyType extends string>(rows: listItemType[], keyExtractionFunction: (r: listItemType) => itemKeyType): Dictionary<listItemType[]> => {
    return groupBy(rows, keyExtractionFunction)
}
export const gatherWhile = <T, U>(values: T[], filterFunc: (value: T) => boolean, limitReachedFunc: (gathered: T, acc: U) => boolean, acc: U): T[] => {
    const gatheredValues = []
    for (const value of values) {
        if (filterFunc(value)) {
            gatheredValues.push(value)
            if (limitReachedFunc(value, acc)) {
                return gatheredValues
            }
        }
    }
    return gatheredValues
}
export const anyScheduleRowsForWord = (
    scheduleRowsToReview: ScheduleRow<SpacedSortQuizData>[],
    quizCardFieldConfig: FlashCardType[],
) => {
    // A word is to review if any of its rows are too review
    return Object.values(groupBy(scheduleRowsToReview, row => row.d.word))
}
export const allScheduleRowsForWordToday = (
    {
        scheduleRows,
        allScheduleRows,
    }:
        {
            scheduleRows: ScheduleRow<SortQuizData>[],
            allScheduleRows: ScheduleRow<SortQuizData>[]
        },
) => {
    // So we take all the schedule rows which are due today and then apply the evewry function
    /**
     * For a word to be unStarted, all of its schedule rows must be unStarted for that day
     */
    const selectScheduleRowsGrouped = groupBy(scheduleRows, r => r.d.word)
    const allScheduleRowsGrouped = groupBy(allScheduleRows, r => r.d.word)
    const selectEntriesGrouped = Object.entries(selectScheduleRowsGrouped)
    const filteredItems = []
    for (const [word, rows] of selectEntriesGrouped) {
        const allScheduleRowEntries = allScheduleRowsGrouped[word]?.filter(r => isToday(r.dueDate()))
        const allRowsComplete = allScheduleRowEntries.length === rows.length
        if (allRowsComplete) {
            filteredItems.push(rows)
        }
    }
    return filteredItems
}
export const getSiblingRecords = (learningScheduleRows: SpacedScheduleRow[], unStartedScheduleRows: SpacedScheduleRow[]) =>
    flatten(learningScheduleRows
        .map(learningScheduleRow => unStartedScheduleRows
            .filter(unStartedScheduleRow => unStartedScheduleRow.d.word === learningScheduleRow.d.word),
        ),
    )