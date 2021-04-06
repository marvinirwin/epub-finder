import { ScheduleItem } from '../schedule/schedule-row'
import { supermemo, SuperMemoGrade, SuperMemoItem } from 'supermemo'
import { add } from 'date-fns'

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const MINUTE_IN_MILLISECONDS = 60 * 1000

const FLOOR = 0

export const RecognitionMap: { [key: string]: SuperMemoGrade } = {
    easy: 5,
    medium: 2,
    hard: 0,
}

export class SrmService {
    private static getProgressScore(rows: ScheduleItem[]): number {
        return rows[rows.length - 1]?.repetition || 0
    }

    public static correctScore() {
        return 3
    }

    public static getNextRecognitionRecord(
        previousRows: ScheduleItem[],
        score: SuperMemoGrade,
    ): SuperMemoItem {
        const mostRecentRow: SuperMemoItem = previousRows[
            previousRows.length - 1
        ] || {
            interval: 0,
            repetition: 0,
            efactor: 2.5,
        }
        return supermemo(mostRecentRow, score)
    }
}


export const quizCardNextDueDate = ({grade, previousItems}:{grade: SuperMemoGrade, previousItems: ScheduleItem[]}) => {
    const inARow = <T>(
        array: T[],
        filterFunc: (v: T) => boolean,
    ): T[] => {
        const sequencedElements = []
        {
            for (let i = 0; i < array.length; i++) {
                const arrayElement = array[i]
                if (!filterFunc(arrayElement)) {
                    return sequencedElements
                }
                sequencedElements.push(arrayElement)
            }
        }
        return sequencedElements
    }

    const nextRecognitionRecord = SrmService.getNextRecognitionRecord(previousItems, grade);

    const nextDueDate = () => {
        if (grade < 3) {
            return add(Date.now(), { minutes: 1 })
        }
        const correctRecordsInARow = inARow(
            Array.from(previousItems).reverse(),
            (r) => r.grade >= 3,
        )
        switch (correctRecordsInARow.length) {
            case 0:
                return add(Date.now(), { minutes: 1 })
            case 1:
                return add(Date.now(), { minutes: 5 })
            case 2:
                return add(Date.now(), { minutes: 10 })
            default:
                return add(Date.now(), {
                    days: nextRecognitionRecord.interval,
                })
        }
    }
    return nextDueDate();
}