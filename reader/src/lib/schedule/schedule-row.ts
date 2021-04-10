import { DocumentWordCount } from '../../../../server/src/shared/DocumentWordCount'
import { WordRecognitionRow } from './word-recognition-row'
import { PronunciationProgressRow } from './pronunciation-progress-row.interface'
import { NormalizedValue } from '../manager/normalized-value.interface'
import { SrmService } from '../srm/srm.service'
import { formatDistance, isToday } from 'date-fns'
import { SuperMemoGrade, SuperMemoItem } from 'supermemo'
import { lastN } from '../../components/quiz/last-n'
import { FlashCardType } from '../quiz/hidden-quiz-fields'

export interface QuizScheduleRowData {
    wordCountRecords: DocumentWordCount[]
    greedyWordCountRecords: DocumentWordCount[]
    wordRecognitionRecords: WordRecognitionRow[]
    flashCardType: FlashCardType;
    word: string
}

export interface NormalizedQuizCardScheduleRowData extends QuizScheduleRowData {
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
    timestamp: Date
    repetition: number
    interval: number
    efactor: number
}

export const recordsLearnedToday = (r1: ScheduleItem[]) => {
    const lastTwoRecords = ScheduleRow.lastNRecords(r1, 2)
    return (
        lastTwoRecords.length === 2 &&
        lastTwoRecords.every((r) => r.grade >= 3 && isToday(r.timestamp))
    )
}
export const recordsLearnedAnyDay = (r1: ScheduleItem[]) => {
    const lastTwoRecords = ScheduleRow.lastNRecords(r1, 2)
    return (
        lastTwoRecords.length === 2 && lastTwoRecords.every((r) => r.grade >= 3)
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
        const isComplete = lastN(3)(this.superMemoRecords).every(
            (r) => isToday(r.timestamp) && r.grade >= 3,
        )
        if (isComplete) {
            return false
        }
        const isCurrentlyReviewing = this.superMemoRecords.find((r) =>
            isToday(r.timestamp),
        )
        if (isCurrentlyReviewing) {
            return false
        }
        return this.isOverDue({ now })
    }

    public isOverDue({ now }: { now: Date }) {
        return this.dueDate() < now
    }

    public hasNRecognizedInARow(n = 2) {
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
        const startedToday = isToday(lastRecord.timestamp)
        if (this.superMemoRecords.length < 2) {
            return startedToday;
        }
        const lastTwoRecords = ScheduleRow.lastNRecords(
            this.superMemoRecords,
            2,
        );
        const completed = lastTwoRecords.every(
            (record) => record.grade >= 3 && isToday(record.timestamp),
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
        return this.hasNRecognizedInARow(2) && this.isOverDue({ now })
    }

    public isRecognized() {
        return this.recognitionScore() >= 3
        /*
                return !this.isUnrecognized() && !this.isSomewhatRecognized()
        */
    }

    wasLearnedToday() {
        return recordsLearnedToday(this.superMemoRecords)
    }

    isNotStarted() {
        return this.superMemoRecords.length === 0
    }
}
