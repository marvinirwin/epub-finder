import { DocumentWordCount } from '../../../../server/src/shared/DocumentWordCount'
import { WordRecognitionRow } from './word-recognition-row'
import { NormalizedValue } from '../manager/normalized-value.interface'
import { SrmService } from '../srm/srm.service'
import { formatDistance, isToday } from 'date-fns'
import { SuperMemoGrade } from 'supermemo'
import { lastN } from '../../components/quiz/last-n'
import { FlashCardType } from '../quiz/hidden-quiz-fields'

export interface QuizScheduleRowData {
    wordCountRecords: DocumentWordCount[]
    greedyWordCountRecords: DocumentWordCount[]
    wordRecognitionRecords: WordRecognitionRow[]
    flash_card_type: FlashCardType;
    word: string
}

export interface SortQuizData extends QuizScheduleRowData {
    count: SortValue<number>
    dueDate: SortValue<Date>
    length: SortValue<number>
    finalSortValue: number
    normalizedCount: NormalizedValue
    normalizedDate: NormalizedValue
    sortValues: {
        dueDate: SortValue<Date>
        count: SortValue<number>
        length: SortValue<number>
        sentencePriority: SortValue<number>
    }
}
export interface SpacedSortQuizData extends SortQuizData {
    spacedDueDate: {source: Date, transformed: Date}
}

export interface SortValue<T> {
    value: T
    normalValue: number
    inverseLogNormalValue: number
    weightedInverseLogNormalValue: number
    weight: number
    normalizedValueObject: NormalizedValue
}

export type ScheduleItem = {
    nextDueDate: Date
    grade: SuperMemoGrade
    created_at: Date
    repetition: number
    interval: number
    efactor: number
}

const NUMBER_OF_CORRECT_ANSWERS_TO_LEARN = 2
const CORRECT_SUPERMEMO_GRADE = 3
export const wasLearnedToday = (r1: ScheduleItem[]) => {
    const lastTwoRecords = ScheduleRow.lastNRecords(r1, NUMBER_OF_CORRECT_ANSWERS_TO_LEARN)
    return (
        lastTwoRecords.length === NUMBER_OF_CORRECT_ANSWERS_TO_LEARN &&
        lastTwoRecords.every((r) => r.grade >= CORRECT_SUPERMEMO_GRADE && isToday(r.created_at))
    )
}

export const dateLearnedForTheFirstTime = (records: ScheduleItem[]): Date | undefined => {
    // @ts-ignore
    if (records[0]?.word === '制') {
        // debugger;console.log()
    }
    let successInARow: ScheduleItem[] = [];
    for (let i = 0; i < records.length; i++) {
        const record = records[i]
        if (successInARow.length === NUMBER_OF_CORRECT_ANSWERS_TO_LEARN) {
            return successInARow[0].created_at;
        }
        if (record.grade >= CORRECT_SUPERMEMO_GRADE) {
            successInARow.push(record)
        } else {
            successInARow = [];
        }
    }
    return undefined
}

export const recordsLearnedAnyDay = (r1: ScheduleItem[]) => {
    const lastTwoRecords = ScheduleRow.lastNRecords(r1, NUMBER_OF_CORRECT_ANSWERS_TO_LEARN)
    return (
        lastTwoRecords.length === NUMBER_OF_CORRECT_ANSWERS_TO_LEARN && lastTwoRecords.every((r) => r.grade >= CORRECT_SUPERMEMO_GRADE)
    )
}

export class ScheduleRow<T> {
    private _dueDate: Date

    constructor(public d: T, private superMemoRecords: ScheduleItem[]) {
        this._dueDate = this.superMemoRecords[
            this.superMemoRecords.length - 1
        ]?.nextDueDate
    }

    public dueDate() {
        return this._dueDate || new Date()
    }

    public isNew() {
        return this.superMemoRecords.length === 0
    }

    public recognitionScore() {
        return (
            this.superMemoRecords[this.superMemoRecords.length - 1]?.grade || 0
        )
    }

    public isToReview({ now }: { now: Date }) {
        const hasNeverBeenAttempted = this.superMemoRecords.length <= 0
        if (hasNeverBeenAttempted) {
            return false
        }
        const isComplete = lastN(NUMBER_OF_CORRECT_ANSWERS_TO_LEARN)(this.superMemoRecords).every(
            (r) => isToday(r.created_at) && r.grade >= CORRECT_SUPERMEMO_GRADE,
        )
        if (isComplete) {
            return false
        }
        const isCurrentlyReviewing = this.superMemoRecords.find((r) =>
            isToday(r.created_at),
        )
        if (isCurrentlyReviewing) {
            return false
        }
        return this.isOverDue({ now })
    }

    public isOverDue({ now }: { now: Date }) {
        return this.dueDate() < now
    }

    public hasNRecognizedInARow(n = NUMBER_OF_CORRECT_ANSWERS_TO_LEARN) {
        const last2 = this.superMemoRecords.slice(n * -1)
        return last2.every((rec) => rec.grade === SrmService.correctScore())
    }

    static lastNRecords<T>(r: T[], n: number) {
        return r.slice(n * -1)
    }

    public isLearning() {
        const hasNoRecords = !this.superMemoRecords.length
        if (hasNoRecords) return false

        const lastRecord = this.superMemoRecords[
            this.superMemoRecords.length - 1
        ]
        const startedToday = isToday(lastRecord.created_at)
        if (this.superMemoRecords.length < NUMBER_OF_CORRECT_ANSWERS_TO_LEARN) {
            return startedToday;
        }
        const lastTwoRecords = ScheduleRow.lastNRecords(
            this.superMemoRecords,
            NUMBER_OF_CORRECT_ANSWERS_TO_LEARN,
        );
        const completed = lastTwoRecords.every(
            (record) => record.grade >= CORRECT_SUPERMEMO_GRADE && isToday(record.created_at),
        )
        if (completed) {
            return false
        }
        return startedToday;
    }

    public dueIn() {
        return formatDistance(this.dueDate(), Date.now(), { addSuffix: true })
    }

    public isUnrecognized() {
        return this.hasNRecognizedInARow(1)
    }

    public isSomewhatRecognized({ now }: { now: Date }) {
        return this.hasNRecognizedInARow(NUMBER_OF_CORRECT_ANSWERS_TO_LEARN) && this.isOverDue({ now })
    }

    public isRecognized() {
        return this.recognitionScore() >= CORRECT_SUPERMEMO_GRADE
        /*
                return !this.isUnrecognized() && !this.isSomewhatRecognized()
        */
    }

    wasLearnedOrReviewedToday() {
        return wasLearnedToday(this.superMemoRecords)
    }

    wasLearnedForTheFirstTimeToday() {
        const dateLearned = dateLearnedForTheFirstTime(this.superMemoRecords);
        if (!dateLearned) {
            return false;
        }
        return isToday(dateLearned);
    }

    isNotStarted() {
        return this.superMemoRecords.length === 0
    }
}
